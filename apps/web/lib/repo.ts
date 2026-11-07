import { randomBytes } from "node:crypto";
import { q, q1, tx } from "./db.ts";
import { deriveState, canLicense, bandOf, tierOf, settleBonds, quorum } from "./state-machine.ts";
import type { Likeness, LikenessState, Challenge } from "./types.ts";

/**
 * Reads and writes for the app, with the state machine applied on the way out.
 *
 * Routes stay thin: they call one of these, and a `Result` tells them the status
 * to send. All the rules live in `state-machine.ts`; this file only moves rows
 * and never re-implements a decision.
 *
 * Postgres, not sqlite: every function here is async because `pg` is. The call
 * sites (routes) were already `async route handlers`, so the change is at this
 * layer and the two layers that read from it, not across the whole app.
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

async function openCount(likenessId: string): Promise<number> {
  const row = await q1<{ n: string }>(
    "SELECT COUNT(*)::text AS n FROM challenges WHERE likeness_id = $1 AND status = 'open'",
    [likenessId],
  );
  return row ? Number(row.n) : 0;
}

async function toLikeness(r: Row): Promise<Likeness> {
  const open = await openCount(r.id);
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

export async function listLikenesses(): Promise<Likeness[]> {
  const rows = await q<Row>("SELECT * FROM likenesses ORDER BY id");
  return Promise.all(rows.map((r) => toLikeness(r)));
}

export async function getLikeness(id: string): Promise<Likeness | null> {
  const r = await q1<Row>("SELECT * FROM likenesses WHERE id = $1", [id]);
  return r ? toLikeness(r) : null;
}

export async function listChallenges(likenessId: string): Promise<Challenge[]> {
  const rows = await q<{
    id: string;
    likeness_id: string;
    challenger: string;
    stake: number;
    cos: number | null;
    status: Challenge["status"];
  }>(
    "SELECT id, likeness_id, challenger, stake, cos, status FROM challenges WHERE likeness_id = $1 ORDER BY created_at",
    [likenessId],
  );
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

export async function registerLikeness(input: {
  name: string;
  ensName?: string;
  controller: string;
  pricePerUse: number;
  /** Hex SHA-256 of the captured reference frame. */
  referenceHash?: string;
  /** World ID nullifier. Enforces one likeness per human. */
  nullifier?: string;
}): Promise<Result<Likeness>> {
  const name = input.name.trim();
  if (name.length < 3) {
    return { ok: false, status: 400, error: "A likeness name needs at least three characters." };
  }
  if (!/^0x[0-9a-fA-F]{6,}$/.test(input.controller)) {
    return { ok: false, status: 400, error: "A wallet address is required to own a likeness." };
  }

  // Fail closed: without a nullifier there is no proof a unique human is
  // registering, and 'one likeness per human' would be meaningless.
  if (!input.nullifier) {
    return {
      ok: false,
      status: 400,
      error:
        "A World ID proof is required to register. One likeness per human cannot be enforced without it.",
    };
  }
  const existing = await q1<{ id: string }>(
    "SELECT id FROM likenesses WHERE nullifier = $1",
    [input.nullifier],
  );
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: "This World ID has already registered a likeness. One likeness per human.",
    };
  }

  // Time alone is not enough: a fast double-submit produced the same id. A short
  // random suffix keeps ids readable and collision-free.
  const id = `lc-${String(Date.now()).slice(-6)}${randomBytes(2).toString("hex")}`;
  await q(
    `INSERT INTO likenesses
       (id, name, price_per_use, state, ens_name, controller, holder, settlement_deadline,
        reference_hash, nullifier)
     VALUES ($1,$2,$3,'provisional',$4,$5,$6,$7,$8,$9)`,
    [
      id,
      name,
      Math.max(0, Math.trunc(input.pricePerUse)),
      input.ensName?.trim() || null,
      input.controller.slice(0, 12),
      input.controller,
      new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      input.referenceHash ?? null,
      input.nullifier ?? null,
    ],
  );

  return { ok: true, status: 201, data: (await getLikeness(id))! };
}

export async function licenseLikeness(input: {
  likenessId: string;
  buyer: string;
}): Promise<Result<{ licenseId: string; likeness: Likeness }>> {
  const likeness = await getLikeness(input.likenessId);
  if (!likeness) return { ok: false, status: 404, error: "No such likeness." };

  const refusal = canLicense(likeness.state);
  if (refusal) return { ok: false, status: refusal.code, error: refusal.reason };

  const licenseId = `LV-${likeness.id.slice(-3).toUpperCase()}-${String(Date.now()).slice(-4)}`;

  // A licence and its ledger entry must move together: a licence whose money
  // cannot be accounted for is a licence that was never paid for.
  const out = await tx(async () => {
    await q(
      "INSERT INTO licenses (id, likeness_id, buyer, price) VALUES ($1,$2,$3,$4)",
      [licenseId, likeness.id, input.buyer, likeness.pricePerUse],
    );
    await q(
      "INSERT INTO bond_ledger (id, likeness_id, kind, from_account, to_account, amount) VALUES ($1,$2,'licence',$3,$4,$5)",
      [`bl-${Date.now()}`, likeness.id, input.buyer, likeness.holder, likeness.pricePerUse],
    );
    return { licenseId, likeness };
  });

  return { ok: true, status: 201, data: out };
}

export async function openChallenge(input: {
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
}): Promise<Result<{ challengeId: string; tier: 1 | 3; likeness: Likeness }>> {
  const likeness = await getLikeness(input.likenessId);
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

  const dup = await q1<{ one: string }>(
    "SELECT 1 AS one FROM challenges WHERE likeness_id = $1 AND challenger = $2 AND status = 'open'",
    [input.likenessId, input.challenger],
  );
  if (dup) {
    return { ok: false, status: 409, error: "You already have an open challenge on this likeness." };
  }

  // Fail closed: a challenge without a World ID proof cannot claim to come from a
  // different unique human, so it is refused rather than allowed through.
  if (!input.nullifier) {
    return {
      ok: false,
      status: 400,
      error:
        "A World ID proof is required to challenge. A challenge must come from a different unique human than the registrant.",
    };
  }

  const registrant = await q1<{ nullifier: string | null }>(
    "SELECT nullifier FROM likenesses WHERE id = $1",
    [input.likenessId],
  );
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

  // The challenge, its money and the visible state must move together.
  await tx(async () => {
    await q(
      `INSERT INTO challenges (id, likeness_id, challenger, stake, cos, tier, status, reference_hash, nullifier, capture_source)
       VALUES ($1,$2,$3,$4,$5,$6,'open',$7,$8,$9)`,
      [
        challengeId,
        likeness.id,
        input.challenger,
        stake,
        input.cos,
        tier,
        input.referenceHash ?? null,
        input.nullifier ?? null,
        input.captureSource ?? null,
      ],
    );
    await q(
      "INSERT INTO bond_ledger (id, likeness_id, challenge_id, kind, from_account, amount) VALUES ($1,$2,$3,'challenge',$4,$5)",
      [`bl-${Date.now()}`, likeness.id, challengeId, input.challenger, stake],
    );
  });

  return {
    ok: true,
    status: 201,
    data: { challengeId, tier, likeness: (await getLikeness(likeness.id))! },
  };
}

type ChallengeRow = {
  id: string;
  likeness_id: string;
  challenger: string;
  stake: number;
  cos: number | null;
  status: string;
};

async function getChallenge(id: string): Promise<ChallengeRow | null> {
  return q1<ChallengeRow>("SELECT * FROM challenges WHERE id = $1", [id]);
}

/**
 * Resolve one open challenge at tier 1 (deterministic): the band decides, then
 * bonds settle. A `no-match` means the registrant defended; a `match` means the
 * challenger won and the likeness moves to them.
 */
export async function resolveTier1(input: { challengeId: string }): Promise<
  Result<{
    outcome: "won" | "lost";
    settled: ReturnType<typeof settleBonds>;
    likenessId: string;
    cos: number;
    faceWins: boolean;
  }>
> {
  const ch = await getChallenge(input.challengeId);
  if (!ch) return { ok: false, status: 404, error: "No such challenge." };
  if (ch.status !== "open") {
    return { ok: false, status: 409, error: "This challenge is already resolved." };
  }
  if (ch.cos == null) {
    return { ok: false, status: 409, error: "This challenge needs a reading before it can settle." };
  }

  const band = bandOf(ch.cos);
  if (band === "review") {
    await q("UPDATE challenges SET status = 'review', tier = 3 WHERE id = $1", [ch.id]);
    return {
      ok: false,
      status: 409,
      error: "The reading is in the review band. Two of three resolvers must agree.",
    };
  }

  const row = await q1<Row>("SELECT * FROM likenesses WHERE id = $1", [ch.likeness_id]);
  if (!row) return { ok: false, status: 404, error: "No such likeness." };
  const likeness = await toLikeness(row);
  const challengerWins = band === "match";

  const settlement = settleBonds({
    registrant: likeness.holder,
    registrantBond: likeness.pricePerUse * 2,
    challengers: [{ address: ch.challenger, bond: ch.stake }],
    winner: challengerWins ? ch.challenger : likeness.holder,
  });

  await tx(async () => {
    await q("UPDATE challenges SET status = $1, resolved_by = 'auto', resolved_at = now() WHERE id = $2", [
      challengerWins ? "won" : "lost",
      ch.id,
    ]);
    for (const leg of settlement.legs) {
      await q(
        "INSERT INTO bond_ledger (id, likeness_id, challenge_id, kind, from_account, to_account, amount) VALUES ($1,$2,$3,'settle',$4,$5,$6)",
        [`bl-s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, likeness.id, ch.id, null, leg.to, leg.amount],
      );
    }
    if (challengerWins) {
      // The face decided: the record moves to the challenger.
      await q("UPDATE likenesses SET holder = $1, controller = $2, state = 'moved' WHERE id = $3", [
        ch.challenger,
        ch.challenger.slice(0, 12),
        likeness.id,
      ]);
    }
  });

  return {
    ok: true,
    status: 200,
    data: {
      outcome: challengerWins ? "won" : "lost",
      settled: settlement,
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
export async function voteOnReview(input: {
  challengeId: string;
  resolver: string;
  verdict: "registrant" | "challenger" | "evidence";
}): Promise<Result<{ recorded: true; resolved: boolean; verdict?: "registrant" | "challenger" }>> {
  const ch = await getChallenge(input.challengeId);
  if (!ch) return { ok: false, status: 404, error: "No such challenge." };
  if (ch.status !== "review" && ch.status !== "open") {
    return { ok: false, status: 409, error: "This challenge is not awaiting a review." };
  }

  const resolvers = await q<{ address: string }>("SELECT address FROM resolvers WHERE active = true");
  if (!resolvers.some((r) => r.address.toLowerCase() === input.resolver.toLowerCase())) {
    return { ok: false, status: 403, error: "Only an active resolver can record a verdict." };
  }

  const prior = await q1<{ one: string }>(
    "SELECT 1 AS one FROM review_votes WHERE challenge_id = $1 AND resolver_address = $2",
    [ch.id, input.resolver],
  );
  if (prior) return { ok: false, status: 409, error: "You have already voted on this challenge." };

  await q("INSERT INTO review_votes (challenge_id, resolver_address, verdict) VALUES ($1,$2,$3)", [
    ch.id,
    input.resolver,
    input.verdict,
  ]);
  await q("UPDATE challenges SET status = 'review', tier = 3 WHERE id = $1", [ch.id]);

  const votes = await q<{ resolver_address: string; verdict: "registrant" | "challenger" | "evidence" }>(
    "SELECT resolver_address, verdict FROM review_votes WHERE challenge_id = $1",
    [ch.id],
  );
  const outcome = quorum(votes.map((v) => ({ resolver: v.resolver_address, verdict: v.verdict })));

  if (!outcome.resolved) {
    return { ok: true, status: 200, data: { recorded: true, resolved: false } };
  }

  const row = await q1<Row>("SELECT * FROM likenesses WHERE id = $1", [ch.likeness_id]);
  if (!row) return { ok: false, status: 404, error: "No such likeness." };
  const likeness = await toLikeness(row);
  const challengerWins = outcome.verdict === "challenger";
  const settlement = settleBonds({
    registrant: likeness.holder,
    registrantBond: likeness.pricePerUse * 2,
    challengers: [{ address: ch.challenger, bond: ch.stake }],
    winner: challengerWins ? ch.challenger : likeness.holder,
  });

  await tx(async () => {
    await q("UPDATE challenges SET status = $1, resolved_by = 'multisig', resolved_at = now() WHERE id = $2", [
      challengerWins ? "won" : "lost",
      ch.id,
    ]);
    for (const leg of settlement.legs) {
      await q(
        "INSERT INTO bond_ledger (id, likeness_id, challenge_id, kind, from_account, to_account, amount) VALUES ($1,$2,$3,'settle',$4,$5,$6)",
        [`bl-r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, likeness.id, ch.id, null, leg.to, leg.amount],
      );
    }
    if (challengerWins) {
      await q("UPDATE likenesses SET holder = $1, controller = $2, state = 'moved' WHERE id = $3", [
        ch.challenger,
        ch.challenger.slice(0, 12),
        likeness.id,
      ]);
    }
  });

  return { ok: true, status: 200, data: { recorded: true, resolved: true, verdict: outcome.verdict } };
}

/* ── resolvers ───────────────────────────────────────────────────────────── */

export async function listResolvers(): Promise<{ address: string; active: boolean }[]> {
  const rows = await q<{ address: string; active: boolean }>(
    "SELECT address, active FROM resolvers ORDER BY address",
  );
  return rows.map((r) => ({ address: r.address, active: r.active }));
}

/** Seed the three demo resolver seats if the table is empty. */
export async function ensureResolvers(): Promise<void> {
  const row = await q1<{ n: string }>("SELECT COUNT(*)::text AS n FROM resolvers");
  if (row && Number(row.n) > 0) return;
  const seats = [
    "0xa11ce00000000000000000000000000000000001",
    "0xb0b000000000000000000000000000000000002",
    "0xca40100000000000000000000000000000000003",
  ];
  await tx(async () => {
    for (const s of seats) {
      await q("INSERT INTO resolvers (address) VALUES ($1) ON CONFLICT (address) DO NOTHING", [s]);
    }
  });
}