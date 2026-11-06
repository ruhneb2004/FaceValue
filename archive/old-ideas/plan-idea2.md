# Implementation plan — Idea 2: the petition that cannot be shut down

**Status:** build plan for the 35-hour envelope (deadline Sat 7 Nov 2026, 09:00 IST). Every technical claim carries an S-id from [`sources.md`](sources.md). Statements that are **our reasoning** rather than documented fact are marked **⟨ours⟩** — four of them, and each is load-bearing somewhere, so they are called out rather than buried.

Track: **Arkiv "Build on Arkiv (from scratch)" — $4,000** (S3), plus EF's **CROPS** (S33) and World ID's IDKit track, under the World + Arkiv + EF trio (`ideas-trio.md`).

---

## §0 The six decisions this plan makes, and why

| # | Decision | Why (sourced where possible) |
|---|---|---|
| 1 | **Two named schemas**: `setu.campaign`, `setu.signature` | The schema name tags every entity we write, and a query *through* the schema only sees entities carrying that tag — without it, a filter on a common attribute returns other projects' rows, because Arkiv is public and shared (S15). Anyone can copy a tag, so where trust matters we additionally filter by `$owner` / `.ownedBy()` (S15). |
| 2 | **The signature entity is owned by the *signer*, not by us** | Only the owner wallet can change, hand over or delete an entity (S15). If *we* own the signature, "withdraw my signature" is a promise we can break. If the *signer* owns it, withdrawal is a property of the database. This is the entire `why-arkiv.md` argument, so faking it would collapse the submission. |
| 3 | **Raw nullifier stays in the issuer store; only a salted hash is published** | World requires the backend to reject a reused nullifier, and its own example relies on `UNIQUE (nullifier, action)` (S11). Arkiv documents no unique constraint, so dedupe cannot live on Arkiv anyway. Publishing the raw nullifier would let anyone holding it correlate the signer elsewhere — **⟨ours⟩**, tracked as a risk in §11. |
| 4 | **`action = sign:<campaignId>`**, one action per campaign | The nullifier derives from *(person, app, action)* and different actions produce different, **unlinkable** nullifiers (S10). Scoping the action to the campaign is what makes "one human, one signature *here*" true without making signatures linkable *across* campaigns. **Consequence to state on camera:** an auditor cannot detect the same human signing two campaigns. That is the price of unlinkability, not a bug (§11 retracts my earlier wrong suggestion). |
| 5 | **Reads sit behind one `readSignatures()` with two backends** (`direct`, `anon`) | Anon-RPC anonymizes RPC reads via a hash-pinned worker in a null-origin sandbox (S34, S35), but Arkiv's `arkiv_query` is **not documented** as an anon-rpc network. One function means the demo never depends on an unverified spike (§5). |
| 6 | **The frontend is static; reads never touch our server** | EF scores the property that is "structural (works without you) beats cosmetic (a setting)" (S33). A static page reading Arkiv is structurally unshutdownable; a backend page is not. |

---

## §1 Architecture

```
  signer's browser
  ┌──────────────────────────────┐
  │ static frontend (any host)   │  ← reading needs NO backend of ours
  │  • campaign page + tally     │
  │  • sign flow                 │
  │  • signer keypair (local)    │
  └──────┬──────────────┬────────┘
         │ reads        │ writes (signer key signs, pays)
         ▼              ▼
  readSignatures()   ┌──────────────────┐
   ├ direct RPC      │ Arkiv (Rabdi)    │
   └ anon-rpc        │ setu.campaign    │
         │           │ setu.signature   │
         │           └────────▲─────────┘
         │                    │ writes only after proof verified
         │            ┌───────┴──────────┐
         └───────────►│ issuer backend   │  the ONLY server
                      │ • RP signature   │
                      │ • /api/v4/verify │
                      │ • nullifier store│
                      └──────────────────┘
```

The asymmetry is the product: **reading never touches us**, so killing the backend stops only *new* signatures — exactly the EF "moment it matters" beat (S33).

---

## §2 Repo layout

```
setu/
├─ /arkiv/schema.md             ← required artefact (S3)
├─ /arkiv/friction.md           ← required, 25% of the Arkiv score (S3)
├─ /arkiv/reach.md              ← required, 25% (S3)
├─ /arkiv/why-arkiv.md          ← required, 25% (S3)
├─ /arkiv/how-you-use-arkiv.md  ← required, 25% — the FROM-SCRATCH file (S3)
├─ apps/web/                    ← static build: create campaign, sign, tally, withdraw
├─ apps/issuer/                 ← RP signature, World verify, nullifier store, serialised writes
├─ packages/arkiv/              ← schemas, readSignatures(), createSignature()
└─ README.md                    ← writer wallet address(es), one runnable query, licence, AI disclosure
```

`data-quality.md` is **not** here, deliberately: it belongs to the **Mirror** track, whose qualification requires a re-runnable import script and a republishing-compatible licence (S3). An app has no import. Writing it would signal we misread the track.

---

## §3 Data model

```ts
// packages/arkiv/schemas.ts
import { defineSchema, str, u64 } from "@arkiv-network/sdk/schema"

/* WHY a named schema: the name tags every entity, and a query through the
   schema sees only tagged entities. Arkiv is public and shared, so without a
   unique tag a filter on a common attribute would match strangers' rows. [S15] */
export const Campaign = defineSchema("setu.campaign", {
  title:    str().indexed(), // the page heading; indexed so listings are searchable
  category: str().indexed(), // "campus" | "labour" | "housing" — people browse by cause
  region:   str().indexed(), // ward/city — the filter users actually reach for
  goal:     u64(),           // display-only target. NOT used in any logic, so a
                             // wrong goal can never invalidate a signature
  startsAt: u64(),           // block height, so the window is reconstructable
})

export const Signature = defineSchema("setu.signature", {
  campaignId: str().indexed(), // the join key; every read is scoped to one campaign
  proofHash:  str().indexed(), // salted hash of the nullifier — see §4 step 5
  region:     str().indexed(), // copied from the campaign so "signatures in my ward" is one query
  note:       str().optional(),// public comment; hard-capped at 128 bytes [S16]
})
```

Three documented limits shaped this model, and each has a code consequence:

1. **`str` values max 128 bytes of UTF-8** (`MAX_STRING_BYTES`, S16). The comment field is trimmed **before** the write, in the client, because an over-length value is rejected before the request is sent (S16) — a demo that types a long comment and gets a thrown error looks broken.
2. **Max 32 attributes, or 31 for a named schema** (`MAX_ATTRIBUTES`, S16). We use 5 and 4. That is a deliberate margin, and `schema.md` will say so, because designing to the edge of a limit is a smell judges notice.
3. **Lifetime is hard-capped at 7,884,000 blocks ≈ 182.5 days** (`MAX_LIFETIME`, S17), and **only the owner can extend an entity** unless it was created with the `permissionlessExtension` flag (S17). So a campaign is renewed by a deliberate act by the organiser; a petition nobody renews visibly expires. That is a feature we should claim, not a chore we should hide.

### Creating a campaign

```ts
import { ExpirationTime } from "@arkiv-network/sdk"

const { entityKey } = await walletClient.createEntity(
  Campaign,
  { title, category, region, goal: u64(goal), startsAt: u64(blockNumber) },
  // WHY fromDays(30) and not max(): expiry is enforced by the chain — from that
  // block the entity is gone from every query and every operation on it fails
  // [S15]. Short lifetime also costs less, so we start short and extend what we
  // still need [S17]. No cron job, nothing to forget.
  { expiration: ExpirationTime.fromDays(30) },
)
```

### Reading the tally — and the trap

```ts
const { entities } = await client
  .select({ $key: true, proofHash: true, region: true, note: true })
  .from(Signature)
  .where(eq("campaignId", campaignId))  // indexed, so this is a real server-side filter [S15]
  .fetch()

// WHY no count(): Arkiv documents NO aggregate or count method, and pages cap at
// MAX_LIMIT = 100 rows [S19]. So a tally is "read pages until empty". At demo
// scale (tens of signatures) that is one request. The UI must not show a
// hard-coded number — the whole point is that the count is recomputable by
// anyone, including a journalist who does not trust us.
```

Two more query facts that dictate the UI rather than the backend:

- A query **through a named schema needs no `where`**; any other query without a condition throws `InvalidPredicateError` (S19). So there is never an "all signatures everywhere" view — every read names a campaign.
- **`$createdAt` is not a documented sort key.** Only `$key`, `$owner`, `$creator`, `$expiresAt` are sortable (S19). Do not attempt server-side ordering by time; render in retrieval order or sort client-side.

---

Sources so far: S3, S10, S11, S15, S16, S17, S19, S33, S34, S35.

---

## §4 The World ID flow, step by step

Uniqueness proofs only. **Agent Pass is not used here** — that removes the biggest onboarding risk in the project, because Agent Pass required an OIDC client and sector-scoped `sub`; a plain uniqueness proof at the moment of signing is enough for "one human, one signature".

**Step 1 — the issuer signs the request.** The Developer Portal issues `app_id`, `rp_id` and a `signing_key` that must be stored as a secret (S11).

```ts
// apps/issuer/rp-signature.ts
import { signRequest } from "@worldcoin/idkit-core/signing"

const { sig, nonce, createdAt, expiresAt } = signRequest({
  signingKeyHex: process.env.RP_SIGNING_KEY!,   // never shipped to the browser
  action,                                        // "sign:<campaignId>"
})
// WHY this exists at all: the RP signature proves the proof request came from
// our app, preventing impersonation of our app_id by someone else's page [S11].
```

**Step 2 — the browser asks for the proof.**

```ts
const request = await IDKit.request({
  app_id: "app_xxxxx",
  action: `sign:${campaignId}`,                 // scopes uniqueness to THIS campaign [S10]
  rp_context: { rp_id, nonce, created_at, expires_at, signature: sig }, // from step 1
  environment: "production",                    // "staging" ONLY for simulator.worldcoin.org [S11]
}).preset(orbLegacy({ signal: campaignId }))

const response = await request.pollUntilCompletion()
// WHY signal = campaignId: the signal is bound into the proof, so a proof
// harvested for campaign A cannot be replayed onto campaign B. The backend must
// enforce the same value, or the binding is decoration [S11].
```

**Step 3 — the backend verifies.** Forward the payload **as-is**; no remapping is required (S11).

```ts
// apps/issuer/verify.ts
if (idkitResponse.environment !== "production") return reject()
// ^ BEFORE verification: this is how a staging/simulator proof is kept out of production [S11]

const res = await fetch(`https://developer.world.org/api/v4/verify/${rp_id}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ ...idkitResponse, environment: "production" }),
})
const verification = await res.json()

if (verification?.success !== true) return reject()
if (verification?.environment !== "production") return reject()
// WHY three separate checks: the Developer Portal confirms the proof is
// cryptographically valid and nothing more [S11]; success is the only field
// that says verification passed, and the response environment is re-checked
// because trusting the request alone is one assertion too few [S11].
```

**Step 4 — dedupe the nullifier in our store, not on Arkiv.**

```sql
-- World's own example, and the reason this cannot live on Arkiv [S11]
CREATE TABLE nullifiers (
  nullifier   NUMERIC(78, 0) NOT NULL,   -- convert hex to decimal; casing bugs are a real vulnerability [S11]
  action      TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (nullifier, action)             -- ← Arkiv has no documented equivalent
);
```
> "The Developer Portal confirms the proof is **cryptographically valid**, but your backend must check that the nullifier hasn't been used before." (S11)

This is the single most interesting fact in the plan: **World's required guarantee assumes a unique constraint that Arkiv does not document having.** §6 is the consequence.

**Step 5 — publish a hash, never the nullifier.**

```ts
const proofHash = keccak256(encodePacked(["bytes32", "string"], [nullifier, campaignSalt]))
// ⟨ours⟩ WHY: the public record must prove uniqueness without publishing a
// value that anyone else could correlate against the same person. A salted
// hash keeps the public set auditable for duplicates while the raw nullifier
// never leaves the issuer. This is a design choice, not a documented World
// recommendation — they publish nullifiers to *their* portal, not to a public DB.
```

**Step 6 — write the signature entity, owned by the signer.**

```ts
// apps/web/sign.ts
const signer = privateKeyToAccount(readOrCreateLocalKey())   // generated in the browser, kept in localStorage
// WHY fund it: a write is a signed transaction paid by the writer [S15], so the
// campaign's funded wallet tops the signer key up once, then the signer key
// signs and pays for its own entity. That is the price of real ownership.
await walletClient.createEntity(
  Signature,
  { campaignId, proofHash, region, note: trimTo128Bytes(note) },
  { expiration: ExpirationTime.fromDays(90) },  // ⟨ours⟩ long enough to outlive the campaign, short enough to decay
)
```

**Fallback, decided now:** if the funding step misbehaves under time pressure, ship organiser-owned entities with withdrawal implemented as a nullifier proof — and **say so on camera**. Non-owner deletion is not available (S15), so an organiser-owned design means withdrawal is a promise again; the plan degrades honestly instead of silently.

**Disclosure requirement:** World states the proofs at this event use mocked identities (S2). The UI carries a visible "simulated proof" badge, and the video says it out loud.

---

## §5 The read path, and the honest limit

```ts
// packages/arkiv/read.ts — ONE interface, TWO backends
export async function readSignatures(campaignId: string, mode: "direct" | "anon") {
  if (mode === "direct") return queryVia(publicClient)

  // WHY the harness can only live here, in the browser: it fetches a
  // hash-pinned bundle and runs it in a Web Worker inside a null-origin
  // sandboxed iframe, with KPS transport (WebRTC in the browser) — there is no
  // Node equivalent documented, so a backend cannot use it [S34, S35].
  const worker = new AnonRpcWorker({
    address: SPECIFIER,                    // the anonymizing network's on-chain specifier
    config: undefined,
    preExisting: { rpcProvider: { request: ({ method, params }) => publicClient.request({ method, params }) } },
  })
  const res = await worker.fetch(ARKIV_RPC_URL, {   // the whole point: the query leaves via the sandbox
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "arkiv_query", params: [...] }),
  })
  worker.close()                            // tears the sandbox down
  return res.json()
}
```

**The limit, stated in the submission rather than discovered by a judge:** Anon-RPC's documented job is anonymizing **RPC reads** (S33, S34), and `arkiv_query` is **not documented** as an anon-rpc network. The `passthrough` worker "fulfils calls with an ordinary fetch, so requests are not anonymized… demonstrates the sandbox and hash pinning, not privacy" (S35) — so if only passthrough is wired, we claim **CROPS** and never claim Anon-RPC. EF explicitly welcomes this: *"if you choose to exclude some traffic as an intentional performance/anonymity tradeoff instead of implementation difficulty, that can be a good thing, just let us know"* (S33). The **write** is outside the documented read scope and is labelled as such on camera.

---

## §6 The double-sign race — the sharpest engineering problem here

World requires rejecting a reused nullifier (S11) and its example leans on `UNIQUE (nullifier, action)` (S11). Arkiv documents no unique constraint, so two concurrent requests from one human can both pass a pre-check and both land.

**Answer:** pre-check the store, then **serialise all writes for a campaign through one issuer process** (single writer per campaign), so the window cannot be opened at all. Cost: a modest throughput ceiling, irrelevant here, and stated in `friction.md` as the top item.

**Forbidden shortcut:** do not resolve it by ordering on `$createdAt` and voiding the later write — `$createdAt` is not a documented sort key (S19), so that plan would silently fail.

---

## §7 Build order — phases, hours, and a hard gate each

| Phase | Time | Work | Gate (do not proceed until true) |
|---|---|---|---|
| **P0** | 45 m | Access key from Arkiv Hub, funded test wallet, one `createEntity` + one query against Rabdi | `console.log(query.toString())` prints the query-language string — that string becomes the README's runnable query |
| **P1** | 2 h | Static frontend, campaign entity, tally view, `readSignatures` direct backend | A stranger's browser reads the campaign and its signatures with no backend running |
| **P2** | 2.5 h | RP signature → IDKit → backend verify → nullifier store | A second proof from the same human is rejected, with a readable reason |
| **P3** | 1.5 h | Signer keypair + one-time top-up + signer-owned entity + withdraw | Withdrawal succeeds from the signer's key and **fails** from our key |
| **P4** | 1 h | `readSignatures` anon backend (hard stop) | One Arkiv query executed through the worker, or a written finding of what blocked it |
| **P5** | 1.5 h | Five `/arkiv/` artefacts + CROPS section in README | Every rubric question answered with a number, a link or a query |
| **P6** | 1 h | Record the 3:00 video, twice, and keep both | A recording exists before any further code change |
| **P7** | buffer | Fixes only, then submit | Submission starts before 08:00 IST |

### Fallback ladder

| If this dies | Fall back to — and say so |
|---|---|
| Signer funding (P3) | Organiser-owned entities + withdrawal by nullifier proof; disclose that withdrawal is then a promise |
| Anon-RPC spike (P4) | Claim **CROPS** instead. Never claim Anon-RPC on a passthrough worker (S35) |
| Arkiv access key / rate limits | The plan is dead as specified. Switch to the documented fallback idea rather than pretending |
| World onboarding | Already retired: this plan never uses Agent Pass, only a uniqueness proof |

---

## §8 The 3:00 demo

Constraints: ETHGlobal wants 2–4 min and hard-fails above 4 (S5); EF's CROPS asks for **3 minutes max** (S33); the judging slot is 4 min + 3 min Q&A (S5). ⇒ **3:00**.

| Time | Beat | On screen |
|---|---|---|
| 0:00–0:25 | The problem: a petition whose count nobody can verify and whose signer list somebody can subpoena | the two failure modes, no slides |
| 0:25–1:00 | Sign as human #1: QR to World App, proof returns, signature lands | World App, then the Arkiv entity appearing |
| 1:00–1:25 | Human #1 tries again → rejected, and the UI explains *why* (one human, one signature) | the rejection, read out loud |
| 1:25–1:55 | Two more humans sign; the tally updates live | `watchEntityEvents` + a timer refetch |
| 1:55–2:20 | Human #1 **withdraws their own signature** — it disappears from the query | the delete transaction, signed by the signer's key |
| 2:20–2:50 | **Kill the issuer backend**, reload the static page, the petition still verifies | terminal kill + browser reload, URL bar visible |
| 2:50–3:00 | What is and is not claimed | "simulated proofs", "Anon-RPC covers reads only" |

Two deliberate details: the tally refreshes on a **timer as well as** events, because Arkiv emits **no event when an entity expires** (S20); and the withdrawal beat exists because non-owner deletion is impossible (S15), which is what makes the whole `why-arkiv.md` claim checkable rather than rhetorical.

---

## §9 The submission artefacts, mapped to the rubric

| Bucket | File | The question it must answer (S3) |
|---|---|---|
| Arkiv feedback 25% | `/arkiv/friction.md` | "What should we improve today… When something broke, what did you expect, what happened, and how can we reproduce it?" |
| Reach 25% | `/arkiv/reach.md` | "Who is it for, and would they use it? Can they try it today, and will you keep building it after Mumbai?" |
| Why Arkiv 25% | `/arkiv/why-arkiv.md` | "If you swapped Arkiv for Postgres… what would your users lose? What did you keep off Arkiv, and why?" |
| How you use Arkiv 25% | `/arkiv/how-you-use-arkiv.md` | "Do the things you filter on, who can edit each entity, and when it expires fit what your app does? Does each Arkiv feature you use change something your users see?" |
| — | `/arkiv/schema.md` | entities, queried fields, ownership, expiry (S3) |
| — | `README.md` | writer wallet address(es), **one query judges can run**, open-source licence, AI-use disclosure (S3) |

Every file needs a **number, a link or a runnable query** — that is the stated standard (S3), so a file full of adjectives scores nothing.

## §10 `friction.md` — the five entries, drafted

1. **No unique constraint.** *Expected:* the nullifier dedupe World's own guide mandates (S11) to be enforceable at the storage layer, as its `UNIQUE (nullifier, action)` example implies. *Happened:* Arkiv documents no unique constraint, so the guarantee has to live off-Arkiv and be serialised by us (§6). *Reproduce:* submit two proofs from one human concurrently and watch both pre-checks pass.

2. **Two SDK generations in circulation.** *Expected:* one canonical API. *Happened:* the best-practices page shows Tiramisu-era `createEntity({payload,…})` while the current SDK is schema-based on Rabdi (S3 vs S15). *Reproduce:* follow the best-practices page, then the schema docs.

3. **No aggregate or count.** *Expected:* `count(*)`-style tally. *Happened:* pages cap at `MAX_LIMIT` = 100 rows and no aggregate is documented (S19). *Reproduce:* attempt to count signatures in one query.

4. **128-byte `str` cap.** *Expected:* a free-text comment. *Happened:* `MAX_STRING_BYTES` rejects it before sending (S16). *Reproduce:* write a 200-byte comment.

5. **Public namespace.** *Expected:* our tag isolates our data. *Happened:* anyone can copy a schema name, so we must filter by owner (S15). *Reproduce:* query a common attribute and inspect foreign rows.

**What we would improve today:** one canonical SDK doc, an aggregate/count in the query language, and a `UNIQUE` constraint over indexed attribute pairs. That is a short, specific list from a team that actually shipped — which is what this bucket rewards.

---

## §11 Risks, and one retraction

| Risk | L | I | Mitigation |
|---|---|---|---|
| Double-sign race | M | High | Single-writer serialisation per campaign (§6), disclosed |
| Signer key lost from localStorage | M | Med | Say it in `reach.md`; the entity still expires on its own (S15) |
| Arkiv public RPC rate-limited | H | Med | Access key on day zero, P0 gate (S15) |
| 182.5-day lifetime cap | H | Low | Campaign renewal is a deliberate organiser act (S17) |
| `arkiv_query` not an anon-rpc network | H | Med | Claim CROPS; never claim Anon-RPC (§5) |
| Petition used for harassment | M | Med | State the moderation stance in `reach.md` instead of pretending it cannot happen |

**Correction to earlier guidance — two retractions, both mine:**

1. **"Cross-campaign duplicate audit" was wrong.** With `action = sign:<campaignId>`, nullifiers are unlinkable across actions *by design* (S10). No auditor can detect the same human signing two campaigns. That is the price of unlinkability and it belongs in `why-arkiv.md` as a stated trade-off, not as a feature.
2. **Ordering entities by `$createdAt` was wrong.** It is not a documented sort key (S19); only `$key`, `$owner`, `$creator`, `$expiresAt` are.

---

Sources: S2, S3, S5, S10, S11, S15, S16, S17, S19, S20, S33, S34, S35 — see [`sources.md`](sources.md).
