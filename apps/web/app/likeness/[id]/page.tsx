import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { LikenessAvatar } from "@/components/LikenessAvatar";
import { StateBadge } from "@/components/StateBadge";
import { ActionPanel } from "@/components/ActionPanel";
import { ReasonPanel } from "@/components/ReasonPanel";
import { ConnectGate } from "@/components/ConnectGate";
import { getLikeness } from "@/lib/repo";
import { isLicensable } from "@/lib/types";

/**
 * Likeness detail — the screen a buyer lands on from the grid.
 *
 * Layout: the portrait and its provenance on the left, the clearance action on
 * the right, and the action comes FIRST on mobile because it is why the page was
 * opened. The heading order is h1 (name) → h2 (action) so the outline says what
 * this record is before it says what you can do with it.
 *
 * Either `ActionPanel` or `ReasonPanel` renders, never both — a licensable
 * record has no refusal and a refused record has no buy button. That choice is
 * made by the same `isLicensable()` the grid uses.
 *
 * The record is read from the same repository the rest of the app uses, not from
 * the seed array. Reading the seed here meant anything registered through
 * /api/register lived in SQLite but was invisible to this page, so a freshly
 * registered likeness 404'd on its own profile — the grid listed it and its
 * detail page denied it existed.
 */

/**
 * Records are created at runtime, so the id set is not known at build time and
 * generateStaticParams cannot enumerate it. `await connection()` in the component
 * below opts this route out of prerendering under cacheComponents — `export const
 * dynamic` is rejected when cacheComponents is on.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const likeness = getLikeness(id);
  if (!likeness) return { title: "Likeness not found — FaceValue" };
  return { title: `${likeness.name} — FaceValue` };
}

export default function LikenessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The record is read at request time, which cacheComponents treats as runtime
  // data: it has to sit inside a Suspense boundary or the whole route is forced
  // to block. The shell renders immediately and the record streams in.
  return (
    <Suspense fallback={<LikenessShell />}>
      <LikenessBody params={params} />
    </Suspense>
  );
}

/** The frame shown while the record is fetched. Same shape, no content. */
/**
 * The frame shown while the record is fetched. Deliberately renders no
 * `SiteHeader`: the header calls `usePathname()`, and under cacheComponents that
 * is URL data which cannot be read outside a Suspense boundary — putting it in
 * the fallback moved the problem rather than solving it. A bare loading line is
 * enough here, and the real header arrives with the record.
 */
function LikenessShell() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-8 md:px-12 md:pt-12">
        <span className="body-5 inline-flex min-h-11 items-center gap-1.5 text-ink3">
          Loading likeness…
        </span>
      </div>
    </main>
  );
}

async function LikenessBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();
  const likeness = getLikeness(id);

  // An unknown id is a 404, not an empty page. Silently rendering a blank
  // record would let a dead link look like a cleared one.
  if (!likeness) notFound();

  const licensable = isLicensable(likeness.state);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-8 md:px-12 md:pt-12">
          <Link
            href="/explore"
            className="body-5 press inline-flex min-h-11 items-center gap-1.5 text-ink2 hover:text-ink"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            All likenesses
          </Link>

          <div className="mt-2 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-12">
            {/* Portrait and provenance. On mobile this sits under the action. */}
            <div className="order-2 min-w-0 lg:order-1">
              <div className="overflow-hidden rounded-lg border border-line bg-surface3">
                <div className="relative aspect-square w-full">
                  <LikenessAvatar
                    seed={likeness.id}
                    className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                  />
                  <div className="absolute left-4 top-4">
                    <StateBadge
                      state={likeness.state}
                      count={likeness.openChallenges}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h1 className="heading-4 text-ink text-balance">
                  {likeness.name}
                </h1>
                <p className="body-5 mt-2 text-ink2">
                  {licensable
                    ? "Licensable now, one use at a time."
                    : "Every use is blocked right now. The reason is on the right."}
                </p>
              </div>

              <section aria-labelledby="provenance" className="mt-8">
                <h2
                  id="provenance"
                  className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink3"
                >
                  Provenance
                </h2>
                <dl className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface2">
                  <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                    <dt className="body-6 text-ink2">ENS reference</dt>
                    <dd className="font-mono text-[0.8125rem] text-ink">
                      {likeness.ensName ?? "Not written"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                    <dt className="body-6 text-ink2">Controller</dt>
                    <dd className="font-mono text-[0.8125rem] text-ink">
                      {likeness.controller}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                    <dt className="body-6 text-ink2">Open challenges</dt>
                    <dd className="tnum font-mono text-[0.8125rem] text-ink">
                      {likeness.openChallenges}
                    </dd>
                  </div>
                </dl>

                {/* The privacy claim, next to the data it describes. */}
                <p className="body-6 mt-4 flex items-start gap-2 text-ink2">
                  <ShieldCheck
                    size={15}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span>
                    Only a hash of the reference is written on chain. Neither the
                    image nor an embedding is published here.
                  </span>
                </p>
              </section>
            </div>

            {/* The action, first on mobile. */}
            <div className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-28">
              <ConnectGate
                title="Connect to license this likeness"
                reason="Prices and licence terms are per-wallet. Connecting costs nothing and signs nothing."
              >
                {licensable ? (
                  <ActionPanel likeness={likeness} />
                ) : (
                  <ReasonPanel likeness={likeness} />
                )}
              </ConnectGate>

              <Link
                href="/challenge"
                className="body-5 press mt-4 inline-flex min-h-11 items-center gap-1.5 text-ink2 hover:text-ink"
              >
                Challenge this likeness instead
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
