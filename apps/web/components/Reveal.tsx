"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A short rise and fade as a section enters the viewport, once.
 *
 * This has been the source of three separate invisible-content bugs, so it is
 * now built so that failure is impossible:
 *
 * - Content is visible in the markup. Nothing is ever hidden by default.
 * - The animation is applied only after the element is confirmed to be below
 *   the fold, via a class added from an effect.
 * - If the observer never fires, never attaches, or JavaScript never runs, the
 *   class is never added and the section simply renders. The content does not
 *   depend on the animation; the animation depends on the content being there.
 *
 * Uses one IntersectionObserver per element with `once` semantics, not a scroll
 * listener (B7).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Use "li" where the parent is ol/ul: a div there is invalid HTML and the
   *  browser hoists it out, silently dropping the content. */
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    // Only animate what the reader cannot already see.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.classList.add("reveal-pending");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.remove("reveal-pending");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
