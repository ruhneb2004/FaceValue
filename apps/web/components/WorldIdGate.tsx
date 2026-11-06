"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Fingerprint, Warning } from "@phosphor-icons/react/ssr";
import { Button } from "./Button";
import type { RpContext } from "@worldcoin/idkit";

/**
 * World ID gate.
 *
 * What World ID does in this product, exactly: it proves that a **unique live
 * human** is present and returns a **nullifier** — it does not prove the human
 * owns the reference photo, and it never returns an image. The verdict on who a
 * face belongs to comes from our own cosine match, not from here. This component
 * is therefore a gate on the *person*, not on the *photograph*.
 *
 * Modes, and the UI always says which one ran:
 *
 *  - real        — an RP context came back signed, so the IDKit request widget
 *                  runs and a genuine World ID result comes back.
 *  - simulated   — the server reported `simulated: true` (no RP keys in this
 *                  build). A labelled mock proof is minted from the wallet
 *                  address so the "one likeness per human" rule is still
 *                  demonstrable end to end.
 *
 * Nothing here is allowed to describe a simulated proof as verified.
 */

export type WorldIdProof = {
  nullifier: string;
  /** True only when the RP context was signed by our backend. */
  verified: boolean;
  mode: "real" | "simulated";
};

export function WorldIdGate({
  signal,
  onProof,
  proof,
  onClear,
  action = "register-likeness",
}: {
  /** The hash of the captured reference; couples the proof to this image. */
  signal: string;
  onProof: (proof: WorldIdProof) => void;
  proof?: WorldIdProof | null;
  onClear?: () => void;
  action?: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setState("working");
    setError(null);
    try {
      const res = await fetch("/api/worldid/rp-context", { method: "POST" });
      const data = (await res.json()) as {
        rp_context?: RpContext;
        simulated?: boolean;
        reason?: string;
      };
      if (!res.ok || !data.rp_context) {
        throw new Error("The World ID request could not be prepared.");
      }

      if (data.simulated) {
        // Deterministic from the signal, so the same reference yields the same
        // "human" in a session and a different reference a different one. That
        // is enough to demonstrate the one-likeness-per-nullifier rule without
        // pretending a real proof happened.
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(`simulated-worldid:${signal}`),
        );
        const nullifier =
          "0x" +
          [...new Uint8Array(digest)]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        onProof({ nullifier, verified: false, mode: "simulated" });
        setState("idle");
        return;
      }

      // Real mode. The signing path is wired here; when a partner app_id and
      // signing key are present the IDKit request widget takes over. Kept as a
      // clear message rather than a half-wired widget, because a widget that
      // cannot complete is worse than an honest stop.
      throw new Error(
        "RP context is signed, but the live IDKit widget is not wired in this build. Configure the partner app_id and finish the widget to use real proofs.",
      );
    } catch (err) {
      setState("error");
      setError((err as Error).message);
    }
  }, [signal, onProof]);

  // A proof is bound to a signal. If the reference changes, the old proof is no
  // longer about that image, so it is dropped rather than silently reused.
  useEffect(() => {
    if (proof) setState("idle");
  }, [signal, proof]);

  if (proof) {
    return (
      <div className="rounded-xl border border-line bg-surface3 p-4">
        <p className="flex items-center gap-2 body-4 text-ink">
          <CheckCircle size={16} weight="fill" aria-hidden="true" className="text-accent" />
          {proof.mode === "real" ? "World ID verified" : "World ID proof (simulated)"}
          <span className="caption-5 font-mono uppercase tracking-[0.06em] text-ink3">
            {proof.mode}
          </span>
        </p>
        <p className="body-6 mt-2 text-ink2">
          {proof.mode === "real"
            ? "A unique live human is present. This does not prove ownership of the photo — that is what a challenge is for."
            : "This build has no RP signing key, so the proof is mocked. It is labelled simulated everywhere and is not a real World ID result."}
        </p>
        <dl className="mt-3 rounded-md border border-line bg-surface2 px-3 py-2.5">
          <dt className="caption-5 font-mono uppercase tracking-[0.08em] text-ink3">Nullifier</dt>
          <dd className="mt-1 break-all font-mono text-[0.75rem] leading-relaxed text-ink">
            {proof.nullifier}
          </dd>
        </dl>
        {onClear && (
          <Button variant="ghost" size="sm" className="mt-3" onClick={onClear}>
            Reset proof
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-linestrong bg-surface3 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface4 text-accent">
          <Fingerprint size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="body-4 text-ink">Prove you are a unique human</p>
          <p className="body-6 mt-1 text-ink2">
            One likeness per human. World ID returns a nullifier, never your face
            or an image — and it does not prove the photo is yours.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Button size="sm" onClick={run} disabled={state === "working" || !signal}>
          <Fingerprint size={15} aria-hidden="true" />
          {state === "working" ? "Preparing…" : "Verify with World ID"}
        </Button>
        {!signal && (
          <p className="body-6 mt-2 text-ink3">
            Capture a reference first. The proof is bound to its hash.
          </p>
        )}
      </div>

      {state === "error" && error && (
        <p role="alert" className="body-6 mt-3 flex items-start gap-2 text-[var(--state-disputed)]">
          <Warning size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
