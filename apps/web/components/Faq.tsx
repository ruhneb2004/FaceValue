"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react/ssr";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * B4/objection handling: six to twelve questions in plain question and answer
 * form, so it also serves AEO search results.
 */
const FAQS = [
  {
    q: "What exactly does a licence cover?",
    a: "One named use, at one stated price, until a stated date. It does not transfer ownership of the likeness and it does not cover derivatives. Buying a second use means buying a second licence.",
  },
  {
    q: "What is stored on chain?",
    a: "A hash of the reference face data, the licence terms, and the bond. Never the image, never the embedding, never a nullifier. The face itself stays off chain.",
  },
  {
    q: "Who can open a challenge?",
    a: "Anyone willing to post a bond. A claim with no money behind it is an opinion, so the bond is what makes a challenge admissible. Whoever the face turns out to be takes the stake.",
  },
  {
    q: "Why three resolvers and not a majority vote?",
    a: "Each resolver answers one question independently against the same frozen reference: whose face is this. Two of three must agree. It is not a vote on whether the claim is fair.",
  },
  {
    q: "What happens if a challenge is open on an entry I want?",
    a: "Licensing is suspended on that entry until every challenge against it is resolved. The detail page states why, in words, rather than showing a disabled button.",
  },
  {
    q: "Can I licence an entry that is still provisional?",
    a: "No. A provisional entry is inside its settlement window and can be disputed. Only entries in the active or moved state can be licensed.",
  },
  {
    q: "How is the price set?",
    a: "By the registrant, per use. There is no algorithm behind it and no dynamic pricing in this build. The page shows the same number to everyone.",
  },
  {
    q: "Is this live?",
    a: "No. This is a testnet demo. Every record you see is seeded sample data, and the wallet is a local stand in that asks for no signature.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="border-t border-line">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className={`border-b border-line transition-colors duration-200 ${
              isOpen ? "bg-surface2" : "hover:bg-surface2/50"
            }`}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                className="press group flex w-full items-start gap-4 px-4 py-5 text-left sm:gap-6 sm:px-6"
              >
                {/* Numbering gives each row an identity, so the list stops
                    reading as nine interchangeable bars. The active row's
                    number turns accent, which is the section's only colour. */}
                <span
                  className={`mt-0.5 shrink-0 font-mono text-[0.75rem] tabular-nums transition-colors duration-200 ${
                    isOpen ? "text-accent" : "text-ink3 group-hover:text-ink2"
                  }`}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className={`min-w-0 flex-1 text-[1.0625rem] leading-snug transition-colors duration-200 sm:text-[1.25rem] ${
                    isOpen ? "text-accent" : "text-ink group-hover:text-ink"
                  }`}
                >
                  {f.q}
                </span>

                {/* The control reads its own state rather than relying on the
                    panel below it: a plus that becomes a minus, in accent when
                    open. Colour is never the only cue; the glyph changes too. */}
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-colors duration-200 ${
                    isOpen
                      ? "border-accent text-accent"
                      : "border-linestrong text-ink2 group-hover:border-ink3 group-hover:text-ink"
                  }`}
                  aria-hidden="true"
                >
                  <Plus size={14} weight="bold" />
                </motion.span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-${i}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  {/* Indented to the question text, not the number, so the
                      answer sits in one column with what it answers. */}
                  <p className="max-w-[62ch] pr-4 pb-6 pl-10 text-[1rem] leading-relaxed text-ink2 sm:pl-13">
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
