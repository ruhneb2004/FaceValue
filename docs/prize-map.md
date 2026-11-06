# Prize map — FaceValue at ETHGlobal Mumbai 2026

Read this before choosing anything. Two rules dominate: **3 partner picks**, and **from-scratch only**.

## Rule 1 — 3 picks, and a partner is not a track

> "On the last step of the submission form, you can select up to 3 Partner Prizes to apply for. If a partner has multiple tracks, you can be eligible for all of them while only counting as 1 Partner Prize." — S5

So **World = 1 pick** (IDKit + Agent Pass), **Hedera = 1 pick** (x402 + No-Solidity), **ENS = 1 pick** (ENSv2). Three picks, three partners.

A fourth partner is a trade, not a bonus. **Arkiv is cut** (6 Nov 2026): not built, not claimed, not a fallback. The hours went to the dispute loop.

## Rule 2 — from-scratch only

> "Projects built before the event may still participate but won't qualify for partner prizes or the Finalist category." — S5

Every Continuity track is unreachable. The ones that matter here: World IDKit Continuity ($2,500), World Agent Pass Continuity ($2,500), ENS Integration into an existing project ($3,000). FaceValue is built from scratch.

## The three picks

| Pick | Tracks under it | Conservative headline | Stretch |
|---|---|---|---|
| **ENS** | Best Use of ENSv2 — $7,000 | $7,000 | — |
| **World** | Best Use of IDKit — $2,500; Agent Pass — $5,000 | $2,500 | $7,500 |
| **Hedera** | x402 — $6,500; "No Solidity Allowed" — $2,000 | $6,500 | $8,500 |
| **Total** | | **$16,000** | **$23,000** |

**Realistic target:** one track per partner — ENS ($3,000–$7,000), World IDKit ($1,250–$2,500), Hedera x402 ($1,500–$6,500) — so **$5,750–$16,000** if all three land, with a likely middle around **$5,750–$9,000**. Headlines are not promises.

**Fallbacks if a gate fails:**
- ENSv2 writes fail → drop ENS; picks = World + Hedera ($9,000 headline). Keep ENSv1 names for the demo.
- Hedera x402 fails → direct HTS/HBAR + HCS; claim No-Solidity only ($2,000).
- World IDKit fails → labelled simulator; if still blocked, drop World; picks = ENS + Hedera.
- Do **not** add Arkiv to replace a dropped partner.

## What each partner actually reads

### ENS — Best Use of ENSv2 ($7,000)

ENSv2 must be **central**, not cosmetic; Sepolia is explicitly allowed; the demo must be functional, not hard-coded; live demo link + open-source code (S1). Prize split: $3k / $2k / $1k / $1k.

FaceValue's ENS centrality is structural:
- the likeness **is** an ENS name;
- the licence is an expiring, revocable subname;
- **the dispute is an ENS state transition** — a winning challenge moves the controller/records from the squatter to the real person, and flips `facevalue:status` to `active`;
- the agent discovers the endpoint through ENS and pays over x402.

The challenge move is the demo beat that proves ENS is not a text-record decoration.

### World — IDKit ($2,500) + Agent Pass ($5,000, stretch)

IDKit: functioning app, at least one supported credential, server/on-chain verification, the specific trust event, the minimum sufficient assurance, a meaningful failure path (cancel/unavailable/rejection), and a short integration debrief (S2).

Agent Pass: official integration, full journey (request → user completion → validated result → protected action), a denied/expired/cancelled path, server-side validation, debrief (S2). **Proofs at the event are mocked** and must be labelled.

FaceValue's trust event is **a unique human making a claim on a likeness, and a different unique human contesting it**. World proves uniqueness, not ownership of the photo; the dispute loop is what proves possession. See plan §1.4.

### Hedera — x402 ($6,500) + No-Solidity ($2,000)

x402: at least one x402-protected endpoint settling on Hedera testnet/mainnet through a facilitator; an agent that finds the endpoint and completes a paid request with **no human approving**; public repo; README with architecture, payment flow, and the settled transaction ID; ≤5 min demo with HashScan link (S4).

No-Solidity: JS/TS or Python SDK, **no Solidity**, at least two native Hedera services (HCS + HTS), public repo, README, ≤5 min video; extra points for Mirror Node REST, creative HCS, key management (S4).

FaceValue uses HCS for registration/challenge/licence audit, HTS for the licence receipt, and a **native HBAR bond escrow** for the dispute. That is not a bolted-on second service; the bond is what prices the squat.

## Video constraints

ETHGlobal wants **2–4 minutes** and hard-fails above 4 (S5). Hedera wants ≤5 (S4). Target **3:00**, one video, one take or clearly labelled recorded segments. ≥720p; no phone recording; no sped-up footage; no music-and-text-only; no TTS/AI voiceover (S5).

## What we are consciously giving up

- **Arkiv ($4,000)** — cut. No fourth pick, no fourth integration.
- **Ethereum Foundation (CROPS $3,500 / Anon-RPC $5,000)** — not a pick; the privacy story is real but the registry is not a censorship-resistance product.
- **World Agent Pass ($5,000)** — stretch only; the primary World claim is IDKit.
- **Hedera Tokenize with Studios** — not the use case.
- **ENS Integration into an existing project**, **World Continuity** — Continuity-only, ineligible.
- **Definitive / Flash** — mainnet-only, incompatible with the testnet constraint.

Sources: S1 (prize index, ENSv2, finalist), S2 (World), S3 (Arkiv, cut), S4 (Hedera), S5 (3-pick rule, from-scratch, deadline, demo rules). Full registry: `docs/sources.md`.
