"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { StateBadge } from "./StateBadge";
import { ListingArt } from "./ListingArt";
import { isLicensable, type Likeness } from "@/lib/types";

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
      /* Infrequent entrance: opacity + 4px blur + 12px rise over 300ms,
         staggered 100ms. Capped so a long grid never feels slow. */
      initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.3,
        ease: [0.2, 0, 0, 1],
        delay: Math.min(index * 0.1, 0.4),
      }}
      className="h-full"
    >
      <Link
        href={`/likeness/${likeness.id}`}
        className="card press group flex h-full flex-col overflow-hidden"
      >
        <div className="relative aspect-square w-full overflow-hidden border-b border-line">
          <ListingArt
            id={likeness.id}
            state={likeness.state}
            className="h-full w-full"
          />
          <div className="absolute left-3 top-3">
            <StateBadge state={likeness.state} count={likeness.openChallenges} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">
            {likeness.name}
          </h3>

          {licensable ? (
            <p className="tabular text-sm text-ink-2">
              <span className="font-semibold text-ink">
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
