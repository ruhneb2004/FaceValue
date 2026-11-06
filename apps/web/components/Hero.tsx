"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";

export function Hero({
  eyebrow,
  title = "Licence a face. Prove it on chain.",
  body = "Browse registered likenesses, clear one use at a time, and read the bond behind every claim. A dispute is settled by a face match, not a vote.",
  primaryHref = "#listings",
  primaryLabel = "Explore likenesses",
  secondaryHref = "/register",
  secondaryLabel = "Register yours",
  tall = false,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tall?: boolean;
} = {}) {
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
    <section
      aria-labelledby="hero"
      className="relative isolate overflow-hidden border-b border-line bg-sunken"
    >
      {/* Ambient scan behind the hero. Decorative: it carries no information,
          so it is hidden from assistive tech and stops for reduced motion. */}
      <video
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-70 motion-reduce:hidden"
        src="/video/hero-scan.mp4"
        poster="/video/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />
      {/* Flat scrim (no gradient): a solid wash that keeps text contrast over
          the brightest part of the footage. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[var(--bg-quiet)]/80"
        aria-hidden="true"
      />
      <div
        className={
          tall
            ? "relative mx-auto flex w-full max-w-[1440px] items-center px-4 py-20 md:px-6 md:py-24"
            : "relative mx-auto w-full max-w-[1440px] px-4 py-8 md:px-6 md:py-10"
        }
      >
        <div className={tall ? "max-w-[54rem]" : "max-w-[46rem]"}>
          <div>
            {eyebrow && (
              <motion.p
                {...rise(0)}
                className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3"
              >
                {eyebrow}
              </motion.p>
            )}
            <motion.h1
              id="hero"
              {...rise(0)}
              className="max-w-[18ch] font-display text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.02]"
            >
              {title}
            </motion.h1>

            <motion.p
              {...rise(0.1)}
              className="mt-3.5 max-w-[48ch] text-[15px] leading-relaxed text-ink-2 md:text-base"
            >
              {body}
            </motion.p>

            <motion.div
              {...rise(0.15)}
              className="mt-5 flex flex-wrap items-center gap-2.5"
            >
              <Button href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button href={secondaryHref} variant="secondary">
                {secondaryLabel}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
