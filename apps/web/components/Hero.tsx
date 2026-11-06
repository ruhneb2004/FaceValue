"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/Button";
import { HeroScan } from "@/components/HeroScan";

const STATS = [
  { value: "6", label: "states, one machine" },
  { value: "2 of 3", label: "resolvers on a close call" },
  { value: "100%", label: "of stakes on chain" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: [0.2, 0, 0, 1] as const, delay },
        };

  return (
    <section
      aria-labelledby="hero"
      className="border-b border-line-subtle bg-gradient-to-b from-[var(--gold-50)] to-page"
    >
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-8 md:py-20">
        <div>
          <motion.p
            {...rise(0)}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-page/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-ink-2"
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Likeness rights registry
          </motion.p>

          <motion.h1
            id="hero"
            {...rise(0.06)}
            className="max-w-[16ch] font-display text-4xl leading-[1.03] tracking-[-0.025em] text-ink sm:text-5xl md:text-6xl"
          >
            Likeness rights,
            <br />
            <span className="italic text-[var(--gold-800)]">cleared.</span>
          </motion.h1>

          <motion.p
            {...rise(0.12)}
            className="mt-6 max-w-[52ch] text-base leading-relaxed text-ink-2"
          >
            Find a face. Licence it for one use. Every claim is backed by a bond
            anyone can read, and a dispute is settled in the open by a face
            match — never by a vote.
          </motion.p>

          <motion.div {...rise(0.18)} className="mt-8 flex flex-wrap gap-3">
            <Button>
              Browse likenesses
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button variant="secondary">Register your likeness</Button>
          </motion.div>

          <motion.dl
            {...rise(0.24)}
            className="mt-10 grid max-w-[30rem] grid-cols-3 gap-4 border-t border-line-subtle pt-6"
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="tabular block font-display text-2xl text-ink">
                    {s.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-ink-3">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1], delay: 0.1 }}
          className="relative"
        >
          <div className="surface-card rounded-card bg-surface p-6">
            <div className="mb-4 flex items-center justify-between border-b border-line-subtle pb-4">
              <Image
                src="/logo-light.png"
                alt="facevalue"
                width={800}
                height={297}
                className="h-6 w-auto"
              />
              <span className="text-xs uppercase tracking-[0.08em] text-ink-3">
                Ref · 001
              </span>
            </div>
            <HeroScan className="h-auto w-full" />
            <p className="mt-4 text-center text-xs text-ink-3">
              Capture → embed → match against the frozen reference
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 pb-12 md:px-8">
        <label htmlFor="q" className="sr-only">
          Search likenesses
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <input
              id="q"
              type="search"
              placeholder="Search by listing name or ENS name"
              className="h-11 w-full rounded-control border border-line bg-page pl-9 pr-3 text-sm text-ink placeholder:text-ink-3"
            />
          </div>
          <select
            aria-label="Filter by state"
            defaultValue="all"
            className="h-11 rounded-control border border-line bg-page px-3 text-sm text-ink"
          >
            <option value="all">All states</option>
            <option value="active">Licensable</option>
            <option value="provisional">Provisional</option>
            <option value="disputed">Challenge open</option>
            <option value="review">Under review</option>
            <option value="moved">Moved</option>
          </select>
        </div>
      </div>
    </section>
  );
}
