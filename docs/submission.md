# Submission layer — FaceValue

The plan in `plan-facevalue.md` only converts to money if the paperwork matches what each partner says it will read. This file is the operational checklist.

**Picks: ENS + World + Hedera.** Arkiv is cut; do not add `/arkiv/*.md` or claim it.

---

## 1. The three picks and exactly what each one demands

### Pick 1 — ENS (S1)

**Track:** Best Use of ENSv2 — $7,000 ($3k / $2k / $1k / $1k).

| Requirement (intent from S1) | Where we satisfy it |
|---|---|
| ENSv2 on Ethereum mainnet **or Sepolia**; ENSv2 is central, not cosmetic | The likeness **is** an ENS name; the licence is an expiring subname; the challenge **moves the controller/records** |
| Functional demo, not hard-coded | Real ENSv2 Sepolia writes: parent, human subname, licence subname, records, role grant, controller move |
| Live demo link + open-source repo | README + video + public repo |
| Bonus: AI agents | The agent resolves the name, reads the endpoint, pays over x402 |

**Status caveat:** S1 says ENSv2 is live on mainnet; S47 says mainnet contracts are deployed ahead of launch and **Sepolia runs ENSv2**. We build on Sepolia, which the track allows, and say so on stage. Do not hardcode the Universal Resolver; test `ur.integration-tests.eth` → `0x2222…2222` (S47).

### Pick 2 — World (S2)

**Tracks under one pick:** Best Use of IDKit — $2,500 (2 × $1,250); Agent Pass — $5,000 (stretch).

| Requirement (intent from S2) | Where we satisfy it |
|---|---|
| Integrate IDKit in a functioning app, at least one supported credential | IDKit proof of human at registration **and** at challenge |
| Verify server-side; never trust the client | Backend verify at `POST https://developer.world.org/api/v4/verify/{rp_id}`; check `success === true` and `environment` (S10) |
| Explain the specific trust event and why it is the minimum sufficient assurance | "A unique human makes a claim on a likeness; a different unique human can contest it." World proves uniqueness, not photo ownership — say the gap out loud (S12) |
| Demonstrate a meaningful alternative path | Cancel, replay/duplicate nullifier, losing challenge, provisional record denial |
| Short integration debrief | `INTEGRATION.md`: time to first success, friction, missing capability, one improvement |
| Agent Pass (stretch) | OIDC, pairwise `sub`, mandate scope/budget/expiry; denied/expired path |

**Proofs are mocked at the event** ("We are mocking proofs now… DO NOT rely on them for production" — S2). Label them on screen.

### Pick 3 — Hedera (S4)

**Tracks under one pick:** AI Agents That Pay: x402 — $6,500; "No Solidity Allowed" — $2,000 (2 × $1,000).

| Requirement | Where |
|---|---|
| At least one x402-protected endpoint settling on Hedera testnet through a facilitator | `POST /api/generate` returns `402`; agent pays; facilitator `/verify` + `/settle` |
| Agent completes a paid request end to end, **no human approving** | Agent script: resolve ENS → call → pay → retry → save output |
| Public repo; README with setup, architecture, payment flow, settled tx ID | README |
| Demo ≤5 min showing payment settling + HashScan link | Our 3:00 video |
| No-Solidity: JS/TS or Python SDK, no Solidity, ≥2 native services | `@hiero-ledger/sdk`; zero `.sol`; HCS + HTS + native HBAR bond escrow |
| No-Solidity extras: Mirror Node REST, creative HCS, key management | Mirror Node read; `challenge.*` HCS messages; submit/escrow keys server-side |

**Naming rules:** `@hiero-ledger/sdk` (not `@hashgraph/sdk`); "Hedera testnet" lowercase; "HBAR" uppercase; do not call Hedera a "blockchain" (S23).

**Do not fake a settled payment.** If the facilitator is down, fall back to No-Solidity only and say so.

---

## 2. Repo layout at submission time

```text
/
├─ README.md                 # what, setup, architecture, demo link, ENS name,
│                            # Hedera topic/token/tx IDs, bond escrow account,
│                            # 3 picks, honest limits, AI-use statement
├─ AI_USAGE.md               # which files/parts were AI-assisted (S5)
├─ INTEGRATION.md            # World debrief: time, friction, missing, improvement (S2)
├─ docs/                     # planning/spec artifacts (S5 spec-driven rule)
├─ apps/web/                 # consumer, challenge, agent, platform, report
├─ packages/core/            # face, ENS, World, Hedera, bond, licence
├─ scripts/                  # create-topic, create-nft, create-escrow,
│                            # register-ens, post-bond, seed, verify
├─ .env.example              # names only, never values
└─ LICENSE                   # MIT/Apache-2.0
```

Keep `docs/` in the submission: ETHGlobal's spec-driven-development clause requires all spec files, prompts, and planning artifacts (S5).

**No `arkiv/` directory.** Arkiv is not claimed.

---

## 3. `INTEGRATION.md` template (World asks for this explicitly)

Four questions, answered in numbers, not adjectives:

```markdown
## Time to first success
<minutes> from reading docs to a verified proof on the backend. <which step took longest>

## Friction encountered
1. <step> — <what we expected> — <what happened> — <repro steps / link>
2. ...

## Missing capability
<the one thing we needed and could not find documented>

## The one improvement with the greatest impact
<single change; say why it would help every team after us>
```

Fill this from the real timeline, not from memory.

---

## 4. Demo — 3:00, one take, real failure paths

Constraints: ETHGlobal wants 2–4 minutes and **hard-fails above 4** (S5); Hedera wants ≤5 (S4). Record at ≥720p; no sped-up footage, no phone-camera recording, no TTS/AI voiceover, no music-and-text-only.

| Time | Beat |
|---|---|
| 0:00–0:15 | Problem: your face is in the models; no price, no permission, no receipt. "Not a deepfake detector — a licence check." |
| 0:15–0:35 | **Squatter registers Alice**: photo + mocked World ID + bond → `PROVISIONAL` / `UNVERIFIED`, bond tx, challenge deadline |
| 0:35–0:50 | **Agent denied**: `409 PROVISIONAL`; no payment request, no ad |
| 0:50–1:25 | **Challenge — climax**: Alice passes mocked World ID + live capture; face match to the frozen reference; ENS record + bond move; squatter's nullifier blocked; `ACTIVE` (not "verified") |
| 1:25–1:50 | **Agent pays**: `402` → 0.25 HBAR via x402 on Hedera testnet → ad; HashScan + HCS sequence |
| 1:50–2:15 | **Rogue ad**: gate matches 0.93, no licence → `UNLICENSED` + evidence PDF |
| 2:15–2:35 | **Licensed ad passes**: same gate → `LICENSED` with licence id + expiry |
| 2:35–2:50 | **Restraint**: lookalike → `UNKNOWN`; expired → `EXPIRED`; provisional match → `UNLICENSED` with `record: provisional` |
| 2:50–3:00 | **Honest limits**: registration can be seized and reclaimed, not pre-proven; no world crawl; private generations invisible; World proofs mocked |

Full script and integrity rules: `plan-facevalue.md` §6.

---

## 5. What we deliberately did not build

Say this in Q&A; it reads as judgement, not a gap.

| Not built | Why |
|---|---|
| Arkiv ledger ($4,000) | Cut 6 Nov; no fourth pick, and the hours went to the dispute loop |
| Registration-time liveness (fix A) | Only if a 20-minute vendor check confirms it returns a comparable reference image/embedding; otherwise the UI stays `provisional` |
| Agent Pass ($5,000) | Stretch; the primary World claim is IDKit |
| Invisible watermark / C2PA | Sidecar + visible badge is enough for the demo |
| Global crawler / PimEyes / Google Lens | Discovery is the impossible part; report flow is the honest long-tail sensor |
| Mobile, account recovery, admin console | Out of scope |
| Production escrow / non-custodial wallet | Demo uses a service escrow and testnet keys; disclosed |
| HTS custom-fee revenue split | Do it in the app; the receiver-pays trap is not worth the demo risk (S46) |

---

## 6. Pre-submission checklist (T-90 minutes)

- [ ] Repo public, open-source licence, commit history spread across the event (S5 warns that single-commit uploads can be disqualified)
- [ ] `README.md` has setup, architecture, demo link, wallet addresses, ENS name, Hedera IDs, bond escrow account, the 3 picks, and the honest limits
- [ ] `AI_USAGE.md` written, naming which files were AI-assisted (S5)
- [ ] `INTEGRATION.md` written with real timings (S2)
- [ ] No `.sol` file anywhere (S4)
- [ ] No secret in the repo or client bundle; `.env` ignored
- [ ] **No "verified likeness" string anywhere unless fix A actually shipped.** UI says `provisional` / `uncontested`
- [ ] ENS artefacts: parent, human subname, licence subname, challenge move before/after, explorer links
- [ ] World artefacts: IDKit success + failure path, server-side verification, mocked proofs labelled
- [ ] Hedera artefacts: x402 endpoint, settled tx ID, HashScan link, HCS topic ID, HTS token ID, bond tx, no `.sol`
- [ ] Video is 3:00, ≥720p, audio clear, no TTS, no phone recording, link works in an incognito window
- [ ] Three picks selected on the form: **ENS, World, Hedera** (S5)
- [ ] Submitted before **09:00 IST, Sat 7 Nov 2026** (S5); target **08:00**
