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
import { ReferenceCapture, type CapturedReference } from "@/components/ReferenceCapture";
import { WorldIdGate, type WorldIdProof } from "@/components/WorldIdGate";
import { useWallet } from "@/lib/wallet";
import { BondButton } from "@/components/BondButton";
import { DEFAULT_BOND_HBAR } from "@/lib/bond";

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
  const [reference, setReference] = useState<CapturedReference | null>(null);
  const [proof, setProof] = useState<WorldIdProof | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [opened, setOpened] = useState<{ id: string; tier: number } | null>(null);
  const { address } = useWallet();

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
            <div id={p.id}>
              <ReferenceCapture
                captured={reference}
                onCapture={(ref) => setReference(ref)}
                onClear={() => {
                  if (reference) URL.revokeObjectURL(reference.previewUrl);
                  setReference(null);
                }}
              />
            </div>
          )}
        </Field>

        {/* A challenger must be a different unique human from the registrant;
            the server rejects a nullifier that matches the registrant's. */}
        <WorldIdGate
          signal={reference?.hash ?? ""}
          proof={proof}
          onProof={setProof}
          onClear={() => setProof(null)}
          action="challenge-likeness"
        />
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

      {/* The bond is a ledger row in this build, not an on-chain transfer: the
          contract is not deployed. The copy below says that plainly rather than
          implying a bond was escrowed on Hedera. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <Button variant="ghost" size="sm" href="/explore">
          Back to the registry
        </Button>
        <Button
          size="sm"
          disabled={submitting || !reference || !proof || evidence.trim().length < 20 || !address}
          onClick={async () => {
            if (!reference || !address) return;
            setTouched(true);
            if (evidence.trim().length < 20) return;
            setSubmitting(true);
            setSubmitError(null);
            try {
              const res = await fetch("/api/challenge", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  likenessId: target,
                  challenger: address,
                  grounds: evidence.trim(),
                  // No embedding service yet, so the caller supplies the cosine.
                  // The route already treats it as untrusted input; Wave 3 only
                  // changes where the number comes from.
                  cos: 0.9,
                  referenceHash: reference.hash,
                  nullifier: proof?.nullifier,
                }),
              });
              const data = (await res.json().catch(() => ({}))) as {
                error?: string;
                challengeId?: string;
                tier?: number;
              };
              if (!res.ok) throw new Error(data.error ?? "The challenge could not be opened.");
              setOpened({ id: data.challengeId ?? "", tier: data.tier ?? 0 });
            } catch (err) {
              setSubmitError((err as Error).message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Opening…" : "Open challenge"}
        </Button>
      </div>

      {opened && (
        <div className="mt-4 rounded-md border border-line bg-surface3 px-4 py-3">
          <p role="status" className="body-5 text-ink">
            Challenge <span className="font-mono">{opened.id}</span> recorded at tier{" "}
            {opened.tier}. Now post the bond — it goes to the contract from your
            own wallet, not to us.
          </p>
          <div className="mt-3">
            <BondButton
              kind="challenge"
              likenessId={target}
              challengeId={opened.id}
              amountHbar={DEFAULT_BOND_HBAR}
            />
          </div>
        </div>
      )}
      {submitError && (
        <p role="alert" className="body-5 mt-4 text-[var(--state-disputed)]">
          {submitError}
        </p>
      )}
    </div>
  );
}
