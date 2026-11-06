import { NextResponse } from "next/server";
import { resolveTier1 } from "@/lib/repo";
import { onchainEnabled, settleOnchain } from "@/lib/chain";

/**
 * POST /api/resolve — settle an open challenge at tier 1.
 *
 * Tier 1 is deterministic: the band decides and the bonds move with no human in
 * the loop. A reading in the gray band is moved to `review` and this returns
 * 409, because a human decision cannot be forced through the automatic path.
 *
 * When ONCHAIN_SETTLEMENT is enabled the same boolean is also carried to
 * FaceValueBond, so the money moves in custody rather than in a ledger row. The
 * ledger write always happens first and is never rolled back if the chain call
 * fails: the record of what was decided must survive a testnet hiccup, and the
 * response says plainly which of the two settled it.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const b = body as { challengeId?: string };
  if (!b.challengeId) {
    return NextResponse.json({ error: "challengeId is required." }, { status: 400 });
  }

  const result = resolveTier1({ challengeId: b.challengeId });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // Off-chain is the default and the demo-safe path.
  if (!onchainEnabled()) {
    return NextResponse.json({ ...result.data, settlement: "ledger" }, { status: result.status });
  }

  const chain = await settleOnchain({
    likenessId: result.data.likenessId,
    challengeId: b.challengeId,
    faceWins: result.data.faceWins,
    cos: result.data.cos,
  });

  if (!chain.ok) {
    // The decision stands; the transfer did not. Say so rather than pretending
    // the bond moved, and keep the ledger outcome intact for a retry.
    return NextResponse.json(
      {
        ...result.data,
        settlement: "ledger",
        chainError: chain.error,
      },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      ...result.data,
      settlement: "onchain",
      txHash: chain.hash,
      explorerUrl: chain.explorerUrl,
    },
    { status: result.status },
  );
}
