import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/Button";
import { LandingHero } from "@/components/LandingHero";
import { RegistrySample } from "@/components/RegistrySample";
import { DisputeRecord } from "@/components/DisputeRecord";

export default function Landing() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <LandingHero />

        {/*
          The registry, shown rather than described. A visitor sees a price, a
          refusal in words and four different states before connecting to
          anything. This replaces a row of numbered feature cards that said the
          same thing in slogans.
        */}
        <section
          aria-labelledby="registry"
          className="mx-auto w-full max-w-[1440px] px-4 pt-14 md:px-6 md:pt-16"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="registry"
                className="font-display text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl"
              >
                A licence is one use, one price
              </h2>
              <p className="mt-1.5 max-w-[54ch] text-sm leading-relaxed text-ink-2">
                An entry can be licensed only while it is active or moved.
                Anything else says why not, in words.
              </p>
            </div>
          </div>
          <RegistrySample />
        </section>

        {/* The mechanism, as one worked case. */}
        <section
          aria-labelledby="dispute"
          className="mx-auto w-full max-w-[1440px] px-4 py-14 md:px-6 md:py-16"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-12">
            <div>
              <h2
                id="dispute"
                className="max-w-[18ch] font-display text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl"
              >
                A challenge is settled by the face, not by a vote
              </h2>
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-2">
                Three resolvers each answer one question against a frozen
                reference: whose face is this. Two of three must agree. One
                resolver cannot move a dispute alone.
              </p>
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-2">
                Whoever the face turns out to be takes every stake. That is why
                challengers only file when they are confident, and why the
                queue stays short.
              </p>
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-3">
                Only a hash of the reference face is written to chain. Never the
                image, never the embedding, never a nullifier.
              </p>
            </div>
            <DisputeRecord />
          </div>
        </section>

        {/* Closing CTA. */}
        <section className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-6 md:pb-20">
          <div className="flex flex-col items-start gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[46ch] text-sm leading-relaxed text-ink-2">
              Connect a wallet to browse the registry, clear a use, or challenge
              a claim.
            </p>
            <Button href="/explore">
              Explore likenesses
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-page">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-footer.png"
              alt="facevalue"
              width={800}
              height={195}
              className="h-6 w-auto"
            />
          </div>
          <p className="max-w-[56ch] text-xs leading-relaxed text-ink-3">
            FaceValue is not a party to any licence. Demo build — every record
            on this page is seeded.
          </p>
        </div>
      </footer>
    </>
  );
}
