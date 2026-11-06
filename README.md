# FaceValue — likeness rights registry + clearance API

Hackathon entry for [ETHGlobal Mumbai 2026](https://ethglobal.com/events/mumbai/prizes) (5–7 Nov 2026). Everything factual is traced to a numbered source in [`docs/sources.md`](docs/sources.md); design choices with no source are labelled `⟨ours⟩`.

## The idea

Your face becomes a licensed API. A human registers a likeness, an AI agent pays per use through a licensed generator, and a platform can check any upload against the registry in one call.

The product is **not** a global face scanner. It detects the **absence of a licence** for a registered face at the points where content is generated or distributed, plus a report flow for the long tail. Private generations are invisible; a coincidental lookalike is not automatically your face.

## The honest claim (and the limit)

World ID proves a unique live human, not that the human owns the photo they uploaded. `signal = hash(photo)` is **coupling, not identity** — World compares the live selfie to the credential image inside its own verifier (S12), not to our reference.

So registration is **provisional**:

- one likeness per World ID nullifier;
- a testnet bond, posted to a service escrow account and logged on HCS;
- a public `provisional` / `unverified` badge;
- **no monetisation while provisional** — the agent is denied, so a squatter holds the name but not the business.

Possession is proven at **dispute time**: a challenger passes World ID and a live capture, their face is matched against the frozen registration reference, and on a win the ENS controller/records and the bond move to them while the squatter's nullifier is blocked.

> **Registration can be seized and reclaimed; it cannot be pre-proven.** We never write "verified likeness" unless registration-time liveness (fix A) ships.

Full reasoning, ladder, and failure modes: [`docs/plan-facevalue.md`](docs/plan-facevalue.md) §1.4.

## The clock

Today is **Fri 6 Nov 2026**. Projects are due **Sat 7 Nov 2026, 09:00 IST** (S5); we target **08:00**. Solo build, testnet only, no mainnet.

## The three picks (the form allows exactly 3 — S5)

| Pick | Tracks under it | Conservative | Stretch |
|---|---|---|---|
| **ENS** | Best Use of ENSv2 | $7,000 | — |
| **World** | Best Use of IDKit + Agent Pass | $2,500 | $7,500 |
| **Hedera** | x402 + "No Solidity Allowed" | $6,500 | $8,500 |
| **Total** | | **$16,000** | **$23,000** |

**Arkiv is cut.** Not built, not claimed, not a fallback. The hours went to the dispute loop — the feature that makes the honest claim true.

Prize math, exact requirements, and fallbacks: [`docs/prize-map.md`](docs/prize-map.md).

## What the demo shows

1. A squatter registers Alice's photo → `PROVISIONAL`, bonded, visibly unverified.
2. The agent is denied a licence → `409 PROVISIONAL`.
3. **Alice challenges with a live capture** → face match to the frozen reference → ENS record and bond move → squatter's nullifier blocked. This is the climax.
4. Alice licenses → agent pays 0.25 HBAR via x402 on Hedera testnet → ad.
5. A rogue ad is flagged `UNLICENSED`; a licensed ad passes the same gate.
6. Honest limits on screen.

Real ENS Sepolia writes, a real Hedera testnet payment and bond transfer, a real HCS audit trail, a real face match. World ID proofs are the event's **mocked** proofs (S2) and are labelled.

## Read in this order

| File | What it is |
|---|---|
| [`docs/plan-facevalue.md`](docs/plan-facevalue.md) | The plan: problem/limits, binding ladder, product, architecture, track map, 20-hour schedule, demo script, risks |
| [`docs/prize-map.md`](docs/prize-map.md) | 3-pick rule, exact track requirements, prize arithmetic, what we are giving up |
| [`docs/submission.md`](docs/submission.md) | Requirement-by-requirement checklist, repo artefacts, demo beats, pre-submission checks |
| [`docs/ensv2.md`](docs/ensv2.md) | ENSv2 reference: what changed, roles, resolvers, libraries, Sepolia traps |
| [`docs/world-agentpass.txt`](docs/world-agentpass.txt) | World Agent Pass / OIDC reference (stretch track) |
| [`docs/sources.md`](docs/sources.md) | S1–S48 source registry, conflicts found, claims deliberately **not** made |

Raw captures are in `text/` (ETHGlobal pages), `site/` (HTML), and `md/` (developer docs as Markdown), so any claim can be re-checked without a network.

## Next action

The critical path is **credentials and spikes, not UI**:

1. Repo skeleton + `.env.example`; World app, Hedera testnet account + bond escrow account, ENS Sepolia name, x402 facilitator, face model.
2. Spike 1 (face generation/matching, G1) and Spike 2 (ENSv2 writes + controller move, G2).
3. Spike 3 (World IDKit + live capture, G3) and Spike 4 (Hedera x402 + bond escrow, G4).
4. 20-minute liveness-vendor check → decide fix A (yes/no).
5. Build B+C (dispute loop, G5), then the core loop; record the 3:00 demo; submit.

## Honest caveats

- Prize rules and amounts are as published on 5 Nov 2026 and can change.
- World's prize page states the proofs at this event use **mocked, fake identities** and must not be relied on in production (S2). The demo says so on screen.
- Registration does not prove ownership. It is a bonded, challengeable claim that can be reclaimed by the face.
- The demo bond escrow is a custodial service account on testnet; production needs a real escrow/role design. Disclosed in the README and on stage.
- Face matching is biometric processing; the prototype uses testnet data and demo actors with permission. Production needs consent, retention limits, deletion, and legal review.
- Fix A (registration-time liveness) is not assumed. It is built only if a vendor returns a comparable reference image/embedding within the 20-minute check.
- These docs were produced with an AI coding agent, which ETHGlobal requires us to disclose (S5).
