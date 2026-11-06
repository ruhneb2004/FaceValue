import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { TaglineReveal } from "@/components/TaglineReveal";
import { RegistryMarquee } from "@/components/RegistryMarquee";
import { RegistrySample } from "@/components/RegistrySample";
import { DisputeRecord } from "@/components/DisputeRecord";
import { Faq } from "@/components/Faq";
import { Reveal } from "@/components/Reveal";
import { HowItWorks } from "@/components/HowItWorks";
import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";

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

const BENEFITS = [
  {
    t: "One use at a time",
    d: "A licence names the use and the date. It never hands over the face, so a brief cannot quietly widen into a campaign.",
  },
  {
    t: "Refusals in words",
    d: "An entry that cannot be licensed says why, on the page. No greyed out button and no guessing.",
  },
  {
    t: "Bonded claims",
    d: "A challenge costs money to file. That keeps the dispute queue short and the claims worth reading.",
  },
  {
    t: "Hashes on chain, images off it",
    d: "The reference face never leaves the device. Only a hash, the terms and the bond reach the ledger.",
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
        <section aria-labelledby="tagline" className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-20 md:py-28">
          <h2 id="tagline" className="sr-only">
            What FaceValue is for
          </h2>
          <div className="max-w-[680px]">
            <TaglineReveal lines={["A stock photo is cleared for any use.", "A face is cleared for one."]} />
          </div>
        </section>

        <section aria-labelledby="how" className="border-b border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
              <HowItWorks />
              <div className="hidden lg:block">
                <div className="rounded-lg border border-line bg-surface3 p-6">
                  <p className="caption-3 text-ink">What a licence records</p>
                  <dl className="mt-4 divide-y divide-line">
                    {[
                      ["Use", "One named campaign, one channel"],
                      ["Term", "Fixed expiry, set at purchase"],
                      ["Price", "Stated per use, no dynamic pricing"],
                      ["Bond", "Posted by the registrant"],
                      ["Reference", "A hash, never the image"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="caption-4 text-ink3">{k}</dt>
                        <dd className="body-6 text-right text-ink2">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="recent" className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
          <h2 id="recent" className="sr-only">
            Recently registered
          </h2>
          <RegistryMarquee />
        </section>

        <section aria-labelledby="benefits" className="border-y border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
              <div>
                <h2 id="benefits" className="heading-5 text-ink">
                  What the licence actually does
                </h2>
                <p className="body-6 mt-3 max-w-[42ch] text-ink2">
                  Four things a buyer can rely on before paying, and four a registrant can rely on after.
                </p>
              </div>
              {/* Rows, not a 2x2 grid: the left column is two short paragraphs,
                  so a grid left a visible hole under the heading. */}
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {BENEFITS.map((b, i) => (
                  <Reveal as="li" key={b.t} delay={i * 0.05} className="grid gap-1 py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
                    <h3 className="title-4 text-ink">{b.t}</h3>
                    <p className="body-6 text-ink2">{b.d}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="proof" className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
          <h2 id="proof" className="heading-5 text-ink">
            A licence is one use, one price
          </h2>
          <p className="body-6 mt-3 max-w-[58ch] text-ink2">
            An entry can be licensed only while it is active or moved. Anything else says why not, in words.
          </p>
          <div className="mt-8">
            <RegistrySample />
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
            <div>
              <h3 className="heading-6 text-ink">The face decides, not the count</h3>
              <p className="body-6 mt-3 max-w-[46ch] text-ink2">
                Three resolvers each answer one question against a frozen reference: whose face is this. Two of
                three must agree, so one resolver cannot move a dispute alone.
              </p>
              <p className="body-6 mt-3 max-w-[46ch] text-ink2">
                Whoever the face turns out to be takes every stake. That is why challengers only file when they
                are confident.
              </p>
            </div>
            <DisputeRecord />
          </div>
        </section>

        <section aria-labelledby="faq" className="border-y border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
              <div>
                <h2 id="faq" className="heading-5 text-ink">
                  Questions before you pay
                </h2>
                <p className="body-6 mt-3 max-w-[36ch] text-ink2">
                  If something is unclear, it is cheaper to ask than to licence the wrong thing.
                </p>
              </div>
              <Faq />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-20 md:py-28">
          <div className="rounded-xl border border-line bg-surface3 px-6 py-10 md:px-10 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
              <div>
                <h2 className="heading-5 max-w-[24ch] text-ink">
                  Browse the registry before you commit to anything
                </h2>
                <p className="body-6 mt-3 max-w-[46ch] text-ink2">
                  Connecting a wallet shows prices, bonds and open challenges. It costs nothing and signs nothing.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button href="/explore" size="lg">
                  Explore likenesses
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button href="/register" size="lg" variant="secondary">
                  Register a likeness
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
