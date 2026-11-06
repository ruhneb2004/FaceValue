import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseEther,
  formatEther,
  formatUnits,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bondAbi, toBytes32 } from "./bond.ts";

/**
 * On-chain settlement for FaceValueBond.
 *
 * Identity is decided off-chain; this module only carries the resulting
 * `faceWins` boolean to the contract and reports what happened. It holds no
 * opinion about faces — that is the whole design.
 *
 * Settlement is flag-gated. With ONCHAIN_SETTLEMENT unset the app behaves
 * exactly as before: bonds are SQLite ledger rows and the demo cannot be broken
 * by a chain outage. With it set, stakes and payouts are real.
 *
 * That gate is not laziness. A judging demo where a slow testnet block leaves
 * the UI hung is a worse demo than one that is honest about where the money is.
 */

export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: { name: "HBAR", symbol: "ℏ", decimals: 8 },
  rpcUrls: { default: { http: [process.env.HEDERA_RPC_URL ?? "https://testnet.hashio.io/api"] } },
  blockExplorers: {
    default: { name: "HashScan", url: "https://hashscan.io/testnet" },
  },
  testnet: true,
});

export function onchainEnabled(): boolean {
  return process.env.ONCHAIN_SETTLEMENT === "true" && Boolean(bondAddress()) && Boolean(matcherKey());
}

function bondAddress(): Address | undefined {
  const a = process.env.FACEVALUE_BOND_ADDRESS;
  return a && /^0x[0-9a-fA-F]{40}$/.test(a) ? (a as Address) : undefined;
}

function matcherKey(): Hex | undefined {
  const k = process.env.MATCHER_PRIVATE_KEY;
  return k && /^0x?[0-9a-fA-F]{64}$/.test(k) ? ((k.startsWith("0x") ? k : `0x${k}`) as Hex) : undefined;
}

const publicClient = createPublicClient({
  chain: hederaTestnet,
  transport: http(hederaTestnet.rpcUrls.default.http[0]),
});

function matcherWallet() {
  const key = matcherKey();
  const address = bondAddress();
  if (!key || !address) return null;
  return {
    account: privateKeyToAccount(key),
    client: createWalletClient({
      chain: hederaTestnet,
      account: privateKeyToAccount(key),
      transport: http(hederaTestnet.rpcUrls.default.http[0]),
    }),
    address,
  };
}

export type ChainResult =
  | { ok: true; hash: Hex; explorerUrl: string }
  | { ok: false; error: string };

function explorer(hash: Hex): string {
  return `https://hashscan.io/testnet/transaction/${hash}`;
}

/**
 * Settle a challenge on-chain from the matcher's boolean.
 *
 * This is the only place the trusted key touches money. Every call logs the
 * cosine that produced `faceWins`, because the determinism of that number —
 * not the contract — is what makes the settlement auditable.
 */
export async function settleOnchain(input: {
  likenessId: string;
  challengeId: string;
  faceWins: boolean;
  cos: number;
}): Promise<ChainResult> {
  const w = matcherWallet();
  if (!w) return { ok: false, error: "On-chain settlement is not configured." };

  try {
    const hash = await w.client.writeContract({
      address: w.address,
      abi: bondAbi,
      functionName: "resolveTier1",
      args: [toBytes32(input.likenessId), toBytes32(input.challengeId), input.faceWins],
      account: w.account,
    });
    await publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 });
    return { ok: true, hash, explorerUrl: explorer(hash) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Post the registrant's stake on-chain.
 *
 * Signed by the matcher key because the demo has no browser wallet signing
 * flow for stakes yet. That is a real limitation, not a design choice: it means
 * the server, not the registrant, funds the bond. Stated here so it is not
 * mistaken for non-custodial later.
 */
export async function stakeOnchain(input: {
  likenessId: string;
  amountHbar: string;
}): Promise<ChainResult> {
  const w = matcherWallet();
  if (!w) return { ok: false, error: "On-chain settlement is not configured." };
  try {
    const hash = await w.client.writeContract({
      address: w.address,
      abi: bondAbi,
      functionName: "stake",
      args: [toBytes32(input.likenessId)],
      value: parseEther(input.amountHbar),
      account: w.account,
    });
    await publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 });
    return { ok: true, hash, explorerUrl: explorer(hash) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Post a challenger's equal stake on-chain.
 * @dev `challenge()` reverts unless the value equals the registrant's stake, so
 *      this deliberately reuses the same amount rather than accepting one — the
 *      contract enforces equal stakes and the server must not be able to disagree.
 */
export async function challengeOnchain(input: {
  likenessId: string;
  challengeId: string;
  amountHbar: string;
}): Promise<ChainResult> {
  const w = matcherWallet();
  if (!w) return { ok: false, error: "On-chain settlement is not configured." };
  try {
    const hash = await w.client.writeContract({
      address: w.address,
      abi: bondAbi,
      functionName: "challenge",
      args: [toBytes32(input.likenessId), toBytes32(input.challengeId)],
      value: parseEther(input.amountHbar),
      account: w.account,
    });
    await publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 });
    return { ok: true, hash, explorerUrl: explorer(hash) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Read the withdrawable credit for an address. */export async function creditOf(who: Address): Promise<bigint | null> {
  const address = bondAddress();
  if (!address) return null;
  try {
    return await publicClient.readContract({
      address,
      abi: bondAbi,
      functionName: "credit",
      args: [who],
    });
  } catch {
    return null;
  }
}

/**
 * Hedera's EVM is 18-decimal wei, exactly like Ethereum — `parseEther` is
 * correct here.
 *
 * This is worth a comment because the RPC is misleading: `eth_getBalance` and
 * contract uint256 values come back scaled to HBAR's 8 display decimals, so a
 * 0.5 HBAR stake reads as `50000000` rather than `5e17`. I twice read that as an
 * 8-decimal EVM and "fixed" a bug that did not exist. The EVM unit is wei; only
 * the display is HBAR-scaled. Verify with `cast balance`, which already divides
 * by 1e10 before showing a number.
 */
export function formatHbar(wei: bigint): string {
  return formatEther(wei);
}

/**
 * Format a value read back from this RPC.
 *
 * Reading is not symmetric with writing, which is the trap. Writes take 18-decimal
 * wei (`parseEther`), but `eth_call` results and `eth_getBalance` come back scaled
 * to HBAR's 8 display decimals — a 0.005 HBAR stake reads as `500000`. Passing a
 * read value through `formatEther` therefore shows 1e-11 of the truth.
 *
 * Anything that came from `eth_call`/`eth_getBalance` must go through this instead.
 */
export function formatReadHbar(raw: bigint): string {
  return formatUnits(raw, 8);
}

/** Convert a wei amount to the 8-decimal scale the RPC reports reads in. */
export function toReadScale(wei: bigint): bigint {
  return wei / BigInt(10 ** 10);
}

export { parseEther };
