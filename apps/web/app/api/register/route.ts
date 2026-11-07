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

  const result = await registerLikeness({
    name: b.name ?? "",
    ensName: b.ensName,
    controller: b.controller ?? "",
    pricePerUse: Number(b.pricePerUse ?? 0),
    referenceHash: b.referenceHash,
    nullifier: b.nullifier,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // Mint the subname after the row exists, and never let it fail the registration.
  // A provisional claim must be cheap to make: paying gas is not part of claiming,
  // and an unreachable or unfunded chain must not stop someone recording a claim.
  // The name is reported separately so the UI can say exactly what happened.
  let ens: { name: string | null; minted: boolean; reason?: string } = {
    name: null,
    minted: false,
  };
  try {
    const { likenessSubname, mintSubname, ensEnabled } = await import("@/lib/ens");
    const name = likenessSubname(result.data.name);
    ens = { name, minted: false };
    if (ensEnabled() && name) {
      const minted = await mintSubname(
        result.data.name,
        result.data.holder as `0x${string}`,
      );
      ens = minted.ok
        ? { name: minted.name, minted: true }
        : { name, minted: false, reason: minted.reason };
    }
  } catch (err) {
    ens = { name: null, minted: false, reason: (err as Error).message };
  }

  return NextResponse.json(
    { likeness: result.data, ens },
    { status: result.status },
  );
}

/** GET /api/register — not meaningful; list is at /api/likenesses. */
export async function GET() {
  await connection();
  const likenesses = await listLikenesses();
  return NextResponse.json({ likenesses });
}
