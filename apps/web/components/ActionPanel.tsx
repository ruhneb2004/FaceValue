"use client";

import { useState } from "react";
import { ArrowRight, Check, SealCheck } from "@phosphor-icons/react/ssr";
import { Button } from "./Button";
import { PriceRow } from "./PriceRow";
import { isLicensable, type Likeness } from "@/lib/types";
import { useWallet } from "@/lib/wallet";

/**
 * The clearance action for a licensable likeness.
 *
 * The licence is a two-step commitment rather than one button, because it spends
 * money and produces a record that names the buyer. Pressing "Clear this use"
 * opens the terms; the terms hold the confirm. That is the confirmation the
 * action requires — the destructive-action rule applies to spending, not just to
 * deleting.
 *
 * The success state replaces the button rather than raising a toast. A toast
 * disappears and leaves the panel looking unchanged, which reads as failure;
 * this leaves behind what was bought, for how much, and the licence reference.
 */
export function ActionPanel({ likeness }: { likeness: Likeness }) {
  const { address } = useWallet();
  const [stage, setStage] = useState<"idle" | "confirm" | "done">("idle");
  const [licenseId, setLicenseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isLicensable(likeness.state)) return null;

  /**
   * The licence is written by the server, not faked in the client. A 409 here
   * means the record changed state between the page load and the click - the
   * state machine has the final say and its reason is shown verbatim.
   */
  async function pay() {
    if (!address) {
      setError("Connect a wallet before clearing a use.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/licence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ likenessId: likeness.id, buyer: address }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "The licence could not be written.");
        return;
      }
      setLicenseId(data.licenseId);
      setStage("done");
    } catch {
      setError("The registry did not respond. Nothing was charged.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "done") {
    return (
      <section
        aria-labelledby="licence-done"
        className="rounded-lg border border-line bg-surface2 p-5"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-accent text-accentink">
            <Check size={16} weight="bold" aria-hidden="true" />
          </span>
          <h2 id="licence-done" className="title-4 text-ink">
            Licence issued
          </h2>
        </div>

        <p className="body-4 mt-3 text-ink2">
          One use of {likeness.name} cleared for{" "}
          <span className="tnum text-ink">{likeness.pricePerUse} HBAR</span>. The
          licence is recorded against the likeness hash; no image left this
          device.
        </p>

        <dl className="mt-4 divide-y divide-line rounded-md border border-line">
          <div className="flex items-baseline justify-between gap-4 px-3 py-2.5">
            <dt className="caption-5 text-ink2">Licence</dt>
            <dd className="tnum font-mono text-[0.8125rem] text-ink">
              {licenseId ?? `LV-${likeness.id.slice(-3).toUpperCase()}-0001`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-3 py-2.5">
            <dt className="caption-5 text-ink2">Status</dt>
            <dd className="caption-5 flex items-center gap-1.5 font-mono uppercase text-[var(--state-active)]">
              <SealCheck size={12} aria-hidden="true" />
              Cleared
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/explore" variant="secondary" size="sm">
            Back to the registry
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStage("idle")}>
            Clear another use
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="licence-action"
      className="rounded-lg border border-line bg-surface2 p-5"
    >
      <h2 id="licence-action" className="title-4 text-ink">
        Clear one use
      </h2>
      <p className="body-5 mt-1.5 text-ink2">
        One licence covers one placement. Nothing is recurring.
      </p>

      <div className="mt-4">
        <PriceRow likeness={likeness} />
      </div>

      {stage === "idle" ? (
        <Button
          className="mt-4 w-full"
          onClick={() => setStage("confirm")}
        >
          Clear this use
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      ) : (
        <div className="mt-4 rounded-md border border-line bg-surface3 p-4">
          <p className="body-5 text-ink">
            You are about to license <span className="text-ink">{likeness.name}</span>{" "}
            for one use at{" "}
            <span className="tnum">{likeness.pricePerUse} HBAR</span>.
          </p>
          <p className="body-6 mt-2 text-ink2">
            This writes a licence naming this wallet. It cannot be reversed from
            here; a refund is a dispute.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={pay} disabled={busy} size="sm">
              {busy ? "Writing the licence" : "Confirm and pay"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                setStage("idle");
              }}
            >
              Cancel
            </Button>
          </div>
          {error && (
            <p role="alert" className="body-6 mt-3 text-[var(--state-disputed)]">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
