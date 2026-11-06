# FaceValue — plan report, track map, and 20-hour build

**Status:** committed idea. **Scope:** a likeness rights registry + clearance API, not a global face scanner.
**Date:** 2026-11-06. **Deadline:** Saturday 7 November 2026, 09:00 IST (S5).
**Working title:** FaceValue. Check for name collisions before submission.

---

## 0. Executive summary

**One line:** your face becomes a licensed API — a human registers a likeness, an AI agent pays per use through a licensed generator, and platforms can check any upload against the registry in one call.

**The honest claim:** we do not detect AI generation, and we do not scan the world. We detect the **absence of a license** for a face that is registered, at the points where content is generated or distributed, plus a report flow for the long tail. The random Russian's private generation is invisible to everyone; if he publishes it on a platform that integrates the check, it is flagged; if you find it, we handle it.

**The registration claim (and its limit):** World ID proves a unique live human, not that the human owns the photo they uploaded. So registration is **provisional**, not verified. One likeness per World ID nullifier, a testnet bond, a public `provisional` badge, and no monetisation until the record settles. Possession is proven at **dispute time**: the challenger passes a live check, their face is matched against the frozen registration reference, the ENS record and bond move, and the squatter's nullifier is blocked. **Registration can be seized and reclaimed; it cannot be pre-proven.** Never write "verified likeness" in the UI unless fix A (registration-time liveness comparison) ships.

**The three picks:**

| Pick | Tracks under it | Conservative headline | Stretch |
|---|---|---|---|
| **ENS** | Best Use of ENSv2 — $7,000 | $7,000 | — |
| **World** | Best Use of IDKit — $2,500; Agent Pass — $5,000 (stretch) | $2,500 | $7,500 |
| **Hedera** | x402 — $6,500 | $6,500 | — |
| **Total** | | **$16,000** | **$23,000** |

**Arkiv is cut.** It is not a fourth integration, not a fourth pick, and not a fallback. The 3-pick rule makes a fourth partner a trade, not a bonus (S5; §4.1), and the hours Arkiv would cost are now spent on the dispute loop — the feature that makes the honest claim true. If a primary partner fails, drop that claim; do not add Arkiv at the last minute.

**The build:** a 20-hour solo build (plus a 1-hour submission buffer) with five kill gates — face generation/matching, ENSv2 Sepolia writes, World IDKit, Hedera x402, and the dispute loop. Fixes **B + C** (provisional registration, bond, dispute-time possession) are in the core build (~2h). Fix **A** (registration-time liveness match) is a 1-hour stretch, attempted **only** after a 20-minute check confirms the vendor returns a comparable reference image/embedding. If a gate fails, the fallbacks are explicit (§5.4).

**The demo:** a squatter registers Alice's photo — the record is provisional, bonded, and visibly unverified; the agent is denied a licence. Alice challenges with a live capture, the face matches the frozen reference, the ENS record moves to her, the bond moves with it, and the squatter's nullifier is blocked. Only then can she license: the agent pays over x402, generates an ad, a rogue ad is flagged as unlicensed, and a licensed ad passes the same gate. Real ENS Sepolia writes, a real Hedera testnet payment, a real HCS audit sequence, and a real face match. World ID proofs are the event's mocked proofs (S2) and are labelled as such. The challenge is the climax; the standalone revoke beat is cut for time.

---

## 1. The problem, and the limit that shapes the product

### 1.1 The problem

A person's face is now a raw material for AI-generated ads, avatars, stock images, and agent-made media. The person has no practical way to say **yes, at this price, for this use, until this date** — and no way to make a legitimate use easier than an illegitimate one. Detection-only products fail because the web is too large, private generation is invisible, and a coincidental lookalike may not be legally "your face" at all.

### 1.2 The Russia test — what we can and cannot know

The user's scenario: someone in Russia generates a random face that happens to look like you. How would you know it is your face, and that the use is unauthorised?

| Where the image lives | Can we know? | What the product does |
|---|---|---|
| Generated privately, never published | **No** | Invisible to everyone. We do not claim otherwise. |
| Posted on a platform that does not integrate the check | **Only if someone reports it** | The human/fan submits the URL; we match, check the registry, and generate evidence + a takedown notice. |
| Posted on a platform that integrates the check | **Yes, at upload** | The platform calls the clearance API; the registry returns `licensed`, `unlicensed`, or `unknown`. |
| Used in an ad, marketplace, or commercial campaign | **Usually yes, at the gate** | The platform/ad network checks at ingest; the brand can license or the platform can block. |
| He used your actual photos to train the model | **Clearer violation** | Still only visible when the output is published or reported. |
| A genuinely random face that merely resembles you | **Maybe not actionable** | The gate returns `unknown` or `possible_match`; no automatic accusation. A coincidental resemblance is not the same as using your likeness, and the law varies by jurisdiction. |

**Conclusion:** the product cannot be a global detector. Discovery is the expensive, impossible part. Enforcement has to happen at **choke points**:

1. **The generator** — a compliant agent uses a licensed generator; the raw face never leaves the vault.
2. **The platform** — the platform already has the upload; one API call checks it against the registry.
3. **The report** — the human or a fan is the sensor for the long tail; we verify and produce evidence.

The long tail (small forums, private servers, rogue open-source models) is uncovered. We say so. The product is a rights registry and clearance layer, not an omniscient face police.

### 1.3 What we claim, and what we do not

**We claim:**
- A human can register a likeness, prove uniqueness (World ID), set a price, and — once the record is settled — license it to an agent.
- Registration is **provisional**: it can be challenged, seized, and reclaimed by the face itself.
- An agent can discover the license endpoint through ENS, pay per use through x402 on Hedera, and receive a signed output + verifiable license receipt.
- A platform can check an upload against the registry and get a verdict with evidence.
- A human can report a use, get a match + license status, and generate a takedown notice.
- A human can revoke a license; the registry state changes and the next check fails.

**We do not claim:**
- That we prove the registrant owns the face at signup (unless fix A ships; then only that the live face matches the reference at that moment).
- That a provisional record is a licence or a safe thing to monetise.
- That we detect AI-generated images.
- That we find every use in the world, or crawl the web.
- That we can see private generations or detect training data.
- That a face match is a legal conclusion, or that a coincidental lookalike is actionable.
- That a rogue open-source model can be prevented. We make the legitimate path easy and the commercial path accountable.

**Design decision (⟨ours⟩):** the product's promise is "make the licensed use the default and the commercial use checkable," not "stop all misuse." This is the difference between a rights society and a surveillance system.

### 1.4 Binding World ID to a likeness — the ladder

World ID proves **a unique live human**; it does not prove that the human owns the photo they upload. The relying party receives `signal_hash`, `nullifier`, `sybil_score`, and an integrity bundle — not the live image and not the credential image. World's docs say that, depending on the credential, **World matches the user's live selfie to the credential image** (passport photo or the image captured during Orb verification) (S12). That comparison happens inside World's verifier; it is **not** a comparison to our uploaded reference.

So `signal = hash(uploaded_photo)` is **coupling, not identity**. The attack is:

1. Attacker A passes World ID Selfie Check with A's own face.
2. A uploads B's photo as the likeness reference.
3. A sets `signal = hash(B's photo)`; the proof is genuine and correctly bound to that hash.
4. Nothing in the flow compares A's live face to B's photo. A now controls `b.facevalue-demo.eth`.

This is the gap the design has to close. The ladder:

| Level | Mechanism | What it proves | Cost to attacker | Status |
|---|---|---|---|---|
| **L0** | Upload a photo, no World ID | Nothing | Free | Never ship |
| **L1** | World ID + `signal = hash(photo)` | A unique human chose this photo | Free (one proof per sybil) | Necessary, not sufficient |
| **L2** | L1 + provisional record + bond + dispute-time face possession (**B + C**) | A unique human, **and** whoever ends up with the record can prove possession when challenged | Bond + loss of bond + nullifier block | **Build now (~2h)** |
| **L3** | L2 + registration-time liveness compared to the uploaded reference (**A**) | The registrant's live face matches the reference **at signup** | Must be the person or a very good spoof | Optional, 1h max, vendor-gated |

**B — dispute-time possession (build now).** Registration is `provisional`, not `verified`. Anyone can open a challenge by posting a challenger bond and passing a live capture: browser camera capture + server-side face match against the **frozen** registration reference; World ID gates the challenger as a unique human. If the match clears the threshold, the ENS controller/records move to the challenger, the registrant's bond is forfeited to the challenger, the challenger's own bond is returned, the challenger's nullifier becomes the bound one, and the losing nullifier is blocked from re-registering or re-challenging that likeness. If the match fails, the challenger's bond is forfeited to the registrant and the challenger cannot re-challenge for a cooldown. A false negative goes to human review; the bond is held and no automatic transfer happens.

**B2 — many challengers, and the payout rule (⟨ours⟩, see `docs/dispute-spec.md`).** Several distinct humans may challenge **the same** likeness at once (B, C, D against registrant A). Each challenge resolves **independently against the face**; the number of challengers never decides the outcome, because a majority vote would let three colluding strangers seize any face (see §11). The rule is one line: **the person the face identifies takes every stake; everyone else loses theirs.**

| Outcome | Payout |
|---|---|
| No challenge in the window | A's bond returns on revoke/verify |
| A wins (every challenger below the low threshold) | A keeps the bond **and takes every challenger stake** |
| B wins, C/D lose | B takes its own stake + A's bond + C/D's stakes |
| Any challenge in the ambiguous band | That challenge → `review`; its bonds held; the others settle normally |

The face is the referee, not the count. This is deliberately asymmetric to griefing: a failed challenge *funds the defender*, so spurious challenges are strictly unprofitable, and no group can outvote a correct match.

**C — price the attack (build now).**
- **One likeness per World ID nullifier**, enforced server-side. The attacker needs a distinct unique human per squat.
- **Registration bond** in testnet HBAR, sized to the expected license revenue over the challenge window. A squat becomes a loan, not a theft: you can seize the record only by posting a bond you forfeit when the real person shows up.
- **No monetisation while provisional.** `/api/generate` refuses provisional records (`409 PROVISIONAL`), so the squatter holds a name but cannot collect a licence fee. `active` is a confidence label after the challenge deadline, **not immunity**: challenges stay open for the life of the record, and the registration bond stays locked until the record is revoked or the person is verified (fix A). Otherwise a squatter could wait out the deadline and keep the name. Reserve `verified` **only** for L3.
- **Bond escrow is the contract.** `FaceValueBond.sol` holds every stake; no service key can move the pool. `challenge.opened` and `challenge.resolved` go to HCS with the contract tx id. This removes custody and makes the 2-of-3 quorum un-fakeable. See `docs/bond-contract.md`.
- **Freeze the reference at registration** so a squatter cannot swap the photo after being challenged.
- **Record move = ENS controller/record update** for the demo, not a token transfer. Do not build custody. A production transfer needs role/escrow design.

**A — registration-time closure (optional, after a 20-minute vendor check).** A hosted liveness vendor that returns a reference image/embedding lets us compare the live capture to the uploaded likeness **at registration**. Only then can the UI say `verified likeness`. If the vendor does not return a comparable image/embedding, A is not buildable in the timebox; do not fake it. Until A ships, the UI says `provisional` or `uncontested`, never "verified".

**The line for stage and UI:** "We don't prove the face is yours at signup. We make signup provisional, and we prove possession when it's disputed — by the face itself. A squatter can register you once, with a bond; you take it back with a live check."

**Honest limit, on screen:** registration can be seized and reclaimed; it cannot be pre-proven. A determined attacker with a very good spoof, or a real lookalike, may still win a challenge. That is a review case, not an automatic one.

**R — resolution ladder (⟨ours⟩, see `docs/dispute-spec.md` §3).** Three tiers, in this order. Most challenges resolve at tier 1 and never reach a human, which is the same shape as UMA's optimistic oracle (a bonded claim that settles unless disputed) without adopting its contracts or its DVM.

| Tier | Decider | Band | Outcome |
|---|---|---|---|
| 1 | **Face match** — deterministic cosine similarity against the frozen reference | `≥ 0.65` → challenger wins; `< 0.45` → registrant wins | Automatic, written on-chain, no human |
| 2 | **Evidence bundle** — an LLM summarises scores, crops and metadata | `0.45 ≤ cos < 0.65` | Produces *evidence for a human*, never the verdict |
| 3 | **Multisig / human panel** | Any tier-2 case, or an appeal | **2 of 3 resolver addresses** vote; the only authority in the gray band |

**Do not let a model decide identity.** A language model may assemble the review pack; it may not return the verdict. The defensible answer to "how do you decide it is the same person" is a face embedding with a tuned, published threshold — not "we asked a model". Tier 1 must stay deterministic and reproducible so a judge can re-run it.

**Why not the World ID credential photo.** The World verifier compares the live selfie to the credential image **inside World** and returns only `signal_hash`, `nullifier` and `sybil_score` — never either image (§4.3, S12). A design that asks users to "upload their World ID verification photo" therefore cannot be built: there is no API that returns it, by design. What we use instead is a face *we* capture live and match ourselves, with World ID gating that a unique human is present.

---

## 2. Product

### 2.1 Actors and surfaces

| Actor | What they do | Surface |
|---|---|---|
| **Human licensor** | Registers a likeness (provisional), proves uniqueness via World ID, posts a bond, sets price/terms, approves an agent, revokes | Consumer web app |
| **Challenger** | Contests a likeness, passes World ID + a live capture, posts a bond; wins the ENS record and the bond if the face matches | Challenge screen |
| **Agent / licensee** | Discovers the likeness via ENS, pays per generation, receives the output + receipt; denied while the record is provisional | x402 API / MCP tool |
| **Platform / verifier** | Checks an upload at ingest, gets a verdict + evidence | Clearance API |
| **Reporter** | Submits a URL/image, gets a match + takedown bundle | Report page |
| **FaceValue** | Runs the vault, the licensed generator, the matcher, the registry adapters, and the evidence flow | Backend |

### 2.2 Core objects

**Likeness**
- ENS name: `alice.facevalue-demo.eth` (Sepolia).
- World ID nullifier (server-side only; never public).
- Reference face embedding (off-chain vector store) + `embedding_hash` (public commitment in ENS).
- Encrypted, **frozen** reference image(s) (vault; never returned by the API; no swap after registration).
- Status: `provisional` → `active` (unchallenged past deadline, **still challengeable**) or `disputed` → `active` (defended) / `moved` (seized by a challenger) / `review` (gray band, pending a human) / `revoked`. `moved` is distinct from `active`: it means the ENS controller changed hands, and the platform gate must be able to tell the two apart. `verified` is reserved for fix A and is never inferred.
- Registration bond: amount, asset, escrow tx id.
- Challenge deadline; `verified_at` (null unless fix A matched at registration).
- Controller wallet (the wallet that owns the ENS name and can revoke).
- Price, asset, scope, terms hash.
- Revocation state.

**Challenge**
- **Many challengers may be open on one likeness at once**; each challenge is an independent claim resolved against the face, not a vote. A single challenger may hold only one open challenge per likeness (anti-spam), but B, C and D may each hold their own.
- Challenger is a unique human (World ID nullifier, server-side), distinct from the registrant's.
- Live capture embedding (server-side; not stored as an image beyond the match window).
- Match confidence against the **frozen** reference; bond tx id; status (`open` / `won` / `lost` / `review`).
- Resolution: ENS controller/record move, bond move, nullifier block for the loser.

**Bond**
- A stake held by `FaceValueBond.sol` on Hedera EVM testnet, recorded on HCS when it lands.
- `registration` bond (posted by the registrant) and `challenge` bond (posted by each challenger).
- On resolution the payout follows the face: **the person the face identifies takes every stake**, and everyone else loses theirs — a winning challenger takes its own stake back plus the registrant's bond plus any stakes from challengers who also failed; a registrant who defends takes its bond back plus every challenger's stake. Bonds are held, not paid, while a challenge sits in `review`.
- The registration bond stays locked for the life of the record. It is returned only on voluntary revocation, or after fix A verifies the registrant. Otherwise "squat, wait out the deadline, keep the name" is a free attack.

**License**
- A signed JWT receipt + an ENS subname + an HCS audit message + an optional HTS NFT. (Arkiv is cut; see §4.5 and §9.5.)
- Only issuable for an `active` likeness. A provisional or disputed likeness has no licences.
- Fields: license id, likeness ENS name, licensee (agent ENS/wallet), scope (`ad:image`), price, asset, issued/expiry, output hash, ENS subname, HCS topic/sequence, Hedera tx id, revocation state.

**Output**
- The generated image (returned to the agent).
- A signed sidecar JSON with the license id, likeness, output hash, and registry pointers.
- Optional visible badge "Licensed by FaceValue"; invisible watermark is a stretch.

**Case**
- A reported use: likeness, domain, match confidence, license status, evidence hash, status (open/takedown/closed), expiry.
- Details stay off-chain; public ledgers get hashes and public identifiers only.

### 2.3 Flows

**Flow A — Register (provisional)**
1. Human connects a wallet (burner/testnet for the demo) and uploads 1–3 selfies.
2. Face detect + align + embed; store the encrypted reference and the embedding in the vault; **freeze the reference**.
3. World ID IDKit proof of human; backend verifies `success === true` and `environment`; store the nullifier as `NUMERIC(78,0)` (S10). Set `signal = hash(reference_photo)` — coupling only, not proof of ownership (§1.4).
4. Enforce one likeness per nullifier; bind the nullifier to the wallet. Run a 1:N check against existing non-revoked likenesses: if the face is already claimed above a high threshold, **do not create a second record** — route the user to the challenge flow ("this face is already claimed; contest it"). That is the immediate path back for a squatted person, and it prevents two records for one face.
5. Post the **registration bond** via `FaceValueBond.stake{value: bond}(likenessId)`; write `likeness.registered` to HCS with the contract tx id.
6. Register `alice.facevalue-demo.eth` on ENSv2 Sepolia with `facevalue:status = provisional`, `facevalue:verified = 0`, `facevalue:bond-tx`, and `facevalue:challenge-deadline`; grant the backend scoped roles (§4.2).
7. Set price (e.g., 0.25 HBAR), scope (`ad:image`), and terms hash.
8. Dashboard shows the name, the **provisional / unverified badge**, the bond, the challenge deadline, and the licence endpoint — with licensing disabled. If fix A matched the live capture to the reference, set `verified = 1` and say "verified at registration", never just "verified likeness".

**Flow A2 — Challenge / reclaim**
1. Anyone can open a challenge on a likeness **at any time while the record exists** — the badge may say `active`, but the door does not close. Connect a wallet, pass World ID (unique human), and capture a live selfie in the browser. Several distinct humans may hold open challenges on the same likeness simultaneously; one challenger may hold at most one open challenge per likeness.
2. Challenger posts the challenge bond; the server writes `challenge.opened` + the bond tx to HCS, then compares the live embedding to the **frozen** reference.
3. Match ≥ `0.65` → challenge wins: ENS controller/records move to the challenger's wallet; the registrant's bond is forfeited to the challenger and the challenger's bond is returned; the challenger's nullifier becomes the bound one; the losing nullifier is blocked from re-registering or re-challenging that likeness; status becomes `moved`; write `challenge.resolved` + `likeness.moved` to HCS.
4. Match < `0.45` → challenge loses: the challenger bond moves to the registrant; the challenger cannot re-challenge for a cooldown; status returns to `provisional` / `active`. The challenger can escalate to human review within the cooldown; the bond is held, and review can reverse the result or allow a fresh registration. Without that path, a false negative locks the real person out of their own face.
5. `0.45 ≤ cos < 0.65` → `review`: bonds held, no automatic move; the server assembles an evidence bundle (scores, crops, metadata) and a human/multisig resolves. The model summarises; it does not decide (§1.4 R).
6. **Other open challenges on the same likeness keep resolving independently.** A registrant who defeats every challenger recovers its bond and takes every challenger stake; a challenger who wins takes its own stake, the registrant's bond and any stakes from challengers who also failed (§1.4 B2).
7. The person who ends up controlling the name can now license — and only now.

**Flow B — License / generate**
1. Agent resolves the ENS name; reads `agent-context` / `agent-endpoint[mcp]` or `facevalue:license-endpoint` (S48; ENSIP-26 is a draft).
2. Agent calls `POST /api/generate` with `{ likeness, prompt, scope }`.
3. Server checks `facevalue:status`. If `provisional`, `disputed` or `review` → `409 PROVISIONAL` with no payment request. A squatter can hold the name but cannot sell a licence.
4. No payment → `402` with `accepts` (scheme `exact`, network `hedera-testnet`, asset HBAR or HTS, amount, payTo, resource) (S37/S38).
5. Agent pays through the facilitator; retries with the payment header.
6. Server verifies/settles with the facilitator; checks the human's mandate/budget; generates.
7. Server writes HCS audit message, mints/records HTS receipt, creates the ENS license subname, signs the output.
8. Human dashboard shows the payment, the license, and the output hash.

**Flow C — Platform clearance**
1. Platform uploads an image (or sends a URL) to `POST /api/clearance/check`.
2. Face detect + embed; top-k search in the vault.
3. No match above threshold → `unknown` (no accusation).
4. Match → resolve ENS; check status (`provisional` / `active` / `disputed` / `review` / `moved` / `revoked`), revocation, license subname, expiry, scope, signature.
5. A match to a `provisional` or `disputed` likeness is **not** a licence: return `unlicensed` and say `record: provisional`. The name is a claim, not permission.
6. Return `licensed` (with license id + expiry) or `unlicensed` (with match confidence + evidence).
7. The platform decides: allow, require a license, block, or report. FaceValue does not auto-takedown at the platform.

**Flow D — Report / takedown**
1. Human submits a URL or image.
2. Fetch with SSRF protection; match; check the registry.
3. Create an off-chain case (encrypted details) and write `case.opened` with a case hash, domain, and status to HCS; no PII on a public ledger.
4. Generate an evidence PDF: registered likeness, match confidence, licence status, record status, timestamps, ENS name, HCS sequence.
5. Human reviews and sends; a platform can also receive the case through the clearance API.

**Flow E — Revoke**
1. Human clicks "Revoke" (or revokes the backend's role in the ENS app).
2. Backend unregisters the license subname / flips `facevalue:revoked`; writes an HCS revocation message.
3. The platform gate's next check sees no valid license → `unlicensed`.
4. The agent's next generation request is denied; the output receipt is marked revoked.

### 2.4 What the judge sees

- A **consumer dashboard** with a face, an ENS name, a **provisional / unverified badge**, a bond, a challenge deadline, a price, a licence list, and a revoke button.
- A **challenge screen**: "This is me" → live camera capture → match against the frozen reference → ENS record moves.
- An **agent console** that resolves the ENS name, is denied while provisional, pays after the record is active, and produces an ad with the judge's face.
- A **platform gate** that flags a rogue ad and returns a verdict + evidence; a licensed ad passes.
- A **report page** that generates the takedown bundle.
- A **failure panel**: cancelled World ID, agent denied on a provisional record, failed challenge, expired licence, revoked licence, unknown face.

### 2.5 Business model (design, not a market-size claim)

- **Platforms** pay per clearance check (or a monthly fee) because it reduces legal and moderation risk.
- **Agents** pay per generation; the human receives the majority; FaceValue takes a fee.
- **Humans** register with a bond that stays locked for the life of the record (returned on voluntary revocation or after fix A verifies them), set their price, and can revoke. The bond is the cost of a credible claim, not a paywall.
- **No revenue while provisional.** A provisional record cannot issue licences and cannot be monetised. This is the guardrail that makes squatting pointless: the squatter holds the name but not the business.
- The registry is the supply side; the clearance API is the demand side; the licensed generator is the easiest path to a compliant output.
- **No custody (⟨ours⟩):** the x402 payment is received by the service account; **bonds are not** — they are held by `FaceValueBond.sol` and released only by its own resolution logic. Say this precisely in the README: payments are custodial, bonds are not.

This is "Content ID for likeness" / "ASCAP for faces": license the commercial channels, enforce the ones that matter, and be honest about the tail.

### 2.6 Out of scope

- A global web crawler.
- Detecting private model training or private generations.
- A legal determination of likeness rights.
- Perfect deepfake detection.
- Production-grade liveness / presentation-attack detection. The demo uses a browser capture + a simple challenge; fix A can add a vendor check if it returns a comparable reference.
- A production dispute court. The demo has a bonded challenge and a human-review fallback, not arbitration.
- A mobile app, account recovery, enterprise admin console.
- A production-grade non-custodial wallet. Bonds are non-custodial already (contract-held); the x402 payment account is service-held and disclosed.

---

## 3. Architecture

### 3.1 Diagram

```
Human ── upload selfie ──▶ Vault (encrypted, frozen refs + embeddings)
  │                           │
  ├─ World ID IDKit ──▶ backend verify ──▶ nullifier (server-side)
  │                           │
  ├─ bond ──▶ Hedera escrow ──▶ HCS `likeness.registered` (provisional)
  │                           │
  └─ wallet ──▶ ENSv2 name ──▶ status=provisional, verified=0, bond, deadline
                              │
Challenger ── live capture + World ID ──▶ 1:1 match vs frozen ref
                              │
                     win ──▶ ENS controller/records move + bond moves
                              └─▶ HCS `challenge.resolved` + nullifier block
                              │
Agent ── resolve ENS ──▶ status gate ──▶ provisional? 409 : 402 ──▶ x402/Hedera
                                                              │
                                                     licensed generator + HCS/HTS
                                                              │
                                                     signed output + license JWT
                                                              │
Platform ── upload ──▶ clearance API ──▶ face match ──▶ ENS status + license ──▶ verdict
                                                              │
Human/fan ── report ──▶ match + evidence ──▶ case hash on HCS + takedown bundle
```

### 3.2 Components

| Component | Technology | Why |
|---|---|---|
| Web app | Next.js + Tailwind | One app for consumer, agent demo, platform gate, report |
| API | Next.js route handlers / small Node service | Same deploy, simple auth, easy demo |
| Face service | InsightFace (ArcFace embeddings) + cosine search | Small, local, no LLM; works on a laptop |
| Vault | Local encrypted files / S3-compatible bucket | Raw face never leaves the vault |
| Vector store | SQLite/Postgres + in-memory cosine (pgvector if available) | Demo-scale brute force is fine |
| Generator | Local face-swap/template pipeline; hosted image API optional | Reliable in 20h; no raw face leaves the server |
| ENS adapter | ENSjs ≥ 4.2.3 + viem ≥ 2.35.0 | ENSjs is the documented write path (S47) |
| World adapter | IDKit + backend verify endpoint | Server-side proof validation (S10) |
| Live capture | Browser `getUserMedia` + a simple blink/turn challenge; vendor optional | Dispute-time possession without pretending it is production PAD (fix A adds the vendor) |
| Hedera adapter | `@hiero-ledger/sdk` (not `@hashgraph/sdk`) | S23 naming/import rule |
| x402 | Hedera facilitator (official/Ax402/Blocky402) or our own | Per-request payment, facilitator pays network fee (S37) |
| Bond escrow | Hedera testnet account + native HBAR transfers, logged on HCS | Dispute has teeth without Solidity; custodial demo, disclosed |
| Database | SQLite/Postgres | Off-chain PII, embeddings, cases, challenges |

**Face-matching note (⟨ours⟩):** use a small embedding model (InsightFace/ArcFace-class), not a large multimodal model. A 512-d embedding + cosine similarity is enough for a demo-scale registry. Accuracy depends on pose, lighting, and image quality; tune a threshold on the demo set and treat the score as evidence, not proof.

### 3.3 Data model

**Off-chain (private / encrypted):**

```text
users(id, wallet, world_nullifier NUMERIC(78,0) UNIQUE, ens_name, created_at)
likenesses(id, user_id, ens_name, embedding vector, embedding_hash,
           encrypted_ref_path, reference_frozen_at, controller_wallet,
           status TEXT CHECK (status IN ('provisional','active','disputed','review','moved','revoked')),
           verified_at,                     -- only set by fix A
           bond_amount, bond_asset, bond_tx_id, challenge_deadline,
           price, asset, scope, terms_hash, revoked, created_at)
challenges(id, likeness_id, challenger_user_id, challenger_nullifier,
           live_embedding_hash, match_confidence, challenger_bond_tx_id,
           status TEXT CHECK (status IN ('open','won','lost','review')),
           created_at, resolved_at)
nullifier_blocks(nullifier NUMERIC(78,0), likeness_id, reason, created_at,
                 PRIMARY KEY (nullifier, likeness_id))
licenses(id, likeness_id, licensee_agent, scope, price, asset, status,
         ens_subname, hcs_topic, hcs_sequence, hedera_tx_id,
         output_hash, issued_at, expires_at, revoked_at)
cases(id, likeness_id, domain, evidence_hash, confidence, status,
      hcs_sequence, created_at, expires_at)
agents(id, ens_name, wallet, mandate_id, budget, spent, status, expires_at)
```

**Invariants:**
- `UNIQUE(world_nullifier)` on `users`; one non-revoked likeness per nullifier.
- At most **one open challenge per challenger per likeness**; several distinct challengers may hold open challenges on the same likeness simultaneously.
- One non-revoked likeness per face cluster: a registration whose reference matches an existing record above the high threshold is routed to challenge, not minted twice.
- A `licenses` row may only reference a likeness whose status is `active`.
- `nullifier_blocks` prevents the loser of a challenge from re-registering or re-challenging that likeness.
- The reference image is frozen at registration; `reference_frozen_at` is set once and never updated.

**ENS records (public):**

```text
facevalue:embedding-hash   = 0x…        # commitment only, not the embedding
facevalue:license-endpoint = https://…
facevalue:price            = 0.25
facevalue:asset            = HBAR
facevalue:terms-hash       = 0x…
facevalue:status           = provisional | active | disputed | review | moved | revoked
facevalue:verified         = 0 | 1        # 1 only if fix A matched at registration
facevalue:bond-tx          = 0.0.…@…      # registration bond, public
facevalue:challenge-deadline = unix timestamp
facevalue:revoked          = 0 | 1
facevalue:agent-context    = …           # ENSIP-26 draft, optional
facevalue:agent-endpoint[mcp] = https://… # ENSIP-26 draft, optional
```

**License subname records (public):**

```text
facevalue:license-status = active | revoked | expired
facevalue:licensee       = agent ENS / wallet
facevalue:scope          = ad:image
facevalue:output-hash    = 0x…
facevalue:expires-at     = unix timestamp
facevalue:hcs-sequence   = 123
```

**HCS messages (public, no PII):**

```json
{"type":"likeness.registered","likeness":"alice.facevalue-demo.eth",
 "status":"provisional","bondTx":"0.0.…@…","subjectCommitment":"0x…","ts":1762…}

{"type":"challenge.opened","likeness":"alice.facevalue-demo.eth",
 "challengeId":"ch_123","bondTx":"0.0.…@…","ts":1762…}

{"type":"challenge.resolved","likeness":"alice.facevalue-demo.eth",
 "challengeId":"ch_123","outcome":"won","confidence":0.93,
 "bondTx":"0.0.…@…","ts":1762…}

{"type":"likeness.moved","likeness":"alice.facevalue-demo.eth",
 "from":"0x…","to":"0x…","ts":1762…}

{"type":"license.issued","licenseId":"lic_123","likeness":"alice.facevalue-demo.eth",
 "licensee":"agent.facevalue-demo.eth","scope":"ad:image","amount":"0.25",
 "asset":"HBAR","outputHash":"0x…","status":"active","ts":1762…}
```

No raw nullifier on HCS. Use `subjectCommitment = hash(nullifier + likeness)` if a public commitment is needed; keep the nullifier server-side.

**HTS:** a fungible token for payments (if the facilitator supports it) or an NFT collection for the license receipt. For the demo, HBAR is the x402 asset and the HTS NFT is the receipt — this avoids HTS association issues on the payment leg while still using HTS as a native service (S4). The dispute bond is a native HBAR transfer, not a token, so it cannot get stuck on an association.

### 3.4 Face matching and privacy

- Registration: detect, align, embed; store the embedding and an encrypted reference. Delete or encrypt the raw image; the API never returns it.
- Matching: cosine similarity; top-k; thresholds:
  - `< 0.45` → `unknown` (no match).
  - `0.45–0.65` → `possible_match` (human review; no auto-accusation).
  - `≥ 0.65` → `match` (evidence; still not a legal conclusion).
  - Thresholds are placeholders tuned on the demo set; do not publish them as accuracy claims.
- Public ledgers get `embedding_hash`, not the embedding. The nullifier stays server-side (no source says a World ID nullifier is safe to publish; sources.md flags this as a design risk).
- **Challenge capture:** the live image is held in memory for the match, the embedding is compared to the frozen reference, and the raw capture is discarded at the end of the request (or within a short, stated window for human review). No challenge image, embedding, or nullifier goes to ENS or HCS — only hashes, tx ids, and outcomes.
- **Freeze:** the registration reference is immutable after signup. A challenge always compares against the frozen reference, so a squatter cannot swap in a new photo after being challenged.
- **Fix A vendor:** check the retention policy and whether it returns an image/embedding before building. If it only returns a pass/fail, it cannot close the gap and must not be used to claim "verified".
- A face match is biometric processing. Production needs consent, retention limits, deletion, and legal review; the hackathon prototype says so.

### 3.5 License token

A signed JWT (Ed25519/HS256) with:

```json
{
  "iss": "facevalue",
  "sub": "lic_123",
  "likeness": "alice.facevalue-demo.eth",
  "licensee": "agent.facevalue-demo.eth",
  "scope": "ad:image",
  "price": "0.25",
  "asset": "HBAR",
  "iat": 1762…,
  "exp": 1762…,
  "output_hash": "0x…",
  "ens_subname": "lic-123.alice.facevalue-demo.eth",
  "hcs_topic": "0.0.…",
  "hcs_sequence": 123,
  "hedera_tx_id": "0.0.…@…"
}
```

The platform gate verifies the signature **and** the registry state. A signed licence is not valid if ENS says `provisional`, `disputed`, `revoked`, or expired. This is the difference between a receipt and a permission.

### 3.6 Clearance API

```http
POST /api/clearance/check
{
  "image": "https://… or base64",
  "platform": "demo-marketplace",
  "use": "ad"
}
```

```json
{
  "verdict": "unlicensed",
  "match": {
    "likeness": "alice.facevalue-demo.eth",
    "confidence": 0.93
  },
  "record": {
    "status": "provisional",
    "verified": false
  },
  "license": null,
  "evidence": {
    "case_id": "case_123",
    "hash": "0x…"
  },
  "note": "match on a provisional record; no licence exists; human review required before enforcement"
}
```

Verdicts: `licensed`, `unlicensed`, `unknown`, `possible_match`. A provisional or disputed record always returns `unlicensed`, with `record.status` set. The platform decides the action. No automatic takedown, no automatic accusation.

### 3.7 Report / takedown

- Input: URL or image. Fetch with SSRF protection (block private IPs, limit size/type).
- Match + registry check.
- Create a case; store details encrypted off-chain; put only a case hash/domain/status on HCS.
- Evidence PDF: registered likeness, match confidence, record status, licence status, timestamps, ENS name, HCS sequence, and a template notice. It is evidence, not legal advice.
- Human review before sending. The platform can also receive the case via the clearance API.

### 3.8 Security and privacy

- No raw face, embedding, nullifier, or PII on ENS or HCS. Only hashes, ENS names, public wallet addresses, statuses, and tx ids.
- Hedera keys and the World RP signing key are server-side only; `.env` never committed. The bond contract has no owner key that can withdraw stakes.
- HCS topic has a submit key; only the service can write.
- Rate-limit the clearance API and the challenge endpoint; one open challenge per likeness; cooldown after a failed challenge; API key per platform; log IDs, not images.
- The bond escrow is a service account in the demo. Disclose it in the README; do not imply non-custodial escrow.
- The demo uses testnet keys and mocked World ID proofs; label both.

### 3.9 Failure modes

| Failure | Behaviour |
|---|---|
| No face match | `unknown`; no accusation |
| Low-confidence match | `possible_match`; human review |
| License expired | `unlicensed`; output not generated; registry says expired |
| License revoked | `unlicensed`; next generation denied |
| Forged JWT | Signature check fails; `unlicensed` |
| Platform ignores the verdict | Product cannot force it; the report flow is the fallback |
| Rogue model never publishes | Invisible; out of scope |
| Rogue model publishes on a non-integrating site | Only via report; out of scope for automatic detection |
| Vault breach | Encrypted refs + minimal retention; production needs HSM/KMS and a real threat model |
| World ID proof reused | Nullifier uniqueness check; one active likeness per nullifier |
| Agent over budget | Denied; fresh step-up if Agent Pass is enabled |
| Record is `provisional` | `409 PROVISIONAL` before any 402; no licence, no payment request, no generation |
| Record is `disputed` | `409 DISPUTED`; licensing frozen until resolution |
| Duplicate nullifier registers a second likeness | Denied; one non-revoked likeness per nullifier |
| Same face registers twice under two nullifiers | 1:N check routes the second registration to the challenge flow; no duplicate record |
| Challenge match below threshold | Challenger loses bond to the registrant; cooldown; record returns to `provisional`/`active` |
| Challenge match in the ambiguous band | Status `review`; bonds held; a human/multisig decides; the model only summarises evidence |
| Three challengers, only one matches | That one wins alone — the count does not decide; losers' stakes follow the face (§1.4 B2) |
| Colluding challengers try to outvote a correct record | No vote exists; three non-matching faces all lose their stakes to the registrant |
| A registrant defends against every challenger | Recovers its bond and takes every challenger stake; record stays `active` |
| Registration is in `review` | Licence requests return `409`; no payment, no output |
| ENS move fails after a winning challenge | Status stays `disputed`; retry the controller/record update; no licensing until it lands |
| Bond transfer fails | Registration does not become `active`; no licensing; surface the failed tx |
| Losing nullifier tries to re-register or re-challenge | Blocked by `nullifier_blocks` |
| A squatter registered you | The real person challenges with a live capture, wins the record and the bond, and the squatter's nullifier is blocked |

---

## 4. Track map — the part that converts the build into prizes

### 4.1 Pick strategy: 3 picks, 3 partners

ETHGlobal allows **up to 3 partner prizes**; a partner with multiple tracks counts as **1** pick (S5). The form is the last step; build the integrations, then choose from evidence.

| Partner | Tracks we can enter | Counts as | Decision |
|---|---|---|---|
| **ENS** | Best Use of ENSv2 — $7,000 | 1 | **Pick** |
| **World** | Best Use of IDKit — $2,500; Agent Pass — $5,000 (stretch) | 1 | **Pick** |
| **Hedera** | x402 — $6,500 | 1 | **Pick** — No-Solidity is **forgone** (see §4.4) |
| ~~Arkiv~~ | Build on Arkiv — $4,000 | — | **Cut** — not built, not claimed |

**Why Arkiv is cut, not carried as a fourth integration?** Hedera's x402 is the agent-payment rail; ENS is the identity/permission layer; World is the human-uniqueness layer. The dispute loop (B+C) is the honest-claim feature, and it costs ~2h. Arkiv would cost another 3h+ for a fourth integration that cannot be picked. With the deadline fixed, the marginal hour belongs to the challenge, not a second ledger. The form allows only three; the trade is explicit.

### 4.2 ENS — Best Use of ENSv2 ($7,000)

**Track facts (S1):**
- Best Use of ENSv2 — $7,000; 1st $3,000, 2nd $2,000, 3rd $1,000, 3rd $1,000 (two third-place prizes).
- Project must be built on ENSv2 on Ethereum mainnet **or Sepolia**; ENSv2 must be **central**, not cosmetic; the demo must be functional, not hard-coded; the showcase needs a live demo link and open-source code.
- The page lists hierarchical registries, wildcard resolution, subname registries, Enhanced Access Control, Permissioned Resolvers, record/namespace aliasing, expiring/revocable/non-transferable subnames, and "bonus points if you bring AI agents into the mix."

**Status caveat:** the ENS prize page says ENSv2 is live on mainnet (S1), while the ENS docs say mainnet contracts are deployed ahead of launch and **Sepolia runs ENSv2** (S47). We build on **Sepolia**, which the track explicitly allows, and say so on stage. Do not hardcode the Universal Resolver; use the library's canonical proxy (S47). Test with `ur.integration-tests.eth` → `0x2222…2222` (S47).

**Why ENS is central, not cosmetic:**
- The likeness **is** an ENS name. The name is the public identity, the discovery document, the permission surface, and the license registry.
- The human owns the name; the backend gets only scoped roles. ENSv2's Enhanced Access Control lets us grant `ROLE_SET_TEXT` for `facevalue:*` keys without giving the backend the avatar, address, or resolver.
- The license is an **expiring, revocable subname** (`lic-123.alice.facevalue-demo.eth`) with its own records. The platform resolves it; expiry removes it; revocation unregisters it.
- **The dispute is an ENS state transition.** A winning challenge moves the controller/records from the squatter's wallet to the real person's wallet; `facevalue:status` flips from `provisional` to `active`; the platform gate can see the move without trusting our API. This is the strongest "ENS is central" proof in the demo: not a text record, but who controls the name.
- The agent discovers the endpoint through ENS (`agent-context` / `agent-endpoint[mcp]`, ENSIP-26 draft) and pays over x402. The name is the discovery document, not a text record on the side.

**What we build:**
1. Register a demo parent on ENSv2 Sepolia (`facevalue-demo.eth` or a random suffix).
2. Register the human's subname (`alice.facevalue-demo.eth`) with the human's wallet as owner.
3. Write profile records: `facevalue:embedding-hash`, `facevalue:license-endpoint`, `facevalue:price`, `facevalue:asset`, `facevalue:terms-hash`, `facevalue:status=provisional`, `facevalue:verified=0`, `facevalue:bond-tx`, `facevalue:challenge-deadline`, `facevalue:revoked`.
4. Grant the backend `ROLE_SET_TEXT` on the human's **Permissioned Resolver**, scoped to the `facevalue:*` text keys, plus `ROLE_REGISTRAR`/`ROLE_RENEW` on the parent registry for license subnames; the human keeps the dangerous roles. **One Permissioned Resolver per human** — resolver roles are resolver-wide, so sharing a resolver across users would let one user's grant touch another's records (S47 trap #4).
5. On a winning challenge, **reassign the likeness subname to the challenger's wallet** and flip `facevalue:status` to `active`; on a losing challenge, leave it with the registrant. Demo shortcut: the parent registry admin does the reassignment; production needs a dispute contract/escrow, not a backend key. Say this on stage.
6. On license issuance, register the license subname with an expiry; write `license-status`, `licensee`, `scope`, `output-hash`, `hcs-sequence`. Refuse if `facevalue:status` is `provisional` or `disputed`.
7. On revocation, unregister the subname (or flip `revoked`); the platform check fails.
8. If time: ENSIP-25 `agent-registration` to an ERC-8004 identity; not required, and the ERC-8004 Validation Registry is not available (S40).

**Demo proof:**
- Show the ENS Sepolia explorer: the parent, the human subname, the license subname, the records, the role grant.
- Show the **challenge move**: before → the squatter's wallet controls `alice.…` with `status=provisional`; after → Alice's wallet controls it with `status=active`. This is the beat that makes ENS structural, not decorative.
- Show a platform resolving the license subname and reading the expiry.
- Optional, if time: the revoke transaction and the next check failing (not in the 3:00 cut).

**Risks:**
- ENSv2 Sepolia write path is the biggest unknown. Spike it first (§5.2). If it fails, drop ENS from the picks and keep World + Hedera; do **not** swap in Arkiv (§5.4).
- ENSjs write helpers may not cover `grantSetterRoles`/record linking; raw contract calls may be needed (S47 §9 open question). Budget 3 hours, not 6.
- The mainnet/Sepolia contradiction: say "Sepolia" clearly; the track allows it.

**Sources:** S1 (track + requirements), S47 (ENSv2 architecture, Sepolia status, EAC, Permissioned Resolver, libraries, traps), S48 (ENSIP-25/26 drafts).

### 4.3 World — Best Use of IDKit ($2,500) + Agent Pass ($5,000 stretch)

**Track facts (S2):**
- **Best Use of IDKit** — $2,500; up to 2 teams receive $1,250.
- **World ID Agent Pass** — $5,000 open; 1st $2,500, 2nd $1,500, 3rd $1,000. (The $2,500 Agent Pass is Continuity-only; not for us.)
- IDKit requirements: integrate IDKit in a functioning app; use at least one supported credential and verify server/on-chain; explain the specific trust event and why the credential is the minimum sufficient assurance; demonstrate a successful verification and one meaningful alternative path (cancel, unavailable, rejection, ineligible); include a short integration debrief.
- Agent Pass requirements: official Agent Pass integration; full journey (request → user completion → validated result → protected action); a denied/expired/cancelled path; server-side validation; debrief.
- **Proofs are mocked at the event** ("We are mocking proofs now… Proofs are using fake identities, DO NOT rely in them for production" — S2). Label them.

**Why World is central:**
- The trust moment is **"a unique human is making a claim on a likeness, and a different unique human can contest it."** That is not a login screen; it is the uniqueness and consent layer under the entire registry.
- IDKit Proof of Human is the minimum sufficient credential: one human per likeness, no personal data. The track explicitly rewards choosing the right credential, not the most credentials (S2).
- Agent Pass is the natural fit for the agent economy: the human grants an agent a scoped, time-bound mandate; the agent can license/generate within the budget; above the threshold, fresh step-up. This is exactly "power human-backed agents" (S14).

**What World does and does not prove — say this on stage.** World proves a unique live human; it does not prove that human owns the uploaded photo. The app receives `signal_hash`, `nullifier`, `sybil_score`, and an integrity bundle, not the live image. World's docs say that, depending on the credential, **World matches the user's live selfie to the credential image** (passport/Orb) **inside World's verifier** (S12) — not to our reference. So `signal = hash(photo)` is coupling, not identity. Attack: A passes Selfie Check with A's face, uploads B's photo, sets `signal = hash(B's photo)`. The proof is genuine; nothing compares A's live face to B's photo. The fix is the ladder in §1.4: provisional registration + bond + dispute-time possession (B+C), with registration-time liveness match (A) as a vendor-gated stretch. Do **not** quote this as S1; the "matches the live selfie to the credential image" line is **S12**.

**What we build (IDKit — primary):**
1. Server generates the RP signature; client calls `IDKit.request` with `app_id`, `rp_id`, `action`, `signal` (S10). Set `signal = hash(reference_photo)` and read it as **coupling, not identity**; the app cannot see the credential image.
2. Backend verifies at `POST https://developer.world.org/api/v4/verify/{rp_id}`; checks `success === true` and `environment`; never trusts the client response (S10).
3. Store the nullifier as `NUMERIC(78,0)`; enforce one non-revoked likeness per nullifier (S10).
4. Bind the nullifier to the human's wallet; the ENS name is owned by that wallet, and the nullifier is the key that can be blocked after a lost challenge.
5. Failure paths: replay (second likeness denied), cancel (no likeness), expired proof, wrong human trying to revoke another's licence, losing nullifier trying to re-register.
6. Second trust event: a challenger passes World ID (a different unique human) **and** a live capture; the face match against the frozen reference decides the record. This is the event the judges should remember.

**What we build (Agent Pass — stretch, only if the core is green):**
1. OIDC client with World ID Agent Pass; pairwise `sub` per sector (S14).
2. Human grants an agent a mandate: scope, budget, expiry.
3. Agent calls the licensed generator; the backend maps the `sub` to the mandate and enforces budget/scope.
4. Above budget → fresh authentication; denied/expired mandate → protected action does not occur.
5. Demo beat: the agent generates 3 ads; the 4th exceeds the budget; the human denies; the agent is blocked.

**Integration debrief (`INTEGRATION.md`):** time to first success, friction, missing capability, one improvement, with real timings (S2). The track asks for it explicitly.

**Risks:**
- IDKit setup can eat hours; spike early. The simulator/mocked proofs reduce risk (S2).
- Agent Pass is a separate OIDC integration; it is a stretch, not the primary claim.
- Selfie Check is medium-assurance (S12); a good spoof or a lookalike can pass. The challenge threshold and human review are the mitigation, not a guarantee.
- Do not publish the nullifier; keep it server-side. No source says it is safe to publish (sources.md).

**Sources:** S2 (tracks + requirements + mocked proofs), S10 (IDKit integration contract, server verification, nullifier storage), S12 (credentials), S14 (Agent Pass/OIDC/pairwise `sub`), S9 (World ID overview).

### 4.4 Hedera — x402 ($6,500); No-Solidity forgone

**Track facts (S4):**
- **AI Agents That Pay: x402 on Hedera** — $6,500; 1st $3,000, 2nd $2,000, 3rd $1,500.
  - At least one x402-protected endpoint that settles on Hedera testnet/mainnet through a facilitator (Official x402, Ax402, Blocky402, or your own).
  - An agent/client that finds the endpoint and completes at least one paid request end to end, **with no human approving**.
  - Public GitHub repo; README with setup, architecture, payment flow, and the Hedera transaction ID of at least one settled payment.
  - Demo video ≤5 minutes showing a payment settling and a HashScan link.
- **"No Solidity Allowed": Build with Hedera SDKs** — $2,000; up to 2 teams receive $1,000.
  - JS/TS or Python SDK; **no Solidity smart contracts**.
  - At least **two native Hedera services** (e.g., HTS + HCS).
  - Public repo with README; demo video ≤5 minutes.
  - Extra points: Mirror Node REST, creative HCS, Agent Kit, security/key management.

> **We are not claiming this track.** A bond contract ships (`contracts/FaceValueBond.sol`), so the repo is no longer Solidity-free, which the track audits for. Cost booked: **−$2,000**. Reason: without a contract the bonds are custodial and the 2-of-3 review quorum is enforced by our own database, which contradicts the product's own trust story. See `docs/bond-contract.md`.

**Why Hedera is central:**
- The agent payment **is** the product's economic loop. x402 is how an agent pays per generation without a checkout, signup, or API key (S4/S38).
- HCS is the tamper-evident audit log: registration, challenge opened/resolved, record move, licence, revocation, and clearance verdict each get a sequence number. The receipt points to it; the platform can verify it through the Mirror Node (S29).
- **The bond is held by a contract, not by us.** `FaceValueBond.sol` (~70 lines) takes stakes, enforces one stake per address per likeness, and is the only code that can move the pool. The contract does **not** decide identity: it receives `faceWins: bool` from the match and 2-of-3 approvals for the gray band. This removes custody and makes the quorum un-fakeable. See `docs/bond-contract.md`.
- HCS remains the audit log for every state change the contract makes; HTS remains the licence receipt. Mirror Node REST is a third Hedera surface.
- The facilitator pays the network fee, so the paying agent does not need HBAR for gas (S37); the agent still needs a funded payment account.

**What we build:**
1. Create an HCS topic with a submit key; memo "FaceValue licenses v1" (S26).
2. Create an HTS NFT collection (or fungible token) for license receipts (S28); treasury = service account.
3. **Deploy `FaceValueBond.sol`** to Hedera EVM testnet (or Sepolia). Stakes and payouts go through it; the backend holds no key that can move the pool.
4. Implement `POST /api/generate` as an x402-protected endpoint:
   - Check record status first. `provisional`/`disputed` → `409` with no payment request.
   - No payment → `402` with `accepts` (scheme `exact`, network `hedera-testnet`, asset HBAR or HTS, amount, payTo, resource).
   - Agent builds a `TransferTransaction`, sets payer to the facilitator's `feePayer`, partially signs, Base64 → `PaymentPayload` (S37).
   - Server calls facilitator `/verify`, then `/settle`; facilitator pays the network fee (S37).
   - Server generates, writes HCS, mints the HTS receipt, returns the output + JWT.
5. Agent script: resolve the ENS name, read the endpoint, call, pay, retry, save the output. No human click.
6. Mirror Node REST read for the HCS messages + transaction status (S29).
7. README: the Hedera transaction ID, topic ID, token ID, **bond contract address**, HashScan links.

**Solidity posture (deliberate):**
- Exactly **one** contract, `contracts/FaceValueBond.sol`. No factory, no proxy, no token contract — HTS is used natively for the receipt.
- The contract never sees a face, an embedding, or a nullifier. It sees `bytes32 likenessId`, addresses, amounts and a `bool`.
- Use `@hiero-ledger/sdk` for HCS/HTS, not `@hashgraph/sdk` (S23).
- Key management: submit key and operator key in `.env`; no client-side signing of HCS.
- Say "Hedera testnet" (lowercase), "HBAR" (uppercase); do not call Hedera a "blockchain" (S23).

**Risks:**
- Facilitator onboarding is the biggest unknown. Spike early; if it fails, use a direct HBAR transfer for the licence payment for the demo and claim only No-Solidity (**no longer available**) — i.e. drop the Hedera pick's second track and lean on x402 alone. This is now a real loss, not a free fallback.
- The bond contract is the only code holding funds. Audit its transfer logic before the demo; prefer the pull pattern so a failed push cannot brick a payout.
- HTS association/auto-account-creation can bite; the facilitator docs say alias auto-account-creation defaults to `reject` (S37). Fund and associate the agent account before the demo.
- Do not use HTS custom fees without reading the fee-direction trap: the receiver pays by default; only `net_of_transfers` makes the sender pay (S46). For the demo, do the revenue split in the app, not in a custom fee.
- The x402 track requires a real settled payment; a mocked payment does not qualify. If the facilitator is down, the Hedera pick yields nothing — x402 was the only claimable Hedera track once No-Solidity was forgone.

**Sources:** S4 (tracks + requirements), S23 (SDK naming/import, terminology), S24 (HTS overview), S26/S27 (HCS topic/submit), S28 (HTS define), S29 (Mirror Node), S37 (x402 flow/fee payer/limits), S38 (x402 HBAR/HTS), S46 (custom-fee direction trap), S30 (SDK install).

### 4.5 Prize math

| Scenario | ENS | World | Hedera | Headline |
|---|---|---|---|---|
| **Primary, conservative** | $7,000 | $2,500 (IDKit) | $6,500 (x402) | **$16,000** |
| Primary + Agent Pass | $7,000 | $7,500 | $6,500 | **$21,000** |
| ENS fails | — | $2,500 | $6,500 | **$9,000** |
| World fails | $7,000 | — | $6,500 | **$13,500** |
| Hedera x402 fails | $7,000 | $2,500 | — | **$9,500** |

**No-Solidity is out** (−$2,000, §4.4): the bond contract makes the repo non-Solidity-free. The headline ceiling drops from $23,000 to $21,000 accordingly. This is a deliberate trade — a custodial escrow would have been worth more money and less credibility.

**Realistic target:** one track per partner — ENS ($3,000–$7,000), World IDKit ($1,250–$2,500), Hedera x402 ($1,500–$6,500) — so **$5,750–$16,000** if all three land, with a likely middle around **$5,750–$9,000**. The headline is not a promise.

**Arkiv is not in this table.** It was cut on 6 Nov: no fourth pick, no fourth integration, and the hours went to the dispute loop. If a primary partner fails, the fallback is to drop that partner's claim, **not** to add Arkiv at the last minute (§5.4).

**Finalist prizes** are separate and stack; the solo finalist package is 250 USDC + $10k AWS credits (S1 finalist block). The finalist is chosen on the five criteria in S5, so the demo quality matters more than the track checklist.

### 4.6 What we are not claiming

- **Ethereum Foundation** (CROPS/Anon-RPC): not in the three picks. FaceValue's privacy story could fit CROPS, but the registry is not a censorship-resistance product and the three picks are full.
- **Definitive / Flash**: mainnet-only; incompatible with the no-mainnet constraint.
- **Arkiv**: cut on 6 Nov. Not built, not claimed, not a fallback. The hours went to the dispute loop.
- **World Agent Pass**: stretch only; the primary World claim is IDKit.
- **Hedera Tokenize with Studios**: not our use case; x402 is the fit.
- **No-Solidity ($2,000)**: forgone — we ship a bond contract. Stated out loud rather than quietly omitted.
- **ENS "Integration into an existing project"**: Continuity-only; not eligible for a from-scratch team (S2/S1).
- **World Continuity tracks**: not eligible for a from-scratch team (S2).

---

## 5. The 20-hour build plan

**Assumptions:** solo; ~20 focused hours; 4 hours sleep; testnet only; no mainnet deployment; the demo is recorded before the final submission crunch. The clock starts at **05:30 IST Friday 6 Nov 2026**; the hard deadline is **09:00 IST Saturday 7 Nov** (S5). Submit by **08:00**, one hour early.

### 5.1 Hour-by-hour

| Window | Hours | Work | Output | Gate |
|---|---|---|---|---|
| Fri 05:30–06:30 | 1 | Repo, env, accounts: World app, Hedera testnet account, ENS Sepolia name, facilitator key, face model download, **contract deploy key**; fund the burner wallet with Sepolia ETH and the Hedera accounts with testnet HBAR | `.env.example`, skeleton, credentials checklist | — |
| Fri 06:30–08:30 | 2 | **Spike 1: face generation + matching** — InsightFace embed, cosine match, template/face-swap pipeline, one generated ad | A real ad with a test face; match score | **G1 at 08:30** |
| Fri 08:30–11:30 | 3 | **Spike 2: ENSv2 Sepolia** — register parent + human subname, write records incl. `status`/`verified`/`bond-tx`, grant scoped roles, license subname with expiry, dry-run a controller reassignment | ENS explorer links; a script that reproduces registration + move | **G2 at 11:30** |
| Fri 11:30–12:15 | 0.75 | Lunch | — | — |
| Fri 12:15–14:45 | 2.5 | **Spike 3: World IDKit + live capture** — RP signature server-side, IDKit request, backend verify, nullifier store, browser camera capture, 1:1 match against a test reference, success + cancel | Verified proof in the backend; a real capture-to-reference score; failure path | **G3 at 14:45** |
| Fri 14:45–17:45 | 3 | **Spike 4: Hedera** — HCS topic, HTS NFT, x402 endpoint, facilitator verify/settle, bond escrow transfer, agent script | A settled testnet payment + a bond tx + HashScan links | **G4 at 17:45** |
| Fri 17:45–18:05 | 0.3 | **Vendor check (20 min):** does a hosted liveness vendor return a reference image/embedding we can compare? | Go/no-go for fix A; record the answer | **A-gate** |
| Fri 18:05–18:45 | 0.7 | Dinner | — | — |
| Fri 18:45–20:45 | 2 | **B+C: provisional + bond + challenge** — status gate, registration bond, reference freeze, challenge capture + match, ENS controller move, bond move, nullifier block, HCS messages | A winning challenge moves the name and the bond; a losing one forfeits the bond | **G5 at 20:45** |
| Fri 20:45–23:45 | 3 | **Core loop + wiring** — dashboard, agent console, clearance API, report page, failure panel; connect the spikes | End-to-end: register → provisional → deny → challenge → win → pay → generate → check | — |
| Fri 23:45–03:45 | 4 | Sleep | — | — |
| Sat 03:45–04:45 | 1 | **Fix A only if the vendor gate passed**; otherwise polish + failure paths + evidence PDF | `verified` at registration, or a stronger failure panel | — |
| Sat 04:45–06:30 | 1.75 | **Demo video 3:00** + README + `INTEGRATION.md` | Video uploaded; repo docs complete | — |
| Sat 06:30–07:30 | 1 | Submission form, 3 picks, link checks, incognito test | Submitted | — |
| Sat 07:30–08:30 | 1 | Buffer / final fixes; submit by 08:00 | — | — |

**Total scheduled:** ~21.5 hours including the 1-hour buffer; 0.75h lunch + 0.7h dinner + 4h sleep. The build/submission work is ~20 hours after the 20-minute vendor check.

### 5.2 The five gates (do these before UI)

1. **Face generation + matching (2h).** The "wow" depends on a real image of the judge. Use InsightFace for detection/embedding and a local face-swap/template pipeline for the ad. If a hosted generation API is faster, use it only if it has a no-retention policy; otherwise keep it local. **Fallback:** a polished template + face composite; disclose "demo generator uses a template + face swap." Do not spend 4 hours chasing model quality.
2. **ENSv2 Sepolia (3h).** Follow S47: ENSjs ≥ 4.2.3 + viem ≥ 2.35.0; test `ur.integration-tests.eth`; register a parent; write a record; grant a scoped role; create an expiring license subname; **dry-run the controller reassignment** for the challenge. **Fallback:** if writes fail, drop ENS from the picks; keep ENSv1 Sepolia names for the demo; picks = World + Hedera only.
3. **World IDKit + live capture (2.5h).** Server RP signature; IDKit request; backend verify; nullifier; browser camera capture; 1:1 match against a test reference; success + cancel. Use the simulator/mocked proofs; label them. **Fallback:** if IDKit is blocked, use the simulator link and a clearly labelled mock; if the integration still fails, drop World (picks = ENS + Hedera).
4. **Hedera x402 (3h).** HCS topic + HTS NFT + one x402 endpoint + agent payment. **Fallback:** a direct HBAR transfer for the licence payment, claim nothing on Hedera beyond the demo. Do not fake a settled payment. *(The bond contract is separate — see gate 5.)*
5. **Dispute loop + bond contract (3h, G5).** Deploy `FaceValueBond.sol`; provisional status, registration stake, frozen reference, challenge capture/match, ENS move, contract-enforced payout, nullifier block. **Fallback:** if the move or the match is not on camera, ship provisional + stake + agent denial only; do not claim seizure. Say the challenge is not demoed. Multi-challenger and the tier-2/tier-3 review path are **not** in this block; they are specified in `docs/dispute-spec.md` and only built if G5 goes green early.

### 5.3 Cut list (in order)

1. Fix A (only if the vendor gate fails or the 20-minute check is not conclusive).
2. Agent Pass.
3. Invisible watermark / C2PA manifest.
4. ENSIP-25/ERC-8004 registration.
5. Discovery integrations (PimEyes/Yandex/Google Lens); the report flow is enough.
6. Fancy UI polish; the demo needs clarity, not decoration.
7. Multi-tenant resolvers; one human + one agent is enough for the demo.
8. HTS custom fees / revenue split on-chain; do it in the app.
9. The standalone revoke beat in the video (keep the feature; cut the beat).
10. Mobile; no.
11. Admin console; no.

### 5.4 Contingencies

| If this fails | Then |
|---|---|
| ENSv2 Sepolia writes | Drop ENS; picks = World + Hedera. Keep ENSv1 names for the demo; say "ENSv2 not claimed." Do **not** add Arkiv. |
| World IDKit | Use the simulator + labelled mock; if still blocked, drop World; picks = ENS + Hedera. |
| Hedera x402 facilitator | A direct HBAR transfer for the licence payment; claim nothing from Hedera. x402 was the only claimable Hedera track.
| Face generation | Template + face composite; disclose; the product is the licence, not the model. |
| Face matching | Use a hosted face API or a simpler embedding; if no match, the demo is not credible — this is a hard gate. |
| Dispute loop | Ship provisional + bond + agent denial; do not claim seizure; say the challenge is not on camera. |
| Liveness vendor (fix A) | No comparable reference returned → do not build A; UI says `provisional` / `uncontested`; never "verified". |
| Time | Submit the minimum loop: provisional → challenge → licence → check, with ENS + World + Hedera HCS/HTS; drop the report page, revoke beat, Agent Pass, and polish. A working 80% with a video beats a missing 100% (S5). |

---

## 6. Demo script — 3:00

**Constraints:** ETHGlobal wants 2–4 minutes and hard-fails above 4 (S5); Hedera wants ≤5 (S4); target **3:00**. ≥720p; no phone recording; no sped-up footage; no music-and-text-only; no TTS/AI voiceover (S5). Record with a real voice and a screen capture.

| Time | Beat | On screen |
|---|---|---|
| 0:00–0:15 | **Problem.** "Your face is already in the models. You have no price, no permission, and no receipt." Show one generated ad with a face; "This is not a deepfake detector. It is a licence check." | A polished ad image; one sentence |
| 0:15–0:35 | **Squatter registers Alice.** Upload Alice's photo (demo actor, with permission), pass World ID (mocked, labelled), post the bond, mint `alice.facevalue-demo.eth`. The record is `PROVISIONAL` and `UNVERIFIED`, with a bond tx and a challenge deadline. | Browser + ENS explorer |
| 0:35–0:50 | **Agent denied.** The agent resolves the name, calls the endpoint, and gets `409 PROVISIONAL` — no payment request, no ad. "A squatter can take the name, not the money." | Agent console + status |
| 0:50–1:25 | **Challenge — the climax.** Alice clicks "This is me", passes World ID (mocked, labelled) and a live capture; the server matches her face to the **frozen** reference (0.9x); the ENS controller/records move to Alice; the bond moves to Alice; the squatter's nullifier is blocked; status flips to `ACTIVE` (not "verified"). Say the line: "We don't prove the face at signup. We prove possession when it's disputed." | Challenge screen + ENS before/after + HCS + bond tx |
| 1:25–1:50 | **Agent pays.** The agent resolves, calls the endpoint, gets `402`, pays 0.25 HBAR via x402 on Hedera testnet, receives the ad. Show HashScan + HCS sequence. | Agent console + HashScan |
| 1:50–2:15 | **Rogue ad.** Upload a pre-made ad using Alice's face without a licence. The gate matches (0.93), finds no licence, returns `UNLICENSED` + evidence. Show the report PDF. | Platform gate + evidence |
| 2:15–2:35 | **Licensed ad passes.** The same gate, the same face, a licensed output: `LICENSED` with the licence id and expiry. This is the product in one comparison. | Gate panel, side by side |
| 2:35–2:50 | **Restraint.** A lookalike/unknown face returns `UNKNOWN`, not an accusation. An expired licence returns `EXPIRED`. A match on a provisional record returns `UNLICENSED` with `record: provisional`. | Gate panel |
| 2:50–3:00 | **Honest limits.** "Registration can be seized and reclaimed; it cannot be pre-proven. We don't scan the world. We check at the generator, at the platform, and on report. Private generations are invisible. Coincidental lookalikes are not automatically your face. World proofs here are mocked." Close: "Your face, your price, your permission." | Three captions + logo |

**Demo integrity:**
- The rogue ad and the squatted reference use the demo actor's face **with their permission**; no real person is impersonated. Say this in the video or README.
- World ID proofs are mocked at the event (S2); label them on screen. Both the squatter's proof and Alice's challenge proof are mocked.
- The payment and the bond are real Hedera testnet transfers; show both transaction IDs.
- The face match is real; do not hard-code the verdict. Show the score and the threshold band.
- The challenge capture is live in the recording; if it is pre-recorded, say "recorded" on screen.
- Never write "verified likeness" on screen. Use `provisional`, `uncontested`, or `verified at registration` (only after fix A).
- If a live step fails, cut to the recorded segment and say "recorded"; do not fake it.

---

## 7. Submission checklist

### 7.1 Repo

```text
/
├─ README.md                 # what, setup, architecture, live demo, ENS name,
│                            # Hedera topic/token/tx IDs, **bond contract address**,
│                            # 3 picks, honest limits, AI-use statement
├─ AI_USAGE.md               # which files/parts were AI-assisted (S5)
├─ INTEGRATION.md            # World debrief: time, friction, missing, improvement (S2)
├─ docs/                     # keep the plan/spec artifacts (S5 spec-driven rule)
├─ apps/web/                 # consumer, challenge, agent, platform, report
├─ packages/core/            # face, ENS, World, Hedera, bond, license
├─ scripts/                  # create-topic, create-nft, create-escrow,
│                            # register-ens, post-bond, seed, verify
├─ .env.example              # names only
└─ LICENSE                   # MIT/Apache-2.0
```

### 7.2 Track artefacts

- **ENS:** live demo link; open-source repo; ENSv2 Sepolia name + licence subname; the **challenge move** before/after with explorer links; a transaction/explorer link; functional, not hard-coded.
- **World:** IDKit success + meaningful failure path; server-side verification; `INTEGRATION.md`; mocked proofs labelled; the challenge's second unique-human check.
- **Hedera:** x402 endpoint; agent paid request; Hedera transaction ID in README; HashScan link; HCS topic ID; HTS token ID; **bond contract address + a resolve tx**; HCS `challenge.*` sequences; README; ≤5 min video (our 3:00). No-Solidity is **not claimed**.
- **Arkiv:** not claimed, no `/arkiv/*.md` files. Do not imply it is used.

### 7.3 Final checks (T-90 minutes)

- [ ] Repo public, open-source license, commit history spread across the event (S5 warns single-commit uploads can be disqualified).
- [ ] `README.md` has setup, architecture, demo link, wallet addresses, ENS name, Hedera IDs, **bond contract address**, the 3 picks, and the honest limits.
- [ ] `AI_USAGE.md` written; spec/planning artifacts included.
- [ ] `INTEGRATION.md` written with real timings.
- [ ] No `.sol` file anywhere.
- [ ] No secret in the repo or client bundle; `.env` ignored.
- [ ] No "verified likeness" string anywhere unless fix A actually shipped; UI says `provisional` / `uncontested`.
- [ ] Video is 3:00, ≥720p, audio clear, no TTS, no phone recording, link works in incognito.
- [ ] Three picks selected: **ENS, World, Hedera** (S5).
- [ ] Submitted before **09:00 IST, Sat 7 Nov 2026** (S5); target **08:00**.

---

## 8. Risks and open questions

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | ENSv2 Sepolia write path is harder than expected | Medium | High (loses $7k pick) | Spike at Hour 3; fallback to World + Hedera; ENSv1 names for the demo; no Arkiv |
| 2 | Hedera x402 facilitator onboarding fails | Medium | High (loses $6.5k) | Spike at Hour 6; fallback to a direct HBAR licence payment; write off the Hedera pick |
| 3 | Face generation looks bad or is slow | Medium | Medium (weak wow) | Template + local face swap; pre-generate the ad; disclose |
| 4 | World IDKit setup eats time | Medium | Medium | Simulator/mocked proofs; spike at Hour 5; fallback to dropped World |
| 5 | Face match false positive on a lookalike | Medium | Medium (ethics) | `unknown`/`possible_match` bands; human review; no auto-accusation |
| 6 | Platform ignores the verdict | High (in the real world) | Medium | Report flow; B2B sales; start with one platform |
| 7 | Rogue model never publishes | Certain (out of scope) | Low (honest limit) | Say it on stage; don't overclaim |
| 8 | Legal claim on a random lookalike is weak | Medium | Medium | Focus on identifiable commercial use; evidence, not legal advice |
| 9 | Biometric privacy/compliance | Medium | High (long-term) | Consent, retention limits, deletion, encrypted vault; production legal review |
| 10 | Time | High | High | 20h plan with gates; cut Agent Pass/fix A; submit by 08:00 |
| 11 | **A squatter registers you and the dispute loop is not built** | Medium | High (honest claim collapses) | B+C is a G5 gate; if it fails, ship provisional + bond + agent denial and say the challenge is not on camera. Never imply seizure works |
| 12 | **Challenge false negative (real person loses) or false positive (lookalike wins)** | Medium | High (injustice) | Ambiguous band → `review`, bonds held, human review; evidence bundle; no automatic transfer |
| 13 | **Fix A vendor returns only pass/fail, not a comparable reference** | High | Low (stretch) | 20-minute check; if no reference, skip A and never say "verified" |
| 14 | **Bond contract bug (locked or mispaid stakes)** | Low | High (demo breaks publicly) | Keep the contract ~70 lines; use the pull pattern; test stake → challenge → resolve → withdraw on testnet before recording; the contract has no owner-withdraw path |
| 15 | ENS mainnet/Sepolia contradiction confuses judges | Low | Low | Say "Sepolia, which the track allows" (S1/S47) |
| 16 | **The World simulator cannot produce two distinct mocked identities** (squatter + Alice) | Medium | High (the challenge demo breaks) | Test at G3; fallback: two actions/app_ids if supported, or clearly labelled simulated identities; never claim uniqueness enforcement that the demo does not show |

**Open questions to resolve in the first hour:**
1. Does the ENSv2 Sepolia app support the parent + subname + scoped-role writes we need, **and can we reassign a subname to a challenger's wallet** without raw contract work?
2. Which Hedera x402 facilitator has testnet support today, what asset does it accept (HBAR/USDC/HTS), and does it settle to an account we control?
3. Does the World ID simulator work for the event's mocked proofs, what `app_id`/`rp_id` do we use, does `selfieCheck` fit the challenge gate (S12), and **can we produce two distinct mocked identities** (the squatter and Alice) so the challenge and the nullifier block are real?
4. Which face model fits the laptop's CPU/GPU budget, and what threshold separates the demo faces? What is the challenge band (match / review / reject)?
5. **The 20-minute liveness-vendor check:** does the vendor return a reference image/embedding we can compare, or only a pass/fail? If only pass/fail, fix A is dead.
6. **Is a face embedding + published threshold defensible on stage as the identity decider?** It is the honest answer (§1.4 R); do not let a bid for "AI resolution" replace it with something a judge cannot reproduce.
7. **Who holds the multisig that resolves the gray band?** **Resolved:** three resolver addresses, **2-of-3** quorum, the role transferable with both signatures (`docs/dispute-spec.md` §4a). The demo runs three browser profiles with three burner wallets. Label it "demo arbitration", never decentralised governance.
6. Is there a name collision on "FaceValue" that matters for the submission? (Working title; check before the video.)

---

## 9. Sources

All S-ids are from `docs/sources.md`, captured **2026-11-05**. Prize amounts/rules are as published then; ETHGlobal can change them.

### 9.1 Event and tracks

| ID | URL | Used for |
|---|---|---|
| S1 | https://ethglobal.com/events/mumbai/prizes | Prize index; ENSv2 track ($7,000) and requirements; finalist block |
| S2 | https://ethglobal.com/events/mumbai/prizes/world | World IDKit ($2,500), Agent Pass ($5,000), requirements, mocked proofs, debrief |
| S3 | https://ethglobal.com/events/mumbai/prizes/arkiv | Arkiv Build on Arkiv ($4,000) — **cut 6 Nov; retained for citation only** |
| S4 | https://ethglobal.com/events/mumbai/prizes/hedera | Hedera x402 ($6,500), No-Solidity ($2,000), requirements |
| S5 | https://ethglobal.com/events/mumbai/info/details | Deadline, 3 picks, from-scratch rule, AI attribution, 5 judging criteria, demo rules |

### 9.2 ENSv2

| ID | URL | Used for |
|---|---|---|
| S47 | https://docs.ens.domains (local `md/ens-full.txt`) | ENSv2 architecture; Sepolia runs ENSv2; mainnet pre-launch; EAC; Permissioned Resolver; library versions; expiry; traps |
| S48 | https://docs.ens.domains/ensip/25 · https://docs.ens.domains/ensip/26 | ENSIP-25 agent registration; ENSIP-26 `agent-context`/`agent-endpoint` (drafts) |

**Conflict note:** S1 says ENSv2 is live on mainnet; S47 says mainnet contracts are deployed ahead of launch and Sepolia runs ENSv2. We build on Sepolia, which S1 explicitly allows; say so on stage.

### 9.3 World ID

| ID | URL | Used for |
|---|---|---|
| S9 | https://docs.world.org/world-id/overview | World ID overview; privacy; uniqueness |
| S10 | https://docs.world.org/world-id/idkit/integrate | IDKit contract; server-side RP signature; backend verify; nullifier storage |
| S12 | https://docs.world.org/world-id/idkit/credentials | Credential presets; Selfie Check (medium-assurance liveness + facial similarity); `signal` binding; **the line "World matches the user's live selfie to the credential image"** — the citation for the registration gap, not S1 |
| S13 | https://docs.world.org/world-id/idkit/verification-flows | Hot/cold/semi-cold; demo constraints |
| S14 | https://auth.world.org/docs | Agent Pass/OIDC; pairwise `sub`; fresh authentication |

### 9.4 Hedera

| ID | URL | Used for |
|---|---|---|
| S23 | https://docs.hedera.com/llms.txt | `@hiero-ledger/sdk`; terminology rules |
| S24 | https://docs.hedera.com/learn/core-concepts/tokens/hts-overview | HTS native tokens; keys; KYC/freeze |
| S26 | https://docs.hedera.com/native/consensus/create-topic | HCS topic; submit key |
| S27 | https://docs.hedera.com/native/consensus/submit-message | HCS message sequencing |
| S28 | https://docs.hedera.com/native/tokens/define | HTS token creation |
| S29 | https://docs.hedera.com/operators/mirror-node/ | Mirror Node REST testnet |
| S30 | https://docs.hedera.com/native/index | SDK install |
| S37 | https://docs.hedera.com/solutions/ai/x402/how-it-works | x402 flow; facilitator fee payer; limits |
| S38 | https://docs.hedera.com/solutions/ai/x402 | x402 HBAR/HTS; HTTP 402 |
| S46 | https://docs.hedera.com/native/tokens/custom-fees | Custom-fee direction trap; avoid for the demo |

### 9.5 Arkiv — not used

Arkiv (S3, S15–S22) was cut on **6 Nov 2026**. The source rows remain in `docs/sources.md` for citation integrity, but this build does not write to Arkiv, does not ship `/arkiv/*.md`, and does not claim the prize.

### 9.6 Technical sources (not in the repo registry)

These are **new** external sources used for the face-matching/generation claims, not hackathon rules. Fetch/verify before relying on them.

| Source | URL | Used for |
|---|---|---|
| ArcFace paper | https://arxiv.org/abs/1801.07698 | Additive angular margin loss; face embedding background |
| InsightFace | https://github.com/deepinsight/insightface | Open-source face detection/embedding/swap toolkit |
| C2PA | https://c2pa.org/ | Content provenance standard; optional sidecar/manifest direction |
| x402 | https://github.com/x402-foundation/x402 | Protocol repo; client/server flow reference |

**Claims I am not making:**
- No source says a face-match score is a legal determination; that is ⟨ours⟩ and a legal-review item.
- No source says a coincidental lookalike is actionable; laws vary; the product produces evidence, not conclusions.
- No source says a World ID nullifier is safe to publish; we keep it server-side.
- No source says a liveness vendor returns a reference image/embedding; that is why fix A is vendor-gated, not assumed.
- No source says a bonded challenge is a legal remedy; it is a product mechanism with a human-review fallback.
- No source says the demo generator's output is a production-grade synthetic image; the demo uses a template/face-swap pipeline and says so.
- No market-size claims; the business model is a design hypothesis, not fetched TAM data.

---

## 10. Decisions locked / next actions

**Locked:**
1. Idea: **FaceValue** — likeness rights registry + clearance API, not a global detector.
2. Picks: **ENS + World + Hedera**. **Arkiv is cut** — not built, not claimed, not a fallback.
3. Primary tracks: **ENSv2 $7,000**, **IDKit $2,500**, **x402 $6,500**; stretch: **Agent Pass $5,000**. **No-Solidity forgone** (−$2,000) because of the bond contract.
4. Binding ladder: **L2 = B + C** (provisional + bond + dispute-time possession) is core. **L3 = A** (registration-time liveness match) is a 1h stretch, only after the 20-minute vendor check.
5. Demo: squatter registers Alice → provisional + bond + agent denied → Alice challenges live → ENS record + bond move → agent pays → rogue ad flagged → licensed ad passes; 3:00 video.
6. Build: ~20 hours, five kill gates (G1 face, G2 ENS, G3 World, G4 Hedera, G5 dispute), submit by **08:00 IST Sat 7 Nov**.

**Next actions (in order):**
1. Create the repo skeleton + `.env.example`; confirm World app, Hedera testnet account, ENS Sepolia name, facilitator, face model, and a deploy key for the bond contract.
2. Run Spike 1 (face) and Spike 2 (ENSv2, including the controller move) before writing UI.
3. If both green, run Spike 3 (World + live capture) and Spike 4 (Hedera + bond escrow).
4. Run the 20-minute liveness-vendor check; decide fix A (yes/no) before Sat 03:45.
5. Build B+C (G5), then the loop; record the demo; write the docs; submit.
6. At T-2h, choose the three picks from evidence. Do not add Arkiv. Do not claim "verified" without fix A.

**The line to say on stage:** "We don't prove the face is yours at signup. We make signup provisional, and we prove possession when it's disputed — by the face itself. A squatter can register you once, with a bond; you take it back with a live check. We don't find every face in the world; we make the legitimate use easy and paid, and we check the commercial uses that matter. The random Russian's private generation is invisible to everyone; if he publishes it where the check runs, we catch it; if you find it, we handle it."

---

## 11. Amendment log — dispute model (6 Nov 2026)

> Written while §1–§10 were still being drafted by another agent. Read this before re-editing §1.4, §2.2, §2.3 or §3.9: the changes below are deliberate, and reverting them quietly will re-introduce a design flaw.

**Why this changed.** The question that opened it: *when several people dispute one likeness, who wins, and who is paid?* The original text allowed only **one open challenge per likeness** and said the winner "gets their own bond back plus the registrant's bond". That is correct for one challenger and silent for three.

**What changed, and where:**

| # | Change | Section | Why |
|---|---|---|---|
| 1 | **Many challengers may be open on one likeness at once**; each resolves independently against the face | §1.4 B2, §2.2, §2.3 A2 | A real dispute can have several claimants |
| 2 | **New likeness status `moved`** (seized), distinct from `active` (defended) | §2.2, §2.3 A2 | "The controller changed hands" is a different outcome from "the challenge failed", and the platform gate must tell them apart |
| 3 | **Payout follows the face, not the count**: whoever the face identifies takes every stake | §1.4 B2, §2.2 Bond | Symmetric in both directions; see the rejected alternative below |
| 4 | **Resolution ladder R**: deterministic face match → evidence bundle → multisig, with the threshold bands written down (`≥ 0.65`, `< 0.45`, else review) | §1.4 R | Makes the decider reproducible and publishable |
| 5 | **An LLM may summarise evidence, never return the verdict** | §1.4 R, §3.9, What we do not claim | "We asked a model" is not a defensible answer to how identity was decided |
| 6 | `review` state also blocks licensing (`409`) | §2.3 Flow B | A record under human review is not a licence |

**Rejected: majority of challengers decides.** If three challengers beat one registrant by count, then three colluding strangers can seize any face by staking against it. The stake stops being a cost of attacking and becomes a vote, and a vote is not a face test. This is why the count is inert and the embedding decides.

**Rejected: adopting UMA's contracts.** UMA's Optimistic Oracle V3 is on Ethereum Sepolia, the same chain as our ENS work, and its *pattern* — a bonded claim that settles optimistically unless disputed — is the model we copied for the resolution ladder. Its *contracts* were not adopted because their DVM resolves on Ethereum **mainnet** with a ~48h commit-reveal vote, which cannot finish before the Saturday 09:00 deadline, and their escalation game is one-assertion-to-one-dispute, so a B/C/D case still needs a custom aggregation contract. Net: cost without a demo-able benefit. **We do write our own, much smaller contract** — see the next entry.

**Accepted: one bond contract, and No-Solidity forgone (−$2,000).** Custody was the deciding argument: without a contract the bonds sit in a service account and the 2-of-3 review quorum lives in a SQL table, which means the *money* layer trusts us while the *registry* layer (ENS) does not. A judge asking "who holds the bonds" would get an answer that contradicts the product's own claim. `contracts/FaceValueBond.sol` (~70 lines, Hedera EVM testnet) now holds stakes, enforces one stake per address per likeness, splits payouts atomically, and requires 2-of-3 approvals for the gray band. The contract **never decides identity**: it takes `faceWins: bool` from the match. Cost booked: the "No Solidity Allowed" $2,000 track, which audits for zero `.sol` files. Full spec: `docs/bond-contract.md`.

**Rejected: "upload your World ID verification photo".** There is no API for it. The World verifier compares the live selfie against the credential image **inside World** and returns only `signal_hash`, `nullifier` and `sybil_score` (§4.3, S12). Asking a user to upload a selfie alongside a proof adds no information the attacker cannot forge. The substitute is a face **we** capture live and match ourselves, with World ID gating that a unique human is present.

**Unchanged and still true:** registration is provisional and can never be pre-proven; the reference is frozen at signup; there is no monetisation while `provisional`; the loser's nullifier is blocked; Arkiv is cut; picks are ENS + World + Hedera.

**Full mechanics:** `docs/dispute-spec.md` — state machine, storage, events, payout table, tier thresholds and the 2-of-3 resolver set. `docs/bond-contract.md` — the contract interface, storage layout, access control and test plan.
