/**
 * Tests for the client-side bond helpers.
 *
 * These cover the parts that can be proven without a browser wallet: the id
 * mapping that both parties must agree on, and the ABI surface the client and
 * server share. A mismatch in `toBytes32` would have each party stake against a
 * different slot, so it is worth pinning.
 *
 * The actual signature cannot be tested here — it needs a real wallet — and this
 * file says so rather than implying otherwise.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { toBytes32, bondAbi, DEFAULT_BOND_HBAR } from "./bond.ts";

test("toBytes32 pads a short id to 32 bytes", () => {
  const out = toBytes32("lc-001");
  assert.equal(out.length, 66); // 0x + 64 hex chars
  assert.match(out, /^0x[0-9a-f]+$/);
});

test("toBytes32 is deterministic", () => {
  assert.equal(toBytes32("lc-123"), toBytes32("lc-123"));
});

test("toBytes32 differs for different ids", () => {
  assert.notEqual(toBytes32("lc-001"), toBytes32("lc-002"));
});

test("toBytes32 encodes the utf8 bytes of the id", () => {
  // "lc-001" -> 6c 63 2d 30 30 31 then zero padding.
  assert.equal(toBytes32("lc-001").slice(2, 14), "6c632d303031");
});

test("toBytes32 truncates to 32 bytes so the ABI type cannot overflow", () => {
  const long = "x".repeat(80);
  assert.equal(toBytes32(long).length, 66);
});

test("ABI exposes the calls the client makes", () => {
  const names = bondAbi.map((e) => e.name);
  for (const fn of ["stake", "challenge", "withdraw", "credit", "stakes"]) {
    assert.ok(names.includes(fn), `ABI is missing ${fn}`);
  }
});

test("stake takes exactly one bytes32 argument", () => {
  const stake = bondAbi.find((e) => e.name === "stake");
  assert.ok(stake);
  assert.equal(stake.inputs.length, 1);
  assert.equal(stake.inputs[0].type, "bytes32");
  assert.equal(stake.stateMutability, "payable");
});

test("challenge takes likenessId and challengeId, and is payable", () => {
  const ch = bondAbi.find((e) => e.name === "challenge");
  assert.ok(ch);
  assert.deepEqual(
    ch.inputs.map((i) => i.type),
    ["bytes32", "bytes32"],
  );
  assert.equal(ch.stateMutability, "payable");
});

test("withdraw takes no arguments and sends no value", () => {
  const w = bondAbi.find((e) => e.name === "withdraw");
  assert.ok(w);
  assert.equal(w.inputs.length, 0);
  assert.equal(w.stateMutability, "nonpayable");
});

test("the default bond is a small, non-zero HBAR amount", () => {
  const n = Number(DEFAULT_BOND_HBAR);
  assert.ok(n > 0, "a zero bond is not a bond");
  assert.ok(n <= 0.1, "keep the testnet demo affordable");
});
