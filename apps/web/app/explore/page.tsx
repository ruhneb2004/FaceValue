import { ExploreHeader } from "@/components/ExploreHeader";
import { LikenessCard } from "@/components/LikenessCard";
import { SiteHeader } from "@/components/SiteHeader";
import { ConnectGate } from "@/components/ConnectGate";
import { SEED_LIKENESSES } from "@/lib/seed";
import Image from "next/image";

export default function Explore() {
  const licensable = SEED_LIKENESSES.filter(
    (l) => l.state === "active" || l.state === "moved",
  ).length;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <ConnectGate
          returnTo="/explore"
          title="Connect a wallet to explore likenesses"
          reason="Browsing is free. Prices, bonds and challenges are per-wallet, so the registry asks you to connect before showing them."
        >
          <ExploreHeader />

        <section
          aria-labelledby="listings"
          className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-6 md:py-12"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 id="listings" className="text-sm font-medium text-ink">
              All likenesses
            </h2>
            <p className="tabular font-mono text-xs text-ink-3">
              {SEED_LIKENESSES.length} registered · {licensable} licensable
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {SEED_LIKENESSES.map((l, i) => (
              <li key={l.id}>
                <LikenessCard likeness={l} index={i} />
              </li>
            ))}
          </ul>
        </section>
        </ConnectGate>
      </main>

      <footer className="border-t border-line bg-page">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[34ch]">
              <Image
                src="/logo-footer.png"
                alt="facevalue"
                width={800}
                height={195}
                className="h-8 w-auto"
              />
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                A registry interface for likeness rights. FaceValue is not a
                party to any licence.
              </p>
            </div>

            <div className="flex flex-wrap gap-10 text-sm">
              <div>
                <p className="mb-3 eyebrow">
                  Integrations
                </p>
                <ul className="space-y-2 text-ink-2">
                  <li>ENS names</li>
                  <li>World ID</li>
                  <li>Hedera</li>
                </ul>
              </div>
              <div>
                <p className="mb-3 eyebrow">
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
