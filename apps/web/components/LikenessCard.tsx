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
          <div className="absolute left-2.5 top-2.5">
            <StateBadge state={likeness.state} count={likeness.openChallenges} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-snug text-ink">
              {likeness.name}
            </h3>
            {licensable && (
              <span className="tabular shrink-0 font-mono text-sm font-medium text-ink">
                {likeness.pricePerUse.toFixed(2)}
              </span>
            )}
          </div>

          {licensable ? (
            <p className="font-mono text-[11px] text-ink-3">HBAR per use</p>
          ) : (
            <p className="text-xs leading-snug text-ink-3">
              {reasonShort(likeness)}
            </p>
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
        ? `${l.openChallenges} challenges open`
        : "Challenge open";
    case "review":
      return "Under review";
    case "revoked":
      return "Revoked by the registrant";
    default:
      return "Not licensable";
  }
}
