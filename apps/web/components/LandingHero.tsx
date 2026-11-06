import { Hero } from "./Hero";

/** The landing hero. Tall, with one primary action into the gated app. */
export function LandingHero() {
  return (
    <Hero
      tall
      eyebrow="Likeness rights registry"
      title="A face is not a stock photo."
      body="Clear the right to use someone's likeness, one use at a time. Every claim is bonded, every dispute is settled by a face match, and only hashes ever touch the chain."
      primaryHref="/explore"
      primaryLabel="Explore likenesses"
      secondaryHref="/register"
      secondaryLabel="Register a likeness"
    />
  );
}
