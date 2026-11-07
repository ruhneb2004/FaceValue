import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
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

export const ENS_REGISTRY: Address = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
export const ENS_PUBLIC_RESOLVER: Address = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

/** Bytecode is unnecessary for these calls; only the ABI signatures matter. */
const REGISTRY_ABI = [
  {
    name: "setSubnodeRecord",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "parentNode", type: "bytes32" },
      { name: "label", type: "bytes32" },
      { name: "owner", type: "address" },
      { name: "resolver", type: "address" },
      { name: "ttl", type: "uint64" },
    ],
    outputs: [],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const RESOLVER_ABI = [
  {
    name: "setAddr",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "a", type: "address" },
    ],
    outputs: [],
  },
] as const;

const parentName = () => process.env.ENS_PARENT_NAME || "facevalue.eth";
const rpcUrl = () => process.env.ENS_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

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
  return process.env.ENS_SUBNAMES === "true" && !!process.env.ENS_PARENT_OWNER_KEY;
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
  | { ok: true; name: string; txHash: Hex }
  | { ok: false; reason: string };

/**
 * Mint `<label>.facevalue.eth` and point it at `owner`.
 *
 * Two transactions: create the subnode, then set its address on the resolver.
 * `setSubnodeRecord` can attach a resolver atomically, but the address itself is
 * stored by the resolver, so it needs a second call. Doing the record first keeps
 * the name owned by the right address even if the second call fails.
 */
export async function mintSubname(
  name: string,
  owner: Address,
): Promise<SubnameResult> {
  const full = likenessSubname(name);
  if (!full) return { ok: false, reason: "That name has no usable ENS label." };
  if (!ensEnabled()) {
    return { ok: false, reason: "ENS writes are not enabled (ENS_SUBNAMES is off)." };
  }

  const key = process.env.ENS_PARENT_OWNER_KEY as Hex;
  const account = privateKeyToAccount(key);
  const wallet = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl()) });
  const client = publicClient();

  const parentNode = namehash(parentName());
  const label = full.split(".")[0];
  const labelHash = keccak256(toHex(label));

  // Fail before spending gas if we do not actually control the parent. A revert
  // from setSubnodeRecord costs a failed transaction and says less.
  const currentOwner = await client.readContract({
    address: ENS_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: "owner",
    args: [parentNode],
  });
  if (currentOwner.toLowerCase() !== account.address.toLowerCase()) {
    return {
      ok: false,
      reason: `This key does not own ${parentName()} (owner is ${currentOwner}).`,
    };
  }

  try {
    const tx1 = await wallet.writeContract({
      address: ENS_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "setSubnodeRecord",
      args: [parentNode, labelHash, owner, ENS_PUBLIC_RESOLVER, BigInt(0)],
    });
    await client.waitForTransactionReceipt({ hash: tx1 });

    const node = namehash(full);
    const tx2 = await wallet.writeContract({
      address: ENS_PUBLIC_RESOLVER,
      abi: RESOLVER_ABI,
      functionName: "setAddr",
      args: [node, owner],
    });
    await client.waitForTransactionReceipt({ hash: tx2 });

    return { ok: true, name: full, txHash: tx2 };
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
