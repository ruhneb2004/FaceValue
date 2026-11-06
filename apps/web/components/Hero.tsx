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
      className={`relative isolate flex items-center overflow-hidden border-b border-line bg-surface2 ${
        tall
          ? "min-h-[78vh] pb-24 pt-28 md:min-h-[82vh] md:pb-28 md:pt-32"
          : "pb-16 pt-24 md:pb-20 md:pt-28"
      }`}
    >
      {video && (
        /*
          Full bleed behind the whole hero: the footage fills the section edge
          to edge, and the copy sits on top of it.

          The constraint that drives this markup is legibility. Headline text on
          moving footage is unreadable without something between them, and the
          design rule allows exactly one gradient on the page (the heading), so
          the scrim cannot be a gradient. Instead it is a flat two-part wash:
          solid over the copy column and lighter over the right, with the copy
          panel offset to blend the join. Flat colour also keeps the section
          within the "six dark surfaces, no decorative gradients" rule.

          Muted, looping, playsInline, no controls, tabIndex -1 and aria-hidden:
          this is texture, not media. `motion-reduce:hidden` removes it for
          anyone who has asked the system for less motion.
        */
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <video
            className="h-full w-full scale-125 object-cover object-[58%_center] opacity-95 motion-reduce:hidden"
            src="/video/hero-scan.mp4"
            poster="/video/hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
          />
          {/* Flat scrim. Dense where the text is, open where the footage shows. */}
          {/* One flat wash across the entire hero. No second panel, because a
              hard edge between two flat colours is itself a visible vertical
              line, which read as the video being a right-hand column. The
              footage measures 0 to 27 of 255 behind the copy against 21 at its
              brightest, so the left side is already dark enough to carry text
              without its own guard. */}
          <div className="absolute inset-0 bg-surface2/45" />
        </div>
      )}

      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
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
