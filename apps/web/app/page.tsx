import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { TaglineReveal } from "@/components/TaglineReveal";
import { RegistryCarousel } from "@/components/RegistryCarousel";
import { RegistrySample } from "@/components/RegistrySample";
import { DisputeRecord } from "@/components/DisputeRecord";
import { Faq } from "@/components/Faq";
import { Reveal } from "@/components/Reveal";
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
          eyebrow="Hedera testnet · 8 entries registered"
          lines={["Clear one use of a face,", "not the face itself."]}
          body="A likeness licence names the use, the price and the expiry. Every claim is bonded, and a challenge is settled by a face match against a frozen reference."
          primaryHref="/explore"
          primaryLabel="Explore likenesses"
          secondaryHref="/register"
          secondaryLabel="Register a likeness"
          video
        />

        {/* B11 tagline moment, as its own section. */}
        <section aria-labelledby="tagline" className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
          <h2 id="tagline" className="sr-only">
            What FaceValue is for
          </h2>
          <div className="max-w-[680px]">
            <TaglineReveal lines={["A stock photo is cleared for any use.", "A face is cleared for one."]} />
          </div>
        </section>

        <section aria-labelledby="how" className="border-y border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
            <h2 id="how" className="heading-5 text-ink">
              How it works
            </h2>
            <ol className="mt-2 grid gap-2 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.n}
                  delay={i * 0.08}
                  className="h-full rounded-lg border border-line bg-surface3 p-3"
                >
                  <p className="caption-3 font-mono text-accent">{s.n}</p>
                  <h3 className="title-3 mt-2 text-ink">{s.t}</h3>
                  <p className="body-6 mt-2 text-ink2">{s.d}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="recent" className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
          <h2 id="recent" className="sr-only">
            Recently registered
          </h2>
          <RegistryCarousel />
        </section>

        <section aria-labelledby="benefits" className="border-y border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
            <div className="grid gap-2 lg:grid-cols-[0.85fr_1.15fr] lg:gap-2">
              <div>
                <h2 id="benefits" className="heading-5 text-ink">
                  What the licence actually does
                </h2>
                <p className="body-6 mt-2 max-w-[42ch] text-ink2">
                  Four things a buyer can rely on before paying, and four a registrant can rely on after.
                </p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {BENEFITS.map((b, i) => (
                  <Reveal as="li" key={b.t} delay={i * 0.06} className="h-full rounded-lg border border-line bg-surface3 p-3">
                    <h3 className="title-4 text-ink">{b.t}</h3>
                    <p className="body-6 mt-2 text-ink2">{b.d}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="proof" className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
          <h2 id="proof" className="heading-5 text-ink">
            A licence is one use, one price
          </h2>
          <p className="body-6 mt-2 max-w-[58ch] text-ink2">
            An entry can be licensed only while it is active or moved. Anything else says why not, in words.
          </p>
          <div className="mt-2">
            <RegistrySample />
          </div>

          <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-2">
            <div>
              <h3 className="heading-6 text-ink">The face decides, not the count</h3>
              <p className="body-6 mt-2 max-w-[46ch] text-ink2">
                Three resolvers each answer one question against a frozen reference: whose face is this. Two of
                three must agree, so one resolver cannot move a dispute alone.
              </p>
              <p className="body-6 mt-2 max-w-[46ch] text-ink2">
                Whoever the face turns out to be takes every stake. That is why challengers only file when they
                are confident.
              </p>
            </div>
            <DisputeRecord />
          </div>
        </section>

        <section aria-labelledby="faq" className="border-y border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
            <div className="grid gap-2 lg:grid-cols-[0.7fr_1.3fr] lg:gap-2">
              <div>
                <h2 id="faq" className="heading-5 text-ink">
                  Questions before you pay
                </h2>
                <p className="body-6 mt-2 max-w-[36ch] text-ink2">
                  If something is unclear, it is cheaper to ask than to licence the wrong thing.
                </p>
              </div>
              <Faq />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3 md:py-3">
          <div className="rounded-xl border border-line bg-surface3 p-3 md:p-3">
            <h2 className="heading-5 max-w-[24ch] text-ink">
              Browse the registry before you commit to anything
            </h2>
            <p className="body-6 mt-2 max-w-[52ch] text-ink2">
              Connecting a wallet shows prices, bonds and open challenges. It costs nothing and signs nothing.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button href="/explore" size="lg">
                Explore likenesses
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button href="/register" size="lg" variant="secondary">
                Register a likeness
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
