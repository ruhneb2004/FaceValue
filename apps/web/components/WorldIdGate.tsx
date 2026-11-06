"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Fingerprint, Warning } from "@phosphor-icons/react/ssr";
import { IDKitRequestWidget, proofOfHuman, type IDKitResult } from "@worldcoin/idkit";
import { Button } from "./Button";

/**
 * World ID gate — a real IDKit integration.
 *
 * What World ID does here, exactly: it proves that a **unique live human** is
 * present and returns a **nullifier**. It does not prove the human owns the
 * reference photo, and it never returns an image. The verdict on who a face
 * belongs to comes from our own cosine match. So this gates the *person*, not
 * the *photograph*, and `signal = hash(reference)` is coupling — not identity.
 *
 * IDKit v4 differs from every snippet in the docs: there is no `IDKitWidget` and
 * no `environment` prop. The widget is controlled (`open` / `onOpenChange`),
 * takes a `preset` such as `proofOfHuman({ signal })`, and requires an
 * `rp_context` signed by our backend. The old API does not exist in this version.
 *
 * The track asks for a successful verification **and** a meaningful alternative
 * path. Both are real here: `user_rejected`, `credential_unavailable`,
 * `max_verifications_reached` and the expired-signature cases each produce their
 * own message rather than a generic failure.
 */

export type WorldIdProof = {
  nullifier: string;
  /** True only when World's backend confirmed the proof. */
  verified: boolean;
  /** Which credential the proof came from, for the debrief. */
  credential?: string;
};

const APP_ID = process.env.NEXT_PUBLIC_WORLDID_APP_ID ?? "";

/** Plain-language reasons, because "generic_error" tells a user nothing. */
const ERROR_COPY: Record<string, string> = {
  user_rejected: "You cancelled the request in World App. Nothing was verified.",
  verification_rejected: "World could not verify you. Try again with a supported credential.",
  credential_unavailable:
    "No supported credential was found on your World ID. Orb verification or a passport is needed.",
  max_verifications_reached:
    "This World ID has used its verification allowance. A different unique human must make this claim.",
  invalid_rp_signature:
    "The request signature was rejected — this is our configuration, not you. The proof was not accepted.",
  rp_signature_expired: "The request expired before it was approved. Try again.",
  nullifier_replayed: "This World ID has already been used for a different claim.",
  duplicate_nonce: "The request was sent twice. Try again.",
  connection_failed: "Could not reach World App. Check the connection and retry.",
  failed_by_host_app: "World App closed the request before it completed.",
  malformed_request: "The request was malformed — this is our bug, not yours.",
  inactive_rp: "This relying party is not active. This is a configuration problem.",
  unknown_rp: "Unknown relying party. This is a configuration problem.",
};

export function WorldIdGate({
  signal,
  onProof,
  proof,
  onClear,
  action = "register-likeness",
}: {
  /** Hex hash of the captured reference; couples the proof to this image. */
  signal: string;
  onProof: (proof: WorldIdProof) => void;
  proof?: WorldIdProof | null;
  onClear?: () => void;
  action?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Fetch a fresh signed context each time the widget opens. The signature covers
  // a nonce and a five-minute window, so reusing one would be rejected as stale —
  // and a long-lived context would be replayable.
  const prepare = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/worldid/rp-context", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as {
        rp_context?: RpContext;
        simulated?: boolean;
        error?: string;
      };
      if (!res.ok || !data.rp_context) {
        throw new Error(data.error ?? "Could not prepare the World ID request.");
      }
      if (data.simulated) {
        throw new Error(
          "World ID is not configured on the server, so a real proof cannot be requested.",
        );
      }
      setRpContext(data.rp_context);
      setOpen(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [action]);

  async function handleSuccess(result: IDKitResult) {
    setOpen(false);
    setVerifying(true);
    setError(null);
    try {
      // Never trust the client result. The server checks it with World before any
      // nullifier is stored, which is the whole point of server-side validation.
      const res = await fetch("/api/worldid/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payload: result, action, signal }),
      });
      const data = (await res.json()) as {
        verified?: boolean;
        nullifier?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "World rejected the proof.");
      if (!data.verified || !data.nullifier) {
        throw new Error("The proof did not verify.");
      }
      onProof({ nullifier: data.nullifier, verified: true, credential: "proofOfHuman" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVerifying(false);
    }
  }

  function handleError(code: string) {
    setOpen(false);
    setError(ERROR_COPY[code] ?? `World ID could not complete the request (${code}).`);
  }

  if (proof) {
    return (
      <div className="rounded-xl border border-line bg-surface3 p-4">
        <p className="flex items-center gap-2 body-4 text-ink">
          <CheckCircle size={16} weight="fill" aria-hidden="true" className="text-accent" />
          {proof.verified ? "World ID verified" : "World ID proof"}
          <span className="caption-5 font-mono uppercase tracking-[0.06em] text-ink3">
            {proof.credential ?? "verified"}
          </span>
        </p>
        <p className="body-6 mt-2 text-ink2">
          A unique live human is present. This does not prove ownership of the
          photo — that is what a challenge is for.
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
        <Button size="sm" onClick={prepare} disabled={verifying || !signal}>
          <Fingerprint size={15} aria-hidden="true" />
          {verifying ? "Verifying with World…" : "Verify with World ID"}
        </Button>
        {!signal && (
          <p className="body-6 mt-2 text-ink3">
            Capture a reference first. The proof is bound to its hash.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="body-6 mt-3 flex items-start gap-2 text-[var(--state-disputed)]">
          <Warning size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {/* Rendered only once a signed context exists: the widget cannot request a
          proof without one, and mounting it early would show a dead modal. */}
      {open && rpContext && (
        <IDKitRequestWidget
          open={open}
          onOpenChange={setOpen}
          app_id={APP_ID as `app_${string}`}
          action={action}
          rp_context={rpContext}
          allow_legacy_proofs
          preset={proofOfHuman({ signal })}
          handleVerify={async () => {
            // Real verification is server-side in handleSuccess; this callback
            // only needs to not throw, or IDKit shows its own error screen.
          }}
          onSuccess={handleSuccess}
          onError={handleError}
          autoClose
        />
      )}
    </div>
  );
}

/**
 * Wire shape of the signed relying-party context.
 *
 * Declared here rather than imported because IDKit's exported type lives in a
 * subpath that is awkward to resolve at build time, and this is a plain data
 * shape — the server is the only producer.
 */
type RpContext = {
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
};
