"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Lock, Wallet } from "@phosphor-icons/react/ssr";
import { useWallet } from "@/lib/wallet";
import { Button } from "./Button";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Gates a screen behind a connected wallet. A page, not a modal: no focus
 * trap, no scroll lock, nothing to escape from. The pending state is announced
 * in a live region so motion is never the only signal (B9).
 */
export function ConnectGate({
  children,
  title = "Connect a wallet to browse",
  reason = "Prices, bonds and open challenges are per wallet, so the registry asks you to connect before showing them.",
}: {
  children: React.ReactNode;
  title?: string;
  reason?: string;
}) {
  const { status, connect } = useWallet();
  const reduce = useReducedMotion();

  if (status === "connected") return <>{children}</>;

  const connecting = status === "connecting";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-[1440px] items-center justify-center px-3 py-3 md:px-3"
    >
      <div className="w-full max-w-[34rem] rounded-xl border border-line bg-surface3 p-3">
        <div className="mb-2 flex size-11 items-center justify-center rounded-md bg-accentsoft">
          <Lock size={20} className="text-accent" aria-hidden="true" />
        </div>

        <h1 className="heading-6 text-ink">{title}</h1>
        <p className="body-6 mt-2 text-ink2">{reason}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button onClick={connect} disabled={connecting} size="md">
            <Wallet size={16} aria-hidden="true" />
            {connecting ? "Connecting" : "Connect wallet"}
          </Button>
          <Button href="/" variant="ghost" size="md">
            What is FaceValue?
          </Button>
        </div>

        <p aria-live="polite" className="caption-5 mt-2 font-mono text-ink3">
          {connecting
            ? "Waiting for the wallet to approve"
            : "Demo wallet: this mints a local address and asks for no signature."}
        </p>

        <p className="caption-5 mt-2 border-t border-line pt-2 text-ink3">
          Browsing is free.{" "}
          <Link href="/" className="text-ink2 hover:text-ink">
            Read what a licence covers
          </Link>{" "}
          first if you would rather.
        </p>
      </div>
    </motion.div>
  );
}
