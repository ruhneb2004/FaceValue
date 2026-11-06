import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { TaglineReveal } from "@/components/TaglineReveal";
import { RegistryMarquee } from "@/components/RegistryMarquee";
import { RegistrySample } from "@/components/RegistrySample";
import { DisputeRecord } from "@/components/DisputeRecord";
import { Faq } from "@/components/Faq";
import { HowItWorks } from "@/components/HowItWorks";
import { StatusStages } from "@/components/StatusStages";
import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { SEED_LIKENESSES } from "@/lib/seed";
import { isLicensable } from "@/lib/types";

/**
 * Landing page. Section order follows the skill's A2 and A6:
 * hero, tagline reveal, how it works, registry, benefits, proof, FAQ, final CTA.
 * One offer, one audience, one primary action.
 */

const STEPS = [
  {
    n: "1",
    t: "Register the likeness once",
    d: "Capture a reference, set a price per use, post a bond. Only a hash goes to chain.",
  },
  {
    n: "2",
    t: "Clear a single use",
    d: "Pay the stated price and get a licence that names the use and the expiry. Nothing broader.",
  },
  {
    n: "3",
    t: "Challenge if it is wrong",
    d: "Post a bond against a claim you believe is false. The face decides and the stake follows it.",
  },
];

export default function Landing() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero
          lines={["Clear one use of a face,", "not the face itself."]}
          body="A likeness licence names the use, the price and the expiry. Every claim is bonded, and a challenge is settled by a face match against a frozen reference."
          primaryHref="/explore"
          primaryLabel="Explore likenesses"
          secondaryHref="/register"
          secondaryLabel="Register a likeness"
          video
        />

        {/* B11 tagline moment, as its own section. */}
        <section
          aria-labelledby="tagline"
          className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-20 md:py-28"
        >
          <h2 id="tagline" className="sr-only">
            What FaceValue is for
          </h2>
          <div className="max-w-[680px]">
            <TaglineReveal
              lines={[
                "A stock photo is cleared for any use.",
                "A face is cleared for one.",
              ]}
            />
          </div>
        </section>

        <section
          aria-labelledby="how"
          className="border-b border-line bg-surface1"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-24 md:py-36">
            <HowItWorks />
          </div>
        </section>

        <section
          aria-labelledby="recent"
          className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24"
        >
          {/* The heading, and its id, live inside RegistryMarquee. An sr-only
              duplicate used to sit here as well, giving the page two elements
              with id="recent". */}
          <RegistryMarquee />
        </section>

        <section
          aria-labelledby="benefits"
          className="border-y border-line bg-surface1"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-24 md:py-36">
            <StatusStages />
          </div>
        </section>

        <section
          aria-labelledby="face"
          className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24"
        >
          {/* The record sits LEFT and the heading and intro sit RIGHT, mirroring
              the block above it. The source order stays heading-first so the h2
              is announced before the record, and the visual swap is done with
              grid placement rather than by moving the copy down the DOM. */}
          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)] lg:gap-16">
            {/* The intro runs the full height of the record beside it rather
                than sitting as a short paragraph at the top. A long block of
                cards next to three lines of grey leaves most of the column
                empty, so the copy is given the column, a larger measure, a
                stronger heading and brighter body text, and it is pinned to the
                top of a sticky column so it stays with the reader as the rows
                scroll past. */}
            <div className="lg:col-start-2 lg:row-start-1 lg:self-stretch">
              <div className="lg:sticky lg:top-28">
                <h2
                  id="face"
                  className="text-[2rem] leading-[1.1] font-medium tracking-[-0.02em] text-ink text-balance md:text-[2.75rem]"
                >
                  The face decides, not the count
                </h2>

                <div className="mt-8 border-t border-line pt-8">
                  <p className="text-[1.125rem] leading-[1.65] text-ink2">
                    Three resolvers each answer one question against a frozen
                    reference: whose face is this. Two of three must agree, so
                    one resolver cannot move a dispute alone.
                  </p>
                  <p className="mt-6 text-[1.125rem] leading-[1.65] font-medium text-ink">
                    Whoever the face turns out to be takes every stake. That is
                    why challengers only file when they are confident.
                  </p>
                </div>

                {/* The last sentence of the supplied copy is the claim the
                    section exists to prove, so it is pulled forward in ink
                    rather than left as a second grey paragraph, and given an
                    accent rule to anchor it to the column. No new words. */}
              </div>
            </div>

            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <DisputeRecord />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq"
          className="border-y border-line bg-surface1"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:items-start lg:gap-16">
              {/* Same treatment as the dispute intro: the heading and the line
                  under it get the column, a larger scale and a sticky hold, so
                  the copy stays with the reader while eight rows scroll past
                  instead of sitting as a caption at the top. */}
              <div className="lg:self-stretch">
                <div className="lg:sticky lg:top-28">
                  <h2
                    id="faq"
                    className="text-[2rem] leading-[1.1] font-medium tracking-[-0.02em] text-ink text-balance md:text-[2.75rem]"
                  >
                    Questions before you pay
                  </h2>
                  <p className="mt-6 border-t border-line pt-6 text-[1.125rem] leading-[1.65] text-ink2">
                    If something is unclear, it is cheaper to ask than to
                    licence the wrong thing.
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <Faq />
              </div>
            </div>
          </div>
        </section>

        {/* Closing prompt. The old version was a shallow card with the copy in
            one corner and the buttons in the other, so most of a full-width
            panel was dead space between them. This gives the block a heading at
            the same scale as the sections above, puts the two actions directly
            under the copy they belong to, and uses the remaining width for the
            one number that answers "why now". */}
        <section
          aria-labelledby="closing"
          className="mx-auto w-full max-w-[1440px] px-6 md:px-12 pb-20 pt-8 md:pb-28"
        >
          <div className="overflow-hidden rounded-2xl border border-line bg-surface2">
            <div className="grid gap-10 p-8 md:p-12 lg:grid-cols-[minmax(0,1.5fr)_auto] lg:items-end lg:gap-16">
              <div>
                <h2
                  id="closing"
                  className="max-w-[20ch] text-[2rem] leading-[1.08] font-medium tracking-[-0.02em] text-ink text-balance md:text-[2.75rem]"
                >
                  Browse the registry before you commit to anything
                </h2>
                <p className="mt-5 max-w-[44ch] text-[1.0625rem] leading-relaxed text-ink2">
                  Connecting a wallet shows prices, bonds and open challenges. It
                  costs nothing and signs nothing.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button href="/explore" size="lg">
                  Explore likenesses
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button href="/register" size="lg" variant="secondary">
                  Register a likeness
                </Button>
              </div>
            </div>

            {/* A strip of the three facts a reader checks before leaving. They
                are the numbers the registry actually holds, not decoration, and
                they use the width the card was otherwise wasting. */}
            <dl className="grid grid-cols-3 divide-x divide-line border-t border-line">
              {[
                { k: "Entries", v: String(SEED_LIKENESSES.length) },
                {
                  k: "Licensable now",
                  v: String(SEED_LIKENESSES.filter((l) => isLicensable(l.state)).length),
                },
                {
                  k: "Open challenges",
                  v: String(
                    SEED_LIKENESSES.reduce((n, l) => n + l.openChallenges, 0),
                  ),
                },
              ].map((s) => (
                <div key={s.k} className="px-6 py-5 md:px-8">
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink2">
                    {s.k}
                  </dt>
                  <dd className="tnum mt-1.5 font-mono text-[1.25rem] text-ink">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
