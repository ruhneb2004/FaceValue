import { test } from "node:test";
import assert from "node:assert/strict";
import { cosine, bandOf } from "./match.ts";

test("identical vectors have cosine 1", () => {
  const a = [0.3, -0.4, 0.86];
  // Not strict equal: float accumulation over the sqrt gives 1.0000000000000002.
  assert.ok(Math.abs(cosine(a, a) - 1) < 1e-12);
});

test("cosine never exceeds 1 even with float drift", () => {
  const a = [0.3, -0.4, 0.86];
  assert.ok(cosine(a, a) <= 1 + 1e-12);
});

test("orthogonal vectors have cosine 0", () => {
  assert.equal(cosine([1, 0], [0, 1]), 0);
});

test("opposite vectors have cosine -1", () => {
  assert.ok(Math.abs(cosine([1, 2, 3], [-1, -2, -3]) + 1) < 1e-12);
});

test("zero vector yields 0 rather than NaN", () => {
  assert.equal(cosine([0, 0], [1, 1]), 0);
});

test("mismatched lengths throw", () => {
  assert.throws(() => cosine([1, 2], [1, 2, 3]), /length mismatch/);
});

test("band boundaries: 0.65 matches, 0.45 still reviews", () => {
  assert.equal(bandOf(0.65), "match");
  assert.equal(bandOf(0.45), "review");
  assert.equal(bandOf(0.4499), "no-match");
  assert.equal(bandOf(1), "match");
});
