"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/ssr";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    n: 1,
    t: "Register the likeness once",
    d: "Capture a reference, set a price per use, post a bond. Only a hash goes to chain, never the image.",
    meta: ["One capture", "Hash on chain", "Bond posted"],
  },
  {
    n: 2,
    t: "Clear a single use",
    d: "Pay the stated price and receive a licence that names the use and the expiry. Nothing broader is granted.",
    meta: ["Named use", "Fixed price", "Dated expiry"],
  },
  {
    n: 3,
    t: "Challenge if it is wrong",
    d: "Post a bond against a claim you believe is false. The face decides and the stake follows the face.",
    meta: ["Bonded", "2 of 3 resolvers", "Stake follows"],
  },
];

/**
 * How it works, as a connected sequence rather than three equal boxes.
 *
 * The steps happen in order and depend on each other, so the layout says so:
 * a rule runs between the markers and the active step expands. Selection is by
 * click and by keyboard, and it is never carried by motion alone: the active
 * row also changes colour and weight.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="mx-auto mb-10 max-w-[720px] text-center">
        <h2 id="how" className="heading-4 text-ink">
          How it works
        </h2>
        <p className="caption-3 mt-3 font-mono text-ink3">
          Step {active + 1} of 3
        </p>
      </div>

      <ol className="relative mx-auto max-w-[720px] text-left" role="list">
        {STEPS.map((s, i) => {
          const isActive = i === active;
          return (
            <li key={s.n} className="relative">
              {/* The connecting rule: from this marker down to the next. */}
              {i < STEPS.length - 1 && (
                <span
                  className="absolute left-[19px] top-[56px] h-[calc(100%-34px)] w-px bg-line"
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                aria-controls={`step-${i}`}
                className="press group grid w-full grid-cols-[40px_1fr] items-start gap-5 rounded-lg px-3 py-5 text-left hover:bg-surface3"
              >
                <span
                  className={`grid size-[39px] place-items-center rounded-full border font-mono text-sm transition-colors ${
                    isActive
                      ? "border-accent bg-accent text-accentink"
                      : "border-line bg-surface3 text-ink3 group-hover:border-linestrong"
                  }`}
                >
                  {s.n}
                </span>

                <span>
                  <span
                    className={`title-2 block transition-colors ${
                      isActive ? "text-ink" : "text-ink2"
                    }`}
                  >
                    {s.t}
                  </span>

                  <motion.span
                    id={`step-${i}`}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      height: isActive ? "auto" : 0,
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="block overflow-hidden"
                    style={reduce ? { opacity: 1, height: "auto" } : undefined}
                  >
                    <span className="body-3 mt-3 block max-w-[58ch] text-ink2">
                      {s.d}
                    </span>
                    <span className="mt-3 flex flex-wrap gap-2">
                      {s.meta.map((m) => (
                        <span
                          key={m}
                          className="caption-4 rounded-sm border border-line bg-surface2 px-2 py-1 text-ink3"
                        >
                          {m}
                        </span>
                      ))}
                    </span>
                  </motion.span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto mt-10 max-w-[720px] text-center">
        <a
          href="/explore"
          className="press caption-1 inline-flex items-center gap-1.5 text-accent hover:underline"
        >
          See what a licence costs
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
