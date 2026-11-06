"use client";

import { ArrowUpRight, CheckCircle, Wallet, Warning } from "@phosphor-icons/react/ssr";
import { Button } from "./Button";
import { useBond } from "@/lib/useBond";

/**
 * Post a bond from the user's own wallet.
 *
 * Deliberately not a one-click "confirm" — a bond is money leaving the user's
 * account and cannot be recovered unless they win. So the amount and the
 * consequence are stated before the signature, and the button says what it will
 * do rather than "Continue".
 *
 * Three outcomes are shown distinctly, because they mean different things:
 *   signing   — the wallet is asking for a signature; nothing has moved
 *   pending   — the transaction is in, waiting for a block
 *   confirmed — the money is in custody, with a HashScan link to prove it
 */
export function BondButton({
  kind,
  likenessId,
  challengeId,
  amountHbar,
  onPosted,
  label,
}: {
  kind: "stake" | "challenge";
  likenessId: string;
  challengeId?: string;
  amountHbar: string;
  onPosted?: (hash: `0x${string}`) => void;
  label?: string;
}) {
  const bond = useBond();

  const text =
    label ??
    (kind === "stake"
      ? `Post ${amountHbar} ℏ bond`
      : `Post ${amountHbar} ℏ challenge bond`);

  const disabled =
    !bond.ready ||
    bond.status === "signing" ||
    bond.status === "pending" ||
    bond.status === "confirmed" ||
    (kind === "challenge" && !challengeId);

  return (
    <div>
      <Button
        size="sm"
        disabled={disabled}
        onClick={async () => {
          const h =
            kind === "stake"
              ? await bond.stake(likenessId, amountHbar)
              : await bond.challenge(likenessId, challengeId!, amountHbar);
          if (h) onPosted?.(h);
        }}
      >
        <Wallet size={15} aria-hidden="true" />
        {bond.status === "signing"
          ? "Waiting for your signature…"
          : bond.status === "pending"
            ? "Confirming on Hedera…"
            : bond.status === "confirmed"
              ? "Bond posted"
              : text}
      </Button>

      {bond.status === "confirmed" && bond.hash && (
        <p role="status" className="body-6 mt-2 flex items-start gap-2 text-ink2">
          <CheckCircle size={15} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
          <span>
            Bond held by the contract.{" "}
            <a
              href={`https://hashscan.io/testnet/transaction/${bond.hash}`}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:no-underline"
            >
              View on HashScan
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </span>
        </p>
      )}

      {bond.error && (
        <p role="alert" className="body-6 mt-2 flex items-start gap-2 text-[var(--state-disputed)]">
          <Warning size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          {bond.error}
        </p>
      )}

      {bond.blockedReason && !bond.error && (
        <p className="body-6 mt-2 text-ink3">{bond.blockedReason}</p>
      )}

      <p className="body-6 mt-2 text-ink3">
        This comes out of your wallet and is held by the contract, not by us.
        {kind === "challenge"
          ? " You get it back only if your face matches the reference."
          : " You get it back if the record settles or is revoked."}
      </p>
    </div>
  );
}
