"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { ExploreHeader } from "@/components/ExploreHeader";
import { LikenessCard } from "@/components/LikenessCard";
import { ConnectGate } from "@/components/ConnectGate";
import { Button } from "@/components/Button";
import { SEED_LIKENESSES } from "@/lib/seed";
import { isLicensable, type LikenessState } from "@/lib/types";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";

/**
 * The registry grid.
 *
 * Filtering is real: the search matches the name and the ENS name, and the
 * state pills filter by the record's own state. The count beside the controls
 * is derived from the same filtered list the grid renders, so the two can never
 * disagree.
 *
 * The layout follows the landing page's rhythm — one max-width container, the
 * same horizontal padding, and section spacing measured in the project's
 * steps — rather than the old full-bleed 3px inset, which read as a spreadsheet
 * with the browser chrome turned off.
 */
export default function Explore() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"all" | LikenessState>("all");

  const licensable = SEED_LIKENESSES.filter((l) => isLicensable(l.state)).length;
  const challenges = SEED_LIKENESSES.reduce((n, l) => n + l.openChallenges, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEED_LIKENESSES.filter((l) => {
      if (state !== "all" && l.state !== state) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.ensName ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, state]);

  const clear = () => {
    setQuery("");
    setState("all");
  };

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageIntro
          eyebrow="Registry"
          title="Explore likenesses"
          intro="Every listing states one price per use and the claim behind it. Only records that are licensable now can be cleared; the rest say why they cannot."
          aside={
            <dl className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface2">
              {[
                { k: "Entries", v: SEED_LIKENESSES.length },
                { k: "Licensable", v: licensable },
                { k: "Challenges", v: challenges },
              ].map((s) => (
                <div key={s.k} className="px-5 py-4 text-center first:rounded-l-xl last:rounded-r-xl">
                  <dd className="tnum font-mono text-[1.375rem] leading-none text-ink">
                    {s.v}
                  </dd>
                  <dt className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink3">
                    {s.k}
                  </dt>
                </div>
              ))}
            </dl>
          }
        />

        <ConnectGate
          title="Connect a wallet to explore likenesses"
          reason="Browsing is free. Prices, bonds and challenges are per-wallet, so the registry asks you to connect before showing them."
        >
          <section aria-labelledby="listings" className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
            <h2 id="listings" className="sr-only">
              All likenesses
            </h2>

            <ExploreHeader
              query={query}
              onQuery={setQuery}
              state={state}
              onState={setState}
              total={SEED_LIKENESSES.length}
              shown={filtered.length}
            />

            {filtered.length > 0 ? (
              <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((l, i) => (
                  <li key={l.id}>
                    <LikenessCard likeness={l} index={i} />
                  </li>
                ))}
              </ul>
            ) : (
              /* An empty result says so and offers the way back, rather than
                 leaving a blank panel where the grid was. */
              <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-linestrong bg-surface2 px-6 py-16 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-surface3 text-ink3">
                  <MagnifyingGlass size={20} aria-hidden="true" />
                </span>
                <p className="title-3 mt-4 text-ink">
                  Nothing matches{query ? ` “${query}”` : " that state"}
                </p>
                <p className="body-5 mt-2 max-w-[42ch] text-ink2">
                  The demo registry holds{" "}
                  <span className="tnum text-ink">{SEED_LIKENESSES.length}</span>{" "}
                  records. Try a different name, or clear the filters to see them all.
                </p>
                <Button variant="secondary" size="sm" className="mt-6" onClick={clear}>
                  Clear filters
                </Button>
              </div>
            )}
          </section>
        </ConnectGate>
      </main>
      <Footer />
    </>
  );
}
