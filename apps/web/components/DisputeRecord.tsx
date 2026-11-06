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
 * Each resolver is a row of their own: the reading on the left, the face they
 * were reading on the right. The rows run in the opposite direction to the
 * licence section above, where the card leads — here the argument leads and the
 * face is the evidence it rests on, so the copy comes first and the portraits
 * sit in a consistent right-hand column.
 *
 * Type and card sizes match that section rather than being smaller, so the two
 * blocks carry equal weight on the page.
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

  // Additive motion only: the reading is visible unless we have confirmed on the
  // client that it can animate and that it starts below the fold.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setArmed(true);
  }, [reduced]);

  const from = reduced ? 0 : 24;
  const hidden = armed && !inView;

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
    >
      {/* The reading. First in the DOM and first in the grid, so the argument
          leads on both mobile and desktop. */}
      <motion.div
        className="min-w-0 md:col-start-1 md:row-start-1"
        animate={{ opacity: hidden ? 0 : 1, x: hidden ? -from : 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[0.8125rem] uppercase tracking-[0.08em] ${
              r.match ? "text-accent" : "text-ink2"
            }`}
          >
            {r.match ? (
              <Check size={15} weight="bold" aria-hidden="true" />
            ) : (
              <X size={15} weight="bold" aria-hidden="true" />
            )}
            {r.match ? "Match" : "No match"}
          </span>
          <span className="font-mono text-[0.8125rem] text-ink2">{r.name}</span>
        </div>

        <h3 className="mt-4 text-[1.5rem] leading-tight font-medium tracking-[-0.01em] text-ink">
          <span className="tnum font-mono">{r.cos.toFixed(2)}</span>
          <span className="ml-2 font-mono text-[0.9375rem] font-normal text-ink2">
            vs {THRESHOLD}
          </span>
        </h3>

        {/* The score as a position on a scale, not a number to interpret. The
            threshold sits at its real place, so 0.91 and 0.31 read as one above
            and one well below without the reader doing arithmetic. */}
        <div
          className="relative mt-4 h-1.5 w-full max-w-[320px] rounded-full bg-surface4"
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

        <p className="body-2 mt-4 max-w-[42ch] text-ink2">{r.note}</p>
      </motion.div>

      {/* The face this resolver was reading. Trails in the DOM so the reading is
          announced first, and sits in column 2 on every row so the portraits
          form one consistent edge down the right side. */}
      <motion.div
        className="min-w-0 md:col-start-2 md:row-start-1"
        animate={{ opacity: hidden ? 0 : 1, x: hidden ? from : 0 }}
        transition={{
          duration: 0.55,
          delay: hidden || reduced ? 0 : 0.08,
          ease: [0.2, 0, 0, 1],
        }}
      >
        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface3 p-5">
          <LikenessAvatar
            seed={r.seed}
            className="size-full [&>svg]:size-full"
          />
        </div>
      </motion.div>
    </div>
  );
}

export function DisputeRecord() {
  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-14 md:gap-16">
        {READINGS.map((r, i) => (
          <ReadingRow key={r.name} r={r} index={i} />
        ))}
      </div>

      {/* The consequence. Not a field in a table: the sentence the section is
          actually making, with the party the face identified named. */}
      <div className="mt-14 flex items-start gap-4 border-t border-line pt-8">
        <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-surface3">
          <LikenessAvatar
            seed="d-0417-claimant"
            className="size-full [&>svg]:size-full"
          />
        </span>
        <div className="min-w-0">
          <p className="text-[1.125rem] leading-snug text-ink">
            The stake followed the face, not the majority
          </p>
          <p className="body-2 mt-2 max-w-[52ch] text-ink2">
            ref-001.faceref.eth kept the record and took the 120 HBAR bond.
            Thresholds are placeholders pending calibration.
          </p>
        </div>
      </div>
    </div>
  );
}
