import {
  createPublicClient,
  createWalletClient,
  http,
  labelhash,
  namehash,
  toHex,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

/**
 * ENS on Sepolia — subnames under our parent name.
 *
 * The shape of the problem: ENS names are a tree, and minting a child is cheap
 * only if you own the parent. So FaceValue registers ONE name (`facevalue.eth`)
 * and then mints `alice.facevalue.eth` per likeness. Registering each name
 * separately on mainnet would cost real ETH and a commit/reveal wait per name.
 *
 * What goes on-chain here is deliberately thin: a subname and a resolved address.
 * No face, no embedding, no nullifier, no reference hash. A name pointing at an
 * address is public by construction, so anything written must already be public.
 */

/**
 * ENSv2 on Sepolia.
 *
 * Sepolia now runs ENSv2: names live in a `PermissionedRegistry` (ETHRegistry) and
 * subnames live in a per-name `UserRegistry` proxy. That means the v1 path in most
 * tutorials — `setSubnodeRecord` on the legacy registry — simply reverts here even
 * though the legacy contract still has code. We learned that from a failed
 * transaction, so it is written down next to the code that depends on it.
 *
 * The parent was registered through the ETHRegistrar (commit/reveal, fee paid in
 * MockUSDC), then a UserRegistry proxy was deployed through the Verifiable Factory
 * and attached with `setSubregistry`. Minting a subname is then a single
 * `register` call on that UserRegistry.
 */
export const ETH_REGISTRY: Address = "0xd4ebcbbdf463c9c45784603db0ddd499bc44a8b4";

export const ENS_PUBLIC_RESOLVER: Address = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

/** Address(0) subregistry: the subname gets no child registry of its own. */
const NO_SUBREGISTRY = "0x0000000000000000000000000000000000000000" as Address;

/**
 * All roles and their admin counterparts, from the ENS v2 docs.
 *
 * Note this is 0x1111...1111, not (1 << N) - 1. The bitmap sets each role bit and
 * each corresponding admin bit, so a contiguous all-ones value is wrong and the
 * grant is rejected.
 */
const ALL_ROLES = BigInt(
  "0x1111111111111111111111111111111111111111111111111111111111111111",
);

const USER_REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "label", type: "string" },
      { name: "owner", type: "address" },
      { name: "subregistry", type: "address" },
      { name: "resolver", type: "address" },
      { name: "roleBitmap", type: "uint256" },
      { name: "expiry", type: "uint64" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getState",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "anyId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

/** Bytecode is unnecessary for these calls; only the ABI signatures matter. */
const REGISTRY_ABI = [
  {
    name: "getOwner",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "anyId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const parentName = () => process.env.ENS_PARENT_NAME || "facevalue.eth";
const rpcUrl = () => process.env.ENS_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

/**
 * The UserRegistry proxy that holds the subnames of the parent name.
 *
 * Deployed once via the Verifiable Factory and attached to the parent with
 * `setSubregistry`; every mint goes through it. Read from env because it is a
 * deployment address that changes if the parent is ever re-registered.
 */
const userRegistry = () => (process.env.ENS_SUBREGISTRY_ADDRESS ?? "") as Address;

const publicClient = () =>
  createPublicClient({ chain: sepolia, transport: http(rpcUrl()) });

/**
 * Whether ENS writes are enabled.
 *
 * Same pattern as ONCHAIN_SETTLEMENT: the ledger keeps working when the chain is
 * unreachable or unfunded, so a faucet that never arrived cannot break the demo.
 * When false the caller gets a clear "not enabled" result rather than a revert.
 */
export function ensEnabled(): boolean {
  return (
    process.env.ENS_SUBNAMES === "true" &&
    !!process.env.ENS_PARENT_OWNER_KEY &&
    !!process.env.ENS_SUBREGISTRY_ADDRESS
  );
}

/** A label is one DNS segment: lowercase alphanumerics and hyphens. */
export function toLabel(name: string): string | null {
  const cleaned = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!cleaned) return null;
  // ENS forbids a label longer than 63 bytes; truncate rather than fail, because a
  // long display name should still get a usable subname.
  return cleaned.slice(0, 63);
}

/**
 * The subname for a likeness: `<label>.<parent>`.
 *
 * Deterministic so the same likeness always yields the same name, which matters
 * because the name is what a licence record points at.
 */
export function likenessSubname(name: string): string | null {
  const label = toLabel(name);
  return label ? `${label}.${parentName()}` : null;
}

export type SubnameResult =
  | {
      ok: true;
      name: string;
      txHash: Hex;
      /** False while the name is owned but has no address record yet. */
      resolved: boolean;
    }
  | { ok: false; reason: string };

/**
 * Mint `<label>.facevalue.eth`, owned by `owner`.
 *
 * One transaction: `register` on the UserRegistry mints the token that carries
 * ownership. No resolver record is written here.
 *
 * Why no address record: ENSv2 separates ownership from records, and a record
 * write is authorised against the *resolver*, not the name. The shared
 * PublicResolver rejects our `setAddr` because our addresses hold no role on it,
 * and a resolver proxy deployed through the Verifiable Factory with this
 * implementation exposes no record setters at all. So the subname is a real,
 * owned name that does not yet resolve to an address. Saying that plainly beats
 * writing a name that looks resolvable and is not — the `resolved` flag on the
 * result is false and the UI does not claim otherwise.
 */
export async function mintSubname(
  name: string,
  owner: Address,
): Promise<SubnameResult> {
  const full = likenessSubname(name);
  if (!full) return { ok: false, reason: "That name has no usable ENS label." };
  if (!ensEnabled()) {
    return {
      ok: false,
      reason: "ENS writes are not enabled (ENS_SUBNAMES, key or subregistry missing).",
    };
  }

  // Keys in env files are often pasted without the 0x prefix, and viem rejects
  // the bare hex with a tick error that does not say why. Normalise instead.
  const raw = process.env.ENS_PARENT_OWNER_KEY as Hex;
  const key = (raw.startsWith("0x") ? raw : `0x${raw}`) as Hex;
  const account = privateKeyToAccount(key);
  const wallet = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl()) });
  const client = publicClient();
  const registry = userRegistry();

  const label = full.split(".")[0];

  // Skip the write entirely if this subname is already minted. Re-minting would
  // revert and cost gas, and a likeness can be re-saved many times.
  try {
    const state = await client.readContract({
      address: registry,
      abi: USER_REGISTRY_ABI,
      functionName: "getState",
      args: [BigInt(labelhash(label))],
    });
    if (state === 2) return { ok: true, name: full, txHash: "0x" as Hex, resolved: false };
  } catch {
    // An unreadable state is not a reason to refuse; fall through and let the
    // write fail loudly with the chain's own error.
  }

  try {
    // Expiry a year out. ENSv2 stores expiry per label, so a subname is not
    // permanent by default — this is the renewal horizon.
    const expiry = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 3600);
    const tx = await wallet.writeContract({
      address: registry,
      abi: USER_REGISTRY_ABI,
      functionName: "register",
      args: [label, owner, NO_SUBREGISTRY, ENS_PUBLIC_RESOLVER, ALL_ROLES, expiry],
    });
    await client.waitForTransactionReceipt({ hash: tx });
    return { ok: true, name: full, txHash: tx, resolved: false };
  } catch (err) {
    return { ok: false, reason: `ENS write failed: ${(err as Error).message}` };
  }
}

/** Read the address a subname resolves to, or null if it does not resolve. */
export async function resolveSubname(name: string): Promise<Address | null> {
  try {
    const { getEnsAddress } = await import("viem/ens");
    const address = await getEnsAddress(publicClient(), { name: normalize(name) });
    return (address as Address) ?? null;
  } catch {
    return null;
  }
}
