import type { MatchBand } from "./types";

/**
 * Cosine similarity between two embeddings.
 *
 * Pure, no I/O, no model. The identity verdict is produced here and nowhere
 * else, so it stays testable and auditable.
 */
export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`embedding length mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Thresholds. UNMEASURED PLACEHOLDERS.
 *
 * docs/action-plan.md §W3.1 gates on a spike that produces real cosine scores
 * for same-person and different-person image pairs. Until that runs, these are
 * numbers someone typed. Do not present them as calibrated.
 */
export const MATCH_THRESHOLD = 0.65;
export const NO_MATCH_THRESHOLD = 0.45;

export function bandOf(cos: number): MatchBand {
  if (cos >= MATCH_THRESHOLD) return "match";
  if (cos < NO_MATCH_THRESHOLD) return "no-match";
  return "review";
}
