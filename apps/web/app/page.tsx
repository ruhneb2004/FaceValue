import { Hero } from "@/components/Hero";
import { LikenessCard } from "@/components/LikenessCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SEED_LIKENESSES } from "@/lib/seed";
import Image from "next/image";

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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2
              id="listings"
              className="font-display text-2xl font-bold text-ink md:text-3xl"
            >
              Listings
            </h2>
            <p className="tabular text-sm text-ink-3">
              {SEED_LIKENESSES.length} total · {licensable} licensable
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SEED_LIKENESSES.map((l, i) => (
              <li key={l.id}>
                <LikenessCard likeness={l} index={i} />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line bg-page">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[34ch]">
              <Image
                src="/logo-light.png"
                alt="facevalue"
                width={800}
                height={343}
                className="h-10 w-auto"
              />
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                A registry interface for likeness rights. FaceValue is not a
                party to any licence.
              </p>
            </div>

            <div className="flex flex-wrap gap-10 text-sm">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                  Integrations
                </p>
                <ul className="space-y-2 text-ink-2">
                  <li>ENS names</li>
                  <li>World ID</li>
                  <li>Hedera</li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                  Record
                </p>
                <ul className="space-y-2 text-ink-2">
                  <li>Bond contract</li>
                  <li>Dispute log</li>
                  <li>Resolver set</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
