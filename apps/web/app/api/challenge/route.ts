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
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // With settlement on, a challenge cannot be settled by this server alone: the
  // contract allows one stake per address per likeness, so a single server key
  // cannot be both registrant and challenger. A real bond is posted from each
  // party's own wallet, which means browser signing for both sides.
  //
  // Until that exists this refuses on-chain challenges loudly instead of
  // half-recording one. The ledger still records the challenge, so the demo
  // continues; the response says which layer settled it, and the UI shows that.
  if (onchainEnabled()) {
    return NextResponse.json(
      {
        ...result.data,
        settlement: "ledger",
        chainError:
          "On-chain bonds need both parties to sign from their own wallets; this build holds a single key. The ledger recorded the challenge.",
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ ...result.data, settlement: "ledger" }, { status: result.status });
}
