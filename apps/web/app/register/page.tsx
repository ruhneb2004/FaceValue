"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Fingerprint,
  Hash,
  ShieldCheck,
  Timer,
} from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { Stepper } from "@/components/Stepper";
import { Field, TextInput } from "@/components/Field";
import { Button } from "@/components/Button";
import { ConnectGate } from "@/components/ConnectGate";
import { LikenessAvatar } from "@/components/LikenessAvatar";
import { StateBadge } from "@/components/StateBadge";
import { ReferenceCapture, type CapturedReference } from "@/components/ReferenceCapture";
import { WorldIdGate, type WorldIdProof } from "@/components/WorldIdGate";
import { useWallet } from "@/lib/wallet";

/**
 * Register a likeness — four steps in one shell.
 *
 * Copy rule that governs this whole flow: the outcome is "Likeness registered".
 * It is never "verified", because nothing here verifies anything — registration
 * freezes a hash and opens a settlement window. Saying "verified" would claim a
 * result the system does not produce, and the dispute rules exist precisely
 * because a registration is a claim, not a fact.
 *
 * The camera is real. A frame is captured locally, its SHA-256 is computed in
 * the browser, and only that hash is sent to the registry — the image itself is
 * never uploaded or stored. The hash is shown on screen so the claim is visible
 * rather than asserted.
 *
 * Layout: the form sits left and a sticky rail sits right. The rail is not
 * decoration — it previews the record being built (the avatar is drawn from the
 * same seed the real one will use), states the current step's single governing
 * fact, and carries the privacy line. Before this, the screen was a narrow
 * column of bordered inputs in a field of empty surface, which read as a form
 * on a blank page rather than a product.
 */

const STEPS = ["Capture", "Details", "Settlement", "Review"] as const;

/** One governing fact per step, for the rail. Real mechanism, not filler. */
const STEP_COPY: Record<number, { title: string; line: string; icon: React.ReactNode }> = {
  0: {
    title: "What a reference is",
    line: "A frozen image used only for comparison. Its hash is written; the image stays here.",
    icon: <Fingerprint size={16} aria-hidden="true" />,
  },
  1: {
    title: "What a buyer sees",
    line: "The name and ENS reference are the terms. They are read before anyone clears a use.",
    icon: <Hash size={16} aria-hidden="true" />,
  },
  2: {
    title: "Why the wait",
    line: "The window gives a competing owner time to challenge before the record can earn.",
    icon: <Timer size={16} aria-hidden="true" />,
  },
  3: {
    title: "Registered, not verified",
    line: "Writing a record states a claim. It does not prove an identity — a challenge does.",
    icon: <Check size={16} aria-hidden="true" />,
  },
};

export default function Register() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageIntro
          eyebrow="Register"
          title="Register a likeness"
          intro="Registration freezes a reference and opens a settlement window. It does not prove that anyone is who they say they are — that is what a challenge is for."
          backHref="/explore"
        />

        <section className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
          <ConnectGate
            title="Connect a wallet to register"
            reason="A likeness is owned by an address. Connecting costs nothing and signs nothing."
          >
            <RegisterFlow />
          </ConnectGate>
        </section>
      </main>
      <Footer />
    </>
  );
}

function RegisterFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ensName, setEnsName] = useState("");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState<CapturedReference | null>(null);
  const [proof, setProof] = useState<WorldIdProof | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { address } = useWallet();

  const nameError =
    touched && name.trim().length < 3
      ? "Give the likeness a name of at least three characters, so a buyer can tell it apart from others."
      : undefined;

  if (done) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div className="rounded-2xl border border-line bg-surface2 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-accent text-accentink">
              <Check size={20} weight="bold" aria-hidden="true" />
            </span>
            {/* The exact wording the brief requires. */}
            <h2 className="title-1 text-ink">Likeness registered</h2>
          </div>
          <p className="body-3 mt-4 max-w-[52ch] text-ink2">
            <span className="font-medium text-ink">{name.trim() || "This likeness"}</span>{" "}
            is now provisional for 24 hours. It becomes licensable when the
            settlement window closes, unless a challenge is raised first.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/explore">
              See it in the registry
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDone(false);
                setStep(0);
                setName("");
                setEnsName("");
                setTouched(false);
              }}
            >
              Register another
            </Button>
          </div>
        </div>
        <RecordRail name={name} ensName={ensName} state="provisional" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-14">
      {/* Form column */}
      <div className="min-w-0 rounded-2xl border border-line bg-surface2 p-5 md:p-7">
        <Stepper steps={[...STEPS]} current={step} />

        <div className="mt-7">
          {step === 0 && (
            <div>
              <h2 className="title-2 text-ink">Capture the reference</h2>
              <p className="body-5 mt-2 max-w-[56ch] text-ink2">
                One straight-on photograph. This becomes the frozen reference
                every future challenge is measured against.
              </p>

              {/* The capture is real: camera (or a file, because judging
                  laptops often have none), hashed in the browser. The hash is
                  the only thing that travels. */}
              <div className="mt-5">
                <ReferenceCapture
                  captured={reference}
                  onCapture={(ref) => setReference(ref)}
                  onClear={() => {
                    if (reference) URL.revokeObjectURL(reference.previewUrl);
                    setReference(null);
                  }}
                />
              </div>

              {/* World ID gates that a unique human is present. It is bound to
                  the reference hash via `signal`, and it says whether the proof
                  was real or simulated. */}
              <div className="mt-4">
                <WorldIdGate
                  signal={reference?.hash ?? ""}
                  proof={proof}
                  onProof={setProof}
                  onClear={() => setProof(null)}
                />
              </div>

              <p className="body-6 mt-4 flex items-start gap-2 text-ink2">
                <ShieldCheck
                  size={15}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-accent"
                />
                The image never leaves this device.
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="title-2 text-ink">Name and reference</h2>
              <p className="body-5 mt-2 max-w-[56ch] text-ink2">
                These are the terms a buyer reads before clearing a use.
              </p>

              <div className="mt-6 flex flex-col gap-6">
                <Field
                  label="Likeness name"
                  hint="How this reference is listed. Use the subject or the shoot, not the file name."
                  error={nameError}
                >
                  {(p) => (
                    <TextInput
                      {...p}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched(true)}
                      placeholder="Editorial headshot, March"
                    />
                  )}
                </Field>

                <Field
                  label="ENS reference"
                  hint="Optional. Written as a subname of faceref.eth. Only a hash of the reference goes here."
                >
                  {(p) => (
                    <TextInput
                      {...p}
                      value={ensName}
                      onChange={(e) => setEnsName(e.target.value)}
                      placeholder="ref-009.faceref.eth"
                    />
                  )}
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="title-2 text-ink">Settlement window</h2>
              <p className="body-5 mt-2 max-w-[56ch] text-ink2">
                While a likeness is provisional it cannot be licensed. The window
                gives anyone holding a competing claim time to challenge it.
              </p>

              <dl className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface3">
                <FactRow k="Window" v="24 hours" />
                <FactRow k="Becomes licensable" v="When the window closes" />
                <FactRow
                  k="To challenge"
                  v="Post a bond; the face decides, not the count"
                />
              </dl>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="title-2 text-ink">Review</h2>
              <p className="body-5 mt-2 max-w-[56ch] text-ink2">
                Check the record before it is written. Nothing here is editable
                once it is on chain.
              </p>

              <dl className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface3">
                <FactRow k="Name" v={name.trim() || "Not given"} />
                <FactRow
                  k="ENS reference"
                  v={ensName.trim() || "Not written"}
                  mono
                />
                <FactRow k="Resulting state" v="Provisional" />
              </dl>

              <p className="body-6 mt-4 text-ink2">
                Registering states a claim. It does not verify an identity.
              </p>
            </div>
          )}
        </div>

        {/* Navigation. Next is blocked only on the step that has a required
            field, and the reason is on the field itself. */}
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              size="sm"
              onClick={() => {
                if (step === 1) {
                  setTouched(true);
                  if (name.trim().length < 3) return;
                }
                setStep((s) => s + 1);
              }}
            >
              Continue
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={submitting || !reference || !address}
              onClick={async () => {
                if (!reference || !address) return;
                setSubmitting(true);
                setSubmitError(null);
                try {
                  const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      name: name.trim(),
                      ensName: ensName.trim() || undefined,
                      controller: address,
                      pricePerUse: 20,
                      referenceHash: reference.hash,
                      nullifier: proof?.nullifier,
                    }),
                  });
                  if (!res.ok) {
                    const data = (await res.json().catch(() => ({}))) as { error?: string };
                    throw new Error(data.error ?? "Registration failed.");
                  }
                  setDone(true);
                } catch (err) {
                  setSubmitError((err as Error).message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Registering…" : "Register likeness"}
            </Button>
          )}

          {submitError && (
            <p role="alert" className="body-6 mt-3 text-[var(--state-disputed)]">
              {submitError}
            </p>
          )}
        </div>
      </div>

      {/* Context rail */}
      <aside className="min-w-0 lg:sticky lg:top-28">
        <RecordRail name={name} ensName={ensName} state="provisional" />

        <div className="mt-4 rounded-xl border border-line bg-surface2 p-5">
          <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink3">
            <span className="text-accent">{STEP_COPY[step].icon}</span>
            Step {step + 1} of {STEPS.length}
          </p>
          <h3 className="title-4 mt-3 text-ink">{STEP_COPY[step].title}</h3>
          <p className="body-6 mt-1.5 text-ink2">{STEP_COPY[step].line}</p>
        </div>
      </aside>
    </div>
  );
}

/** The record as it stands, drawn live from the fields the user is filling. */
function RecordRail({
  name,
  ensName,
  state,
}: {
  name: string;
  ensName: string;
  state: "provisional";
}) {
  const seed = name.trim() || "new-likeness";
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface2">
      <div className="relative aspect-square w-full bg-surface3">
        <LikenessAvatar
          seed={seed}
          className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
        />
        <div className="absolute left-3 top-3">
          <StateBadge state={state} compact />
        </div>
      </div>
      <div className="border-t border-line p-4">
        <p className="caption-4 font-mono uppercase tracking-[0.08em] text-ink3">
          Live preview
        </p>
        <p className="title-3 mt-1 truncate text-ink">
          {name.trim() || "Untitled likeness"}
        </p>
        <p className="caption-5 mt-1 truncate font-mono text-ink2">
          {ensName.trim() || "no ENS reference yet"}
        </p>
      </div>
    </div>
  );
}

function FactRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="body-6 text-ink2">{k}</dt>
      <dd
        className={`body-5 text-right text-ink ${mono ? "font-mono text-[0.8125rem]" : ""}`}
      >
        {v}
      </dd>
    </div>
  );
}
