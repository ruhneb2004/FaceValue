import { NextResponse } from "next/server";
import { openChallenge } from "@/lib/repo";
import { onchainEnabled } from "@/lib/chain";

/**
 * POST /api/challenge — open a challenge against a likeness.
 *
 * The cosine is supplied by the caller. In this build there is no live
 * embedding service, so the demo drives the band directly; the state machine is
 * what turns that number into a tier and a settlement. When the embedding spike
 * lands, only the source of `cos` changes — this route and everything under it
 * already treat it as untrusted input.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const b = body as {
    likenessId?: string;
    challenger?: string;
    grounds?: string;
    cos?: number;
    referenceHash?: string;
    nullifier?: string;
    captureSource?: "camera" | "file";
  };
  if (!b.likenessId || !b.challenger) {
    return NextResponse.json({ error: "likenessId and challenger are required." }, { status: 400 });
  }
  if (typeof b.cos !== "number" || b.cos < -1 || b.cos > 1) {
    return NextResponse.json({ error: "A cosine between -1 and 1 is required." }, { status: 400 });
  }

  const result = openChallenge({
    likenessId: b.likenessId,
    challenger: b.challenger,
    grounds: b.grounds ?? "",
    cos: b.cos,
    referenceHash: b.referenceHash,
    nullifier: b.nullifier,
    captureSource: b.captureSource,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // The bond is posted from the challenger's own wallet by the client, not here.
  // The server holds no user key and must not pretend to custody a bond: a stake
  // the server pays for proves nothing about the challenger's belief in the claim.
  // So this records the challenge and reports which layer holds the money; the
  // browser follows up with `challenge()` signed by the user.
  return NextResponse.json(
    {
      ...result.data,
      settlement: onchainEnabled() ? "client" : "ledger",
      bondHbar: (process.env.DEMO_BOND_HBAR ?? "0.01").trim(),
    },
    { status: result.status },
  );
}
