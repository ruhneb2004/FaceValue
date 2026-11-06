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
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.2, 0, 0, 1],
        delay: Math.min(index * 0.04, 0.24),
      }}
      className="h-full"
    >
      <Link
        href={`/likeness/${likeness.id}`}
        className="cartoon press group flex h-full flex-col overflow-hidden bg-paper"
      >
        <div className="relative aspect-square w-full border-b-[2.5px] border-ink">
          <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.05]">
            <ListingArt
              id={likeness.id}
              state={likeness.state}
              className="h-full w-full"
            />
          </div>
          <div className="absolute left-3 top-3">
            <StateBadge state={likeness.state} count={likeness.openChallenges} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="font-display text-lg font-extrabold leading-tight text-ink">
            {likeness.name}
          </h3>

          {licensable ? (
            <p className="tabular text-sm text-ink-2">
              <span className="font-extrabold text-ink">
                {likeness.pricePerUse.toFixed(2)} HBAR
              </span>{" "}
              per use
            </p>
          ) : (
            <p className="text-sm font-semibold text-ink-2">
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
