"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Lock, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { Button } from "./Button";

/**
 * Gates a screen behind a connected wallet.
 *
 * Three states, all explicit: disconnected (the wall), connecting (pending),
 * connected (children). `returnTo` is the path to come back to after
 * connecting, so a deep link is not lost.
 */
export function ConnectGate({
  children,
  title = "Connect a wallet to browse",
  reason = "The registry is public to read on chain. This marketplace shows per-use prices and bonded claims, so it asks for a wallet first.",
  returnTo,
}: {
  children: React.ReactNode;
  title?: string;
  reason?: string;
  returnTo?: string;
}) {
  const { status, connect } = useWallet();
  const reduce = useReducedMotion();

  if (status === "connected") return <>{children}</>;

  const connecting = status === "connecting";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1440px] items-center justify-center px-4 py-16 md:px-6 md:py-24"
    >
      <div className="card w-full max-w-[34rem] p-6 md:p-8">
        <div className="mb-5 flex size-11 items-center justify-center rounded-control bg-accent-soft">
          <Lock className="size-5 text-accent" aria-hidden="true" />
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          {title}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{reason}</p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {/* One primary action: connecting is the only thing to do here. */}
          <Button onClick={connect} disabled={connecting}>
            <Wallet className="size-4" aria-hidden="true" />
            {connecting ? "Connecting…" : "Connect wallet"}
          </Button>
          <Button href="/" variant="ghost">
            What is FaceValue?
          </Button>
        </div>

        {/* Static cue alongside the pending state, so motion is never the only
            signal. */}
        <p aria-live="polite" className="mt-4 font-mono text-[11px] text-ink-3">
          {connecting
            ? "Waiting for the wallet to approve…"
            : "Demo wallet: this mints a local address. No signature is requested."}
        </p>

        {returnTo && (
          <p className="mt-6 border-t border-line pt-4 text-xs text-ink-3">
            You were heading to{" "}
            <Link href={returnTo} className="text-ink underline underline-offset-2">
              {returnTo}
            </Link>
            . You will be returned there once connected.
          </p>
        )}
      </div>
    </motion.div>
  );
}
