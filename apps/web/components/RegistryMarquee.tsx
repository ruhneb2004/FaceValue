"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SEED_LIKENESSES } from "@/lib/seed";
import { isLicensable, type LikenessState } from "@/lib/types";
import { StateBadge } from "./StateBadge";
import { ListingArt } from "./ListingArt";

/** Two words at most: a card states the state, the record page explains it. */
const SHORT: Record<LikenessState, string> = {
  active: "Available",
  moved: "Available",
  provisional: "Not yet",
  disputed: "Challenged",
  review: "In review",
  revoked: "Revoked",
};

/**
 * A marquee: the registry scrolls continuously, in one direction, forever.
 *
 * How the seam is avoided, which is the only hard part of a marquee. The track
 * holds the same records twice, side by side, and translates by exactly half
 * its own width. At the moment the animation resets, the second copy is sitting
 * precisely where the first one started, so the jump is invisible. Duplicating
 * by a different amount, or translating by a fixed pixel value, produces a
 * visible snap every cycle.
 *
 * The second copy is aria-hidden: a screen reader should hear each record once,
 * not twice because the layout needed a repeat.
 *
 * Motion is paused on hover and on focus so a reader can actually stop on a
 * card, and removed entirely under prefers-reduced-motion, where the row falls
 * back to a normal horizontally scrollable list. A marquee that cannot be
 * stopped is an accessibility problem, not a style choice.
 */
export function RegistryMarquee() {
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(60);

  // Keep the speed constant rather than the duration. A fixed duration means
  // more records scroll faster, which at eight records is a blur. Solving for
  // the width keeps it readable however many entries exist.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const half = el.scrollWidth / 2;
      const pxPerSecond = 60;
      setDuration(Math.max(18, half / pxPerSecond));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cards = [...SEED_LIKENESSES, ...SEED_LIKENESSES];

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="recent" className="heading-5 text-ink">
            Recently registered
          </h2>
          <p className="body-6 mt-3 max-w-[52ch] text-ink2">
            Eight entries in the demo registry, across all five states.
          </p>
        </div>
      </div>

      {/*
        The fade at each end is a mask, not a gradient background: it hides the
        hard cut where cards enter and leave, which otherwise reads as a clip.
        Masks are not subject to the one-gradient rule, which applies to paints.
      */}
      <div
        className="relative -mx-6 overflow-hidden md:-mx-12"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
        }}
      >
        <div
          ref={track}
          className="marquee-track flex w-max gap-3"
          style={{
            animationDuration: `${duration}s`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {cards.map((l, i) => {
            const ok = isLicensable(l.state);
            const repeat = i >= SEED_LIKENESSES.length;
            return (
              <div
                key={`${l.id}-${i}`}
                className="w-[260px] shrink-0 sm:w-[300px]"
                aria-hidden={repeat ? "true" : undefined}
              >
                <Link
                  href={`/likeness/${l.id}`}
                  tabIndex={repeat ? -1 : undefined}
                  className="press group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface3 hover:bg-surface4"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <ListingArt id={l.id} className="h-full w-full" />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="title-4 text-ink">{l.name}</p>
                      <StateBadge state={l.state} />
                    </div>
                    <p className="caption-5 mt-2 font-mono text-ink3">
                      {l.ensName}
                    </p>

                    <div className="mt-auto flex shrink-0 items-end justify-between gap-2 border-t border-line pt-3">
                      <div>
                        <p className="caption-5 text-ink3">Per use</p>
                        <p className="tnum title-3 mt-2 font-mono text-ink">
                          {l.pricePerUse > 0
                            ? `${l.pricePerUse} HBAR`
                            : "\u2014"}
                        </p>
                      </div>
                      <p
                        className={`caption-5 text-right ${ok ? "text-accent" : "text-ink3"}`}
                      >
                        {ok ? "Available" : SHORT[l.state]}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
