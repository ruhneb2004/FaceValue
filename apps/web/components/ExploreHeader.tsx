"use client";

import { Search, ChevronDown } from "lucide-react";

/**
 * The marketplace header: title plus search and filter.
 *
 * Lives inside the gate on purpose. Above the gate, the search box invited an
 * action that could not do anything, because there were no results to filter.
 */
export function ExploreHeader() {
  return (
    <section className="border-b border-line bg-sunken">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-6 md:py-10">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl">
          Explore likenesses
        </h1>
        <p className="mt-1.5 max-w-[52ch] text-sm text-ink-2">
          Every listing states one price per use and the bond behind the claim.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              Search likenesses
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <input
              id="q"
              type="search"
              placeholder="Search by name, ENS or collection"
              className="h-11 w-full rounded-control border border-line bg-soft pl-9 pr-3 text-base text-ink placeholder:text-ink-3 focus:border-line-strong"
            />
          </div>
          <div className="relative">
            <label htmlFor="state" className="sr-only">
              Filter by state
            </label>
            <select
              id="state"
              defaultValue="all"
              className="h-11 w-full appearance-none rounded-control border border-line bg-soft pl-3 pr-10 text-base text-ink focus:border-line-strong sm:w-auto sm:min-w-[11rem]"
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
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
