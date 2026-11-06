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
      <main id="main" className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-8 md:py-16">
        <section aria-labelledby="hero">
          <h1
            id="hero"
            className="max-w-[18ch] font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ink md:text-6xl"
          >
            Likeness rights, cleared.
          </h1>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-ink-2">
            Find a face. Licence it for one use. Every claim is backed by a bond
            anyone can see, and any dispute is resolved in the open.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <label htmlFor="q" className="sr-only">
            Search likenesses
          </label>
          <input
            id="q"
            type="search"
            placeholder="Search by listing name or ENS name"
            className="h-11 min-w-0 flex-1 rounded-control border border-line bg-page px-3 text-sm text-ink placeholder:text-ink-3"
          />
          <select
            aria-label="Filter by state"
            className="h-11 rounded-control border border-line bg-page px-3 text-sm text-ink"
            defaultValue="all"
          >
            <option value="all">All states</option>
            <option value="active">Licensable</option>
            <option value="provisional">Provisional</option>
            <option value="disputed">Challenge open</option>
            <option value="review">Under review</option>
            <option value="moved">Moved</option>
          </select>
        </div>

        <p className="mt-6 text-sm text-ink-3">
          {SEED_LIKENESSES.length} listings · {licensable} licensable now
        </p>

        <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SEED_LIKENESSES.map((l) => (
            <li key={l.id}>
              <LikenessCard likeness={l} />
            </li>
          ))}
        </ul>
      </main>

      <footer className="mt-auto border-t border-line-subtle">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-8 text-sm text-ink-3 md:px-8">
          FaceValue is a registry interface, not a party to any licence.
        </div>
      </footer>
    </>
  );
}
