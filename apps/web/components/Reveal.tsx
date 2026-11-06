"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * B7 scroll reveal: content rises 32px and fades in over 700ms on the base
 * curve, once, and does not replay when scrolling back up.
 *
 * Deliberately not `whileInView`. That starts from opacity 0, so any failure of
 * the observer, of JS, or of a headless screenshot leaves the section blank
 * forever, which is exactly what happened here. This renders at full opacity by
 * default and hides the element only after the effect has confirmed it is below
 * the fold and can therefore be animated back in. The hidden class is a plain
 * CSS transition, so a missing observer costs the animation and never the
 * content.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Render as a list item where the parent is ol/ul: a div there is invalid
   *  HTML and the browser hoists it out, which silently drops the content. */
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Starts visible. Only the effect may hide it.
  const [state, setState] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    // Already in view on mount: leave it alone, no flicker.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setState("shown");
      return;
    }

    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setState("shown");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const hidden = state === "hidden";

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(32px)" : "translateY(0)",
        transition: `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </Tag>
  );
}
