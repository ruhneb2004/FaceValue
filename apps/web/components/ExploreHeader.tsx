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
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl">
          Explore likenesses
        </h1>
        <p className="mt-2 max-w-[52ch] text-sm text-ink2">
          Every listing states one price per use and the bond behind the claim.
        </p>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              Search likenesses
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink3"
              aria-hidden="true"
            />
            <input
              id="q"
              type="search"
              placeholder="Search by name, ENS or collection"
              className="h-11 w-full rounded-md border border-line bg-surface3 pl-2 pr-2 body-3 text-ink placeholder:text-ink3 focus:border-line-strong"
            />
          </div>
          <div className="relative">
            <label htmlFor="state" className="sr-only">
              Filter by state
            </label>
            <select
              id="state"
              defaultValue="all"
              className="h-11 w-full appearance-none rounded-md border border-line bg-surface3 pl-2 pr-2 body-3 text-ink focus:border-line-strong sm:w-auto sm:min-w-[11rem]"
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
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
