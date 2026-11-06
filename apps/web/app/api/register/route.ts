import { NextResponse, connection } from "next/server";
import { listLikenesses, registerLikeness } from "@/lib/repo";

/** POST /api/register — register a likeness. It enters `provisional`. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const b = body as {
    name?: string;
    ensName?: string;
    controller?: string;
    pricePerUse?: number;
    referenceHash?: string;
    nullifier?: string;
  };

  const result = registerLikeness({
    name: b.name ?? "",
    ensName: b.ensName,
    controller: b.controller ?? "",
    pricePerUse: Number(b.pricePerUse ?? 0),
    referenceHash: b.referenceHash,
    nullifier: b.nullifier,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ likeness: result.data }, { status: result.status });
}

/** GET /api/register — not meaningful; list is at /api/likenesses. */
export async function GET() {
  await connection();
  return NextResponse.json({ likenesses: listLikenesses() });
}
