"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ShieldCheck,
} from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Stepper } from "@/components/Stepper";
import { Field, TextInput } from "@/components/Field";
import { Button } from "@/components/Button";
import { ConnectGate } from "@/components/ConnectGate";

/**
 * Register a likeness — four steps, one screen.
 *
 * Copy rule that governs this whole flow: the outcome is "Likeness registered".
 * It is never "verified", because nothing here verifies anything — registration
 * freezes a hash and opens a settlement window. Saying "verified" would claim a
 * result the system does not produce, and the dispute rules exist precisely
 * because a registration is a claim, not a fact.
 *
 * The camera is a placeholder. It renders the shape of the capture without
 * requesting a device, so the flow can be walked in a demo and reviewed without
 * a permission prompt. The element says so in words rather than looking like a
 * broken preview.
 */

const STEPS = ["Capture", "Details", "Settlement", "Review"] as const;

export default function Register() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-[760px] px-6 pb-24 pt-8 md:px-8 md:pt-12">
          <Link
            href="/explore"
            className="body-5 press inline-flex min-h-11 items-center gap-1.5 text-ink2 hover:text-ink"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to the registry
          </Link>

          <h1 className="heading-3 mt-2 text-ink text-balance">
            Register a likeness
          </h1>
          <p className="body-4 mt-3 max-w-[60ch] text-ink2">
            Registration freezes a reference and opens a settlement window. It
            does not prove that anyone is who they say they are — that is what a
            challenge is for.
          </p>

          <div className="mt-8">
            <ConnectGate
              title="Connect a wallet to register"
              reason="A likeness is owned by an address. Connecting costs nothing and signs nothing."
            >
              <RegisterFlow />
            </ConnectGate>
          </div>
        </div>
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

  const nameError =
    touched && name.trim().length < 3
      ? "Give the likeness a name of at least three characters, so a buyer can tell it apart from others."
      : undefined;

  if (done) {
    return (
      <div className="rounded-lg border border-line bg-surface2 p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-accentink">
            <Check size={18} weight="bold" aria-hidden="true" />
          </span>
          {/* The exact wording the brief requires. */}
          <h2 className="title-2 text-ink">Likeness registered</h2>
        </div>
        <p className="body-4 mt-3 text-ink2">
          {name} is now provisional for 24 hours. It becomes licensable when the
          settlement window closes, unless a challenge is raised first.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href="/explore">See it in the registry</Button>
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
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface2 p-5 md:p-6">
      <Stepper steps={[...STEPS]} current={step} />

      <div className="mt-6">
        {step === 0 && (
          <div>
            <h2 className="title-3 text-ink">Capture the reference</h2>
            <p className="body-5 mt-2 text-ink2">
              One straight-on photograph. This becomes the frozen reference every
              future challenge is measured against.
            </p>

            {/* A placeholder that says what it is, rather than an empty box that
                looks like a broken camera. */}
            <div className="mt-4 grid aspect-[4/3] w-full place-items-center rounded-md border border-dashed border-linestrong bg-surface3">
              <div className="px-6 text-center">
                <Camera
                  size={28}
                  aria-hidden="true"
                  className="mx-auto text-ink3"
                />
                <p className="body-5 mt-2 text-ink2">
                  Camera capture is not wired in this build
                </p>
                <p className="body-6 mt-1 text-ink3">
                  The reference would be stored locally and only its hash written
                </p>
              </div>
            </div>

            <p className="body-6 mt-3 flex items-start gap-2 text-ink2">
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
            <h2 className="title-3 text-ink">Name and reference</h2>
            <p className="body-5 mt-2 text-ink2">
              These are the terms a buyer reads before clearing a use.
            </p>

            <div className="mt-5 flex flex-col gap-5">
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
            <h2 className="title-3 text-ink">Settlement window</h2>
            <p className="body-5 mt-2 text-ink2">
              While a likeness is provisional it cannot be licensed. The window
              gives anyone holding a competing claim time to challenge it.
            </p>

            <dl className="mt-5 divide-y divide-line rounded-md border border-line bg-surface3">
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="body-6 text-ink2">Window</dt>
                <dd className="body-5 text-ink">24 hours</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="body-6 text-ink2">Becomes licensable</dt>
                <dd className="body-5 text-ink">When the window closes</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="body-6 text-ink2">To challenge</dt>
                <dd className="body-5 text-right text-ink">
                  Post a bond; the face decides, not the count
                </dd>
              </div>
            </dl>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="title-3 text-ink">Review</h2>
            <p className="body-5 mt-2 text-ink2">
              Check the record before it is written. Nothing here is editable
              once it is on chain.
            </p>

            <dl className="mt-5 divide-y divide-line rounded-md border border-line bg-surface3">
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="body-6 text-ink2">Name</dt>
                <dd className="body-5 text-right text-ink">
                  {name.trim() || "Not given"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="body-6 text-ink2">ENS reference</dt>
                <dd className="body-5 text-right font-mono text-ink">
                  {ensName.trim() || "Not written"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="body-6 text-ink2">Resulting state</dt>
                <dd className="body-5 text-right text-ink">Provisional</dd>
              </div>
            </dl>

            <p className="body-6 mt-4 text-ink2">
              Registering states a claim. It does not verify an identity.
            </p>
          </div>
        )}
      </div>

      {/* Navigation. Next is blocked only on the step that has a required field,
          and the reason is on the field itself. */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
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
          <Button size="sm" onClick={() => setDone(true)}>
            Register likeness
          </Button>
        )}
      </div>
    </div>
  );
}
