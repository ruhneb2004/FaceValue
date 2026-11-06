"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { StateBadge } from "./StateBadge";
import { ListingArt } from "./ListingArt";
import { isLicensable, type Likeness } from "@/lib/types";

/** Warm tint per state, so the grid reads as varied artwork, not repetition. */
const TINT: Record<string, string> = {
  active: "var(--gold-50)",
  provisional: "var(--gold-100)",
  disputed: "var(--state-disputed-bg)",
  review: "var(--state-review-bg)",
  moved: "var(--taupe-100)",
  revoked: "var(--neutral-100)",
};

/**
 * A marketplace card.
 * Shadow for elevation, transparent border for forced-colors (better-ui).
 * Non-licensable cards state the reason in words, never a blank price.
 */
export function LikenessCard({
  likeness,
  index = 0,
}: {
  likeness: Likeness;
  index?: number;
}) {
  const licensable = isLicensable(likeness.state);
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.2, 0, 0, 1],
        delay: Math.min(index * 0.05, 0.3),
      }}
      className="h-full"
    >
      <Link
        href={`/likeness/${likeness.id}`}
        className="surface-card group flex h-full flex-col overflow-hidden rounded-card bg-surface"
      >
        <div
          className="relative aspect-square w-full overflow-hidden"
          style={{ backgroundColor: TINT[likeness.state] ?? "var(--gold-50)" }}
        >
          <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.04]">
            <ListingArt id={likeness.id} className="h-full w-full [&>svg]:h-full [&>svg]:w-full" />
          </div>
          <div className="absolute left-3 top-3">
            <StateBadge state={likeness.state} count={likeness.openChallenges} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="text-base font-semibold leading-snug text-ink">
            {likeness.name}
          </h3>

          {licensable ? (
            <p className="tabular text-sm text-ink-2">
              <span className="font-medium text-ink">
                {likeness.pricePerUse.toFixed(2)} HBAR
              </span>{" "}
              per use
            </p>
          ) : (
            <p className="text-sm text-ink-3">{reasonShort(likeness)}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function reasonShort(l: Likeness): string {
  switch (l.state) {
    case "provisional":
      return "Not licensable until settled";
    case "disputed":
      return l.openChallenges > 1
        ? `Not licensable — ${l.openChallenges} challenges open`
        : "Not licensable — challenge open";
    case "review":
      return "Not licensable — under review";
    case "revoked":
      return "Revoked by the registrant";
    default:
      return "Not licensable";
  }
}
