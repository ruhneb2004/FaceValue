# Algo Haat — a marketplace for trading algorithms, where the track record is a role

Working title ⟨ours⟩. Companion to `ideas-10.md`, `ensv2.md`, `prize-map.md` and `sources.md`. Product definition + feasibility, same shape as `idea-gatekeeper.md`; no code, no hour-by-hour plan.

One line: **people publish trading algorithms, anyone can try or auto-execute them, the author earns a commission only on successful runs — and the performance record nobody can edit is a role on an ENSv2 name.**

---

## §0 What it is, and what it is not

**It is** a marketplace with an incentive loop: author publishes an executable algorithm → the platform's simulator evaluates it (same sim for everyone) → followers either run it on their own parameters or let our executor agent place the orders → if the sim/kitty outcome is positive, a commission settles to the author — no admin, no review queue, no human approval.

**It is not** an adviser (no discretionary management of pooled money), not a broker (execution is per-user, per-authorization), not a social feed of screenshots (no author-supplied backtests), and not a fund (no custody, no pooling).

Three properties carry the pitch:

| Property | Mechanism | Source |
|---|---|---|
| The author is a distinct human | **World ID**: one commission-earning account per human, per action | S9–S12 |
| The record can't be faked | **ENSv2 roles**: who may write `performance` vs `code-hash` vs `payout` is enforced by the name | S47 |
| Money flows without a person | **Hedera x402**: the executor agent pays its own way, per order, fees sponsored | S37, S38 |

---

## §1 The thing it inserts into

Copy-trading and algo marketplaces exist (copy-trading platforms, creator-hosted backtests, signals groups) ⟨ours — category description, no market-size claim⟩. Their structural weaknesses are exactly the ones this stack removes:

1. **Fake track records.** Anyone can post a backtest they curated; nobody can verify when an alleged trade actually happened. "Check for yourself" needs a neutral evaluation with *controlled write access* — a database owned by the platform fails that audit.
2. **Sybil reward farming.** The moment success pays a commission, the rational play is 40 accounts, 40 copies of one noisy strategy, and let variance find a winner. Defences today are identity (phone, KYC) — expensive and invasive — or nothing.
3. **The agent gap.** "AI makes the trade" needs per-action payment with no human approving — the least-settled corner of agentic commerce (S44) and the x402 use Hedera documents for agents paying per API call (S4, S37).

**Competitive calibration (honest).** Tokyo 2026 had x402 projects (Tollgate resold leftover API credits per call; Meigi did confirmation-of-payee) but nothing role-ensuring public records *and* human-uniqueness on the payee side (S36 — read as a showcase listing, not a winners list). The cluster to avoid is agent-approval guardrails (8 of 33 projects, S36) — we are not that.

---

## §2 The product

| Surface | Who | What they touch |
|---|---|---|
| Publish screen | Algo author | Name, executable code, declared window, caps |
| Sim results page | Everyone | One simulator, timestamped, role-written performance |
| Try / Execute | Follower | Run on my parameters · or **let the agent** place it (x402) |
| Earnings page | Author | Commission per successful run, settlement receipts |
| Registry view | Anyone | The algo's role map: who may write what, verifiable |

**The loop as one pass:** author publishes → sim computes the outcome over the declared window → follower auto-executes (the agent pays via x402) → positive outcome ⇒ commission auto-settles to the author → the *same* outcome sits on the author's public record, where the author cannot edit it.

**Commission rule, mechanical ⟨ours⟩:** due iff (a) the executor filled the algo's order set without exceeding the follower's stated cap, **and** (b) the sim/kitty P&L over the declared window is ≥ 0. It is a rule the sim applies, not a human decision — that is what makes it auditable.

---

## §3 How it actually works

### 3a ENSv2 as the integrity layer

- Each algo is an entry in a **UserRegistry** under the marketplace namespace, e.g. `mom-macd.algos.haat.eth`, with its own resolver (S47: every name can own a subregistry and resolver).
- **Records**: a `data` record for `code-hash` — ENSIP-24 arbitrary data is a *commitment*, not the code; the code stays off-chain (S47) — and a `data` record for `performance`.
- **Roles, and the doc-call-out trap**: resolver roles are scoped by *root or argument* (a text key, a coin type), **not per-name** — a role holder can write the covered records on every name served by that resolver instance (S47). So the design uses per-key grants:
  - **Sim service** holds `ROLE_SET_DATA` for the `performance` key — and no other records.
  - **Author** holds `ROLE_SET_DATA` for the `code-hash` key — and no other records.
  - **Nobody** holds a payout role; the payout address record is written only by the executor, via `grantSetterRoles()` scoped to that key (S47).
  - Where authors must be isolated from each other, use **separate resolver instances** (S47's multi-tenant rule).
- **Emancipation is the load-bearing detail**: at deploy the registry is emancipated — nobody holds `ROLE_SET_RESOLVER`, `ROLE_SET_SUBREGISTRY`, `ROLE_UNREGISTER`, `ROLE_CAN_TRANSFER_ADMIN` (nor `ROLE_UPGRADE`, UserRegistry) on `ROOT_RESOURCE`, and `isEmancipated()` is only meaningful after `verifyContract()` against the Verifiable Factory (S47). Consequence: **even the marketplace operator cannot later re-point an author's resolver or swap in a friendly sim.**
- **Versioning**: v2 of an algo = re-registration = a new immutable token ID (S47's mutable-ID mechanic). "Which version was I executed on" stays pinned.
- **Author portability**: an ENSIP-25 `agent-registration[<registry>][<algoId>]` text record on the author's own name binds them to their algos (S48) — the marketplace is a namespace; the author walks away with the handle.

### 3b World ID as the payee gate

- Every **earning account** must produce a proof: `orbLegacy` (Tier 1, highest-assurance uniqueness, S11) or `selfieCheck` (Tier 2, camera biometric with `sybil_score` + `integrity_bundle`, verified **server-side before use**, S12).
- Integration contract, all documented (S10): RP signature generated **server-side only**; `rp_context` with an `action` per earning flow; a `signal` binding the proof to the account-creation challenge; forward the payload **as-is** to `POST /api/v4/verify/{rp_id}`; assert `success === true` **and** an `environment` match; `expires_at_min` rejects stale proofs; store the nullifier as `NUMERIC(78,0)`; replay defence = single-use nonce, short TTL ⟨ours⟩.
- **Uniqueness check is ours**: the backend answers "have I paid this human before?" with `new` vs `duplicate`. A duplicate earner gets the **denied path** — refused at join (which is also the demonstrated denied/expired/cancelled case the World track asks for, S2).
- Free property: nullifiers are unlinkable across apps (S9), so the platform cannot correlate earners with actions elsewhere even in principle.
- **What World ID does not do, said out loud**: it proves one human, not effectiveness or honesty. A unique human can still publish garbage; the commission rule and the public record punish that.

### 3c Hedera x402 as the executor's wallet

- The follower authorizes one order within their cap; the **executor agent** — not a human — completes the paid request (S4's x402 gate: "a client completes a paid request with no human approving").
- Mechanics (S37): client builds a `TransferTransaction`, sets payer to the facilitator's `feePayer`, partially signs, Base64 → `PaymentPayload`; the server calls `/verify` then `/settle`; **the facilitator pays the network fee** — the agent needs no HBAR for gas; settlement in HBAR or HTS including USDC (S38).
- Standing limits, taken as constraints (S37): per-request and discrete — one order, one payment, no streaming metering; **no native privacy** — the order log is public by design; facilitator required (official / Ax402 / Blocky402 / self-run: TBD).
- **Commission settlement**: a direct HTS/HBAR transfer from the executor's kitty to the author's account on success. Deliberately **not** an HTS custom-fee config — fractional custom fees are receiver-pays by default (S46), which would have rewritten the commission direction and silently taxed authors. (S46's documented trap, applied.)

### 3d The accountability layer (and the second native service)

An **HCS topic** is the order log: `TopicCreateTransaction`, then `TopicMessageSubmitTransaction` per executed order — public submit key, low-cost, timestamped, sequenced (S26, S27). Every order's occurrence is public and time-stamped. That gives two native services — **HTS + HCS** — exactly what the "No Solidity Allowed" track rewards (JS SDK only, ≥2 native services, S4), while our own code stays `@hiero-ledger/sdk` only (S23, S30).

---

## §4 What has to be true — with the cheapest falsifying test each

| # | Assumption | Test that kills it |
|---|---|---|
| A1 | ENSv2 write path (registry deploy → subname → per-key role grant → resolve) works on Sepolia | **Hour-zero spike, 60 min**: one UserRegistry through the Verifiable Factory, two subnames, per-key `grantRoles`, resolution. If this fails, the ENS column is empty and the trio changes. |
| A2 | A real World proof can be produced during the event | One assessed proof in `staging` (simulator), then production (S10). If no verified proof by hour 3, fallback per `ideas-10.md` §14. |
| A3 | x402 facilitator serves testnet and we get an account funded + token-associated | One settled x402 order with a HashScan link (S4, S37). |
| A4 | Prices for the sim are timestamped and honest | The sim's `performance` record includes the feed version + first/last timestamp; a feed that can't replay invalidates the record ⟨ours⟩. |
| A5 | Earning accounts require a proof, no exception | Open a second commission account without a proof → refused, logged. |
| A6 | A judge can see the integrity claim | `isEmancipated()` returns true *and* `verifyContract()` validates the proxy, on the demo machine. |

---

## §5 Feasibility

### 5a Technical ⟨ours⟩

| Component | Status | Effort | Real blocker |
|---|---|---|---|
| ENSv2 registry + roles + emancipation | Documented, **unverified end-to-end** | 4–6h | **The spike (A1) decides everything** |
| World RP signature + verify + nullifier store | Documented (S10–S12) | 3h | A device that can produce a proof |
| IDKit client with two credential tiers | Documented | 3h | Demo tier choice |
| x402 executor (one order type) | Documented (S37, S38) | 4–6h | Facilitator onboarding |
| HCS order log + mirror read | Documented (S26, S27, S29) | 2h | None |
| Sim + metrics + commission rule | ⟨ours⟩ | 4h | Feed trust (A4) |
| Feed UI with one live algo | ⟨ours⟩ | 4h | Time-sink trap |
| **Total** | | **~24–27h** | Every row hides a known integration |

### 5b Commercial ⟨ours — no buyer conversations, no TAM claims⟩

Authors pay nothing to publish; they earn on success — so the product sells *the credibility of the record*, not the algo. The commission split is simultaneously the monetisation and the anti-spam mechanism. The follower side sells "try before you trust" plus one-click execution. No market-size claims are made in this doc.

### 5c Legal and ethical ⟨ours — general, not legal advice, unverified against specific regulation⟩

- **The sharp red flag is success-based commission with automated execution** — the shape of unregistered investment advice/portfolio management (India: SEBI adviser and algo-trading frameworks; US: adviser rules). Mitigation that is real but not a licence: **no custody, no pooling, per-user authorization, a mechanical rule, testnet demo.** On stage, say exactly three sentences: *no pooling, no custody, the commission is a rule not a decision.*
- World App is required to *earn*; a documented fallback (follower-only, no earnings) keeps the platform usable — but the exclusion is real and must be stated (S9/S11's proof requirement).
- A public record that rates strategies is a form of endorsing them; "not financial advice" plus the no-custody line is the honest framing.
- Minors: not for children; earning accounts are proof-gated (S11, S12).

---

## §6 Failure modes, ranked

| # | Failure | Early signal | Severity |
|---|---|---|---|
| 1 | ENSv2 writes don't work as documented | Spike exposes an API gap (roles, factory init, resolution) | **Fatal to the trio** |
| 2 | "Who computed the outcome?" | The sim is a black box we run → judges ask for the feed and the rule | Severe unless stated plainly |
| 3 | Custody question | First judge question is "who holds the money" → the three-sentence line | Severe if unprepared |
| 4 | Feed UI eats the weekend | Hour 10 on pages instead of the registry | Severe, classic |
| 5 | x402 latency inside an execution | `verify` + `settle` more than a couple of seconds per order | Moderate (S37) |
| 6 | "Another trading bot + copy app" | The demo opens on the feed, not on the record | Moderate — ordering fix |

---

## §7 Verdict

**Build it — on one condition: the hour-zero ENSv2 spike.** Every other primitive in this doc is documented and either verified in prior work (World S10–S12, x402 S37) or plain build work (HCS, sim). The ENSv2 write path is the only thing proven on paper but not on a machine, and it is the pillar the credibility story hangs on.

**Claims we can make on stage** (each backed by the cited docs): a commission-earning account requires a World ID proof, verified server-side, one per human, with a demonstrated denied path (S2, S10–S12); the performance record is written under a role the author does not hold, on a registry where the operator does not hold set-resolver/set-subregistry/unregister roles, verified via the factory (S47); the executor completes paid requests with **no human approving**, facilitator pays gas, per-request discrete (S37); every order is timestamped on HCS, public (S26, S27); the commission is a mechanical rule ⟨ours⟩.

**Claims we cannot make**: that it is anonymous (records are public; nullifiers are unlinkable but writer roles are known); that participation needs no proof (earning requires World App); that the record outlives registry expiry without renewals; that it is immune to advisory regulation anywhere (⟨ours⟩); that anyone will use it (no user conversations).

**Score cross-check** (against `ideas-10.md` §13): prize math **12** ($16k–$18k headline, four ENSv2 slots soften the risk), integration **10** (three pillars, each load-bearing), feasibility **6** (spike-gated; 7 if the spike passes, 4 if not), non-rerun **4** (no role-ensured records + payee uniqueness in the S36 calibration), demo clarity **4**. **Net 36/40, provisional — versus Gatekeeper's 38.** The gap is exactly the unverified ENSv2 write path.

---

## §8 The tracks (3 picks, per S5)

| Pick | Track | Prize | How it's won (from the sponsor pages) | Our match |
|---|---|---|---|---|
| **ENS** | Best Use of **ENSv2**, from scratch (Sepolia allowed, S47) | **$7,000** (3k/2k/1k/1k) | ENSv2 as the centre, not cosmetic (S1) | The registry/roles/emancipation model **is** the product |
| **World** | Best Use of **IDKit** | **$2,500** (2 × $1,250) | Full journey request → complete → **backend validate** → action fires; a demonstrated denied/expired/cancelled path; written debrief (S2) | Payee gate + duplicate-refused at join |
| **Hedera** | **x402** | **$6,500** | ≥1 endpoint settling on Hedera via a listed facilitator; client completes the paid request with no human approving; README with settled tx ID; ≤5 min video + HashScan link (S4, S37) | The executor agent |
| Hedera | "No Solidity Allowed" | **$2,000** (2 × $1,000) | JS/TS SDK only, **≥2 native services** (their example: HTS + HCS), README, ≤5 min video (S4) | HTS settlement + HCS order log; our repo writes no Solidity (we call ENSv2's existing contracts, we don't write them) |

**Headline $16,000** for the three picks (Hedera contributing two tracks under one pick); **$18,000 fully counted**; realistic **~$10k–$13k** ⟨ours⟩ — splits on multi-slot tracks.

**Edge risk, said out loud:** the No-Solidity gate is about the code *we* submit; we will not write Solidity but we interact with ENSv2's Solidity contracts. A strict reading might bounce us — keep the README clear that our whole repo is SDK-only, HTS + HCS.

**What we drop by picking this:** Definitive's **$2,500** "Flash advanced orders in a social app" (our best single-track fit, from the previous iteration) — execution venue is Hedera, not Flash. Explicit trade: the trio's money is wider and load-bearing; Definitive was one bespoke slot.

**Video:** target **3:00** — under the 4:00 hard cap (S5) and Hedera's ≤5 min (S4).

---

## §9 Open questions

1. **The spike (A1):** which Factory/registry addresses on Sepolia, and does per-key `grantRoles` go through ENSjs ≥4.2.3 or raw viem calls? (S47 says write flows are the ENSv2-specific part.)
2. Price feed: which public timestamped stream does the sim use, and how do we prove the feed version to a judge? (A4)
3. x402 facilitator: official / Ax402 / Blocky402 / self-run — does it serve testnet today? (S37)
4. Demo tier: Orb (`orbLegacy`, stronger uniqueness) or Selfie Check (`selfieCheck`, more adoptable)? (S12)
5. Registry expiry policy: do dormant algos auto-expire (28-day grace pattern, S47) and who pays renewal?
6. Does the No-Solidity reading (edge risk above) hold with ENSv2 contracts in the loop?
7. Is one positive window enough for commission, or does the rule need a malice check (e.g. an author front-running their own algo)? ⟨ours⟩