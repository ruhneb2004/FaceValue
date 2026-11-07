import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { SEED_LIKENESSES } from "./seed.ts";
import type { LikenessState } from "./types.ts";

/**
 * The app database, on Postgres.
 *
 * Why Postgres: the SQLite file only worked while the app ran on one machine. A
 * hosted instance has no durable filesystem — on Vercel it is read-only, and
 * anywhere else the file is lost on redeploy — so the registry would have reset on
 * every push. Postgres moves the data somewhere that outlives the process.
 *
 * The authority is still the bond contract on Hedera. These tables are an index of
 * it: what the UI can read without a chain call per row. That ordering matters
 * because it means a lost database is recoverable from chain events, while a lost
 * chain is not recoverable from here.
 *
 * `better-sqlite3` was synchronous; `pg` is not, so every repo function is async.
 * That is a real change to the call sites, not a rename.
 */

export type DB = Pool;

let pool: Pool | null = null;

/**
 * Connection string. `DATABASE_URL` first, so a hosted platform can inject it;
 * otherwise a local default that matches the docker instance this was built
 * against.
 */
export function connectionString(): string {
  return (
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5433/facevalue"
  );
}

/**
 * Whether to negotiate TLS.
 *
 * A hosted Postgres requires TLS and a local docker instance does not, so this is
 * derived from the host rather than hardcoded: localhost stays plain, anything else
 * is treated as remote and TLS is required.
 */
function isRemote(url: string): boolean {
  return !/localhost|127\.0\.0\.1|::1/.test(url);
}

function poolConfig() {
  const url = connectionString();
  return {
    connectionString: url,
    statement_timeout: 10_000,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    ...(isRemote(url)
      ? {
          // Managed providers present their own certificate chain, which this
          // client cannot verify without the CA bundle. Encryption is still on;
          // only certificate pinning is relaxed, and the connection string is
          // itself a secret, so this is the same trust boundary as the password.
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 15_000,
        }
      : {}),
  };
}

export function getDb(): DB {
  if (pool) return pool;
  pool = new Pool(poolConfig());
  return pool;
}

/** Run the migration once per process. Idempotent, so it is safe on every boot. */
let migrated: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (!migrated) {
    migrated = (async () => {
      await migrate();
      // Seed here rather than in getDb(): seeding needs a query, and a query would
      // call back into ensureSchema. Doing it inside the one-time init keeps a
      // fresh database looking like the demo it replaces without a second entry
      // point that someone has to remember to call.
      await seedIfEmpty();
    })().catch((err) => {
      // Clear the memo on failure so a transient connection error can be retried
      // rather than poisoning the process for its lifetime.
      migrated = null;
      throw err;
    });
  }
  return migrated;
}

async function migrate(): Promise<void> {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS likenesses (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      price_per_use INTEGER NOT NULL DEFAULT 0,
      state         TEXT NOT NULL,          -- stored base state; 'disputed' is derived
      ens_name      TEXT,
      controller    TEXT NOT NULL,
      holder        TEXT NOT NULL,
      settlement_deadline TEXT,
      -- SHA-256 of the captured reference frame. The image itself is never
      -- persisted; this hash couples a record to its reference and is the only
      -- thing a challenge is matched against.
      reference_hash TEXT,
      -- World ID nullifier. Server-side only, never exposed publicly. One
      -- likeness per human is enforced by the unique index below.
      nullifier     TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    -- One likeness per World ID nullifier. Partial index so un-registered rows
    -- (null nullifier) do not collide with each other.
    CREATE UNIQUE INDEX IF NOT EXISTS one_likeness_per_nullifier
      ON likenesses(nullifier) WHERE nullifier IS NOT NULL;

    CREATE TABLE IF NOT EXISTS challenges (
      id                TEXT PRIMARY KEY,
      likeness_id       TEXT NOT NULL REFERENCES likenesses(id),
      challenger        TEXT NOT NULL,
      stake             INTEGER NOT NULL,
      cos               DOUBLE PRECISION,
      tier              INTEGER,            -- 1 | 2 | 3, set at resolution
      status            TEXT NOT NULL CHECK (status IN ('open','won','lost','review')),
      resolved_by       TEXT,               -- 'auto' | 'multisig'
      reference_hash    TEXT,
      nullifier         TEXT,
      -- How the challenge image arrived: 'camera' or 'file'. A challenge claims
      -- ownership, so an upload is not equivalent evidence to a live capture.
      capture_source    TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      resolved_at       TIMESTAMPTZ
    );
    CREATE UNIQUE INDEX IF NOT EXISTS one_open_per_challenger
      ON challenges(likeness_id, challenger) WHERE status = 'open';

    CREATE TABLE IF NOT EXISTS licenses (
      id           TEXT PRIMARY KEY,
      likeness_id  TEXT NOT NULL REFERENCES likenesses(id),
      buyer        TEXT NOT NULL,
      price        INTEGER NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS resolvers (
      address    TEXT PRIMARY KEY,
      active     BOOLEAN NOT NULL DEFAULT TRUE,
      added_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS review_votes (
      challenge_id     TEXT NOT NULL REFERENCES challenges(id),
      resolver_address TEXT NOT NULL,
      verdict          TEXT NOT NULL CHECK (verdict IN ('registrant','challenger','evidence')),
      voted_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
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
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

/** Run a query and return rows. Thin wrapper so call sites read cleanly. */
export async function q<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const res = await getDb().query<T>(sql, params);
  return res.rows;
}

/** Run a query and return the first row, or null. */
export async function q1<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Run several statements in one transaction.
 *
 * The bond ledger, the challenge row and the likeness state must move together:
 * a challenge that is recorded without its stake row is a challenge whose money
 * cannot be accounted for. SQLite gave us this for free by running synchronously
 * in one process; with a connection pool it has to be asked for explicitly.
 */
export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Seed once, so a fresh database looks like the demo it replaces. */
export async function seedIfEmpty(): Promise<void> {
  // Raw pool, not q1(): q1() calls ensureSchema(), and ensureSchema() calls this —
  // that cycle would recurse until the stack died.
  const db = getDb();
  const res = await db.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM likenesses");
  if (Number(res.rows[0]?.n ?? 0) > 0) return;

  for (const l of SEED_LIKENESSES) {
    await db.query(
      `INSERT INTO likenesses
        (id, name, price_per_use, state, ens_name, controller, holder,
         settlement_deadline, reference_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [
        l.id,
        l.name,
        l.pricePerUse,
        l.state satisfies LikenessState,
        l.ensName ?? null,
        l.controller,
        l.holder,
        l.settlementDeadline ?? null,
        null,
      ],
    );
  }
}

/** Reset the pool. Used by tests so each run starts from a clean connection. */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    migrated = null;
  }
}
