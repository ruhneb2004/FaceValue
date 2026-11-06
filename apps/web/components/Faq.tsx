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
    <div className="divide-y divide-line border-y border-line">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                className="press flex w-full items-center justify-between gap-2 py-3 text-left"
              >
                <span className="body-2 text-ink">{f.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="shrink-0 text-ink3"
                  aria-hidden="true"
                >
                  <Plus size={16} />
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
                  <p className="body-6 max-w-[68ch] pb-2 text-ink2">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
