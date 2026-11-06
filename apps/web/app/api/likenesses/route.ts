import { NextResponse } from "next/server";
import { connection } from "next/server";
import { listLikenesses } from "@/lib/repo";

/**
 * GET /api/likenesses — the registry.
 *
 * The grid reads this instead of the seed constant, so a licence or a challenge
 * is reflected on the next load. No wallet is required to read: browsing is
 * free, and the per-wallet gating happens in the UI where the reason can be
 * shown, not as a 401 here.
 */
export async function GET() {
  // `cacheComponents` is on, so a route with no request input is prerendered
  // unless it opts into per-request rendering. `connection()` is that opt-in:
  // without it the grid served a snapshot taken at build time and a licence
  // never showed up.
  await connection();
  return NextResponse.json({ likenesses: listLikenesses() });
}
