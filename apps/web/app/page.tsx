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
        <section aria-labelledby="tagline" className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-20 md:py-28">
          <h2 id="tagline" className="sr-only">
            What FaceValue is for
          </h2>
          <div className="max-w-[680px]">
            <TaglineReveal lines={["A stock photo is cleared for any use.", "A face is cleared for one."]} />
          </div>
        </section>

        <section aria-labelledby="how" className="border-b border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-24 md:py-36">
            <HowItWorks />
          </div>
        </section>

        <section aria-labelledby="recent" className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
          {/* The heading, and its id, live inside RegistryMarquee. An sr-only
              duplicate used to sit here as well, giving the page two elements
              with id="recent". */}
          <RegistryMarquee />
        </section>

        <section aria-labelledby="benefits" className="border-y border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-24 md:py-36">
            <StatusStages />
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
