import { NextResponse, connection } from "next/server";

/**
 * POST /api/worldid/verify — verify an IDKit proof server-side.
 *
 * The client result is never trusted. A browser can send anything, so the raw
 * IDKit payload is forwarded **as-is** to World's verifier and the response is
 * what decides. That is the whole point of server-side validation: the client
 * says "here is a proof", World says "yes, that proof is real".
 *
 * What comes back is a nullifier — a pseudonymous per-action identifier. We store
 * it to enforce one likeness per human. It is not an identity, not a face, and
 * not linkable to anything outside this action's scope.
 *
 * Per the docs the payload needs no remapping: forward it and read
 * `success` / `nullifier_hash`.
 */
export async function POST(req: Request) {
  await connection();

  const rpId = process.env.WORLDID_RP_ID;
  if (!rpId) {
    return NextResponse.json(
      { error: "World ID is not configured (WORLDID_RP_ID missing)." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const { payload, signal } = body as { payload?: unknown; signal?: string };
  if (!payload) {
    return NextResponse.json({ error: "The proof payload is required." }, { status: 400 });
  }

  // A proof without its signal is not coupled to an image, so it could be lifted
  // and reused against a different reference. Refuse rather than store a
  // nullifier that means "some human, some photo".
  if (!signal || !/^[0-9a-f]{64}$/i.test(signal)) {
    return NextResponse.json(
      { error: "A reference hash is required to bind the proof." },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    // A simulator proof is issued by the staging verifier, and the two verifiers
    // do not share a database — sending a staging proof to the production host is
    // rejected. So the verify host has to match the bridge the proof came from.
    const verifyHost =
      process.env.WORLDID_VERIFY_HOST ||
      (process.env.NEXT_PUBLIC_WORLDID_ENV === "staging"
        ? "staging-developer.world.org"
        : "developer.world.org");
    res = await fetch(`https://${verifyHost}/api/v4/verify/${rpId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach World to verify the proof." },
      { status: 502 },
    );
  }

  if (!res.ok) {
    // Surface World's own reason rather than a bare 400, so the UI can explain
    // what happened instead of saying "verification failed".
    const detail = (await res.json().catch(() => null)) as
      | { error?: { message?: string; code?: string }; detail?: string }
      | null;
    const message =
      detail?.error?.message ??
      detail?.detail ??
      (detail?.error?.code ? `World rejected the proof (${detail.error.code}).` : null) ??
      `World rejected the proof (HTTP ${res.status}).`;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const data = (await res.json().catch(() => null)) as {
    success?: boolean;
    // The docs disagree on this name — one snippet reads `nullifier_hash`, another
    // `nullifier`. Accept either rather than betting the integration on a doc.
    nullifier_hash?: string;
    nullifier?: string;
    environment?: string;
  } | null;

  const nullifier = data?.nullifier_hash ?? data?.nullifier;

  if (!data?.success || !nullifier) {
    // Log the actual body. The first version of this check assumed
    // `{ success, nullifier_hash }` and swallowed every other shape into one
    // unhelpful message, which is exactly the sort of guessing that hides a
    // working integration.
    console.error(
      "[worldid/verify] unexpected verify response",
      JSON.stringify({ status: res.status, body: data }).slice(0, 600),
    );
    const hint =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : null;
    return NextResponse.json(
      {
        error:
          "World did not confirm the proof." +
          (hint ? ` (${hint})` : " See the server log for the full response."),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    verified: true,
    nullifier,
    // Passed back so the UI and the debrief can state which environment the proof
    // came from. The plan requires proofs be labelled honestly; this is the field
    // that makes that possible rather than guessed.
    environment: data.environment ?? "unknown",
  });
}
