import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { SEED_LIKENESSES } from "./seed";
import type { LikenessState } from "./types";

/**
 * The app database.
 *
 * SQLite, one file, opened once per process. The schema follows
 * `docs/dispute-spec.md §6`: likenesses, challenges, licenses, resolvers,
 * review_votes, bond_ledger. The bond_ledger and review_votes tables are
 * indexes of what the (future) contract does — the contract is the authority,
 * this is what the UI reads without a chain call per row.
 *
 * Seeded from `SEED_LIKENESSES` so the running app looks identical to the
 * hardcoded version it replaces. The seed writes `disputed` rows by opening a
 * challenge for them, so the derived state rule holds from the first read: a
 * likeness is `disputed` exactly when it has open challenges.
 *
 * File location: `FACEVALUE_DB`, or `./.data/facevalue.db` by default. The
 * default is gitignored.
 */

export type DB = Database.Database;

const DB_PATH = process.env.FACEVALUE_DB ?? ".data/facevalue.db";

let db: DB | null = null;

export function getDb(): DB {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedIfEmpty(db);
  return db;
}

/** A fresh in-memory database, for tests. */
export function makeTestDb(): DB {
  const d = new Database(":memory:");
  d.pragma("foreign_keys = ON");
  migrate(d);
  seedIfEmpty(d);
  return d;
}

function migrate(d: DB) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS likenesses (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      price_per_use INTEGER NOT NULL DEFAULT 0,
      state         TEXT NOT NULL,          -- stored base state; 'disputed' is derived
      ens_name      TEXT,
      controller    TEXT NOT NULL,
      holder        TEXT NOT NULL,
      settlement_deadline TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id                TEXT PRIMARY KEY,
      likeness_id       TEXT NOT NULL REFERENCES likenesses(id),
      challenger        TEXT NOT NULL,
      stake             INTEGER NOT NULL,
      cos               REAL,
      tier              INTEGER,            -- 1 | 2 | 3, set at resolution
      status            TEXT NOT NULL CHECK (status IN ('open','won','lost','review')),
      resolved_by       TEXT,               -- 'auto' | 'multisig'
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at       TEXT
    );
    -- A challenger may hold at most one OPEN challenge per likeness.
    CREATE UNIQUE INDEX IF NOT EXISTS one_open_per_challenger
      ON challenges(likeness_id, challenger) WHERE status = 'open';

    CREATE TABLE IF NOT EXISTS licenses (
      id           TEXT PRIMARY KEY,
      likeness_id  TEXT NOT NULL REFERENCES likenesses(id),
      buyer        TEXT NOT NULL,
      price        INTEGER NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resolvers (
      address    TEXT PRIMARY KEY,
      active     INTEGER NOT NULL DEFAULT 1,
      added_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS review_votes (
      challenge_id     TEXT NOT NULL REFERENCES challenges(id),
      resolver_address TEXT NOT NULL,
      verdict          TEXT NOT NULL CHECK (verdict IN ('registrant','challenger','evidence')),
      voted_at         TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (challenge_id, resolver_address)
    );

    CREATE TABLE IF NOT EXISTS bond_ledger (
      id           TEXT PRIMARY KEY,
      likeness_id  TEXT NOT NULL REFERENCES likenesses(id),
      challenge_id TEXT,
      kind         TEXT NOT NULL,
      from_account TEXT,
      to_account   TEXT,
      amount       INTEGER NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedIfEmpty(d: DB) {
  const { n } = d.prepare("SELECT COUNT(*) AS n FROM likenesses").get() as { n: number };
  if (n > 0) return;

  const insertLikeness = d.prepare(`
    INSERT INTO likenesses (id, name, price_per_use, state, ens_name, controller, holder, settlement_deadline)
    VALUES (@id, @name, @pricePerUse, @state, @ensName, @controller, @holder, @settlementDeadline)
  `);
  const insertChallenge = d.prepare(`
    INSERT INTO challenges (id, likeness_id, challenger, stake, status)
    VALUES (@id, @likeness_id, @challenger, @stake, 'open')
  `);

  const tx = d.transaction(() => {
    for (const l of SEED_LIKENESSES) {
      // Seed rows carry a `disputed` state and an openChallenges count. Store
      // the base state and materialise the challenges that make it derived.
      const baseState: LikenessState = l.state === "disputed" ? "active" : l.state;
      insertLikeness.run({
        id: l.id,
        name: l.name,
        pricePerUse: l.pricePerUse,
        state: baseState,
        ensName: l.ensName ?? null,
        controller: l.controller,
        holder: l.holder,
        settlementDeadline: l.settlementDeadline ?? null,
      });
      for (let i = 0; i < (l.openChallenges ?? 0); i++) {
        insertChallenge.run({
          id: `${l.id}-seed-${i + 1}`,
          likeness_id: l.id,
          challenger: `0xseed${String(i + 1).padStart(34, "0")}`,
          stake: l.pricePerUse * 2,
        });
      }
    }
  });
  tx();
}
