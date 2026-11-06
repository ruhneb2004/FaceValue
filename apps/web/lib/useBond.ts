"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { bondAbi, toBytes32, BOND_ADDRESS, BOND_CONFIGURED } from "@/lib/bond";

/**
 * Posting a bond from the user's own wallet.
 *
 * The bond is the one part of this product that must not be custodial. A bond the
 * server pays on your behalf is not a bond — it is a fee, and it proves nothing
 * about how much you believe your claim. So `stake` and `challenge` are signed by
 * the connected account, in the browser, and the server never holds the user's key.
 *
 * This is also what makes multi-wallet testing meaningful: two different browsers,
 * two different accounts, two genuine stakes, and the contract's equal-stake and
 * one-stake-per-address rules are exercised for real rather than simulated.
 */

export type BondStatus = "idle" | "signing" | "pending" | "confirmed" | "error";

export function useBond() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<BondStatus>("idle");
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(address && walletClient && publicClient && BOND_CONFIGURED);

  /** Human-readable reason the button is unavailable. */
  const blockedReason = !BOND_CONFIGURED
    ? "The bond contract address is not configured."
    : !address
      ? "Connect a wallet to post a bond."
      : null;

  const run = useCallback(
    async (fn: "stake" | "challenge", args: readonly unknown[], valueHbar: string) => {
      if (!walletClient || !publicClient || !address) {
        setError("Connect a wallet first.");
        setStatus("error");
        return null;
      }
      setError(null);
      setHash(null);
      setStatus("signing");
      try {
        const txHash = await walletClient.writeContract({
          address: BOND_ADDRESS,
          abi: bondAbi,
          // The function name and args are validated against the const ABI by
          // viem at the call site; the cast here is only to bridge the union.
          functionName: fn,
          args,
          value: parseEther(valueHbar),
          account: address,
          chain: walletClient.chain,
        } as never);

        setHash(txHash);
        setStatus("pending");
        await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 60_000 });
        setStatus("confirmed");
        return txHash;
      } catch (err) {
        const message = (err as Error).message ?? "";
        setStatus("error");
        setError(
          /user rejected|denied/i.test(message)
            ? "Signature cancelled. Nothing was posted."
            : message.split("\n")[0] || "The bond transaction failed.",
        );
        return null;
      }
    },
    [walletClient, publicClient, address],
  );

  /** Registrant posts the bond for their own likeness. */
  const stake = useCallback(
    (likenessId: string, valueHbar: string) => run("stake", [toBytes32(likenessId)], valueHbar),
    [run],
  );

  /** Challenger posts an equal bond against someone else's likeness. */
  const challenge = useCallback(
    (likenessId: string, challengeId: string, valueHbar: string) =>
      run("challenge", [toBytes32(likenessId), toBytes32(challengeId)], valueHbar),
    [run],
  );

  return { stake, challenge, status, hash, error, ready, blockedReason, address };
}
