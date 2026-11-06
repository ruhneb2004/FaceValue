import { Hero } from "@/components/Hero";
import { LikenessCard } from "@/components/LikenessCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SEED_LIKENESSES } from "@/lib/seed";

export default function Home() {
  const licensable = SEED_LIKENESSES.filter(
    (l) => l.state === "active" || l.state === "moved",
  ).length;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />

        <section
          aria-labelledby="listings"
          className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-8 md:py-16"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="listings" className="font-display text-2xl text-ink">
              Listings
            </h2>
            <p className="tabular text-sm text-ink-3">
              {SEED_LIKENESSES.length} total · {licensable} licensable now
            </p>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SEED_LIKENESSES.map((l, i) => (
              <li key={l.id}>
                <LikenessCard likeness={l} index={i} />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line-subtle bg-surface">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-8 text-sm text-ink-3 md:flex-row md:items-center md:justify-between md:px-8">
          <p>FaceValue is a registry interface, not a party to any licence.</p>
          <p>ENS · World ID · Hedera</p>
        </div>
      </footer>
    </>
  );
}
