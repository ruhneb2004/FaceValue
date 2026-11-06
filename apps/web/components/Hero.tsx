"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { HeroScan } from "./HeroScan";

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay },
        };

  return (
    /* Flat: a single band, no gradient. */
    <section aria-labelledby="hero" className="border-b border-line bg-strong">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-8 md:py-20">
        <div>
          <motion.p
            {...rise(0)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2"
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Likeness rights registry
          </motion.p>

          <motion.h1
            id="hero"
            {...rise(0.05)}
            className="max-w-[16ch] font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-5xl md:text-6xl"
          >
            Likeness rights, cleared.
          </motion.h1>

          <motion.p
            {...rise(0.1)}
            className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-2"
          >
            Find a face. Licence it for one use. Every claim is backed by a
            bond anyone can read, and disputes are settled by a face match —
            never by a vote.
          </motion.p>

          {/* One primary action. The second is a quiet secondary. */}
          <motion.div {...rise(0.15)} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#listings"
              className="press inline-flex min-h-12 items-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Browse likenesses
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="/register"
              className="press inline-flex min-h-12 items-center rounded-control border border-line-strong bg-card px-5 text-sm font-semibold text-ink hover:bg-page"
            >
              Register your likeness
            </a>
          </motion.div>

          <motion.dl
            {...rise(0.2)}
            className="mt-10 grid max-w-[32rem] grid-cols-3 gap-6 border-t border-line pt-6"
          >
            {[
              ["6", "states, one machine"],
              ["2 of 3", "resolvers on a close call"],
              ["100%", "of stakes on chain"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd>
                  <span className="tabular block font-display text-2xl font-bold text-ink">
                    {v}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-ink-3">
                    {l}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <Image
                src="/logo-light.png"
                alt="facevalue"
                width={800}
                height={297}
                className="h-6 w-auto"
              />
              <span className="tabular rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-accent">
                Ref 001
              </span>
            </div>
            <HeroScan className="h-auto w-full" />
          </div>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 pb-12 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              Search likenesses
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <input
              id="q"
              type="search"
              placeholder="Search by listing name or ENS name"
              className="h-12 w-full rounded-control border border-line-strong bg-card pl-10 pr-3 text-base text-ink placeholder:text-ink-3"
            />
          </div>
          <div className="relative">
            <label htmlFor="state" className="sr-only">
              Filter by state
            </label>
            <select
              id="state"
              defaultValue="all"
              className="h-12 w-full appearance-none rounded-control border border-line-strong bg-card pl-3.5 pr-11 text-base text-ink sm:w-auto sm:min-w-[12rem]"
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
              className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
