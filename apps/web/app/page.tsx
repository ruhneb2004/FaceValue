import Image from "next/image";
import { ArrowRight, Fingerprint, Scale, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/Button";
import { LandingHero } from "@/components/LandingHero";

export default function Landing() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <LandingHero />

        {/* How it works — three steps, numbered because order matters. */}
        <section
          aria-labelledby="how"
          className="mx-auto w-full max-w-[1440px] px-4 py-16 md:px-6 md:py-20"
        >
          <h2
            id="how"
            className="max-w-[20ch] font-display text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl"
          >
            Three steps from a face to a licence
          </h2>

          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Register",
                d: "Capture a likeness once. Only a hash of the face data is written to chain — never the image, never the embedding.",
              },
              {
                n: "02",
                t: "Licence a use",
                d: "Anyone can clear one specific use at a stated price. The licence records what it covers and when it expires.",
              },
              {
                n: "03",
                t: "Challenge or defend",
                d: "A claim can be contested against a bond. The dispute resolves on a face match, not a vote, so a lobby cannot outvote the truth.",
              },
            ].map((s) => (
              <li key={s.n} className="card p-5">
                <span className="font-mono text-xs text-accent">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                  {s.t}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Why the mechanism is different. */}
        <section
          aria-labelledby="why"
          className="border-y border-line bg-sunken"
        >
          <div className="mx-auto w-full max-w-[1440px] px-4 py-16 md:px-6 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <h2
                  id="why"
                  className="max-w-[18ch] font-display text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl"
                >
                  The face decides. The count does not.
                </h2>
                <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-2">
                  Every challenge is resolved independently against a frozen
                  reference. Three resolvers each answer one question — whose
                  face is this — and two of three must agree.
                </p>
                <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-2">
                  Whoever the face turns out to be takes every stake in the
                  dispute. Rational challengers only file when they are
                  confident, which is what keeps the queue short.
                </p>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Fingerprint,
                    t: "Hashes only",
                    d: "No image, embedding or nullifier is ever written to a public ledger.",
                  },
                  {
                    icon: Scale,
                    t: "Bonded claims",
                    d: "A claim with no money behind it is an opinion. A bond makes it a position.",
                  },
                  {
                    icon: ShieldCheck,
                    t: "2-of-3 resolution",
                    d: "One resolver cannot move a dispute alone, and the record says who did what.",
                  },
                  {
                    icon: ArrowRight,
                    t: "Payout follows the face",
                    d: "The identified party takes the stakes. Not the majority, not the first to file.",
                  },
                ].map(({ icon: Icon, t, d }) => (
                  <li key={t} className="card p-4">
                    <Icon className="size-4 text-accent" aria-hidden="true" />
                    <h3 className="mt-2.5 text-sm font-semibold text-ink">{t}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-3">{d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing CTA. One action. */}
        <section className="mx-auto w-full max-w-[1440px] px-4 py-16 md:px-6 md:py-20">
          <div className="card flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl">
                Ready to look?
              </h2>
              <p className="mt-1.5 text-sm text-ink-2">
                Connect a wallet and browse the registry.
              </p>
            </div>
            <Button href="/explore">
              Explore likenesses
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-page">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-footer.png"
                alt="facevalue"
                width={800}
                height={195}
                className="h-7 w-auto"
              />
            </div>
            <p className="max-w-[52ch] text-xs leading-relaxed text-ink-3">
              A registry interface for likeness rights. FaceValue is not a party
              to any licence. Demo build — all records are seeded.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
