import { Hero } from "./Hero";

/**
 * The landing hero.
 *
 * The eyebrow is a concrete fact rather than a category label, and the body
 * states the one thing that separates a licence from a stock photo: it covers
 * a single use and expires. Slogans were doing the work here before.
 */
export function LandingHero() {
  return (
    <Hero
      tall
      eyebrow="Hedera testnet · 8 entries registered"
      title="Clear one use of a face, not the face itself."
      body="A likeness licence names the use, the price and the expiry. Anything contestable is bonded, and a dispute is settled by a face match against a frozen reference."
      primaryHref="/explore"
      primaryLabel="Explore likenesses"
      secondaryHref="/register"
      secondaryLabel="Register a likeness"
    />
  );
}
