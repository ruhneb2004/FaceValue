import { appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
/**
 * Append a diagnostic line to a temp file.
 *
 * Reading server stdout during a live demo is awkward, and diagnosing a failing
 * proof already cost too many round trips. The point of failure has to be
 * inspectable afterwards instead of reconstructed by guesswork. Never throws:
 * diagnostics must not be able to break verification.
 */
function trace(line: string) {
  try {
    appendFileSync(
      join(tmpdir(), "facevalue-worldid.log"),
      `${new Date().toISOString()} ${line}\n`,
    );
  } catch {
    // ignored on purpose
  }
}

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
    // Server-side code must not rely on NEXT_PUBLIC_* — those are inlined for the
    // browser build and their presence in a route handler is not guaranteed. That
    // ambiguity is why the environment question kept coming back. WORLDID_ENV is a
    // plain server variable; both are accepted so the .env needs no duplication.
    const envName = process.env.WORLDID_ENV ?? process.env.NEXT_PUBLIC_WORLDID_ENV;
    const verifyHost =
      process.env.WORLDID_VERIFY_HOST ||
      (envName === "staging"
        ? "staging-developer.world.org"
        : "developer.world.org");
    const verifyUrl = `https://${verifyHost}/api/v4/verify/${rpId}`;
    console.info("[worldid/verify] posting to", verifyUrl);
    trace(`POST ${verifyUrl}`);
    trace(`payload ${JSON.stringify(payload).slice(0, 1200)}`);

    // This app is already registered for World ID 4.0 — v4 accepts its rp_id and
    // validates 4.0-only fields, while v2 reports "App not found" / "Action not
    // found". So there is nothing to migrate and no reason to fall back: a v2
    // retry here could only turn one honest error into a misleading one.
    res = await fetch(verifyUrl, {
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
    const raw = await res.text();
    trace(`reply ${res.status} ${raw.slice(0, 1200)}`);
    let detail: { error?: { message?: string; code?: string }; detail?: string; code?: string } | null =
      null;
    try {
      detail = JSON.parse(raw);
    } catch {
      detail = null;
    }
    const message =
      detail?.error?.message ??
      detail?.detail ??
      (detail?.code ? `World rejected the proof (${detail.code}).` : null) ??
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
