# Ideas — 7 candidates, scored

> **Status: superseded for the *choice*, kept for the *reasoning*.** This set was written when the trio was World + Arkiv + Hedera. Only 3 partner picks exist, and the trio is now **World + Arkiv + Ethereum Foundation** — see [`ideas-trio.md`](ideas-trio.md), which contains the current ideas and the load-bearing test. Scores here stay as written so the reasoning remains auditable.

The brief has three non-negotiables:

1. **World ID**: a moment where someone proves *"I am one human"* and **nothing else**.
2. **Arkiv**: a profile whose data **travels between dapps**.
3. ~~Hedera~~ **EF**: the brief originally named Hedera's SDK-only track; under the 3-pick cap the third pillar is Ethereum Foundation's Anon-RPC/CROPS, which is the one that acts on privacy. Hedera's version of this set is preserved below and remains valid if you swap it back (`ideas-trio.md` §11).

Everything below is judged against those three plus ETHGlobal's own five criteria (S5): Technicality, Originality, Practicality, Usability, WOW.

---

## First, the design question the brief is really asking

"Prove you're human and nothing else" only becomes a *product* when you name what the verifier must **not** learn. Otherwise it is a CAPTCHA with extra steps.

| What a verifier typically learns | Do they need it? | Can World ID avoid it? | Source |
|---|---|---|---|
| Your name, face, passport, phone | No | Yes — proofs are ZK, generated on-device; the app receives a proof, not personal data | S9 |
| Which other apps you used | No | Yes — the nullifier is derived from *(person, app, action)*, so different apps/actions give different nullifiers and are "unlinkable across apps" | S10 |
| That you already claimed this benefit today | **Yes** | Yes — same person + same action ⇒ same nullifier, so our backend can reject the second attempt | S10 |
| That you're the same person on your next visit | Sometimes | Yes — Agent Pass returns a **pairwise `sub`**, stable per sector, different across sectors | S14 |
| That you are physically present at pickup | Sometimes | Yes — `require_user_presence` adds a liveness step and fails with `user_presence_failed` | S12 |
| Your reputation from a previous app | Only if you choose | Yes, if the profile is **yours** (wallet-owned Arkiv entity) and holds predicates, not facts | S15 |

That table is the whole thesis: **uniqueness is per-context, continuity is per-sector, and the profile is a set of claims rather than a biography.** Every idea below is a variation on where to apply it.

---

## The candidates

### A. Chhaya — a pseudonymous human passport ★ flagship
**The moment:** a community fund / health camp / mutual-aid pool has 500 slots and a queue full of bots, resellers and duplicate accounts. Today the fix is to demand an ID — which turns the *list of people who needed help* into a surveillance artefact that outlives the programme. Chhaya lets the organiser enforce "one human, one slot" while the claimant's name never enters the system, and lets a second, unrelated organisation honour the same person's track record without either org's database being opened.

- **World:** Agent Pass gives a sector-scoped stable handle (so the same person is recognisable *within* the mutual-aid sector, invisible across sectors); IDKit `proofOfHuman` with `require_user_presence` at the claim moment; the nullifier is the one-slot-per-human brake.
- **Arkiv:** the passport, the attestations, and the 15-minute slot hold all live as entities the **user's wallet owns**; any second dapp queries them with no API key and no integration meeting.
- **Hedera:** every attestation is committed to an HCS topic (sequence number referenced from the Arkiv entity), so expiry or deletion can't rewrite history; the slot itself is an HTS NFT with a freeze applied to the holder.
- **Prior art check:** Arkiv's own gap list literally names "Shared Cross-App Schemas … two apps interoperate" as unbuilt (S21); World's Tokyo winners were Airlock and Lifeline (both "Best Use of World ID for Agents") and Lortnoc Tahc (the IDKit continuity prize) (S6) — none of the listed winners is a portable pseudonymous profile.
- **Score:** 34/40. **Why it wins:** it is the only candidate where all three partners are load-bearing *and* the privacy story is the product rather than a feature.

### B. The camp queue alone
Same scarce-benefit story, no passport: inventory + holds + vouchers, one dapp only.
- Strongest single-dapp demo, and the Arkiv expiry-of-a-hold is genuinely delightful on camera.
- **Fails the brief's second requirement** — there is no data travelling to a second dapp; Arkiv degrades to "a database with TTL".
- **Score:** 31/40. **Verdict:** it is A's first act, not a rival. Ship it *inside* A.

### C. One-human-one-vote for ward-level consultation
A municipality asks residents to vote on a budget line. Must be one vote per human, must not reveal who voted or how, must not link a resident across two consultations.
- World is perfect here (action-scoped nullifiers); Arkiv holds proposals and tallies; Hedera HCS is the tally log.
- **Weakness:** judges will ask about coercion and vote-buying (a voter can prove how they voted *to a buyer*), and the honest answer needs receipts/revoting — which is a research project, not a 35-hour build.
- **Score:** 30/40. **Verdict:** best *narrative* of the runners-up, worst risk/effort ratio.

### D. Anonymous case file (whistleblowing / workplace harassment)
You must prove you are a real, unique person (and possibly an employee) to file a report; you must never be identifiable; the organisation must not be able to quietly delete or backdate the report.
- Best privacy *stakes* of any idea. Arkiv + Swarm's encrypted-blob bonus fits exactly, with a documented warning: an encrypted Swarm reference contains its key, so never store it raw in a public Arkiv entity (S3).
- **Weakness:** Hedera's HTS has no natural job here — the timestamping is HCS-only, and forcing a token in would be decoration. Encrypted-blob plumbing also eats hours.
- **Score:** 32/40. **Verdict:** the one I would pick if Hedera were not a requirement.

### E. Agent counterparty trust desk
Agents hire humans and other agents; every counterparty must be a verified unique human, tasks/bids/claims expire, payouts in an HTS token, x402 for machine payments.
- Arkiv explicitly suggests "agents: ephemeral coordination state: tasks, bids and claims that agents share, query and let expire" (S3), and Hedera's x402 track is worth $6,500 (S4).
- **Weakness: originality.** "Agent's List" already did fresh-World-ID human approval of agent payments at Tokyo 2026 (S7). Re-treading a known winner is how you place third.
- **Score:** 29/40. **Verdict:** the natural *stretch* layer on top of A (an agent may prepare a claim; only a human can approve it), not the core.

### F. Pseudonymous hiring — prove human, not identity
An applicant proves "one human, not an agent farm" and shows verified track record, while name, gender, college and photo stay hidden until shortlist.
- Real 2026 problem (agent-flooded applications), and `signal` binding to a job ID is a clean fit.
- **Weakness:** the Hedera role is cosmetic, and "should employers accept anonymous applicants" is a debate judges may not want to have in 4 minutes.
- **Score:** 27/40.

### G. Pure Arkiv "Mirror" play (no World, no Hedera)
Skip both other partners; mirror a public dataset Ethereum depends on into Arkiv for the $4,000 Mirror track (S3). E.g. a human-verification-adjacent registry.
- **Highest probability of winning *something*** — smallest surface area, clearest criteria, and the judging rubric is published as four 25% buckets.
- **Weakness:** violates the brief, and forfeits two of three picks.
- **Score:** 19/40 on the criteria — but **keep it as the emergency fallback** if World and Hedera integrations both stall.

---

## Scoreboard

Five ETHGlobal criteria (1–5 each) + partner fit (1–5 each), max 40.

| | Tech | Orig | Prac | Usab | WOW | World | Arkiv | Hedera | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| **A. Chhaya passport** | 4 | 4 | 4 | 4 | 4 | 5 | 5 | 4 | **34** |
| D. Anonymous case file | 5 | 4 | 3 | 3 | 5 | 5 | 4 | 3 | **32** |
| B. Camp queue only | 3 | 3 | 5 | 4 | 3 | 5 | 3 | 5 | **31** |
| C. One-human-one-vote | 4 | 4 | 3 | 3 | 4 | 5 | 3 | 4 | **30** |
| E. Agent trust desk | 5 | 2 | 3 | 3 | 4 | 5 | 4 | 3 | **29** |
| F. Anon hiring | 3 | 4 | 4 | 4 | 3 | 4 | 3 | 2 | **27** |
| G. Arkiv Mirror only | 3 | 2 | 5 | 2 | 2 | 0 | 5 | 0 | **19** |

## Decision

**Build A.** Reasons, in the order they decided it:

1. **It is the only candidate where all three partners are structurally necessary.** Remove Hedera and you lose the tamper-evident anchor and the voucher. Remove Arkiv and the second dapp needs our API. Remove World and there is no uniqueness guarantee. Judges reward "what breaks if X is removed", and here the answer is honest (compare 0G's explicit "one sentence on what breaks if 0G is removed", S1).
2. **It answers Arkiv's published gap** (S21) rather than adding project #117 to their catalogue.
3. **The failure path is native, not bolted on.** World requires a demonstrated denied/expired/cancelled path (S2), and Chhaya has three real ones: cancelled proof → no claim; reused nullifier → "already claimed"; 15-minute hold expires → slot returns to the pool. That is three of the demo beats for free.
4. **It survives scope cuts.** If Agent Pass fails, A still runs on IDKit alone. If HTS auto-account creation fails, the voucher falls back to a treasury-held serial. If Swarm is skipped, nothing breaks — we lose $500 of upside, not the project.

**Fallback ladder, decided now so nobody argues at 3 a.m.:**

| If this dies | Fall back to |
|---|---|
| Agent Pass OIDC onboarding | A-lite: IDKit-only, handle derived server-side. Keeps Arkiv + Hedera intact. |
| Arkiv testnet / access key | G (Mirror play) — but World + Hedera work is wasted, so this is last resort |
| HTS auto account creation (S25) | Voucher stays in treasury; ownership proven by the signed HCS message + Arkiv attribute |
| Everything on day 3 | Submit B (camp queue) with HCS anchoring; it still touches all three partners |
