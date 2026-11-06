/**
 * Contract constants shared by the server and the browser.
 *
 * Split out of `chain.ts` on purpose: that module builds a viem wallet client
 * from a private key and uses Node's `Buffer`, so it must never be imported by a
 * client component. Everything here is pure data and pure functions.
 */

/**
 * The bond contract's ABI — only the calls this app makes.
 *
 * Declared `as const` so viem infers argument and return types from it rather
 * than accepting `any`, which is what catches a wrong argument order at compile
 * time instead of in a reverted transaction.
 */
export const bondAbi = [
  {
    type: "function",
    name: "stake",
    stateMutability: "payable",
    inputs: [{ name: "likenessId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "challenge",
    stateMutability: "payable",
    inputs: [
      { name: "likenessId", type: "bytes32" },
      { name: "challengeId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveTier1",
    stateMutability: "nonpayable",
    inputs: [
      { name: "likenessId", type: "bytes32" },
      { name: "challengeId", type: "bytes32" },
      { name: "faceWins", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "approveReview",
    stateMutability: "nonpayable",
    inputs: [
      { name: "challengeId", type: "bytes32" },
      { name: "verdict", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveReview",
    stateMutability: "nonpayable",
    inputs: [{ name: "challengeId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "credit",
    stateMutability: "view",
    inputs: [{ name: "who", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "stakes",
    stateMutability: "view",
    inputs: [{ name: "likenessId", type: "bytes32" }],
    outputs: [
      { name: "registrant", type: "uint256" },
      { name: "challengerPool", type: "uint256" },
    ],
  },
] as const;

export const BOND_ADDRESS = (process.env.NEXT_PUBLIC_FACEVALUE_BOND_ADDRESS ??
  "") as `0x${string}`;

export const BOND_CONFIGURED = /^0x[0-9a-fA-F]{40}$/.test(BOND_ADDRESS);

/**
 * Map a record id to its `bytes32` on-chain slot.
 *
 * Right-padded UTF-8, so the same record always claims the same slot and the id
 * stays readable on HashScan. Written without `Buffer` because this runs in the
 * browser too, where the server's id and the client's must agree exactly — a
 * mismatch would have each party stake against a different slot.
 */
export function toBytes32(id: string): `0x${string}` {
  let hex = "";
  for (let i = 0; i < id.length; i += 1) {
    hex += id.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return `0x${hex.padEnd(64, "0").slice(0, 64)}`;
}

/** Default bond per side, in HBAR. Small on purpose: this is a testnet demo. */
export const DEFAULT_BOND_HBAR = "0.01";
