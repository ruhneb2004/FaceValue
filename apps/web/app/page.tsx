import { SiteHeader } from "@/components/SiteHeader";
import { StateBadge } from "@/components/StateBadge";
import type { LikenessState } from "@/lib/types";

const STATES: LikenessState[] = [
  "active",
  "provisional",
  "disputed",
  "review",
  "moved",
  "revoked",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8">
        <h1 className="max-w-[20ch] font-display text-5xl leading-[1.05] tracking-[-0.02em] text-ink md:text-6xl">
          Likeness rights, cleared.
        </h1>
        <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-ink-2">
          Find a face. Licence it for one use. Every claim is backed by a bond
          anyone can see.
        </p>

        <section aria-labelledby="states" className="mt-16">
          <h2 id="states" className="font-display text-2xl text-ink">
            States
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {STATES.map((s) => (
              <li key={s}>
                <StateBadge state={s} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
