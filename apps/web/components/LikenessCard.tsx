import Link from "next/link";
import { StateBadge } from "./StateBadge";
import { isLicensable, type Likeness } from "@/lib/types";

/**
 * A marketplace card.
 *
 * A card that cannot be licensed never shows a blank or zero price: it states
 * the reason in words. See docs/design-spec.md §6.1.
 */
export function LikenessCard({ likeness }: { likeness: Likeness }) {
  const licensable = isLicensable(likeness.state);

  return (
    <Link
      href={`/likeness/${likeness.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line-subtle bg-surface transition-colors duration-150 hover:border-line"
    >
      <div className="relative aspect-square w-full bg-sunken">
        {/* Placeholder face area. Real capture art is not shipped for seed
            data: we do not put invented photographs of people in a product
            about likeness rights. */}
        <div className="absolute inset-0 grid place-items-center">
          <svg
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="size-16 text-[var(--taupe-400)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="32" cy="24" r="11" />
            <path d="M12 56c0-11 9-18 20-18s20 7 20 18" strokeLinecap="round" />
          </svg>
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
