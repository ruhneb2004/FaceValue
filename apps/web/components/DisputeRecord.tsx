"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Check, X } from "@phosphor-icons/react/ssr";
import { LikenessAvatar } from "@/components/LikenessAvatar";

/**
 * One resolved dispute, shown as three readings rather than a table of rows.
 *
 * The section claims the face decides and the count does not, so the record has
 * to make the disagreement the thing you see. A table flattens that: four
 * columns of equal weight say "here are some fields", not "one of these three
 * people was overruled".
 *
 * So each resolver is a card of their own, laid out like the reading it is: who
 * they are, the score they produced, where that score sat against the threshold,
 * and the verdict it led to. The dissenter is not styled as an error — it is
 * styled as a minority reading, which is what it is. The final row states whose
 * face it turned out to be, because that is the outcome the section promises.
 *
 * Laid out on the same alternating two-column rhythm as the licence section, and
 * animated the same way, so the two parts of the page read as one argument.
 */

const THRESHOLD = 0.65;

const READINGS = [
  {
    name: "resolver-1",
    seed: "d-0417-r1",
    cos: 0.91,
    match: true,
    note: "Facial geometry, jaw and brow line agree.",
  },
  {
    name: "resolver-2",
    seed: "d-0417-r2",
    cos: 0.88,
    match: true,
    note: "Independent read, same landmarks, same call.",
  },
  {
    name: "resolver-3",
    seed: "d-0417-r3",
    cos: 0.31,
    match: false,
    note: "Read as a different person. Outvoted, not carried.",
  },
];

function ReadingRow({
  r,
  index,
}: {
  r: (typeof READINGS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" });
  const reduced = useReducedMotion();
  const flipped = index % 2 === 1;

  // Additive motion only: the reading is visible unless we have confirmed on the
  // client that it can animate and that it starts below the fold.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setArmed(true);
  }, [reduced]);

  const from = reduced ? 0 : 20;
  const hidden = armed && !inView;

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10"
    >
      {/* The face this resolver was reading. */}
      <motion.div
        className="min-w-0 md:col-start-1 md:row-start-1"
        animate={{ opacity: hidden ? 0 : 1, x: hidden ? -from : 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      >
        <div className="flex items-center gap-3 md:w-[168px] md:flex-col md:items-start md:gap-2">
          <span className="size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface3 md:size-[168px] md:rounded-xl">
            <LikenessAvatar
              seed={r.seed}
              className="size-full [&>svg]:size-full"
            />
          </span>
          <p className="font-mono text-[0.75rem] text-ink2 md:mt-1">{r.name}</p>
        </div>
      </motion.div>

      {/* The reading itself. */}
      <motion.div
        className="min-w-0 md:col-start-2 md:row-start-1"
        animate={{
          opacity: hidden ? 0 : 1,
          x: hidden ? (flipped ? from : 0) : 0,
        }}
        transition={{
          duration: 0.5,
          delay: hidden || reduced ? 0 : 0.06,
          ease: [0.2, 0, 0, 1],
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[0.75rem] uppercase tracking-[0.08em] ${
              r.match ? "text-accent" : "text-ink2"
            }`}
          >
            {r.match ? (
              <Check size={13} weight="bold" aria-hidden="true" />
            ) : (
              <X size={13} weight="bold" aria-hidden="true" />
            )}
            {r.match ? "Match" : "No match"}
          </span>
          <span className="tnum font-mono text-[0.8125rem] text-ink">
            {r.cos.toFixed(2)}
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink2">
            vs {THRESHOLD}
          </span>
        </div>

        {/* The score as a position on a scale, not a number to interpret. The
            threshold sits at its real place, so 0.91 and 0.31 read as one above
            and one well below without the reader doing arithmetic. */}
        <div
          className="relative mt-3 h-1.5 w-full max-w-[280px] rounded-full bg-surface4"
          role="img"
          aria-label={`Cosine ${r.cos.toFixed(2)}, threshold ${THRESHOLD}, ${
            r.match ? "above" : "below"
          }`}
        >
          <span
            className={`absolute inset-y-0 left-0 rounded-full ${
              r.match ? "bg-accent" : "bg-ink3"
            }`}
            style={{ width: `${Math.round(r.cos * 100)}%` }}
          />
          <span
            className="absolute inset-y-[-3px] w-[1.5px] rounded-full bg-ink"
            style={{ left: `${Math.round(THRESHOLD * 100)}%` }}
          />
        </div>

        <p className="mt-3 max-w-[42ch] text-[0.875rem] leading-relaxed text-ink2">
          {r.note}
        </p>
      </motion.div>
    </div>
  );
}

export function DisputeRecord() {
  const agreeing = READINGS.filter((r) => r.match).length;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="min-w-0">
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3">
        <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink2">
          dispute #d-0417
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-accent">
          <Check size={13} weight="bold" aria-hidden="true" />
          Resolved
        </span>
        <span className="tnum ml-auto font-mono text-[0.75rem] text-ink2">
          {agreeing} of {READINGS.length} read the face
        </span>
      </p>

      <div className="mt-8 flex flex-col gap-8 md:gap-10">
        {READINGS.map((r, i) => (
          <ReadingRow key={r.name} r={r} index={i} />
        ))}
      </div>

      {/* The consequence. Not a field in a table: the sentence the section is
          actually making, with the party the face identified named. */}
      <div className="mt-10 flex items-start gap-3 border-t border-line pt-6">
        <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-surface3">
          <LikenessAvatar
            seed="d-0417-claimant"
            className="size-full [&>svg]:size-full"
          />
        </span>
        <div className="min-w-0">
          <p className="text-[0.9375rem] text-ink">
            The stake followed the face, not the majority
          </p>
          <p className="mt-1 text-[0.875rem] leading-relaxed text-ink2">
            ref-001.faceref.eth kept the record and took the 120 HBAR bond.
            Thresholds are placeholders pending calibration.
          </p>
        </div>
      </div>
    </div>
  );
}
