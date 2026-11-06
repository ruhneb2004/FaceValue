"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import type { LikenessState } from "@/lib/types";

/**
 * Marketplace controls: search, a state filter, and a live result count.
 *
 * Every control here does something. An earlier version of this file imported
 * `Search` from `lucide-react` and styled itself with classes that do not exist
 * in this project (`bg-sunken`, `font-display`), so the box rendered with no
 * icon and no fill and the two inputs filtered nothing. The header was also
 * pinned above the gate, where there were no results to filter.
 *
 * The controls are controlled from the page so the grid and the count read the
 * same state. Nothing is filtered here; this only raises the input.
 */

export const STATE_OPTIONS: { value: "all" | LikenessState; label: string }[] = [
  { value: "all", label: "All states" },
  { value: "active", label: "Licensable" },
  { value: "moved", label: "Moved" },
  { value: "provisional", label: "Provisional" },
  { value: "disputed", label: "Challenge open" },
  { value: "review", label: "Under review" },
  { value: "revoked", label: "Revoked" },
];

export function ExploreHeader({
  query,
  onQuery,
  state,
  onState,
  total,
  shown,
}: {
  query: string;
  onQuery: (v: string) => void;
  state: "all" | LikenessState;
  onState: (v: "all" | LikenessState) => void;
  total: number;
  shown: number;
}) {
  const filtering = query.trim() !== "" || state !== "all";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <div className="relative w-full lg:max-w-[26rem]">
        <label htmlFor="q" className="sr-only">
          Search likenesses
        </label>
        <MagnifyingGlass
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink3"
        />
        <input
          id="q"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name or ENS"
          className="press h-11 w-full rounded-full border border-line bg-surface3 pl-10 pr-10 body-5 text-ink placeholder:text-ink3 transition-[border-color,background-color] duration-200 hover:border-linestrong focus:border-accent [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink3 hover:bg-surface4 hover:text-ink"
          >
            <X size={12} weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* State filter, as pill toggles rather than a native select: the states
          are a small fixed set and the row reads as a filter bar the way the
          grid does. A real select would hide five of six options behind a
          click for no gain. */}
      <div className="flex flex-wrap items-center gap-2">
        {STATE_OPTIONS.map((o) => {
          const active = state === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onState(o.value)}
              aria-pressed={active}
              className={cn(
                "press inline-flex min-h-9 items-center rounded-full border px-3 font-mono text-[0.6875rem] uppercase tracking-[0.06em] transition-[color,background-color,border-color] duration-200",
                active
                  ? "border-accent bg-accent text-accentink"
                  : "border-line bg-surface3 text-ink2 hover:border-linestrong hover:text-ink",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {/* Result count. One number, and it says what it is counting. */}
      <p
        aria-live="polite"
        className="tnum shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink3"
      >
        {filtering ? `${shown} of ${total} shown` : `${total} registered`}
      </p>
    </div>
  );
}
