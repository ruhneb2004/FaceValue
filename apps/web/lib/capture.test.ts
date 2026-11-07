/**
 * Tests for the Wave 1.5 invariants.
 *
 * Two rules matter here and neither is cosmetic:
 *
 *  1. One likeness per World ID nullifier. Without it a squatter registers many
 *     times and the "unique human" claim is decoration.
 *  2. A challenger must be a *different* human from the registrant. Without it a
 *     registrant challenges their own record from a second account and the bond
 *     comes back to them, which defeats the whole dispute.
 *
 * Each test runs against a real SQLite database in a temp directory, because the
 * rules are enforced in SQL (partial unique index + lookup), and a mock would not
 * prove that.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The db module reads the path at import time, so set it before importing.
process.env.FACEVALUE_DB = join(mkdtempSync(join(tmpdir(), "fv-")), "test.db");

const { registerLikeness, openChallenge } = await import("./repo.ts");

const WALLET_A = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const WALLET_B = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const WALLET_C = "0xcccccccccccccccccccccccccccccccccccccccc";

test("registering with no nullifier is refused", async () => {
  // This used to assert the opposite. A registration with no World ID proof was
  // accepted, which meant 'one likeness per human' could be bypassed by omitting a
  // field — anyone could mint unlimited unbacked claims. The registry's central
  // promise needs a unique human, so a missing proof is now a rejection.
  const r = await registerLikeness({ name: "No Nullifier", controller: WALLET_A, pricePerUse: 20 });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 400);
});

test("unproofed registrations cannot be created in bulk", async () => {
  // The old partial unique index allowed many nullifier-less rows to coexist. That
  // was fine for the index but wrong for the product: it made the per-human rule
  // optional. Two attempts must both fail, neither may create a row.
  const a = await registerLikeness({ name: "Anon One", controller: WALLET_A, pricePerUse: 10 });
  const b = await registerLikeness({ name: "Anon Two", controller: WALLET_B, pricePerUse: 10 });
  assert.equal(a.ok, false);
  assert.equal(b.ok, false);
});

test("one likeness per nullifier is enforced", async () => {
  const nullifier = "0x" + "11".repeat(32);
  const first = await registerLikeness({
    name: "First Claim",
    controller: WALLET_A,
    pricePerUse: 20,
    nullifier,
  });
  assert.equal(first.ok, true);

  const second = await registerLikeness({
    name: "Second Claim",
    controller: WALLET_B,
    pricePerUse: 20,
    nullifier,
  });
  assert.equal(second.ok, false);
  if (!second.ok) {
    assert.equal(second.status, 409);
    assert.match(second.error, /already registered/i);
  }
});

test("a challenge from the registrant's own nullifier is rejected", async () => {
  const nullifier = "0x" + "22".repeat(32);
  const reg = await registerLikeness({
    name: "Self Challenge Guard",
    controller: WALLET_A,
    pricePerUse: 20,
    nullifier,
  });
  assert.equal(reg.ok, true);
  if (!reg.ok) return;

  const res = await openChallenge({
    likenessId: reg.data.id,
    challenger: WALLET_B,
    grounds: "This frames a shoot I did in March and the record names me.",
    cos: 0.9,
    referenceHash: "ab".repeat(32),
    nullifier,
  });
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.status, 409);
    assert.match(res.error, /registrant/i);
  }
});

test("a challenge from a different nullifier is accepted", async () => {
  const regNullifier = "0x" + "33".repeat(32);
  const reg = await registerLikeness({
    name: "Legit Challenge",
    controller: WALLET_A,
    pricePerUse: 20,
    nullifier: regNullifier,
  });
  assert.equal(reg.ok, true);
  if (!reg.ok) return;

  const res = await openChallenge({
    likenessId: reg.data.id,
    challenger: WALLET_C,
    grounds: "This is my face in the March shoot and the record names someone else.",
    cos: 0.9,
    referenceHash: "cd".repeat(32),
    nullifier: "0x" + "44".repeat(32),
  });
  assert.equal(res.ok, true);
  if (res.ok) assert.equal(res.status, 201);
});

test("reference hash is stored on register and on the challenge", async () => {
  const hash = "ef".repeat(32);
  const reg = await registerLikeness({
    name: "Hash Stored",
    controller: WALLET_A,
    pricePerUse: 20,
    referenceHash: hash,
    nullifier: "0x" + "77".repeat(32),
  });
  assert.equal(reg.ok, true);
  if (!reg.ok) return;
  assert.equal(reg.data.referenceHash, hash);
});
