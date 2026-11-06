"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Scales, X } from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { Button } from "@/components/Button";
import { ConnectGate } from "@/components/ConnectGate";

/**
 * Resolver review — where a 2-of-3 quorum is recorded.
 *
 * Each resolver records an independent reading. The screen does not compute a
 * majority and does not show a running tally: showing "2 of 3 agree" while the
 * third is still reading invites the third to fall in line, which is exactly the
 * failure this design exists to avoid. Readings are sealed until all three are
 * in, and the page says so.
 *
 * The threshold values below are the same unmeasured placeholders as
 * `lib/match.ts` (0.65 / 0.45). They are labelled as provisional here rather
 * than presented as tuned.
 */

const READING = {
  dispute: "d-0417",
  likeness: "Studio portrait, 2024",
  claimant: "0x4f2a…d3",
  threshold: 0.65,
  noMatch: 0.45,
  resolvers: [
    { id: "r1", addr: "0x8b1c…4e", reading: 0.91, sealed: true },
    { id: "r2", addr: "0xc93e…a0", reading: 0.88, sealed: true },
    { id: "r3", addr: "0x2d77…19", reading: null, sealed: false },
  ],
};

export default function Review() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageIntro
          eyebrow="Resolver"
          title="Review a disputed likeness"
          intro="Three resolvers read each challenge independently, against the frozen reference. Readings are recorded, not voted on."
          backHref="/explore"
        />

        <div className="mx-auto w-full max-w-[860px] px-6 py-10 md:px-12 md:py-14">
          <ConnectGate
            title="Connect a resolver wallet to review"
            reason="Only the three addresses holding this dispute can record a reading."
          >
            <ReviewBody />
          </ConnectGate>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ReviewBody() {
  const [recorded, setRecorded] = useState<number | null>(null);

  // Derived, not counted once: recording a reading has to move the number, and
  // the silence-until-all-in rule is the whole point of the screen.
  const sealedCount =
    READING.resolvers.filter((r) => r.sealed).length + (recorded === null ? 0 : 1);

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-labelledby="dispute"
        className="rounded-lg border border-line bg-surface2 p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 id="dispute" className="title-4 text-ink">
              Dispute {READING.dispute}
            </h2>
            <p className="body-6 mt-1 text-ink3">
              Against {READING.likeness} · claimant {READING.claimant}
            </p>
          </div>
          {/* Sealed count, not a tally of agreement. */}
          <p className="caption-4 font-mono uppercase tracking-[0.06em] text-ink2">
            {sealedCount} of 3 readings in
          </p>
        </div>

        <div className="mt-4 rounded-md border border-line bg-surface3 p-4">
          <p className="body-5 flex items-start gap-2 text-ink">
            <Scales size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
            <span>
              Do not compare with the other resolvers. Your reading is sealed
              when you record it, and nobody sees it until all three are in —
              that is what keeps the second reading from anchoring on the first.
            </span>
          </p>
        </div>
      </section>

      <section aria-labelledby="readings" className="rounded-lg border border-line bg-surface2 p-5">
        <h2 id="readings" className="title-4 text-ink">
          Readings
        </h2>

        <ul className="mt-3 divide-y divide-line">
          {READING.resolvers.map((r, i) => (
            <li key={r.id} className="flex items-center justify-between gap-4 py-3">
              <span className="font-mono text-[0.8125rem] text-ink2">{r.addr}</span>
              {r.sealed ? (
                <span className="flex items-center gap-2">
                  {/* The value is withheld until every reading is in. It was
                      shown here, which contradicted the rule stated above it. */}
                  <span
                    className="tnum font-mono text-[0.8125rem] text-ink3"
                    aria-label="Reading sealed and withheld until all three are in"
                  >
                    &middot;&middot;
                  </span>
                  <span className="caption-5 flex items-center gap-1 font-mono uppercase text-[var(--state-active)]">
                    <Check size={11} aria-hidden="true" />
                    Sealed
                  </span>
                </span>
              ) : (
                <span className="caption-5 font-mono uppercase text-ink3">
                  Awaiting reading
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* The placeholder thresholds, labelled as such rather than presented
            as calibrated. */}
        <p className="body-6 mt-4 border-t border-line pt-3 text-ink3">
          A reading at or above{" "}
          <span className="tnum text-ink2">{READING.threshold.toFixed(2)}</span>{" "}
          supports the claim; below{" "}
          <span className="tnum text-ink2">{READING.noMatch.toFixed(2)}</span>{" "}
          rejects it. Between the two the reading goes to evidence. These two
          values are provisional and have not been calibrated.
        </p>
      </section>

      <section aria-labelledby="record" className="rounded-lg border border-line bg-surface2 p-5">
        <h2 id="record" className="title-4 text-ink">
          Record your reading
        </h2>

        {recorded === null ? (
          <>
            <p className="body-5 mt-1.5 text-ink2">
              Recording seals your reading. It cannot be changed afterwards.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="sm" onClick={() => setRecorded(0.9)}>
                <Check size={15} aria-hidden="true" />
                This is the claimant
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setRecorded(0.2)}>
                <X size={15} aria-hidden="true" />
                This is not the claimant
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRecorded(-1)}>
                Send to evidence
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-2">
            <p className="body-4 flex items-center gap-2 text-ink">
              <span className="grid size-6 place-items-center rounded-full bg-accent text-accentink">
                <Check size={14} weight="bold" aria-hidden="true" />
              </span>
              Reading sealed
            </p>
            <p className="body-5 mt-2 text-ink2">
              {sealedCount} of 3 readings are now in. The outcome is written when
              the third arrives.
            </p>
          </div>
        )}
      </section>

      <Link
        href="/explore"
        className="body-5 press inline-flex min-h-11 items-center gap-1.5 self-start text-ink2 hover:text-ink"
      >
        Back to the registry
        <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
