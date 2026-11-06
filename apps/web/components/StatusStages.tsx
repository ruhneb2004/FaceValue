"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { StateBadge } from "@/components/StateBadge";
import { LikenessAvatar } from "@/components/LikenessAvatar";
import type { LikenessState } from "@/lib/types";

/**
 * The licence terms, as a walk through the states a record passes.
 *
 * Replaces an accordion of four abstract claims. The claims were true but they
 * were a list of sentences, which is the shape a generated summary takes. A
 * record's state is the thing this product actually has, so the section shows
 * the states, one per row, each as a real card of the kind that appears on
 * /explore.
 *
 * Rows alternate: the card leads, the words trail, then the words lead and the
 * card trails. The alternation is done by DOM order and an explicit two column
 * grid, never by `order` or `row-reverse`, so source order stays the reading
 * order and a screen reader or a text browser still gets card then copy, card
 * then copy.
 */

interface Stage {
  state: LikenessState;
  title: string;
  body: string;
  /** The terms this state carries, in the order they matter. */
  terms: { k: string; v: string }[];
}

const STAGES: Stage[] = [
  {
    state: "provisional",
    title: "Registered, not yet for sale",
    body: "A unique human claimed this face and put money behind it. That claim is not proof they are the person in the photograph, so the record waits out a challenge window and cannot be licensed during it.",
    terms: [
      { k: "Price", v: "Withheld" },
      { k: "Licence", v: "None" },
      { k: "Bond", v: "Held" },
    ],
  },
  {
    state: "active",
    title: "Settled and licensable",
    body: "The window closed with the claim intact. A buyer can now pay per use, and each licence names one use and one date. The face itself never leaves the device, so a brief cannot quietly widen into a campaign.",
    terms: [
      { k: "Price", v: "60 HBAR" },
      { k: "Licence", v: "One use" },
      { k: "Term", v: "Dated" },
    ],
  },
  {
    state: "disputed",
    title: "Challenged, licensing paused",
    body: "Someone posted a bond and passed a live check against the frozen reference. Every licence stops until the challenge resolves, and the refusal says so in words on the page rather than greying out a button.",
    terms: [
      { k: "Price", v: "Withheld" },
      { k: "Licence", v: "Paused" },
      { k: "Stakes", v: "2 locked" },
    ],
  },
  {
    state: "moved",
    title: "Seized by the face it belongs to",
    body: "The face matched. The record, the bond and the right to license all moved to the person the face identifies, and the losing claim cannot be re-registered. A record can be reclaimed; it can never be pre-proven.",
    terms: [
      { k: "Price", v: "Transferred" },
      { k: "Licence", v: "New holder" },
      { k: "Bond", v: "Moved" },
    ],
  },
];

/**
 * One row. The card fades and lifts slightly as it enters the viewport, in the
 * direction it sits, so the two columns feel like they arrive from opposite
 * sides rather than appearing together.
 *
 * Motion is additive: the content renders at full opacity when reduced motion is
 * set, and `initial` never hides anything that a missing animation would leave
 * invisible.
 */
function StageRow({ stage, index }: { stage: Stage; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const reduced = useReducedMotion();
  const flipped = index % 2 === 1;

  /**
   * Whether this row should be held back for its entrance.
   *
   * Starts false, so the server renders the row at full opacity and a browser
   * with JS disabled, or a crawler, or a reader whose hydration never finishes,
   * still sees the content. It only flips true on the client once we know two
   * things: motion is running, and the row is still below the fold. A row that
   * is already on screen at mount is left alone rather than animated in.
   */
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setArmed(true);
  }, [reduced]);

  const from = reduced ? 0 : 24;
  const hidden = armed && !inView;

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14"
    >
      {/* Card cell. Placed first in the DOM on every row so reading order is
          card then copy; on flipped rows the grid puts it in column 2. */}
      <motion.div
        className={flipped ? "min-w-0 md:col-start-2" : "min-w-0 md:col-start-1"}
        animate={{
          opacity: hidden ? 0 : 1,
          x: hidden ? (flipped ? from : -from) : 0,
        }}
        transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
      >
        <StatusCard stage={stage} />
      </motion.div>

      {/* Copy cell. */}
      <motion.div
        className={flipped ? "min-w-0 md:col-start-1" : "min-w-0 md:col-start-2"}
        animate={{
          opacity: hidden ? 0 : 1,
          x: hidden ? (flipped ? -from : from) : 0,
        }}
        transition={{
          duration: 0.55,
          delay: hidden || reduced ? 0 : 0.08,
          ease: [0.2, 0, 0, 1],
        }}
      >
        <StateBadge state={stage.state} />
        <h3 className="mt-4 text-[1.5rem] leading-tight font-medium tracking-[-0.01em] text-ink text-balance">
          {stage.title}
        </h3>
        <p className="body-2 mt-3 max-w-[46ch] text-ink2">{stage.body}</p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5">
          {stage.terms.map((t) => (
            <div key={t.k}>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink3">
                {t.k}
              </dt>
              <dd className="tnum mt-1 text-[0.9375rem] text-ink">{t.v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  );
}

/**
 * The card. Deliberately the same vocabulary as a listing on /explore — avatar,
 * name, reference, state — so the section teaches the reader a component they
 * will meet again one screen away, instead of inventing a second card style.
 */
function StatusCard({ stage }: { stage: Stage }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface2">
      <div className="aspect-square bg-surface3 p-6">
        <LikenessAvatar
          seed={stage.state}
          className="size-full [&>svg]:size-full"
        />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-medium text-ink">{stage.title}</p>
          <p className="truncate font-mono text-[0.75rem] text-ink2">{stage.state}.faceref.eth</p>
        </div>
        <StateBadge state={stage.state} compact />
      </div>
    </div>
  );
}

export function StatusStages() {
  return (
    <div className="mx-auto max-w-[1096px]">
      <div className="mb-16 max-w-[52ch]">
        <h2 id="benefits" className="heading-3 text-ink text-balance">
          A licence is one use, one price
        </h2>
        <p className="body-2 mt-4 text-ink2">
          Four states a record passes through, and what each one means for a
          buyer before they pay.
        </p>
      </div>

      <div className="flex flex-col gap-20 md:gap-28">
        {STAGES.map((s, i) => (
          <StageRow key={s.state} stage={s} index={i} />
        ))}
      </div>
    </div>
  );
}
