"use client";

import { useState } from "react";
import { Scales, ShieldCheck } from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { ConnectGate } from "@/components/ConnectGate";
import { StateBadge } from "@/components/StateBadge";
import { SEED_LIKENESSES } from "@/lib/seed";
import { isLicensable } from "@/lib/types";

/**
 * Challenge a likeness.
 *
 * The page's whole job is to make the rule explicit before a bond is posted:
 * a challenge is decided by comparing the claimant against the frozen
 * reference, and the count of resolvers does not decide it. Someone staking
 * money on a 2-of-1 reading needs to know that before, not after.
 *
 * The stake is shown as a real number with a stated consequence, because a
 * bond whose loss condition is vague is not a bond.
 */
export default function Challenge() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageIntro
          eyebrow="Dispute"
          title="Challenge a likeness"
          intro="A challenge claims that a registered likeness belongs to someone else. You post a bond. The reference decides, and whoever it identifies takes the stake."
          backHref="/explore"
        />

        <div className="mx-auto w-full max-w-[860px] px-6 py-10 md:px-12 md:py-14">
          <ConnectGate
            title="Connect a wallet to challenge"
            reason="A challenge posts a bond from your address. Connecting costs nothing and signs nothing."
          >
            <ChallengeForm />
          </ConnectGate>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ChallengeForm() {
  const [target, setTarget] = useState(SEED_LIKENESSES[0]?.id ?? "");
  const [evidence, setEvidence] = useState("");
  const [touched, setTouched] = useState(false);

  const evidenceError =
    touched && evidence.trim().length < 20
      ? "Describe what makes the claim specific — at least a sentence. A challenge with no stated grounds can only be decided on the reference alone."
      : undefined;

  const likeness = SEED_LIKENESSES.find((l) => l.id === target);

  return (
    <div className="rounded-lg border border-line bg-surface2 p-5 md:p-6">
      {/* The rule, stated where the money is committed. */}
      <div className="rounded-md border border-line bg-surface3 p-4">
        <p className="body-5 flex items-start gap-2 text-ink">
          <Scales size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
          <span>
            Each resolver compares your reference against the frozen one
            independently. The verdict follows the face, not the number of
            resolvers who agree — a 2-of-1 reading is still recorded as a split.
          </span>
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <Field
          label="Which likeness"
          hint="Only records that exist can be challenged."
        >
          {(p) => (
            <select
              id={p.id}
              aria-describedby={p.describedBy}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="press min-h-11 w-full rounded-md border border-line bg-surface2 px-3 body-4 text-ink hover:border-linestrong focus:border-accent"
            >
              {SEED_LIKENESSES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {isLicensable(l.state) ? "licensable" : l.state}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          label="Grounds for the claim"
          hint="A sentence describing what makes this reference yours."
          error={evidenceError}
        >
          {(p) => (
            <textarea
              id={p.id}
              aria-describedby={p.describedBy}
              aria-invalid={p.invalid || undefined}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={4}
              placeholder="This frames a shoot I did in March; the record was registered from my file."
              className="w-full rounded-md border border-line bg-surface2 px-3 py-2 body-4 text-ink placeholder:text-ink3 hover:border-linestrong focus:border-accent"
            />
          )}
        </Field>

        <Field label="Reference for comparison" hint="A hash is written. The image itself is not uploaded.">
          {(p) => (
            <div
              id={p.id}
              className="grid place-items-center rounded-md border border-dashed border-linestrong bg-surface3 px-6 py-8 text-center"
            >
              <p className="body-5 text-ink2">Capture is not wired in this build</p>
              <p className="body-6 mt-1 text-ink3">
                The bond and the comparison would follow
              </p>
            </div>
          )}
        </Field>
      </div>

      {likeness && (
        <dl className="mt-6 divide-y divide-line rounded-md border border-line bg-surface3">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="body-6 text-ink2">State</dt>
            <dd>
              <StateBadge state={likeness.state} count={likeness.openChallenges} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="body-6 text-ink2">Bond</dt>
            <dd className="tnum body-5 font-mono text-ink">
              {likeness.pricePerUse * 2}
              <span className="caption-5 ml-2 text-ink3">HBAR</span>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="body-6 text-ink2">If the reference identifies you</dt>
            <dd className="body-5 text-right text-ink">You take the stake</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="body-6 text-ink2">If it does not</dt>
            <dd className="body-5 text-right text-ink">The bond is forfeit</dd>
          </div>
        </dl>
      )}

      <p className="body-6 mt-4 flex items-start gap-2 text-ink2">
        <ShieldCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
        No image, embedding or nullifier is published. Only a hash and the
        outcome are written.
      </p>

      {/* No submit button. The bond contract is not deployed, so a control
          here could not do what its label says — and a button that posts
          nothing is worse than an honest stop. The form validates so the
          fields are real; the action is stated as unavailable instead. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <Button variant="ghost" size="sm" href="/explore">
          Back to the registry
        </Button>
        <p className="body-6 max-w-[34ch] text-right text-ink3">
          Posting a bond needs the deployed contract, which this build does not
          have. The challenge flow stops here.
        </p>
      </div>
    </div>
  );
}
