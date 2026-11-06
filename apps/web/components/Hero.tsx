"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Button } from "./Button";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * B5 hero.
 *
 * Heading and subheading capped at 680px, with line breaks given explicitly
 * rather than left to the box width. The heading carries the single permitted
 * gradient (white to #9B9B9B) on text only; the surface stays flat.
 */
export function Hero({
  eyebrow,
  lines,
  body,
  primaryHref = "/explore",
  primaryLabel = "Explore likenesses",
  secondaryHref = "/register",
  secondaryLabel = "Register a likeness",
  video = false,
  tall = true,
}: {
  eyebrow?: string;
  lines: string[];
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  video?: boolean;
  tall?: boolean;
}) {
  const reduce = useReducedMotion();
  const rise = (i: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease: EASE, delay: i * 0.1 },
        };

  return (
    <section
      aria-labelledby="hero"
      className={`relative isolate overflow-hidden border-b border-line bg-surface2 ${
        tall ? "pb-28 pt-32 md:pb-36 md:pt-36" : "pb-20 pt-28 md:pb-24 md:pt-32"
      }`}
    >
      {video && (
        <>
          <video
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-60 motion-reduce:hidden"
            src="/video/hero-scan.mp4"
            poster="/video/hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            tabIndex={-1}
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-surface2/85"
            aria-hidden="true"
          />
        </>
      )}

      <div className="mx-auto w-full max-w-[1440px] px-3 md:px-3">
        <div className="max-w-[680px]">
          {eyebrow && (
            <motion.p
              {...rise(0)}
              className="caption-4 mb-2 font-mono uppercase tracking-[0.06em] text-ink3"
            >
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            id="hero"
            {...rise(eyebrow ? 1 : 0)}
            className={`heading-gradient ${
              tall ? "heading-2" : "heading-3"
            }`}
          >
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </motion.h1>

          <motion.p
            {...rise(eyebrow ? 2 : 1)}
            className="body-3 mt-2 max-w-[680px] text-ink2"
          >
            {body}
          </motion.p>

          <motion.div
            {...rise(eyebrow ? 3 : 2)}
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <Button href={primaryHref} size="lg">
              {primaryLabel}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button href={secondaryHref} size="lg" variant="secondary">
              {secondaryLabel}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
