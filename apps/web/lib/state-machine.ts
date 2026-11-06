/**
 * The state machine, as pure functions.
 *
 * Source: docs/dispute-spec.md §2 (states), §3 (tiers), §4 (payout) and §6
 * (invariants). This file holds no I/O so it can be unit-tested directly and
 * re-read by a judge: every rule that decides what a record may do lives here.
 *
 * The one rule that shapes everything: **the face decides, not the count.** A
 * 2-of-1 reading is a split, not a majority. `band` is derived from cosine
 * alone, and the payout follows the band, never a vote tally.
 */

import type { LikenessState } from "./types.ts";
import { isLicensable } from "./types.ts";

export const MATCH_THRESHOLD = 0.65;
export const NO_MATCH_THRESHOLD = 0.45;

export type Band = "match" | "review" | "no-match";

/** Band from cosine. Thresholds are the published, unmeasured placeholders. */
export function bandOf(cos: number): Band {
  if (cos >= MATCH_THRESHOLD) return "match";
  if (cos < NO_MATCH_THRESHOLD) return "no-match";
  return "review";
}

/** Tier a challenge lands in, given its cosine. T1 auto, T2/T3 review. */
export function tierOf(cos: number): 1 | 3 {
  return bandOf(cos) === "review" ? 3 : 1;
}

export type Refusal = {
  code: 409 | 403 | 400;
  reason: string;
};

/**
 * Whether a record may be licensed. Returns `null` when it may, or a refusal
 * naming why. This is the single gate every licence path must pass, so the
 * grid, the detail page and the API cannot disagree about it.
 */
export function canLicense(state: LikenessState): Refusal | null {
  if (isLicensable(state)) return null;
  switch (state) {
    case "provisional":
      return {
        code: 409,
        reason:
          "This likeness is not licensable until its settlement window closes. A dispute opened against it would extend the window.",
      };
    case "disputed":
      return {
        code: 409,
        reason:
          "A challenge is open against this likeness. Licensing resumes when every challenge has been resolved.",
      };
    case "review":
      return {
        code: 409,
        reason:
          "This likeness is under review. Two of three resolvers must agree before it can be licensed.",
      };
    case "revoked":
      return {
        code: 409,
        reason:
          "The registrant revoked this likeness. It can never be licensed again.",
      };
    default:
      return { code: 409, reason: "This likeness cannot be licensed." };
  }
}

/**
 * The stored state a likeness should have, given its base state and the number
 * of open challenges.
 *
 * `disputed` is derived, never written directly: a record is disputed exactly
 * when it has at least one open challenge. Storing the base state and deriving
 * this keeps the two from drifting apart.
 */
export function deriveState(base: LikenessState, openChallenges: number): LikenessState {
  // A revoked record stays revoked and a provisional one stays provisional:
  // a challenge during the window is recorded but does not change the state a
  // buyer sees, it only extends the wait.
  if (base === "revoked") return "revoked";
  if (base === "provisional") return "provisional";
  if (openChallenges > 0) return "disputed";
  return base;
}

/* ── Payout (§4) ────────────────────────────────────────────────────────────
 *
 * The person the face identifies takes every stake.
 *   B_r = registrant bond, B_c = per-challenger bond (equal), n = challengers.
 *
 * | Outcome                      | to                              |
 * |------------------------------|---------------------------------|
 * | registrant defends           | registrant: B_r + n·B_c         |
 * | challenger k wins            | winner: B_c + B_r + (n-1)·B_c   |
 * | losing challengers           | 0                               |
 */

export type PayoutLeg = { to: string; amount: number };

export type Settlement =
  | { outcome: "registrant-defends"; legs: PayoutLeg[]; total: number }
  | { outcome: "challenger-wins"; legs: PayoutLeg[]; total: number; winner: string };

/**
 * Settle one likeness's bonds given the winner of the identity question.
 *
 * `winnerAddress === registrant` means the registrant defended; any other
 * address is a challenger who won. Every losing challenger forfeits their bond
 * to the winner — that is why a spurious challenge always costs the challenger.
 */
export function settleBonds(input: {
  registrant: string;
  registrantBond: number;
  challengers: { address: string; bond: number }[];
  winner: string;
}): Settlement {
  const { registrant, registrantBond, challengers, winner } = input;
  const n = challengers.length;
  const totalChallengerBonds = challengers.reduce((s, c) => s + c.bond, 0);

  if (winner.toLowerCase() === registrant.toLowerCase()) {
    return {
      outcome: "registrant-defends",
      total: registrantBond + totalChallengerBonds,
      legs: [{ to: registrant, amount: registrantBond + totalChallengerBonds }],
    };
  }

  const winning = challengers.find(
    (c) => c.address.toLowerCase() === winner.toLowerCase(),
  );
  if (!winning) {
    throw new Error("winner is neither the registrant nor a challenger");
  }
  // The winner takes their own bond back plus the registrant's bond plus every
  // other challenger's bond.
  const amount = winning.bond + registrantBond + (totalChallengerBonds - winning.bond);
  return {
    outcome: "challenger-wins",
    winner: winning.address,
    total: amount,
    legs: [{ to: winning.address, amount }],
  };
}

/* ── 2-of-3 quorum (§4a) ─────────────────────────────────────────────────── */

export type Vote = { resolver: string; verdict: "registrant" | "challenger" | "evidence" };

export type QuorumResult =
  | { resolved: false }
  | { resolved: true; verdict: "registrant" | "challenger"; votes: number };

/**
 * Whether a set of resolver votes reaches the 2-of-3 quorum.
 *
 * Order does not matter and a tally is deliberately not returned: the caller
 * must not be able to show "2 of 3 agree" while a third is still reading, which
 * would invite it to fall in line. This answers only "is it decided, and how".
 */
export function quorum(votes: Vote[]): QuorumResult {
  const byVerdict = new Map<string, number>();
  for (const v of votes) {
    if (v.verdict === "evidence") continue; // an evidence vote is not a decision
    byVerdict.set(v.verdict, (byVerdict.get(v.verdict) ?? 0) + 1);
  }
  for (const [verdict, count] of byVerdict) {
    if (count >= 2) {
      return { resolved: true, verdict: verdict as "registrant" | "challenger", votes: count };
    }
  }
  return { resolved: false };
}

export const RESOLVER_SET_SIZE = 3;
export const QUORUM_SIZE = 2;
