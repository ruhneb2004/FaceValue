"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * B11 tagline reveal.
 *
 * Minimum two lines of benefit copy. Each word starts muted at roughly 30% of
 * the text colour and switches to full colour in reading order as it crosses a
 * trigger line. The transition uses the base curve, never a linear fade.
 *
 * Implemented with one IntersectionObserver on the container plus a single
 * passive scroll listener throttled through requestAnimationFrame, never an
 * unthrottled window scroll handler. Under reduced motion the final text shows
 * at full colour immediately with no word by word animation.
 */
export function TaglineReveal({
  lines,
  className = "",
}: {
  lines: string[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState(0);

  const words = lines.map((l) => l.split(" "));
  const total = words.reduce((n, l) => n + l.length, 0);

  useEffect(() => {
    if (reduce) {
      setActive(total);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let visible = false;

    const measure = () => {
      frame = 0;
      if (!visible) return;
      const rect = el.getBoundingClientRect();
      // Trigger line sits 65% down the viewport: a word lights as it rises
      // past it.
      const trigger = rect.top + window.innerHeight * 0.35;
      const spans = el.querySelectorAll<HTMLElement>("[data-word]");
      let lit = 0;
      spans.forEach((s) => {
        if (s.getBoundingClientRect().top < trigger) lit += 1;
      });
      setActive(lit);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    // Only listen while the section is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        measure();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    io.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measure();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce, total]);

  let index = 0;

  return (
    <p
      ref={ref}
      className={`text-3xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-4xl md:leading-[1.12] ${className}`}
    >
      {words.map((lineWords, li) => (
        <span key={li} className="block">
          {lineWords.map((w) => {
            const i = index++;
            const lit = reduce || i < active;
            return (
              <span
                key={`${li}-${i}`}
                data-word
                aria-hidden="false"
                className="transition-colors"
                style={{
                  color: lit ? "var(--text-1)" : "rgba(255,255,255,0.3)",
                  transitionDuration: "400ms",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {w}
                {i < total - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}
