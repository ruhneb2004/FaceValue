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
 * a rule runs between the markers and the steps share one column.
 *
 * Every description is always visible. The previous version expanded only the
 * selected step and hid the other two at opacity 0, which measured as rows of
 * 166px beside rows of 79px: the result read as one finished step followed by
 * two empty lines, and a reader had to click to learn what steps two and three
 * even said. Emphasis now does the work instead of visibility. Clicking promotes
 * a step to full contrast and opens its list of terms; the others stay readable,
 * just quieter.
 *
 * Selection is by click and by keyboard, and it is never carried by motion or by
 * colour alone: the active step also changes weight and reveals its terms.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="mx-auto mb-16 max-w-[760px] text-center">
        <h2 id="how" className="heading-3 text-ink">
          How it works
        </h2>
        <p className="body-2 mt-4 max-w-[46ch] mx-auto text-ink2">
          Three steps, in order. A licence is only ever for one named use, and
          anyone can challenge it.
        </p>
      </div>

      <ol className="relative mx-auto max-w-[760px] text-left" role="list">
        {STEPS.map((s, i) => {
          const isActive = i === active;
          return (
            <li key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <span
                  className="absolute left-[23px] top-[72px] h-[calc(100%-44px)] w-px bg-line"
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                aria-controls={`step-${i}`}
                className="press group grid w-full grid-cols-[48px_1fr] items-start gap-6 rounded-lg px-3 py-6 text-left"
              >
                <span
                  className={`mt-0.5 grid size-[47px] place-items-center rounded-full border font-mono text-base transition-colors ${
                    isActive
                      ? "border-accent bg-accent text-accentink"
                      : "border-line bg-surface2 text-ink2 group-hover:border-linestrong"
                  }`}
                >
                  {s.n}
                </span>

                <span>
                  <span
                    className={`block text-[1.375rem] leading-8 transition-colors ${
                      isActive ? "font-semibold text-ink" : "font-medium text-ink2"
                    }`}
                  >
                    {s.t}
                  </span>

                  {/* Always present. Never zero height, never opacity 0. */}
                  <span id={`step-${i}`} className="body-3 mt-2 block max-w-[56ch] text-ink2">
                    {s.d}
                  </span>

                  {/* The terms are the only part that toggles: they are extra
                      detail, not the step's meaning, so hiding them costs a
                      reader nothing. */}
                  <motion.span
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, height: isActive ? "auto" : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="block overflow-hidden"
                    style={reduce ? { opacity: 1, height: "auto" } : undefined}
                    aria-hidden={isActive ? undefined : "true"}
                  >
                    <span className="mt-4 flex flex-wrap gap-2">
                      {s.meta.map((m) => (
                        <span
                          key={m}
                          className="caption-4 rounded-sm border border-line bg-surface2 px-2.5 py-1 text-ink2"
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

      <div className="mx-auto mt-14 max-w-[760px] text-center">
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
