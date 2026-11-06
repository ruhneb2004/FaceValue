import { NextResponse, connection } from "next/server";
import { randomBytes } from "node:crypto";

/**
 * POST /api/worldid/rp-context — mint an RP context for one World ID request.
 *
 * World ID 4.x requires an `rp_context` that only the relying party's backend
 * can produce: an id, a fresh nonce, a short expiry, and an ECDSA signature over
 * them. The browser must never hold the signing key, so this is the one piece
 * that cannot be done client-side.
 *
 * Two modes, and the response always says which it is:
 *
 *  - `signed`   — WORLDID_RP_ID and WORLDID_RP_SIGNING_KEY are set, and the
 *                 context is signed for real. Verification happens on World's
 *                 side against the partner app id.
 *  - `simulated`— they are not set (the default for this build). The context is
 *                 a well-formed placeholder and `simulated: true` says so, so
 *                 the UI labels the proof as simulated rather than implying a
 *                 real Orb or Selfie Check happened. This matches the plan's
 *                 "the event's mocked proofs, labelled as such".
 *
 * A build that quietly returned a fake signature while showing "verified" would
 * be the one lie this product cannot afford.
 */
export async function POST(req: Request) {
  await connection();

  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const action = body.action ?? "register-likeness";

  const rpId = process.env.WORLDID_RP_ID;
  const signingKey = process.env.WORLDID_RP_SIGNING_KEY;
  const nonce = randomBytes(16).toString("hex");
  const createdAt = Math.floor(Date.now() / 1000);
  const expiresAt = createdAt + 300;

  if (rpId && signingKey) {
    try {
      // Lazily imported: the signing package is only needed when configured, and
      // importing it unconditionally would fail the build without the key.
      const { signRequest } = await import("@worldcoin/idkit-server");
      // signRequest mints its own nonce and expiry, so we use the values it
      // returns rather than the ones generated above — the signature covers
      // exactly those, and a mismatch would be rejected on World's side.
      const sig = signRequest({ signingKeyHex: signingKey, action, ttl: 300 });
      return NextResponse.json({
        rp_context: {
          rp_id: rpId,
          nonce: sig.nonce,
          created_at: sig.createdAt,
          expires_at: sig.expiresAt,
          signature: sig.sig,
        },
        simulated: false,
      });
    } catch (err) {
      return NextResponse.json(
        { error: `RP signing failed: ${(err as Error).message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    rp_context: {
      rp_id: process.env.WORLDID_RP_ID ?? "rp_local_demo",
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
      // Empty by design. The UI reads `simulated` and says so; it never renders
      // this as a real proof.
      signature: "",
    },
    simulated: true,
    reason:
      "WORLDID_RP_ID / WORLDID_RP_SIGNING_KEY are not set, so proofs are simulated in this build.",
  });
}
