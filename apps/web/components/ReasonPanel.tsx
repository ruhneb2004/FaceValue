import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { StateBadge } from "./StateBadge";
import { refusalReason, type Likeness } from "@/lib/types";

/**
 * Why a likeness cannot be licensed — stated in place of the action.
 *
 * This is the 409 surface. The brief is explicit: a non-licensable record shows
 * a sentence explaining the refusal, never a greyed-out button. A disabled
 * control tells you *that* you cannot proceed and nothing about why or when, so
 * a buyer is left to guess.
 *
 * So there is no disabled button here at all. `refusalReason()` supplies the
 * wording from the single source that decides licensability, which means the
 * sentence and the price can never disagree.
 *
 * Where a next step exists it is a real link: a disputed record points at the
 * open challenge, a provisional one at the settlement deadline. A refusal that
 * names no way forward is an error with no recovery path.
 */
export function ReasonPanel({ likeness }: { likeness: Likeness }) {
  const reason = refusalReason(likeness.state);

  // Licensable records get the action panel instead; this panel is only the
  // refusal. Rendering nothing is safer than rendering an empty box.
  if (!reason) return null;

  const deadline = likeness.settlementDeadline
    ? new Date(likeness.settlementDeadline).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      })
    : null;

  return (
    <section
      aria-labelledby="refusal-heading"
      className="rounded-lg border border-line bg-surface2 p-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="refusal-heading" className="title-4 text-ink">
          Not licensable
        </h2>
        <StateBadge state={likeness.state} count={likeness.openChallenges} />
      </div>

      <p className="body-4 mt-3 text-ink2">{reason}</p>

      {/* The specific fact behind the refusal, where there is one. */}
      {likeness.state === "provisional" && deadline && (
        <p className="body-5 mt-3 text-ink3">
          The settlement window closes{" "}
          <time dateTime={likeness.settlementDeadline} className="tnum text-ink2">
            {deadline} UTC
          </time>
          .
        </p>
      )}

      {likeness.state === "disputed" && likeness.openChallenges > 0 && (
        <p className="body-5 mt-3 text-ink3">
          {likeness.openChallenges === 1
            ? "One challenge is open."
            : `${likeness.openChallenges} challenges are open.`}{" "}
          Each is decided against the frozen reference, not by majority.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
        {likeness.state === "disputed" && (
          <Link
            href={`/challenge?likeness=${likeness.id}`}
            className="body-5 press inline-flex min-h-11 items-center gap-1.5 text-accent hover:underline"
          >
            Review the open challenge
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        )}

        {likeness.state === "provisional" && (
          <Link
            href={`/challenge?likeness=${likeness.id}`}
            className="body-5 press inline-flex min-h-11 items-center gap-1.5 text-accent hover:underline"
          >
            Challenge the registration
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        )}

        {likeness.state === "revoked" && (
          <Link
            href="/register"
            className="body-5 press inline-flex min-h-11 items-center gap-1.5 text-accent hover:underline"
          >
            Register a different likeness
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        )}

        <Link
          href="/explore"
          className="body-5 press inline-flex min-h-11 items-center gap-1.5 text-ink2 hover:text-ink"
        >
          Back to the registry
        </Link>
      </div>
    </section>
  );
}
