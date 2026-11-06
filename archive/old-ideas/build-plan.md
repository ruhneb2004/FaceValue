# Build plan — 35 hours, calibrated to the real clock

**Now:** Thu 5 Nov 2026, 21:36 IST.
**Deadline:** Sat 7 Nov 2026, **09:00 IST** (S5). Late submissions are rejected outright (S5), so the plan targets **08:00** with an hour of reserve.

That is 35 hours of wall clock, of which maybe 22 are work. Every number below assumes **one or two people**. If you are solo, cut harder and earlier — the cut list is in §5.

---

## §0 The only three gates that matter

| Gate | Time | If it fails |
|---|---|---|
| **G1 — credentials exist** (Arkiv access key, Hedera testnet account + HBAR, World developer app, Agent Pass client) | Thu 23:00 | Every later block slips. Stop and get these first; nothing else can be tested without them. |
| **G2 — Arkiv write + indexed query + expiry pass** | Fri 00:30 | This design cannot exist without Arkiv. Switch to fallback G in `ideas.md`. Decide *now*, not at hour 30. |
| **G3 — one full happy path end-to-end** (claim → verify → Arkiv → HCS → NFT) | Fri 20:00 | Freeze features. Demo only what works. |

---

## §1 Thursday night — credentials and the Arkiv spike

**21:30–23:00 · Block 0: accounts (critical path)**
Do these in parallel, because each is gated by a portal, an email or a faucet:

- [ ] Arkiv Hub → access key (public RPC is heavily rate limited, so this is not optional — S16), then faucet for test GLM (S3)
- [ ] Hedera developer portal → testnet operator account id + key, funded with test HBAR (S23, S30)
- [ ] World developer portal → app, `app_id`, `rp_id`, `signing_key` (S10)
- [ ] Agent Pass portal → OIDC client, callback URLs (S14) — *registration only tonight; test in Block 2*
- [ ] Repo created, open-source licence, `.env.example` (names only), **first commit**

Commit early and often: ETHGlobal warns that single-commit uploads and missing history can be disqualified (S5).

**23:00–00:30 · Block 1: Spike 2 — Arkiv (G2)**
Write one script that proves the four things the whole design rests on:
`schema` → `createEntity` with `ExpirationTime.fromMinutes(15)` → `.where(eq(...))` returns it → it disappears after expiry. Reference: S16, S17, S18.

Also note, in a scratch file for `/arkiv/friction.md`, anything that made you swear. Friction is 25% of the Arkiv score (S3) and it is unrecoverable if you write it from memory on Saturday.

---

## §2 Friday small hours — the riskiest integration

**00:30–02:00 · Block 2: Spike 1 — Agent Pass OIDC (90 min, then stop)**
The pass condition in `flagship.md` §8: one session, and a sector-scoped `sub` that repeats across two apps in the same sector and differs in another sector. Two apps can be two `client_id`s in the same portal.

If 90 minutes expires without a working `sub`, **write down why and walk away**. Fall back to IDKit-only and keep the $2,500 IDKit track. Do not spend three hours here — it is the only block with an explicit hard stop.

**02:00–08:30 · Sleep.** Non-negotiable. The failure mode of this hackathon is not a missing feature, it is a 4-minute demo delivered by someone who cannot think.

---

## §3 Friday — the build

**08:30–10:00 · Block 3: Spikes 3 & 4 — HTS**
`TokenCreateTransaction` NFT collection (S28) → transfer a serial to an EVM alias so the account auto-creates (S25) → confirm via mirror node REST (S29) → freeze the holder (S24) → attempt a transfer and watch it fail.
Both fallbacks are documented in `flagship.md` §8, so a failure here costs polish, not the project.

**10:00–14:00 · Block 4: issuer core** *(person A)*
Four modules, in this order:
1. `world.ts` — RP signature (server-only), forward payload to `/api/v4/verify/{rp_id}`, the four checks from `flagship.md` §2, return a typed result (S10)
2. `handle.ts` — the HMAC derivation (our design, §2 step 2)
3. `arkiv.ts` — the three schemas, `createEntity` / `patchEntity`, `executeBatch` for slots (S16, S19)
4. `hedera.ts` — topic create, `TopicMessageSubmitTransaction`, **anchor-before-write ordering**, patch the anchor back (S26, S27)

**14:00–15:00 · Block 5: dapp A happy path** *(person B)*
Claim button → IDKit widget → backend → "slot held". Ugly is fine. This is the spine of the demo.

**15:00–18:30 · Block 6: dapp A failure paths**
The three from `flagship.md` §3: replay ("already claimed"), cancel ("no claim created"), expiry (hold releases). These are prize requirements, not polish — World asks for a demonstrated unsuccessful path explicitly (S2).

**18:30–20:00 · Block 7: dapp B**
Separate origin, no backend, Arkiv + mirror node only (S15, S29). Budget this honestly: it is the cheapest block and the one that proves cross-dapp portability.

**20:00 · GATE G3.** Full path, twice, with a fresh slot and a fresh human. If it does not pass, go to §5.

---

## §4 Friday night — freeze, film, write

**20:00–22:00 · Buffer.** Fixes only. Also: create the 4th Arkiv entity by hand to show in the video's failure beat, and confirm the mirror-node links resolve on HashScan.

**22:00–23:30 · Record the video.** Script is `submission.md` §4. Three takes, one uploaded. Filming while the app still works is the single highest-value hour of the whole event.

**23:30–00:30 · Write the paperwork while the demo is fresh.** `INTEGRATION.md` with real timings (S2), `AI_USAGE.md` (S5), and the five `/arkiv/*.md` files from the notes taken during the spikes (S3).

**00:30–06:00 · Sleep.**

**06:00–08:00 · Submit.** Form, three partner picks (World, Arkiv, Hedera — S5), links checked in an incognito window, README read top to bottom. **Submit at 08:00, not at 08:59.**

---

## §5 Cut list — in the order things get dropped

Cut from the top until the schedule fits. Each cut has a written consequence so nobody re-litigates it at 3 a.m.

1. **Swarm +$500** (S3) — cut first. Costs ~4 hours, buys $500, and the doc warns an encrypted reference must never sit raw in a public entity.
2. **Agent Pass** — falls to IDKit-only. Consequence: lose the $5,000 track, keep the $2,500 IDKit track. Trigger: Block 2 overruns.
3. **dapp B's styling** — keep it functional, it only has to load and prove a different origin.
4. **The expiry failure path on camera** — replace with a screenshot of the before/after query. Keep the query, lose the theatre.
5. **HTS voucher** — treasury-held serial, ownership proven by the signed HCS message. Hedera still satisfies ≥2 native services (HCS + HTS calls still happen).
6. **Agent Pass *and* HTS** — **then fall back to idea B (the camp queue)**, which still touches all three partners and has the strongest single-dapp demo (`ideas.md`).
7. **Everything except Arkiv** — idea G, the Mirror play. Last resort, and it should be recognised as such before Friday midnight rather than after.

## §6 Stretch (only if G3 passed before 20:00)

- **Hedera x402 (+$6,500, same pick — S4).** One paid endpoint: dapp B's profile lookup becomes `GET /profile/:handle` costing a fraction of a cent, paid by an agent over x402 and settling on Hedera. It does not consume a partner pick, and the Hedera page lists spending controls and HCS audit logging as extra points it would hit. **Hard rule:** a new track may not break a working demo, and it may not start after 22:00.
- **Selfie Check as a second credential** — deliberately not in scope. World says it does not reward the most credentials used (S2).

## §7 Risk register

| Risk | P | Impact | Mitigation |
|---|---|---|---|
| A portal or faucet needs manual approval and blocks the night | M | High | Block 0 starts now, in parallel, before any code |
| Agent Pass onboarding unknown | **H** | $5k | 90-minute hard stop, IDKit fallback already designed (§2 step 3 works without it) |
| Arkiv public RPC throttles us mid-demo | M | High | Access key from the Hub on day 0 (S16); cache reads in the UI |
| No unique constraint documented on Arkiv ⇒ double-claim race | M | Medium | Pre-check, then serialise writes for a given slot through one issuer process (single writer), so the race window cannot open; disclose the missing constraint in `friction.md`. Do **not** plan on ordering by `$createdAt`: S19 lists only `$key`, `$owner`, `$creator`, `$expiresAt` as sortable entity fields. |
| HTS freeze semantics bite (blocks receiving too) | M | Medium | Spike 4; if it misbehaves, drop the "non-transferable" claim and say so |
| iOS cold-start flow loses the request | M | Medium | Demo on a hot-flow device; invite-code mode exists if needed (S13) |
| Proofs at the event are mocked (fake identities) | **Certain** | Reputational | Say it on a slide before a judge says it to us (S2) |
| Everyone runs out of steam Friday 23:00 | M | High | The video is recorded *before* the paperwork, and submitted with an hour spare |
