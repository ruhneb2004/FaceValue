import { NextResponse, connection } from "next/server";
import { voteOnReview, listResolvers, ensureResolvers } from "@/lib/repo";

/** GET /api/review — the three resolver seats. */
export async function GET() {
  await connection();
  ensureResolvers();
  return NextResponse.json({ resolvers: listResolvers() });
}

/**
 * POST /api/review — record one resolver's verdict on a review-band challenge.
 *
 * A second agreeing verdict resolves the challenge and settles bonds. The
 * response says only whether it resolved and, if so, which way — never a
 * running tally, for the reason in dispute-spec §4a: showing "2 of 3 agree"
 * while the third is still reading invites it to fall in line.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const b = body as { challengeId?: string; resolver?: string; verdict?: "registrant" | "challenger" | "evidence" };
  if (!b.challengeId || !b.resolver || !b.verdict) {
    return NextResponse.json({ error: "challengeId, resolver and verdict are required." }, { status: 400 });
  }
  if (!["registrant", "challenger", "evidence"].includes(b.verdict)) {
    return NextResponse.json({ error: "verdict must be registrant, challenger or evidence." }, { status: 400 });
  }

  ensureResolvers();
  const result = voteOnReview({ challengeId: b.challengeId, resolver: b.resolver, verdict: b.verdict });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data, { status: result.status });
}
