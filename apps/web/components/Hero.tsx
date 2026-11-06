"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, Search, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { HeroScan } from "./HeroScan";

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1] as const,
            delay,
          },
        };

  return (
    <section aria-labelledby="hero" className="border-b border-line bg-sunken">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-6 md:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <motion.div
              {...rise(0)}
              className="mb-4 inline-flex items-center gap-2 rounded-chip border border-line bg-soft px-2.5 py-1"
            >
              <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
                Likeness rights registry
              </span>
            </motion.div>

            <motion.h1
              id="hero"
              {...rise(0.05)}
              className="max-w-[18ch] font-display text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.5rem]"
            >
              Licence a face. Prove it on chain.
            </motion.h1>

            <motion.p
              {...rise(0.1)}
              className="mt-3.5 max-w-[48ch] text-[15px] leading-relaxed text-ink-2 md:text-base"
            >
              Browse registered likenesses, clear one use at a time, and read the
              bond behind every claim. A dispute is settled by a face match, not
              a vote.
            </motion.p>

            <motion.div
              {...rise(0.15)}
              className="mt-5 flex flex-wrap items-center gap-2.5"
            >
              <Button href="#listings">
                Explore likenesses
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button href="/register" variant="secondary">
                Register yours
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="eyebrow">Match preview</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-3">
                <span
                  className="size-1.5 rounded-full bg-[var(--state-active-bg)]"
                  aria-hidden="true"
                />
                live
              </span>
            </div>
            <HeroScan className="h-auto w-full" />
            <div className="grid grid-cols-3 divide-x divide-[var(--line)] border-t border-line">
              {[
                ["Cosine", "0.91"],
                ["Bond", "500 HBAR"],
                ["Resolvers", "2 of 3"],
              ].map(([k, v]) => (
                <div key={k} className="px-3 py-2.5">
                  <div className="eyebrow">{k}</div>
                  <div className="tabular mt-0.5 font-mono text-sm font-medium text-ink">
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Search bar: OpenSea's prominent, shortcut-hinted input. */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              Search likenesses
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <input
              id="q"
              type="search"
              placeholder="Search by name, ENS or collection"
              className="h-11 w-full rounded-control border border-line bg-soft pl-9 pr-3 text-base text-ink placeholder:text-ink-3 focus:border-line-strong"
            />
          </div>
          <div className="relative">
            <label htmlFor="state" className="sr-only">
              Filter by state
            </label>
            <select
              id="state"
              defaultValue="all"
              className="h-11 w-full appearance-none rounded-control border border-line bg-soft pl-3 pr-10 text-base text-ink focus:border-line-strong sm:w-auto sm:min-w-[11rem]"
            >
              <option value="all">All states</option>
              <option value="active">Licensable</option>
              <option value="provisional">Provisional</option>
              <option value="disputed">Challenge open</option>
              <option value="review">Under review</option>
              <option value="moved">Moved</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
