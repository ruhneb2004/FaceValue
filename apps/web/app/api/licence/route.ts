import { NextResponse } from "next/server";
import { licenseLikeness } from "@/lib/repo";

/**
 * POST /api/licence — clear one use.
 *
 * A non-licensable record returns 409 with the reason from the state machine.
 * The UI renders that reason verbatim; it never becomes a disabled button with
 * no explanation.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const b = body as { likenessId?: string; buyer?: string };
  if (!b.likenessId || !b.buyer) {
    return NextResponse.json({ error: "likenessId and buyer are required." }, { status: 400 });
  }
  if (!/^0x[0-9a-fA-F]{6,}$/.test(b.buyer)) {
    return NextResponse.json({ error: "Connect a wallet first." }, { status: 400 });
  }

  const result = await licenseLikeness({ likenessId: b.likenessId, buyer: b.buyer });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data, { status: result.status });
}
