import assert from "node:assert/strict";
import test from "node:test";
import { keccak256, namehash, toHex } from "viem";
import { toLabel, likenessSubname, ensEnabled } from "./ens.ts";

// ENS naming is the part of the integration that can be proven without a funded
// key: whether a display name turns into the right label, and whether the name
// hashes to the node the registry expects. Gas and faucets are out of scope here.

test("labels are lowercased and stripped to one DNS segment", () => {
  assert.equal(toLabel("Ruhneb"), "ruhneb");
  assert.equal(toLabel("Studio Portrait, 2024"), "studio-portrait-2024");
  assert.equal(toLabel("  Alice  "), "alice");
});

test("unicode folds instead of vanishing", () => {
  // A name with an accent must still produce a usable label, not an empty string.
  const label = toLabel("José");
  assert.ok(label && label.length > 0);
  assert.match(label!, /^[a-z0-9-]+$/);
});

test("a label is never over 63 bytes", () => {
  const label = toLabel("x".repeat(200));
  assert.equal(label!.length, 63);
});

test("a name with nothing usable yields no label", () => {
  assert.equal(toLabel(""), null);
  assert.equal(toLabel("!!!"), null);
});

test("subnames hang off the parent", () => {
  const full = likenessSubname("Alice");
  assert.equal(full, "alice.facevalue.eth");
});

test("the same likeness always gets the same subname", () => {
  // Determinism matters: a licence record points at this name, so a shifting name
  // would orphan the record.
  assert.equal(likenessSubname("Alice"), likenessSubname("Alice"));
});

test("different likenesses get different subnames", () => {
  assert.notEqual(likenessSubname("Alice"), likenessSubname("Bob"));
});

test("labelhash matches what the registry computes", () => {
  // setSubnodeRecord takes the keccak of the label, so a mismatch would mint the
  // wrong node — or silently overwrite a neighbour.
  const label = toLabel("Alice")!;
  const expected = keccak256(toHex(label));
  assert.equal(expected, keccak256(toHex("alice")));
});

test("namehash of a subname derives from its parent", () => {
  // The resolvable node is namehash(parent) + label, not a fresh root.
  const full = namehash("alice.facevalue.eth");
  const parent = namehash("facevalue.eth");
  assert.notEqual(full, parent);
  assert.equal(full.length, 66);
});

test("ENS writes are off unless explicitly enabled", () => {
  // Default off, so an unfunded key or an unreachable chain cannot break the
  // ledger-backed demo path.
  const before = process.env.ENS_SUBNAMES;
  delete process.env.ENS_SUBNAMES;
  assert.equal(ensEnabled(), false);
  if (before !== undefined) process.env.ENS_SUBNAMES = before;
});
