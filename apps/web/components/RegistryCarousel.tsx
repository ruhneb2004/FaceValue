"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/ssr";
import { SEED_LIKENESSES } from "@/lib/seed";
import { isLicensable, type LikenessState } from "@/lib/types";

/** Two words at most: a card states the state, the record page explains it. */
const SHORT: Record<LikenessState, string> = {
  active: "Available",
  moved: "Available",
  provisional: "Not yet",
  disputed: "Challenged",
  review: "In review",
  revoked: "Revoked",
};
import { StateBadge } from "./StateBadge";
import { ListingArt } from "./ListingArt";

/**
 * A draggable row of registry entries.
 *
 * Embla handles the drag, snap and momentum; the arrows are real controls with
 * disabled states at the ends, and the keyboard can move between slides. Each
 * slide is a real seed record, not a marketing card.
 */
export function RegistryCarousel() {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!embla) return;
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    sync();
    embla.on("select", sync).on("reInit", sync);
    return () => {
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla, sync]);

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2">
        <div>
          <h2 className="heading-5 text-ink">Recently registered</h2>
          <p className="body-6 mt-2 max-w-[52ch] text-ink2">
            Eight entries in the demo registry, across all five states.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <CarouselButton
            label="Previous entries"
            disabled={!canPrev}
            onClick={() => embla?.scrollPrev()}
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </CarouselButton>
          <CarouselButton
            label="Next entries"
            disabled={!canNext}
            onClick={() => embla?.scrollNext()}
          >
            <ArrowRight size={16} aria-hidden="true" />
          </CarouselButton>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <ul className="-ml-2 flex touch-pan-y items-start">
          {SEED_LIKENESSES.map((l) => {
            const ok = isLicensable(l.state);
            return (
              <li
                key={l.id}
                className="block min-w-0 shrink-0 grow-0 basis-[85%] pl-2 sm:basis-[46%] lg:basis-[31%] xl:basis-[23.5%]"
              >
                <Link
                  href={`/likeness/${l.id}`}
                  className="press group flex flex-col justify-start overflow-hidden rounded-lg border border-line bg-surface3 hover:bg-surface4"
                >
                  {/* The face, not an empty box. Same generated art the grid
                      uses, so a slide and a card are recognisably the same
                      record. */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <ListingArt id={l.id} className="h-full w-full" />
                  </div>

                  <div className="flex flex-none flex-col p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="title-4 text-ink">{l.name}</p>
                    <StateBadge state={l.state} />
                  </div>
                  <p className="caption-5 mt-2 font-mono text-ink3">
                    {l.ensName}
                  </p>

                  <div className="mt-auto flex shrink-0 items-end justify-between gap-2 border-t border-line pt-2">
                    <div>
                      <p className="caption-5 text-ink3">Per use</p>
                      <p className="tnum title-3 mt-2 font-mono text-ink">
                        {l.pricePerUse > 0 ? `${l.pricePerUse} HBAR` : "\u2014"}
                      </p>
                    </div>
                    {/* A whole refusal sentence belongs on the detail page.
                        A slide gets the short status, or it grows to 600px. */}
                    <p
                      className={`caption-5 text-right ${
                        ok ? "text-accent" : "text-ink3"
                      }`}
                    >
                      {ok ? "Available" : SHORT[l.state]}
                    </p>
                  </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="caption-5 mt-2 text-ink3">
        Drag to browse, or use the arrows. Every entry links to its full record.
      </p>
    </div>
  );
}

function CarouselButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="press grid size-11 place-items-center rounded-md border border-line bg-surface3 text-ink2 hover:bg-surface4 hover:text-ink disabled:opacity-35 disabled:hover:bg-surface3"
    >
      {children}
    </button>
  );
}
