import { randomBytes } from "node:crypto";
import { getDb, type DB } from "./db.ts";
import { deriveState, canLicense, bandOf, tierOf, settleBonds, quorum } from "./state-machine.ts";
import type { Likeness, LikenessState, Challenge } from "./types.ts";

/**
 * Reads and writes for the app, with the state machine applied on the way out.
 *
 * Routes stay thin: they call one of these, and a `Result` tells them the status
 * to send. All the rules live in `state-machine.ts`; this file only moves rows
 * and never re-implements a decision.
 */

export type Result<T> =
  | { ok: true; status: 200 | 201; data: T }
  | { ok: false; status: 400 | 403 | 404 | 409; error: string };

type Row = {
  id: string;
  name: string;
  price_per_use: number;
  state: LikenessState;
  ens_name: string | null;
  controller: string;
  holder: string;
  settlement_deadline: string | null;
  reference_hash: string | null;
  nullifier: string | null;
};

function openCount(db: DB, likenessId: string): number {
  const { n } = db
    .prepare("SELECT COUNT(*) AS n FROM challenges WHERE likeness_id = ? AND status = 'open'")
    .get(likenessId) as { n: number };
  return n;
}

function toLikeness(db: DB, r: Row): Likeness {
  const open = openCount(db, r.id);
  return {
    id: r.id,
    name: r.name,
    pricePerUse: r.price_per_use,
    // The stored state is the base; the visible state is derived so it can
    // never contradict the challenges the UI is about to count.
    state: deriveState(r.state, open),
    ensName: r.ens_name ?? undefined,
    controller: r.controller,
    holder: r.holder,
    openChallenges: open,
    settlementDeadline: r.settlement_deadline ?? undefined,
    referenceHash: r.reference_hash ?? undefined,
  };
}

/* ── reads ───────────────────────────────────────────────────────────────── */

export function listLikenesses(): Likeness[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM likenesses ORDER BY id").all() as Row[];
  return rows.map((r) => toLikeness(db, r));
}

export function getLikeness(id: string): Likeness | null {
  const db = getDb();
  const r = db.prepare("SELECT * FROM likenesses WHERE id = ?").get(id) as Row | undefined;
  return r ? toLikeness(db, r) : null;
}

export function listChallenges(likenessId: string): Challenge[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM challenges WHERE likeness_id = ? ORDER BY created_at")
    .all(likenessId) as {
    id: string;
    likeness_id: string;
    challenger: string;
    stake: number;
    cos: number | null;
    status: Challenge["status"];
  }[];
  return rows.map((r) => ({
    id: r.id,
    likenessId: r.likeness_id,
    challenger: r.challenger,
    stake: r.stake,
    cos: r.cos ?? undefined,
    band: r.cos != null ? bandOf(r.cos) : undefined,
    status: r.status,
  }));
}

/* ── writes ──────────────────────────────────────────────────────────────── */

export function registerLikeness(input: {
  name: string;
  ensName?: string;
  controller: string;
  pricePerUse: number;
  /** Hex SHA-256 of the captured reference frame. Optional until a capture is supplied. */
  referenceHash?: string;
  /** World ID nullifier. Enforces one likeness per human when present. */
  nullifier?: string;
}): Result<Likeness> {
  const name = input.name.trim();
  if (name.length < 3) {
    return { ok: false, status: 400, error: "A likeness name needs at least three characters." };
  }
  if (!/^0x[0-9a-fA-F]{6,}$/.test(input.controller)) {
    return { ok: false, status: 400, error: "A wallet address is required to own a likeness." };
  }

  const db = getDb();

  // One likeness per human (plan §3). Checked explicitly so the caller gets a
  // readable 409 rather than a raw unique-constraint violation.
  // Fail closed, like the challenge path: without a nullifier there is no proof a
  // unique human is registering, so the registry would accept an unlimited number
  // of unbacked claims and 'one likeness per human' would mean nothing.
  if (!input.nullifier) {
    return {
      ok: false,
      status: 400,
      error:
        "A World ID proof is required to register. One likeness per human cannot be enforced without it.",
    };
  }
  const existing = db
    .prepare("SELECT id FROM likenesses WHERE nullifier = ?")
    .get(input.nullifier) as { id: string } | undefined;
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: "This World ID has already registered a likeness. One likeness per human.",
    };
  }

  // Time alone is not enough: a fast double-submit, or two registrations in the
  // same millisecond, produced the same id and hit the primary key. A short
  // random suffix keeps ids readable and collision-free.
  const id = `lc-${String(Date.now()).slice(-6)}${randomBytes(2).toString("hex")}`;
  db.prepare(
    `INSERT INTO likenesses
       (id, name, price_per_use, state, ens_name, controller, holder, settlement_deadline,
        reference_hash, nullifier)
     VALUES (?, ?, ?, 'provisional', ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    name,
    Math.max(0, Math.trunc(input.pricePerUse)),
    input.ensName?.trim() || null,
    // Display controller is truncated the same way the seed does it.
    input.controller.slice(0, 12),
    input.controller,
    new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    input.referenceHash ?? null,
    input.nullifier ?? null,
  );

  return { ok: true, status: 201, data: getLikeness(id)! };
}

export function licenseLikeness(input: {
  likenessId: string;
  buyer: string;
}): Result<{ licenseId: string; likeness: Likeness }> {
  const likeness = getLikeness(input.likenessId);
  if (!likeness) return { ok: false, status: 404, error: "No such likeness." };

  const refusal = canLicense(likeness.state);
  if (refusal) return { ok: false, status: refusal.code, error: refusal.reason };

  const db = getDb();
  const licenseId = `LV-${likeness.id.slice(-3).toUpperCase()}-${String(Date.now()).slice(-4)}`;
  db.prepare(
    "INSERT INTO licenses (id, likeness_id, buyer, price) VALUES (?, ?, ?, ?)",
  ).run(licenseId, likeness.id, input.buyer, likeness.pricePerUse);
  db.prepare(
    "INSERT INTO bond_ledger (id, likeness_id, kind, from_account, to_account, amount) VALUES (?, ?, 'licence', ?, ?, ?)",
  ).run(`bl-${Date.now()}`, likeness.id, input.buyer, likeness.holder, likeness.pricePerUse);

  return { ok: true, status: 201, data: { licenseId, likeness } };
}

export function openChallenge(input: {
  likenessId: string;
  challenger: string;
  grounds: string;
  cos: number;
  /** Hex SHA-256 of the challenger's live capture. */
  referenceHash?: string;
  /** Whether the challenge image came from the camera or a file upload. */
  captureSource?: "camera" | "file";
  /** Challenger's World ID nullifier; must differ from the registrant's. */
  nullifier?: string;
}): Result<{ challengeId: string; tier: 1 | 3; likeness: Likeness }> {
  const likeness = getLikeness(input.likenessId);
  if (!likeness) return { ok: false, status: 404, error: "No such likeness." };
  if (likeness.state === "revoked") {
    return { ok: false, status: 409, error: "A revoked likeness cannot be challenged." };
  }
  if (input.grounds.trim().length < 20) {
    return {
      ok: false,
      status: 400,
      error: "Describe what makes the claim specific — at least a sentence.",
    };
  }
  // One open challenge per challenger per likeness (spec §6 unique index).
  const db = getDb();
  const dup = db
    .prepare(
      "SELECT 1 FROM challenges WHERE likeness_id = ? AND challenger = ? AND status = 'open'",
    )
    .get(likeness.id, input.challenger);
  if (dup) {
    return { ok: false, status: 409, error: "You already have an open challenge on this likeness." };
  }

  // A challenger must be a different unique human from the registrant. Without
  // this, a registrant could challenge their own record with a second account
  // and route the bond to themselves. The registrant's nullifier is server-side
  // only, so this comparison never exposes either value.
  //
  // Fail closed. The previous `if (input.nullifier)` guard was skipped entirely
  // when the field was omitted, so a request without one created a challenge and
  // the same human could contest their own record — the exact thing the registry
  // claims is impossible. A missing nullifier is now a rejection, not a bypass.
  if (!input.nullifier) {
    return {
      ok: false,
      status: 400,
      error:
        "A World ID proof is required to challenge. A challenge must come from a different unique human than the registrant.",
    };
  }

  const registrant = db
    .prepare("SELECT nullifier FROM likenesses WHERE id = ?")
    .get(likeness.id) as { nullifier: string | null } | undefined;
  if (registrant?.nullifier && registrant.nullifier === input.nullifier) {
    return {
      ok: false,
      status: 409,
      error: "This World ID belongs to the registrant. A challenge needs a different unique human.",
    };
  }

  const tier = tierOf(input.cos);
  const challengeId = `ch-${String(Date.now()).slice(-8)}${randomBytes(2).toString("hex")}`;
  // Stake is equal to the registrant bond (price * 2), per the equal-stake rule.
  const stake = likeness.pricePerUse * 2;
  db.prepare(
    "INSERT INTO challenges (id, likeness_id, challenger, stake, cos, tier, status, reference_hash, nullifier, capture_source) VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)",
  ).run(
    challengeId,
    likeness.id,
    input.challenger,
    stake,
    input.cos,
    tier,
    input.referenceHash ?? null,
    input.nullifier ?? null,
    input.captureSource ?? null,
  );
  db.prepare(
    "INSERT INTO bond_ledger (id, likeness_id, challenge_id, kind, from_account, amount) VALUES (?, ?, ?, 'challenge', ?, ?)",
  ).run(`bl-${Date.now()}`, likeness.id, challengeId, input.challenger, stake);

  return {
    ok: true,
    status: 201,
    data: { challengeId, tier, likeness: getLikeness(likeness.id)! },
  };
}

/**
 * Resolve one open challenge at tier 1 (deterministic): the band decides, then
 * bonds settle. A `no-match` means the registrant defended; a `match` means the
 * challenger won and the likeness moves to them.
 */
export function resolveTier1(input: {
  challengeId: string;
}): Result<{
  outcome: "won" | "lost";
  settled: ReturnType<typeof settleBonds>;
  /** Carried out so a caller can settle the same decision elsewhere. */
  likenessId: string;
  cos: number;
  faceWins: boolean;
}> {
  const db = getDb();
  const ch = db.prepare("SELECT * FROM challenges WHERE id = ?").get(input.challengeId) as
    | { id: string; likeness_id: string; challenger: string; stake: number; cos: number | null; status: string }
    | undefined;
  if (!ch) return { ok: false, status: 404, error: "No such challenge." };
  if (ch.status !== "open") {
    return { ok: false, status: 409, error: "This challenge is already resolved." };
  }
  if (ch.cos == null) {
    return { ok: false, status: 409, error: "This challenge needs a reading before it can settle." };
  }

  const band = bandOf(ch.cos);
  if (band === "review") {
    // Gray band belongs to the resolvers, not to the automatic path.
    db.prepare("UPDATE challenges SET status = 'review', tier = 3 WHERE id = ?").run(ch.id);
    return { ok: false, status: 409, error: "The reading is in the review band. Two of three resolvers must agree." };
  }

  const row = db.prepare("SELECT * FROM likenesses WHERE id = ?").get(ch.likeness_id) as Row;
  const likeness = toLikeness(db, row);
  const challengerWins = band === "match";

  const settlement = settleBonds({
    registrant: likeness.holder,
    registrantBond: likeness.pricePerUse * 2,
    challengers: [{ address: ch.challenger, bond: ch.stake }],
    winner: challengerWins ? ch.challenger : likeness.holder,
  });

  const tx = db.transaction(() => {
    db.prepare("UPDATE challenges SET status = ?, resolved_by = 'auto', resolved_at = datetime('now') WHERE id = ?")
      .run(challengerWins ? "won" : "lost", ch.id);
    for (const leg of settlement.legs) {
      db.prepare(
        "INSERT INTO bond_ledger (id, likeness_id, challenge_id, kind, from_account, to_account, amount) VALUES (?, ?, ?, 'settle', ?, ?, ?)",
      ).run(`bl-s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, likeness.id, ch.id, null, leg.to, leg.amount);
    }
    if (challengerWins) {
      // The face decided: the record moves to the challenger.
      db.prepare("UPDATE likenesses SET holder = ?, controller = ?, state = 'moved' WHERE id = ?")
        .run(ch.challenger, ch.challenger.slice(0, 12), likeness.id);
    }
  });
  tx();

  return {
    ok: true,
    status: 200,
    data: {
      outcome: challengerWins ? "won" : "lost",
      settled: settlement,
      // Carried out so the route can settle the same decision on-chain without
      // re-reading and re-deriving it. `cos` is what makes the settlement
      // auditable, so it travels with the outcome rather than being discarded.
      likenessId: likeness.id,
      cos: ch.cos,
      faceWins: challengerWins,
    },
  };
}

/**
 * Record one resolver's verdict on a review-band challenge. When two agree the
 * challenge resolves and bonds settle — the count never decides, the verdict does.
 */
export function voteOnReview(input: {
  challengeId: string;
  resolver: string;
  verdict: "registrant" | "challenger" | "evidence";
}): Result<{ recorded: true; resolved: boolean; verdict?: "registrant" | "challenger" }> {
  const db = getDb();
  const ch = db.prepare("SELECT * FROM challenges WHERE id = ?").get(input.challengeId) as
    | { id: string; likeness_id: string; challenger: string; stake: number; status: string }
    | undefined;
  if (!ch) return { ok: false, status: 404, error: "No such challenge." };
  if (ch.status !== "review" && ch.status !== "open") {
    return { ok: false, status: 409, error: "This challenge is not awaiting a review." };
  }

  const resolvers = db.prepare("SELECT address FROM resolvers WHERE active = 1").all() as { address: string }[];
  if (!resolvers.some((r) => r.address.toLowerCase() === input.resolver.toLowerCase())) {
    return { ok: false, status: 403, error: "Only an active resolver can record a verdict." };
  }

  // A vote is final once cast (spec §4a).
  const prior = db
    .prepare("SELECT 1 FROM review_votes WHERE challenge_id = ? AND resolver_address = ?")
    .get(ch.id, input.resolver);
  if (prior) return { ok: false, status: 409, error: "You have already voted on this challenge." };

  db.prepare("INSERT INTO review_votes (challenge_id, resolver_address, verdict) VALUES (?, ?, ?)")
    .run(ch.id, input.resolver, input.verdict);
  db.prepare("UPDATE challenges SET status = 'review', tier = 3 WHERE id = ?").run(ch.id);

  const votes = db
    .prepare("SELECT resolver_address, verdict FROM review_votes WHERE challenge_id = ?")
    .all(ch.id) as { resolver_address: string; verdict: "registrant" | "challenger" | "evidence" }[];
  const outcome = quorum(votes.map((v) => ({ resolver: v.resolver_address, verdict: v.verdict })));

  if (!outcome.resolved) {
    return { ok: true, status: 200, data: { recorded: true, resolved: false } };
  }

  const row = db.prepare("SELECT * FROM likenesses WHERE id = ?").get(ch.likeness_id) as Row;
  const likeness = toLikeness(db, row);
  const challengerWins = outcome.verdict === "challenger";
  const settlement = settleBonds({
    registrant: likeness.holder,
    registrantBond: likeness.pricePerUse * 2,
    challengers: [{ address: ch.challenger, bond: ch.stake }],
    winner: challengerWins ? ch.challenger : likeness.holder,
  });
  db.transaction(() => {
    db.prepare("UPDATE challenges SET status = ?, resolved_by = 'multisig', resolved_at = datetime('now') WHERE id = ?")
      .run(challengerWins ? "won" : "lost", ch.id);
    for (const leg of settlement.legs) {
      db.prepare(
        "INSERT INTO bond_ledger (id, likeness_id, challenge_id, kind, from_account, to_account, amount) VALUES (?, ?, ?, 'settle', ?, ?, ?)",
      ).run(`bl-r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, likeness.id, ch.id, null, leg.to, leg.amount);
    }
    if (challengerWins) {
      db.prepare("UPDATE likenesses SET holder = ?, controller = ?, state = 'moved' WHERE id = ?")
        .run(ch.challenger, ch.challenger.slice(0, 12), likeness.id);
    }
  })();

  return { ok: true, status: 200, data: { recorded: true, resolved: true, verdict: outcome.verdict } };
}

/* ── resolvers ───────────────────────────────────────────────────────────── */

export function listResolvers(): { address: string; active: boolean }[] {
  const db = getDb();
  return (db.prepare("SELECT address, active FROM resolvers ORDER BY address").all() as {
    address: string;
    active: number;
  }[]).map((r) => ({ address: r.address, active: r.active === 1 }));
}

/** Seed the three demo resolver seats if the table is empty. */
export function ensureResolvers(): void {
  const db = getDb();
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM resolvers").get() as { n: number };
  if (n > 0) return;
  const seats = ["0xa11ce00000000000000000000000000000000001", "0xb0b000000000000000000000000000000000002", "0xca40100000000000000000000000000000000003"];
  const ins = db.prepare("INSERT INTO resolvers (address) VALUES (?)");
  db.transaction(() => seats.forEach((s) => ins.run(s)))();
}
