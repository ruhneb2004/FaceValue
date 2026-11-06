import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bandOf,
  tierOf,
  canLicense,
  deriveState,
  settleBonds,
  quorum,
  MATCH_THRESHOLD,
  NO_MATCH_THRESHOLD,
} from "./state-machine.ts";

/* ── band ──────────────────────────────────────────────────────────────── */

test("band: at or above 0.65 is a match", () => {
  assert.equal(bandOf(MATCH_THRESHOLD), "match");
  assert.equal(bandOf(0.9), "match");
});

test("band: below 0.45 is no-match", () => {
  assert.equal(bandOf(NO_MATCH_THRESHOLD - 0.001), "no-match");
  assert.equal(bandOf(0.1), "no-match");
});

test("band: between the thresholds is review", () => {
  assert.equal(bandOf(NO_MATCH_THRESHOLD), "review");
  assert.equal(bandOf(0.55), "review");
  assert.equal(bandOf(MATCH_THRESHOLD - 0.001), "review");
});

test("tier: a band is auto (1) or review (3), never 2 as a decision", () => {
  assert.equal(tierOf(0.9), 1);
  assert.equal(tierOf(0.1), 1);
  assert.equal(tierOf(0.55), 3);
});

/* ── licensing gate ────────────────────────────────────────────────────── */

test("canLicense: only active and moved may be licensed", () => {
  assert.equal(canLicense("active"), null);
  assert.equal(canLicense("moved"), null);
});

test("canLicense: every other state returns a 409 with a readable reason", () => {
  for (const s of ["provisional", "disputed", "review", "revoked"] as const) {
    const r = canLicense(s);
    assert.ok(r, `${s} must refuse`);
    assert.equal(r.code, 409);
    assert.ok(r.reason.length > 20, `${s} reason must be a sentence`);
  }
});

/* ── derived state ─────────────────────────────────────────────────────── */

test("derive: disputed is exactly 'base active with open challenges'", () => {
  assert.equal(deriveState("active", 0), "active");
  assert.equal(deriveState("active", 1), "disputed");
  assert.equal(deriveState("active", 3), "disputed");
});

test("derive: moved re-enters disputed when challenged (door never closes)", () => {
  assert.equal(deriveState("moved", 0), "moved");
  assert.equal(deriveState("moved", 1), "disputed");
});

test("derive: revoked stays revoked, provisional stays provisional", () => {
  assert.equal(deriveState("revoked", 0), "revoked");
  assert.equal(deriveState("revoked", 2), "revoked");
  assert.equal(deriveState("provisional", 0), "provisional");
  assert.equal(deriveState("provisional", 1), "provisional");
});

/* ── payout: the face takes every stake ────────────────────────────────── */

test("payout: registrant defends and takes registrant + all challenger bonds", () => {
  const s = settleBonds({
    registrant: "0xREG",
    registrantBond: 100,
    challengers: [
      { address: "0xA", bond: 100 },
      { address: "0xB", bond: 100 },
    ],
    winner: "0xREG",
  });
  assert.equal(s.outcome, "registrant-defends");
  assert.equal(s.total, 300);
  assert.deepEqual(s.legs, [{ to: "0xREG", amount: 300 }]);
});

test("payout: one challenger wins - takes their bond + registrant + others", () => {
  const s = settleBonds({
    registrant: "0xREG",
    registrantBond: 100,
    challengers: [
      { address: "0xA", bond: 100 },
      { address: "0xB", bond: 100 },
    ],
    winner: "0xB",
  });
  assert.equal(s.outcome, "challenger-wins");
  assert.equal(s.total, 300);
  assert.deepEqual(s.legs, [{ to: "0xB", amount: 300 }]);
});

test("payout: a single-challenger win is registrant bond + that bond", () => {
  const s = settleBonds({
    registrant: "0xREG",
    registrantBond: 60,
    challengers: [{ address: "0xA", bond: 60 }],
    winner: "0xA",
  });
  assert.equal(s.total, 120);
});

test("payout: winner must be the registrant or a challenger", () => {
  assert.throws(() =>
    settleBonds({
      registrant: "0xREG",
      registrantBond: 100,
      challengers: [{ address: "0xA", bond: 100 }],
      winner: "0xNOPE",
    }),
  );
});

test("payout: losing challengers receive nothing (legs only pay the winner)", () => {
  const s = settleBonds({
    registrant: "0xREG",
    registrantBond: 100,
    challengers: [
      { address: "0xA", bond: 100 },
      { address: "0xB", bond: 100 },
    ],
    winner: "0xREG",
  });
  const paid = new Set(s.legs.map((l) => l.to));
  assert.ok(!paid.has("0xA"));
  assert.ok(!paid.has("0xB"));
});

/* ── 2-of-3 quorum: the face decides, not the count ────────────────────── */

test("quorum: two matching votes resolve", () => {
  const q = quorum([
    { resolver: "r1", verdict: "registrant" },
    { resolver: "r2", verdict: "registrant" },
  ]);
  assert.deepEqual(q, { resolved: true, verdict: "registrant", votes: 2 });
});

test("quorum: one of each does not resolve - a 1-1 is a split, not a majority", () => {
  const q = quorum([
    { resolver: "r1", verdict: "registrant" },
    { resolver: "r2", verdict: "challenger" },
  ]);
  assert.equal(q.resolved, false);
});

test("quorum: an evidence vote is not a decision", () => {
  const q = quorum([
    { resolver: "r1", verdict: "registrant" },
    { resolver: "r2", verdict: "evidence" },
  ]);
  assert.equal(q.resolved, false);
});

test("quorum: 2-of-3 with a split third still resolves", () => {
  const q = quorum([
    { resolver: "r1", verdict: "challenger" },
    { resolver: "r2", verdict: "challenger" },
    { resolver: "r3", verdict: "registrant" },
  ]);
  assert.deepEqual(q, { resolved: true, verdict: "challenger", votes: 2 });
});
