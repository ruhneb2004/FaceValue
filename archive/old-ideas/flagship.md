# Chhaya — flagship design

> One human, no name.
> A pseudonymous passport: World ID proves you are one unique human, Arkiv carries the profile that other dapps can read without asking us, Hedera makes the history impossible to quietly rewrite.

Working title. Sections §1–§6 are the design; `submission.md` is the compliance and demo layer.

---

## §1 Architecture

```
                       ┌─────────────────────────────────────────┐
   World ID            │            ISSUER BACKEND               │      Hedera testnet
   ────────            │  (Node/TS, holds all secrets)           │      ──────────────
   Agent Pass (OIDC) ──┼─► 1. OIDC login → issuer+sub stored     │
   IDKit proofOfHuman ─┼─► 2. RP signature (server-side only)    │──►   HCS topic
   /api/v4/verify     ─┼─► 3. verify proof, check environment    │      (attestation log)
                       │    4. nullifier reuse check             │
                       │    5. write Arkiv entities              │──►   HTS NFT
                       │    6. anchor to HCS, patch anchor back  │      (slot voucher)
                       └──────────────┬──────────────────────────┘
                                      │ writes
                    ┌─────────────────▼──────────────────┐
                    │        Arkiv (Rabdi testnet)       │
                    │  chhaya.passport.v1                │
                    │  chhaya.attestation.v1             │
                    │  chhaya.claim.v1   (15-min TTL)    │
                    └───────┬──────────────────┬─────────┘
                            │ public read      │ public read
                    ┌───────▼───────┐  ┌───────▼──────────────────┐
                    │  DAPP A       │  │  DAPP B                  │
                    │  aid claim    │  │  separate origin,        │
                    │  (writes via  │  │  read-only: Arkiv +      │
                    │   our backend)│  │  Mirror Node REST        │
                    └───────────────┘  └──────────────────────────┘
```

The load-bearing claim is the two arrows out of Arkiv: **dapp B has no backend, no API key and no relationship with us.** It is a static page that queries a public database. That is what "profile data transfers from one dapp to another" has to look like to be believable (S15, S21).

Network facts, all from the prize page (S3) unless noted:

| Thing | Value |
|---|---|
| Arkiv RPC | `https://rpc.rabdi.db-chain.testnet.arkiv.network` |
| Arkiv chain id | **7794095** |
| Arkiv explorer | `https://rabdi.explorer.arkiv.network` |
| Arkiv indexer | `https://indexer.rabdi.db-chain.testnet.arkiv.network` |
| Arkiv faucet / access keys | `https://hub.arkiv.network/faucet`, `/access-keys` |
| Arkiv block time | 2 s (S15) |
| Hedera mirror REST (testnet) | `https://testnet.mirrornode.hedera.com/api/v1` (S29) |
| Hedera JS package | `@hiero-ledger/sdk` — **not** `@hashgraph/sdk` (S23) |

---

## §2 The human proof path (World ID)

Six steps, in this order, because each one gates the next.

**Step 1 — recognise the returning human (Agent Pass).**
Agent Pass is an OpenID Connect identity provider; the app receives a **pairwise `sub`** that is stable *within a sector* and different *across sectors* (S14). We store `(issuer, sub)` together, which is exactly the pattern S14 prescribes, and we never store either in Arkiv.

Sector for this project: `mutual-aid`.

**Step 2 — derive the handle (our design, no external source).**

```
handle = "chhaya:" + sector + ":" + base32(HMAC-SHA256(ISSUER_KEY, issuer + "|" + sub))[0..16]
```

Why HMAC and not plain `keccak(sub)`: with a plain hash, anyone holding the sector `sub` (i.e. every app in the sector) could enumerate our handles offline. With a server-held key they cannot. **The cost:** a second, independent issuer in the same sector cannot derive the same handle, so cross-issuer portability rests on trusting *our* attestations plus the HCS anchor rather than on a shared derivation. That trade-off is deliberate and stated in the README, because a judge will ask.

**Step 3 — step up at the moment that matters (IDKit).**
`proofOfHuman` preset (S12), with:

| Parameter | Value | Why |
|---|---|---|
| `action` | `claim-slot:<slotId>` | Scopes uniqueness to *this* claim. Different slot ⇒ different nullifier ⇒ no cross-slot correlation (S10). |
| `signal` | the user's `handle` | Binds the proof to this profile; backend re-checks the same value (S12). |
| `require_user_presence` | `true` | Fresh liveness at claim time; fails with `user_presence_failed` if the check doesn't complete (S12). |
| `rp_context` | `rp_id, nonce, created_at, expires_at, signature` | Signature is generated **only** in the backend and never shipped to the client (S10). |

**Step 4 — validate on the backend, not the browser.**
`POST https://developer.world.org/api/v4/verify/{rp_id}` with the IDKit payload forwarded **as-is** (S10). Then, all four checks:

1. `idkitResponse.environment === "production"` before calling (S10)
2. HTTP `ok`
3. `verification.success === true`
4. `verification.environment === expected`

Anything else ⇒ 400, no Arkiv write, no voucher. This is the requirement World spells out as "do not treat an unvalidated client response as authorization" (S2) and S10.

**Step 5 — enforce uniqueness ourselves.**
The Developer Portal proves the proof is *valid*. It does not prove it is *unused* — "your backend must check that the nullifier hasn't been used before" (S10). We store the nullifier as an indexed `key` column on the attestation entity.

**Step 6 — the protected action fires.**
Only after 1–5: write the Arkiv attestation, anchor to HCS, issue the HTS voucher, flip the claim to `confirmed`.

### Latency notes
Hot flow (World ID already installed) is "typically under 10 seconds" (S13). Cold/semi-cold needs an install, and **iOS has no deferred deep linking**, so the user must return and rescan unless invite-code mode is used — 15-minute, one-shot codes (S13). For a live demo we stay in the hot flow and *say so*; if a judge's phone is cold, use the simulator.

> ⚠️ The prize page states the proofs used at this event are **mocked, with fake identities**, and warns not to rely on them in production (S2). Put that on a slide, not in fine print.

---

## §3 Failure paths (a prize requirement, not an edge case)

World explicitly requires "a denied, expired, cancelled, or otherwise unsuccessful path where the protected action does not occur" (S2). We get four:

| Path | What the user sees | What the system does | Source |
|---|---|---|---|
| **Cancelled** — user closes the IDKit flow | "No claim created." Empty claim list. | `pollUntilCompletion()` never resolves; backend writes nothing; no HCS message, no voucher | S10, S13 |
| **Replayed** — same human, same slot, second attempt | "You already claimed this slot." | Same person + same action ⇒ same nullifier ⇒ our uniqueness check rejects; no second write | S10 |
| **Expired** — 15-minute hold elapses | "Hold released. The slot is back in the pool." | Arkiv entity passes `$expiresAt` and leaves the query surface, so the slot counter recomputes to available | S17 |
| **Unverified** — verification returns `success: false` or env mismatch | "Verification failed." | 400 before any write; no voucher | S10 |

One honest caveat from the docs: **Arkiv emits no event when an entity expires**, and the docs tell you to drop expired entities yourself using `$expiresAt` (S17). So the UI owns a timer; we do not pretend an event arrives.

---

## §4 Hedera: two native services, no Solidity

### 4a. HCS — the tamper-evident anchor

Why this is not decoration: Arkiv entities **expire** (max ≈182.5 days, S17) and are **owned** by a wallet that can patch or delete them (S15). So Arkiv is a great *query surface* and a poor *witness*. HCS is the witness: messages are ordered and sequenced (S26, S27), history is read back for free from the mirror node (S29), and the message carries no personal data.

Topic: `chhaya.attestations.v1`, created with `TopicCreateTransaction`, admin + submit key held by the issuer, memo naming the project (S26). One compact JSON message per attestation:

```json
{"v":1,"p":"<handle>","s":"mutual-aid","k":"human","a":"claim-slot:42","h":"<keccak(nullifier)>","t":1762387200,"i":"<issuer sig, base64>"}
```

Write order matters — **HCS first, Arkiv second.** The Arkiv entity then stores `anchor: "<topicId>:<sequenceNumber>"`, read from the submit receipt (S26/S27). If the HCS submit fails we abort before writing Arkiv, so an Arkiv attestation can never exist without a witness. (`patchEntity` is the only update verb — there is no `updateEntity` — S19.)

### 4b. HTS — the slot voucher

One NFT collection, `Chhaya Slot`, one serial per slot, minted only after §2 and §4a succeed (S24, S28). The serial is transferred to the claimant's **EVM address used as an account alias**, which auto-creates their Hedera account on first transfer (S25 — note the HIP-number conflict recorded in `sources.md`, verify before relying on it).

**Non-transferability, honestly:** no Hedera page I read documents a "soulbound" flag. HTS *does* document a freeze operation — "Freeze/Unfreeze: temporarily restrict or allow token transfers for specific accounts" (S24). So after the transfer we freeze the holder for that token. The README will say exactly that, and will not use the word "soulbound" without this caveat. This is the single most likely thing to go wrong at 2 a.m., so it is a Day-0 spike with a fallback (§8).

### 4c. Mirror Node REST — the free read path

Dapp B reads badge state and HCS history from `https://testnet.mirrornode.hedera.com/api/v1` (S29) rather than querying consensus nodes. This is both cheaper and an explicit extra-point criterion on the Hedera track (S4).

---

## §5 Arkiv data model

Schemas are named for the project, per the docs' warning that Arkiv is public and anyone can write your tag (S15, S19). Column types available: `bool, i32, u64, u256, dec, str, addr, key, bytes`; `str` max 128 bytes; **`bytes` is never indexed**; only indexed columns can be filtered (S18, S19).

```ts
import { addr, bool, bytes, dec, defineSchema, key, str, u64 } from "@arkiv-network/sdk/schema"

const Passport = defineSchema("chhaya.passport.v1", {
  sector:   str().indexed(),
  handle:   str().indexed(),
  human:    bool().indexed(),
  contexts: u64(),
  trust:    dec().indexed(),
  issuer:   addr().indexed(),
  anchor:   str(),            // "<hcs topicId>:<seq>"
  issued:   u64().indexed(),
})

const Attestation = defineSchema("chhaya.attestation.v1", {
  handle:    str().indexed(),
  sector:    str().indexed(),
  action:    str().indexed(),
  kind:      str().indexed(),  // "human" | "presence"
  issuer:    addr().indexed(),
  nullifier: key().indexed(),  // keccak(nullifier) — see §6
  anchor:    str(),
  hcsSeq:    u64(),
  sig:       bytes(),          // issuer signature, not indexed (bytes never is)
})

const Claim = defineSchema("chhaya.claim.v1", {
  handle:  str().indexed(),
  slot:    u64().indexed(),
  status:  str().indexed(),    // "held" | "confirmed" | "expired"
  voucher: str(),              // "0.0.X:12"
  anchor:  str(),
})
```

| Entity | Expiry | Why that lifetime |
|---|---|---|
| Passport | `ExpirationTime.fromDays(30)`, renewed on activity | Reputation that decays when you stop showing up, and the user stops paying for storage (S17: shorter costs less) |
| Attestation | `fromDays(90)` | Long enough for a second dapp to verify; the permanent record is on HCS anyway |
| Claim | `fromMinutes(15)` | **The demo beat.** A hold that nobody confirms literally stops existing (S17) |

Batches: individual creates in a loop are slow and parallel writes from one wallet collide on the nonce — the documented answer is `executeBatch` (S22, as a pattern only; the API on that page is stale, see below).

The query a judge can run (this is the one that goes in the README, per S3):

```ts
// imports: { and, eq, gte, desc } from "@arkiv-network/sdk/query"; { dec } from "@arkiv-network/sdk/schema"
const { entities } = await publicClient
  .select({ $key: true, handle: true, contexts: true, trust: true, anchor: true })
  .from(Passport)
  .where(and(eq("sector", "mutual-aid"), gte("trust", dec("0.5"))))
  .orderBy(desc("trust"))
  .fetch()
```

### Why Arkiv and not Postgres (the 25%-weighted question, S3)

| Property we depend on | Postgres | Arkiv |
|---|---|---|
| A 15-minute hold that disappears with no cron job, no TTL index, no sweeper | Needs a job + a soft-delete convention | Built in: expiry is a protocol field on every entity (S17) |
| A *second* team's dapp reads the profile with no API key, no onboarding, no schema migration | Needs a granted credential and an integration meeting | Public queryable read surface (S15) |
| We cannot edit the user's profile behind their back | Our superuser absolutely can | Only the owner wallet can patch/extend/transfer/delete (S15) |
| History survives the profile | Survives | Does **not** — hence HCS (§4a) |

That last row is the argument for the Hedera track living *inside* the Arkiv design rather than beside it.

### ⚠️ Known doc conflict to write up in `friction.md`

The current docs (S15, S16, S17) use Rabdi + schemas + `createEntity(schema, values, { expiration })`. The **Best Practices page still documents Tiramisu + `createEntity({ payload, contentType, attributes, expires })`** (S22). Same product, two APIs. This is real, reproducible friction and belongs in `/arkiv/friction.md` with both URLs — it is 25% of the Arkiv score (S3).

---

## §6 Privacy analysis — what we publish, and what it costs

This section exists because "prove you're human and nothing else" is a claim that must survive an adversary, not a tagline.

**What we publish:**
1. `handle` — a sector-scoped pseudonym. Linkable across every app in the sector, by design; that linkability *is* portability. Different sectors ⇒ different `sub` ⇒ different handle (S14).
2. `keccak(nullifier)` — not the nullifier. It is stable per *(person, app, action)*, so it proves "this claim was already made by the same person for this same action" (S10) and reveals nothing else, because different actions produce unrelated nullifiers (S10).
3. `anchor` — a topic + sequence number. Contains no identity data.

**What we never store, anywhere:** name, email, phone, DOB, gender, address, photo, any document number, the raw `sub`, the raw nullifier, the selfie, the raw `sybil_score`.

**Attacks we accept and disclose in the README:**

| Attack | Mitigation | Residual risk |
|---|---|---|
| Anyone enumerates all profiles in the sector | Nothing — Arkiv is public (S15) | Accepted. The profile holds predicates, not facts. This is why the app restricts attribute shapes and adds no free-text field. |
| Someone forges our schema tag to inject fake passports | Filter by `.ownedBy()`/`.createdBy()` and verify `sig` (S19) | Low, but must actually be implemented |
| We (the issuer) correlate a user across two sectors | Use **per-sector** HMAC keys and separate issuer identities | Only works if we do it; state it as a deployment rule |
| Publishing `keccak(nullifier)` lets an observer spot "same person, same action" | That is the intended uniqueness property | Accepted — it is also what stops the double claim |
| Reputation resale / farming | Handles are cheap to rotate, so reputation doesn't transfer to a buyer — but it can be farmed by a human doing real work | Out of scope; say so |

One sentence for the pitch: **the nullifier proves you are unique *here*; the handle proves you are consistent *within this sector*; nothing proves who you are.**

---

## §7 What "dapp B" is, concretely

A separate origin, static, no server: reads Arkiv, then the mirror node. Shows a passport card:

- "Verified human: yes" (from Arkiv, `human = true`)
- "3 verified contexts in mutual-aid since 6 Nov" (from Arkiv `contexts`, `issued`)
- "Anchored on Hedera: topic 0.0.x, sequence 42" (link to HashScan)
- "Slot voucher: 0.0.y #12, non-transferable" (from mirror node)
- A deliberately empty "identity" panel, with a note: *this profile cannot contain a name — there is no field for one.*

That last line is the pitch in one screen, and it is the reason a judge remembers the project.

---

## §8 Spikes and fallbacks

Four unknowns can each kill the build. Each gets a **timeboxed spike with a written pass/fail**, and the decision is made from the spike result, not from optimism.

| # | Spike | Pass looks like | Timebox | If it fails |
|---|---|---|---|---|
| 1 | Agent Pass OIDC client (S14) | A logged-in session whose `sub` is identical across two apps registered in the same sector, and different in a third app registered in another sector | 90 min | Drop to IDKit-only; derive the handle from the `signal` + a server-side account. Keep Arkiv + Hedera. Loses the $5,000 Agent Pass track, keeps IDKit. |
| 2 | Arkiv write + indexed query on Rabdi (S16) | `createEntity` succeeds, `.where(eq("sector", ...))` returns it, and an entity with `fromMinutes(15)` disappears from queries after it expires | 60 min | Nothing to fall back to inside this design — this is the one spike that must pass. If it fails, switch to fallback idea G in `ideas.md`. |
| 3 | HTS NFT to an EVM alias (S25) | Serial lands in an auto-created account and the mirror node shows the balance | 75 min | Voucher stays in the issuer treasury; ownership is proven by the signed HCS message + Arkiv attribute. HTS is still genuinely used (two native services satisfied), just less elegantly. |
| 4 | Freeze-after-mint = non-transferable (S24) | A transfer attempt from the frozen holder fails | 30 min | Say "revocable, not soulbound" in the README and on the slide. Do not claim non-transferability. |

**Rule:** spikes 1–3 are done before any UI work. A beautiful interface on top of an unproven integration is how hackathon teams discover at hour 30 that nothing connects.
