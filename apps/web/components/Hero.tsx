"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { HeroScan } from "./HeroScan";

const STATS = [
  { value: "6", label: "states, one machine", bg: "var(--lime)" },
  { value: "2 of 3", label: "resolvers on a close call", bg: "var(--lemon)" },
  { value: "100%", label: "of stakes on chain", bg: "var(--cyan)" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, ease: [0.2, 0, 0, 1] as const, delay },
        };

  return (
    <section
      aria-labelledby="hero"
      className="border-b-[2.5px] border-ink bg-gradient-to-b from-[var(--lemon)] via-[var(--canvas)] to-[var(--canvas)]"
    >
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:px-8 md:py-20">
        <div>
          <motion.p
            {...rise(0)}
            className="sticker mb-5 inline-flex items-center gap-2 bg-bubblegum px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-ink"
          >
            <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
            Likeness rights registry
          </motion.p>

          <motion.h1
            id="hero"
            {...rise(0.06)}
            className="max-w-[15ch] font-display text-[2.75rem] font-extrabold leading-[0.95] tracking-[-0.02em] text-ink sm:text-6xl md:text-7xl"
          >
            Likeness rights,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">cleared.</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 z-0 h-4 -rotate-1 bg-lime"
              />
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.12)}
            className="mt-6 max-w-[52ch] text-lg font-semibold leading-relaxed text-ink-2"
          >
            Find a face. Licence it for one use. Every claim is backed by a bond
            anyone can read, and a dispute is settled in the open by a face
            match — never by a vote.
          </motion.p>

          <motion.div {...rise(0.18)} className="mt-8 flex flex-wrap gap-3">
            <a
              href="#listings"
              className="press cartoon-sm inline-flex min-h-12 items-center gap-2 bg-violet px-5 font-extrabold text-white"
            >
              Browse likenesses
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="/register"
              className="press cartoon-sm inline-flex min-h-12 items-center gap-2 bg-paper px-5 font-extrabold text-ink"
            >
              Register your likeness
            </a>
          </motion.div>

          <motion.dl {...rise(0.24)} className="mt-10 grid max-w-[32rem] grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="cartoon-sm bg-paper px-3 py-3">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span
                    className="tabular mb-1 inline-block rounded-md px-1.5 font-display text-2xl font-extrabold text-ink"
                    style={{ backgroundColor: s.bg }}
                  >
                    {s.value}
                  </span>
                  <span className="block text-[11px] font-bold leading-snug text-ink-2">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96, rotate: -1.5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.1 }}
          className="relative"
        >
          <div className="cartoon bg-paper p-5">
            <div className="mb-4 flex items-center justify-between border-b-[2.5px] border-ink pb-3">
              <Image
                src="/logo-light.png"
                alt="facevalue"
                width={800}
                height={297}
                className="h-6 w-auto"
              />
              <span className="sticker bg-cyan px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink">
                Ref · 001
              </span>
            </div>
            <HeroScan className="h-auto w-full" />
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
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink"
              aria-hidden="true"
            />
            <input
              id="q"
              type="search"
              placeholder="Search by listing name or ENS name"
              className="h-12 w-full rounded-control border-[2.5px] border-ink bg-paper pl-10 pr-3 text-sm font-semibold text-ink placeholder:text-ink-2"
            />
          </div>
          <div className="relative">
            <label htmlFor="state" className="sr-only">
              Filter by state
            </label>
            <select
              id="state"
              defaultValue="all"
              className="h-12 w-full appearance-none rounded-control border-[2.5px] border-ink bg-paper pl-3.5 pr-11 text-sm font-bold text-ink sm:w-auto sm:min-w-[11.5rem]"
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
              className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink"
              strokeWidth={3}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
