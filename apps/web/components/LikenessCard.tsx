"use client";

import Link from "next/link";
import { StateBadge } from "./StateBadge";
import { ApeArt } from "./ApeArt";
import { isLicensable, type Likeness } from "@/lib/types";

/**
 * A marketplace card.
 *
 * The state lives in the badge and licensability lives in the price, so nothing
 * appears twice. A card that cannot be licensed shows no price rather than a
 * zero or a dead button.
 */
export function LikenessCard({ likeness }: { likeness: Likeness; index?: number }) {
  const licensable = isLicensable(likeness.state);

  return (
    <Link
      href={`/likeness/${likeness.id}`}
      className="press group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface3 hover:bg-surface4"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden">
        <ApeArt id={likeness.id} className="h-full w-full" />
        <div className="absolute left-3 top-3">
          <StateBadge state={likeness.state} count={likeness.openChallenges} />
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-line p-3">
        <h3 className="title-4 line-clamp-2 text-ink">{likeness.name}</h3>
        <p className="caption-5 mt-2 font-mono text-ink3">{likeness.ensName}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          {licensable ? (
            <div>
              <p className="tnum title-3 font-mono text-ink">
                {likeness.pricePerUse}
                <span className="caption-5 ml-2 text-ink3">HBAR</span>
              </p>
              <p className="caption-5 text-ink3">per use</p>
            </div>
          ) : (
            <p className="caption-5 text-ink3">Not licensable</p>
          )}
        </div>
      </div>
    </Link>
  );
}
