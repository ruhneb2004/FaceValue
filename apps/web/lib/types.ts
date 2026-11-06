/**
 * Shared types for FaceValue.
 * Source: docs/dispute-spec.md §2 (state machine) and §6 (data model).
 */

/** The five registry states. `disputed` is derived from `openChallenges > 0`. */
export type LikenessState =
  | "provisional"
  | "active"
  | "disputed"
  | "review"
  | "moved"
  | "revoked";

/** Only these two may be licensed. Everything else must return 409. */
export const LICENSABLE_STATES: readonly LikenessState[] = [
  "active",
  "moved",
] as const;

export function isLicensable(state: LikenessState): boolean {
  return LICENSABLE_STATES.includes(state);
}

/** Why a likeness cannot be licensed, in words. Never a bare disabled button. */
export function refusalReason(state: LikenessState): string | null {
  switch (state) {
    case "active":
    case "moved":
      return null;
    case "provisional":
      return "This likeness is not licensable until it is settled. A dispute opened against it would extend that window.";
    case "disputed":
      return "A challenge is open against this likeness. Licensing resumes when every challenge has been resolved.";
    case "review":
      return "This likeness is under review. Two of three resolvers must agree before it can be licensed.";
    case "revoked":
      return "The registrant revoked this likeness. It can never be licensed again.";
  }
}

export interface Likeness {
  id: string;
  name: string;
  /** Per-use price in HBAR. */
  pricePerUse: number;
  state: LikenessState;
  /** ENS name, if one was written. */
  ensName?: string;
  /** Truncated controller address, shown in the UI. */
  controller: string;
  /**
   * Full controller address, used to derive the identicon.
   *
   * An identicon needs the whole 32-byte address: `blo` hashes its bytes, so a
   * truncated string produces art from far less entropy and two records can
   * collide. Keeping this alongside the display value lets the UI stay short
   * without starving the avatar of data.
   */
  holder: string;
  /** Number of challenges currently open. Drives the derived `disputed` state. */
  openChallenges: number;
  /** ISO date the provisional window closes. */
  settlementDeadline?: string;
  /**
   * Hex SHA-256 of the captured reference frame.
   *
   * Public on purpose: it is the coupling proof — it shows which reference a
   * record was registered from without revealing the image. A hash of a frame
   * is one-way, so publishing it is safe in a way the image and the nullifier
   * are not. The nullifier is never part of this type.
   */
  referenceHash?: string;
}

export type MatchBand = "no-match" | "review" | "match";

export interface Challenge {
  id: string;
  likenessId: string;
  challenger: string;
  stake: number;
  /** Cosine confidence against the frozen reference embedding. */
  cos?: number;
  band?: MatchBand;
  status: "open" | "won" | "lost" | "review";
}
