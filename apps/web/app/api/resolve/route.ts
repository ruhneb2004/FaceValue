import { NextResponse } from "next/server";
import { resolveTier1 } from "@/lib/repo";

/**
 * POST /api/resolve — settle an open challenge at tier 1.
 *
 * Tier 1 is deterministic: the band decides and the bonds move with no human in
 * the loop. A reading in the gray band is moved to `review` and this returns
 * 409, because a human decision cannot be forced through the automatic path.
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
  return NextResponse.json(result.data, { status: result.status });
}
