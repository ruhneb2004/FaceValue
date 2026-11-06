# Ten ideas, ranked by what actually wins

Research note, 2026-11-05. Companion to `prize-map.md` (what the money is), `ideas-trio.md` (the shortlist) and `plan-idea2.md` (the build plan for the current lead). It answers one question: **of everything we could build in ~35 hours, which ten ideas have the best chance of taking a partner prize, and in what order?** It is a ranking document, not a plan; if one of these beats `plan-idea2.md`, that is a separate decision and the plan gets rewritten.

---

## §0 How to read this

**The ranking formula.** `Win = prize math × integration depth × 35h feasibility × non-rerun × demo clarity`, scored out of 40:

| Component | Points | What earns them |
|---|---|---|
| Prize math | 12 | How many of our 3 picks can it genuinely claim (S5 caps us at 3), and how big are those pools (S1, S3, S33) |
| Integration depth | 10 | Does it plug into something that already has users and a payer, or is it a new silo |
| Feasibility | 8 | Buildable and *recordable* inside the 35h envelope, no live dependency at demo time |
| Non-rerun | 6 | Would a judge who saw ETHGlobal Tokyo 2026 (S36) think "I have seen this" |
| Demo clarity | 4 | Can a stranger understand the win in 20 seconds, on camera |

**Two rules hold throughout.** Every factual claim carries an S-id from `sources.md`; anything that is our reasoning or our market guess is marked **⟨ours⟩**. And every idea names at most **three** partners, because ETHGlobal gives three picks and one pick can carry several tracks from the same sponsor (S5).

**The brief behind the ranking.** Ten ideas that improve something that already exists, in the way product placement sits inside a finished film rather than interrupting it. No new silos, no "anonymous reporting", no ad network.

---

## §1 The bar, measured rather than guessed

`ethglobal.com/showcase` currently lists **33 projects from ETHGlobal Tokyo 2026** — the event immediately before this one (S36). That cohort is the best available calibration, and it is unkind: three clusters are already crowded.

| Cluster | Projects (S36) | Verdict |
|---|---|---|
| Agent payment guardrails, spend limits, human approval | Izanagi, Agent PayGuard, DSAP Protocol, Proviso, Surety Project, NaAP, My Agent Ohana, Axis | **8 of 33.** Do not add a ninth |
| Human attention, fairness at drop time, sybil-free allocation | KawaiPay, ScalpLess, Dedan, BrandMyStuff | Crowded, and the pitches are good |
| AMM / DeFi hooks | Iceberg, RateSpace, OniBlock, Unison, YieldSolver | Wrong skillset for us, wrong prizes |
| Everything else | Tollgate (x402 for API credits), Meigi (confirmation-of-payee), Waterline (proof of delivered GPU), Tap Pay (ENS NFC terminal), ClauseHash, Kismet, Tripwire, Himitsu, FlyNS, Go Health Me, Mental Poker, Brick Finance, AegisNet, SuwappuBot, QuoteBridge, Ninja Check | **The 16 that are left** — this is the open field |

Three lessons we are taking from that table:

1. **The agent-safety lane is closed.** Eight projects in one weekend. Anything we ship that is "an agent with a spending limit and a World ID approval" is a rerun, however well executed.
2. **Using World ID to make a *fair allocation* is closed too** — KawaiPay monetised attention, ScalpLess capped resale. The pattern "one human, one slot" has been done twice in the same cohort.
3. **The non-crowded space was all specificity.** *Proof of delivered GPU.* *Confirmation of payee for stablecoins.* *An NFC terminal that settles in ETH-to-USDC.* Narrow, physical, boring-sounding problems that map exactly onto a primitive. That is the shape to copy. (Caveat: S36 is a showcase listing, not a winners list — the specificity signal is about what people *built*, not what the judges picked.)

**Where the judges' preferences are stated outright.** Hedera's x402 track does not just ask for a payment — it lists what buys extra points (S4): spending controls for agents, agent identity/reputation via **HCS-14 or ERC-8004**, an **HCS topic as a tamper-evident audit log of each agent's spending**, A2A/ACP negotiation, HTS custom fees to split revenue, recurring payments via Scheduled Transactions. That is a judging rubric written down. Any idea that can hit three of those lines is worth more than a cleverer idea that hits none.

**The insertion test.** For each idea below, ask: *if our layer were removed, would the underlying thing still work?* If yes, we are product placement. If no, we built a silo and the demo will feel like a demo.

---

## §2 The agent economy, in one page

**x402 is a payment inside a request.** A server answers `402 Payment Required` with the price, asset, `payTo` and `feePayer`; the client partially signs a transfer and the request continues (S37, S38). No checkout, no signup, no API key (S38).

**On Hedera the economics are the interesting part.** The client sets the transaction's payer to the facilitator, signs, and Base64-encodes it into a `PaymentPayload`; the server calls the facilitator's `/verify`, then `/settle`; **the facilitator adds its signature and pays the network fee** (S37). A paying agent therefore needs no HBAR for gas — it needs only the asset it is spending. Hedera settles in HBAR or HTS tokens including USDC (S38).

**What x402 cannot do** (all S37, quoted because it constrains the ideas): a facilitator is mandatory; the client account must be funded and, for HTS, token-associated; **"settlement is per-request and discrete… not built for streaming payments or multi-hop routing"**; there is **"no native privacy"**; facilitator concentration is a named risk; alias auto-account-creation defaults to `reject`. Ideas that price *time* below must therefore bill whole requests.

**ERC-8004 is the trust layer next to it** (S39): an Identity Registry (ERC-721, `agentURI` → a registration file, `agentWallet`), a Reputation Registry (feedback values/tags, owners cannot self-rate), and a Validation Registry where named validators return a score — except that **the Validation Registry "is not yet available"** (S40). ERC-8004 says plainly that *"payments are orthogonal to this protocol"* (S39); its own examples show x402 payments enriching the feedback signal, which is the only thing that stops a reputation score being just a review (S39).

**The commerce protocols are not the same thing, and they are not finished.** As of late October 2026 (S42): **ACP** (OpenAI + Stripe; Apache-2.0, REST or MCP, merchant stays merchant of record — S43; it began as ChatGPT's Instant Checkout in September 2025 — S45) is beta at `2026-04-17` with nothing committed since 17 July, and ChatGPT moved away from standalone checkout in March; **UCP** (Google + Shopify) published a breaking `2026-08-25` while Google's own surfaces still run `2026-04-08`, US early access; **AP2** was donated to the FIDO Alliance in April, is v0.2, and no Google product documents it. Consumer appetite is real — **56% of consumers say they will let an agent search and compare for them, 35% will grant an agent access to saved payment credentials** (S41) — but the honest summary is that *"paying without a person present is specified far more fully than it is used"*, and that a business's agent paying per API call is **"the least settled"** of the three meanings of agentic commerce (S44).

**⟨ours⟩ That gap is the whole opportunity.** Checkout is being solved by OpenAI, Stripe, Google and the FIDO Alliance with card credentials. Nothing about it needs us. The unsettled layer is the small, boring, machine-to-machine payment — an API call, a toll gate, a verification, a shift premium — where x402's fee-payer model removes the last friction (a wallet with gas). Every idea below lives there.

---

## §3 #1 — Gatekeeper: the human test that forgets you

**Plugs into.** The form element already sitting on the login, signup and checkout pages of the web: reCAPTCHA and its clones. ⟨ours⟩ this is the most-installed third-party script in existence, and it is installed for one reason — to tell a human from a bot.

**Wedge.** Prove the human and reveal nothing else. A site gets a yes/no answer and a short-lived token; nobody learns who the person is, and no third party gets a behavioural profile.

**Mechanism.** An npm middleware plus a `<script>` tag. The site declares an `action` (one per form). On challenge, the browser runs World ID's IDKit with `rp_context` and `orbLegacy({ signal })`; the backend forwards the payload **as-is** to `POST https://developer.world.org/api/v4/verify/{rp_id}` and requires `verification.success === true` (S10). The nullifier is never stored — it is HMAC'd with a server secret and a per-site salt into a 15-minute session token, so a nullifier bank leak cannot link a person across sites ⟨ours, flagged as a risk in `sources.md`⟩. Each verification writes an Arkiv entity `{siteId, action, verifiedAt, expiresAt}` so a third party can audit *that a site really checks humans* without learning who passed. The site's backend pays the operator per verification over **x402 on Hedera**, so the fee is sponsored and the site needs no HBAR (S37).

**Partner stack.** **World ID IDKit** $2,500 · **Hedera x402** $6,500 (S4) · **Arkiv** from-scratch $4,000 (S3) (+$500 Swarm bonus, stacks, S3). Three picks, ≈$13,000 realistic. **The $5,000 Agent Pass half is out of reach by design** — it explicitly warns against *"simply a login screen added to an existing product"* (S2), which is what a verification widget is.

**Why it beats Tokyo 2026.** Nobody in the 33 replaced an authentication primitive (S36). KawaiPay and ScalpLess used World ID to decide *who gets a slot*; this uses it to decide *whether a request is human at all* — the same proof pointed at a different job. It is also the rare World idea a judge can adopt on the spot.

**35h + demo beat.** Middleware, a demo ticketing site, one Arkiv schema, one metered endpoint. On camera: a script hammers the form and gets nothing; a human taps once on a phone and is in; then the Arkiv receipt and the settled payment on HashScan. **World ID proofs at this event are mocked identities (S2)** — badge it, and pre-record a real-device clip as the B-roll.

**Failure mode.** Every World project at this event faces the same install friction; the differentiator must be the *forgetting*, shown in the schema on screen.

**Score 39/40** — prize 12, integration 10, feasibility 8, non-rerun 5, demo 4.

---

## §4 #2 — WagePort: the 1% that becomes portable cover

**Plugs into.** The payout a platform already makes to a gig worker — delivery, ride-hailing, creator payouts. ⟨ours⟩ The money already moves; nothing new has to be sold to the worker.

**Wedge.** Benefits ride on the payment instead of requiring a payroll product. A basis-point split at settlement funds a portable account, and the worker walks away with a record they own.

**Mechanism.** Each payout is settled through an x402-gated endpoint, or as an HTS transfer that carries a **custom fee** splitting the bps at token level (S4, S24) so the split is enforced by the asset, not by our application code. The swept amount lands in an account the worker controls. Every payout also writes an Arkiv work-record entity **owned by the worker** (S15): `{period, hoursBand, earningsBand, platform}`, no name, no ID, no address. The worker presents that record to an insurer or lender; the record is theirs to keep if they leave the platform. **World ID at onboarding, once**, proves one human per wallet — which is the actual fraud vector in any benefit scheme, and the reason this idea needs World ID at all rather than as decoration.

**Partner stack.** **Hedera x402** $6,500 (S4) · **Arkiv** $4,000 (S3) · **World ID IDKit** $2,500 (S2; Agent Pass not claimed, see §13).

**Why it beats Tokyo 2026.** The cohort's World projects were about allocating scarce slots and approving agent spend (S36). None attached identity, a portable record and a payment to a *labour relationship*. The Mumbai setting is a live advantage: gig density is visible from the venue ⟨ours⟩.

**35h + demo beat.** A mock delivery app issuing three shift payouts, one HTS token with a custom fee, a worker wallet page, and a lender screen that reads the Arkiv record. On camera: three payouts → three sweeps → the worker opens a record the platform cannot delete → a mock loan offer appears.

**Failure mode.** Only the rail is real; the policy behind it is a mock. Say that sentence before a judge asks.

**Score 37/40** — prize 12, integration 10, feasibility 7, non-rerun 5, demo 3.

---

## §5 #3 — Sponsor the Read: brand money buys a human, not an impression

**Plugs into.** The paywall that already exists on news sites. ⟨ours⟩ The reader, the article and the price are all in place; only the payer changes.

**Wedge.** An ad interrupts to buy attention it cannot verify. This pays for the thing the ad wanted — one verified human finishing one article — and proves it without a tracker.

**Mechanism.** The publisher keeps their CMS and adds middleware. A reader hits the paywall; **a sponsor's prepaid budget pays that article's price over x402** (S37 — fee sponsored, so the reader needs no wallet); the reader reads; a completion attestation (scroll depth and dwell, hashed) is written to Arkiv with a *salted per-article nullifier hash*, so the same human cannot be counted twice on the same article but also cannot be linked across articles ⟨ours⟩. The sponsor's dashboard shows exactly one number: **completed reads by distinct humans**. No cookie, no fingerprint, no third-party script. Publisher gets paid, reader gets access, sponsor gets a receipt they can put in a media plan.

**Partner stack.** **World ID IDKit** $2,500 (S2) · **Hedera x402** $6,500 (S4) · **Arkiv** $4,000 (S3). Substitution worth knowing: swapping Arkiv for **EF CROPS** $3,500 (S33) gives a privacy-of-measurement story that fits EF's "structural, not cosmetic" test — but then the receipts have nowhere durable to live.

**Why it beats Tokyo 2026.** BrandMyStuff sold ad space on *objects* and KawaiPay monetised attention directly (S36); neither went near the surface with the most existing inventory and the angriest readers. It is also the only ad-adjacent idea that survives EF's **"no third-party trackers or analytics in the client"** rule (S33), which is why it can be pitched to three different sponsor mentalities without changing the build.

**35h + demo beat.** One publisher template, a sponsor budget account, the attestation path, a one-screen dashboard. On camera: a brand drops $5 in; readers get through the paywall; the budget decrements and stops at zero; then open the schema and show that no reader identity exists anywhere in it.

**Failure mode.** "Completed" is a heuristic and a determined farm can fake dwell time. Price per completed read, say it is a heuristic, and show the nullifier cap that stops the same human being counted twice.

**Score 36/40** — prize 11, integration 10, feasibility 7, non-rerun 4, demo 4. **⟨ours⟩ Highest ceiling as an actual company of the ten**, because the buyer is an existing brand budget rather than a crypto user.

---

## §6 #4 — Bima Meter: cover that pays from the weather, not a claim form

**Plugs into.** The per-shift micro-insurance add-on that delivery riders already buy, and the parametric products insurers already sell.

**Wedge.** The trigger is a measurement, and the claim is a transaction. No form, no assessor, no thirty days.

**Mechanism.** Policy entity in Arkiv: `{rider, zone, shiftWindow, triggerThreshold, payout}`. Premium collected per shift through x402 at shift start, with Scheduled Transactions as the recurring path Hedera rewards (S4). A **Chainlink CRE workflow** reads the weather feed and, on threshold, submits the payout; HTS moves USDC to the rider (S24); the payout transaction is the claim receipt. **World ID binds one policy per human per shift window** via a per-action nullifier — without that, a rider mints twenty wallets and drains the pool, which ⟨ours⟩ is the real reason parametric micro-insurance struggles at the small end.

**Partner stack.** **Chainlink** $5,000 (CRE $1,500 + CCIP $3,500, S1) · **Hedera** $6,500 x402 + HTS · **World ID IDKit** $2,500 (S2). ≈$14,000 realistic — but see the caveat in this idea's Failure mode.

**Why it beats Tokyo 2026.** Go Health Me put money on wearable data (S36), which is the closest prior art and is about self-improvement, not risk transfer. Nobody in the cohort used a real-world oracle to settle a micro-policy, and the local trigger — Mumbai heat and monsoon — is legible to every judge in the room.

**35h + demo beat.** CRE workflow against a mocked feed, a rider app, a `force threshold` button that runs the *same* code path as the real trigger. On camera: premium in, threshold crossed, USDC out, HashScan link.

**Failure mode.** At hackathon speed the oracle is simulated. The claim to make is narrow and true: the workflow is real, the feed is mocked, the payout is on-chain. Chainlink's CRE prize is a single $1,500 first place, so this idea's headline number is flattered by the world's scarcest prize ⟨ours⟩.

**Score 35/40** — prize 12, integration 9, feasibility 5, non-rerun 5, demo 4.

---

## §7 #5 — Actuator: the physical layer for agents is a verified human

**Plugs into.** The work businesses already outsource for real-world checks — address verification, shelf audits, "is this shop open", delivery proof — today done by BPOs and phone calls.

**Wedge.** An agent posts a task with a price; a unique human nearby does it and is paid inside the same request. The agent gets ground truth; the human gets paid without an account.

**Mechanism.** The agent calls `POST /task` and gets `402` with a price. A human app shows the task; claiming burns a **per-task World ID nullifier**, so one human cannot claim the same task twice (S11). The human submits a photo, GPS and timestamp; a vision model scores it; on pass the client agent pays the x402 price and the request returns the attestation (S37). Arkiv stores `{taskId, contentHash, verdict, paidAt}` — the hash, never the photo — so the buyer holds a portable receipt. An HCS topic logs the task lifecycle as a tamper-evident audit trail, which is the exact extra-point Hedera names (S4).

**Partner stack.** **Hedera** $6,500 x402 + **No-Solidity** $2,000 (same pick; HCS log gives the second native service) · **World ID IDKit** $2,500 (S2) · **Arkiv** $4,000. ≈$15,000 — the largest *realistic* pool of the ten.

**Why it beats Tokyo 2026.** All eight agent projects in the cohort pointed agents at *money* or at *each other* (S36). The unbuilt half is agents acting in the physical world, and World ID is the only cheap way to know the actor is one human. It also gives the demo a human: **the judge can be the worker**, claim the task on their phone, and watch the agent pay them.

**35h + demo beat.** Agent, task feed, mobile web app, one vision check, x402 settlement. On camera: an agent needs a photo of a closed shop; a human claims, shoots, gets paid, and a reject path is shown too.

**Failure mode.** A two-sided market with no sides at demo time; mock "nearby" and admit it. If the vision check is weak the payment is unearned, so show the reject.

**Score 34/40** — prize 12, integration 8, feasibility 5, non-rerun 6, demo 3.

---

## §8 #6 — OpenRoad: the barrier that charges the car, not the account

**Plugs into.** Toll gantries, parking barriers, transit gates — infrastructure that already charges per crossing with a tag, an account and a monthly bill.

**Wedge.** x402 is shaped exactly like a toll booth: one request, one price, one settlement, no account. The fee-payer model removes the top-up problem that makes crypto unusable at a barrier (S37).

**Mechanism.** The gantry reads a plate or NFC tag and answers `402` with price and `payTo`. The vehicle wallet — or the driver's phone as proxy — builds the transfer, sets the facilitator as payer, partially signs, and the barrier opens on `/settle` (S37). **The HCS topic records every crossing**, which is the tamper-evident log an operator needs to bill a fleet (S4, S26, S27). Arkiv holds the driver-side receipt so a disputed charge is a query rather than a support ticket (S15). World ID is optional here, for driver identity on a fleet account.

**Partner stack.** **Hedera** $6,500 x402 + **No-Solidity** $2,000 (same pick; HCS topic = second native service) · **Arkiv** $4,000. Two picks ≈$12,500.

**Why it beats Tokyo 2026.** Nothing in the cohort touched transport infrastructure (S36). It is also the cleanest possible proof of the one thing x402 does better than cards: no signup, no minimum, no monthly reconciliation.

**35h + demo beat.** A laptop as the gantry, a QR, a phone wallet, a barrier servo or a browser animation, and an operator dashboard reading the HCS topic. On camera: car approaches, pays, barrier opens, operator sees the crossing a second later.

**Failure mode.** Judges read it as a toy. Mitigate by showing the two things a real operator needs — the audit log and the sponsored fee — rather than the animation.

**Score 33/40** — prize 9, integration 9, feasibility 6, non-rerun 6, demo 3.

---

## §9 #7 — Charge: kWh, signed by the charger

**Plugs into.** EV charge points and the roaming networks that reconcile them.

**Wedge.** The charger signs what it delivered, so the car pays for measured energy rather than a subscription or a flat session fee.

**Mechanism.** Session start writes a meter reading to an HCS topic; session end writes the signed final reading; price is quoted via x402 in USDC, fee sponsored (S37, S38); Arkiv binds `{chargerId, kWh, price, txId}` into an entity the roaming operator can query instead of reconciling spreadsheets (S15). Because x402 bills per request, the unit is the session — a genuinely metered stream would need something x402 does not do (S37) ⟨ours⟩.

**Partner stack.** **Hedera** $6,500 x402 + **No-Solidity** $2,000 (same pick; HCS meter log = second native service) · **Arkiv** $4,000. Two picks ≈$12,500.

**Why it beats Tokyo 2026.** Waterline proved a rented GPU was the chip that was paid for (S36); this is the same instinct — prove the physical quantity you charged for — one layer closer to the street. HCS-as-audit-log is an explicit extra-point (S4).

**35h + demo beat.** A scripted meter that increments realistically, a QR to start and stop, an invoice screen. On camera: plug in, meter runs, stop, invoice matches the meter to the wei.

**Failure mode.** Without hardware it reads as a spreadsheet with extra steps. Import a real OCPP-shaped log to look like infrastructure.

**Score 32/40** — prize 9, integration 9, feasibility 6, non-rerun 5, demo 3.

---

## §10 #8 — Byline: the article that can prove a human wrote it

**Plugs into.** The publish button an editor already presses in an existing CMS.

**Wedge.** The proof is generated by the publishing step and travels with the URL, so a reader can check the original rather than trust a badge vendor.

**Mechanism.** On publish, the CMS calls a signing service that hashes the body, signs with the outlet's key, and writes an Arkiv entity `{url, contentHash, authorRef, publishedAt, supersedes}` (S15). ENS gives the outlet an identity a reader can resolve — a name and a text record pointing at the Arkiv entity — with ENSv2 as the roadmap. **Correction (2026-11-05):** an earlier version of this line said ENSv2 had "no SDK yet". That was wrong. ENSv2-ready libraries exist (viem ≥2.35.0, ethers ≥6.17.0, ENSjs ≥4.2.3 and others, S47) and reads need only a bump; what is genuinely new is that **token IDs are mutable** on role changes, which matters to any indexer (`ensv2.md` §3.7, §8). A reader-side badge re-hashes the load and fails on tamper. **World ID ties the byline to one human**, so a single person cannot staff fifty pseudonymous columnists (S11).

**Partner stack.** **ENSv2** $7,000 (S1) · **Arkiv** $4,000 · **World ID IDKit** $2,500 (S2).

**Why it beats Tokyo 2026.** ClauseHash did wallet-signed document attestations for legal workflows (S36); none of the cohort attacked the loudest 2026 problem — evidence that a human wrote the thing you are reading. The risk is that "provenance" is a crowded *narrative* even where the implementation is not.

**35h + demo beat.** A markdown editor as the CMS, a badge, and one tampered article that visibly fails verification.

**Failure mode.** The badge only matters if someone checks it. Render the proof on the publisher's own origin, next to the headline, rather than in an extension.

**Score 32/40** — prize 11, integration 7, feasibility **6** (raised from 5 on 2026-11-05 once the library story was checked — see `ensv2.md` §8), non-rerun 4, demo 4.

---

## §11 #9 — Vernacular Meter: per-call Indian-language OCR and speech as an MCP tool

**Plugs into.** Any app that needs Hindi, Marathi or Tamil text out of a photo or a voice note, currently bought as per-seat SaaS.

**Wedge.** Agents pay per call; the app pays for what it uses, with no key and no seat.

**Mechanism.** An MCP server exposing `ocr` and `tts` tools; each call answers `402`, the client pays, the result returns (S37, S38); a budget-capped agent demonstrates the spend-control extra-point, and an ERC-8004 identity makes the tool discoverable (S39, S4).

**Partner stack.** **Hedera** $6,500. One real pick.

**Why it ranks ninth, not first.** Hedera lists this idea *in its own track description* (S4). The pile of submissions will be full of it, and nothing in this version separates it from that pile. Included because it is the honest low-risk fallback, not because it is good.

**Score 29/40** — prize 9, integration 6, feasibility 8, non-rerun 1, demo 5.

---

## §12 #10 — Agent Trust Directory: ERC-8004 in front of businesses that already exist

**Plugs into.** A local service directory — the listings page a person already searches.

**Wedge.** Before an agent pays a business, it can check who they are and what past clients said, using a registry that no platform owns.

**Mechanism.** The business registers as an ERC-8004 Identity (ERC-721, `agentURI` → registration file) and collects Reputation feedback after each x402-settled job (S39); Arkiv caches the filtered reads because the chain is a poor query engine (S15).

**Partner stack.** None of the twelve Mumbai sponsors owns ERC-8004 (S1), so the prize math is the weakest of the ten; S40 puts the canonical deployments on Base, so the cross-chain story is real work. Hedera awards extra points for 8004 identity (S4), which is not the same as a track.

**Why it is here.** Because "agentic AI" invites exactly this idea, and the report should say out loud that the obvious idea is the weakest one: the registry is someone else's, the trust is unverifiable until the Validation Registry ships (S40), and the demo is a table of rows.

**Score 27/40** — prize 5, integration 7, feasibility 5, non-rerun 4, demo 6.

---

## §13 Scoreboard

| # | Idea | Realistic claimable (our arithmetic) | Feasibility | Non-rerun | Score |
|---|---|---|---|---|---|
| 1 | **Gatekeeper** — World ID as a CAPTCHA, x402-metered | Hedera 6.5k + Arkiv 4k + World 2.5k ≈ **13k** | 8 | 5 | **39** |
| 2 | **WagePort** — 1% of a machine payment into portable benefits | Hedera 6.5k + Arkiv 4k + World 2.5k ≈ **13k** | 7 | 5 | **37** |
| 3 | **Sponsor the Read** — brand pays a verified human at the paywall | Hedera 6.5k + Arkiv 4k + World 2.5k ≈ **13k** (or EF 3.5k instead of Arkiv) | 7 | 4 | **36** |
| 4 | **Bima Meter** — parametric cover settled by weather | Chainlink 5k + Hedera 6.5k + World 2.5k ≈ **14k** | 5 | 5 | **35** |
| 5 | **Actuator** — agents hire verified humans for ground truth | Hedera 6.5k + 2k + World 2.5k + Arkiv 4k ≈ **15k** | 5 | 6 | **34** |
| 6 | **OpenRoad** — per-crossing toll and transit payment | Hedera 6.5k + 2k + Arkiv 4k ≈ **12.5k** | 6 | 6 | **33** |
| 7 | **Charge** — signed kWh, paid per session | Hedera 6.5k + 2k + Arkiv 4k ≈ **12.5k** | 6 | 5 | **32** |
| 8 | **Byline** — signed originals in an existing CMS | ENSv2 7k + Arkiv 4k + World 2.5k ≈ **13.5k** | 6 | 4 | **32** |
| 9 | **Vernacular Meter** — per-call Indic OCR/TTS MCP tool | Hedera 6.5k ≈ **6.5k** | 8 | 1 | **29** |
| 10 | **Agent Trust Directory** — ERC-8004 over a listings page | ≈**0** (extra points only) | 5 | 4 | **27** |

**Why the money column is smaller than our earlier docs suggest, and why that is the real finding.**

- **World is $2,500 here, not $7,500.** World's $7,500 is Agent Pass $5,000 plus IDKit $2,500 under a *single* pick (S2, S5) — but Agent Pass demands a full request → complete → validate → act journey and explicitly warns against *"simply a login screen added to an existing product"* (S2). None of the ten is an authorisation product; they are verification, payment and record products. Budgeting $2,500 is the honest number, and the corollary is the interesting one: **the biggest World money sits behind the most crowded door** — the agent-approval cluster that eight Tokyo teams already filled (S36). Moving up to $7,500 means joining that pile.
- **Hedera's two tracks share one pick** and can both pay: x402 $6,500 plus No-Solidity $2,000, the latter counted only where the build really uses **≥2 native services** (S4) — hence Actuator, OpenRoad and Charge add it and Gatekeeper does not. x402's hard gate is the same for every idea above: one endpoint settling on Hedera through a listed facilitator, **a client that completes the paid request with no human approving**, a repo README carrying a settled transaction ID, and a ≤5 min video with the HashScan link (S4). An idea whose *payment* demo needs a person tapping "approve" on camera fails that gate — another reason the agent-approval cluster is a trap.
- **Totals are prize pools we could be eligible for, not expected value** — a three-way split of a $6,500 track is not $6,500. **One EF prize per project** applies (S33), and Arkiv's **$500 Swarm bonus stacks** on top of any Arkiv track prize (S3).

**Where the money column and the score disagree.** Actuator has the largest realistic pool and ties for the lowest feasibility; Gatekeeper has the smaller pool and is the only idea we are confident of finishing. The score ranks *expected* wins, which is why feasibility is worth 8 points and money 12 — money you cannot ship is zero.

---

## §14 Recommendation

**Build #1, Gatekeeper**, and keep #3 and #2 as the two escape hatches.

**The remove-a-pillar test, applied to Gatekeeper:**

| Remove | What breaks | Verdict |
|---|---|---|
| World ID | There is no proof of humanity left — the product collapses into a rate limiter | **Irreplaceable** |
| Hedera / x402 | Billing reverts to API keys and invoices; the "a machine can pay on its own" property dies, and $6,500 leaves the table | **Structural loss, survivable** |
| Arkiv | Receipts move into our database; the auditable-without-us claim dies | **Loss of the third-party story** |

That is the shape we want: World is load-bearing, the other two are leverage.

**When to switch, honestly.** If the World ID device flow is not producing a verified proof by hour 3 of the build, drop to **#9 Vernacular Meter** — one partner, no World dependency, and the least impressive idea that can still place. If the team wants a company rather than a demo, **#3 Sponsor the Read** is the better long game ⟨ours⟩. If the judges' room feels local, **#2 WagePort** lands hardest.

**Why the petition (`plan-idea2.md`) is not #1 here.** It is a strong build and still the best use of EF's privacy prize, but its World leg is *allocation fairness* — the cluster Tokyo 2026 filled twice (S36) — and it has no machine-payment behaviour, so it cannot claim the $6,500 x402 track without becoming a different project. It stays a valid plan; this report just ranks the alternatives above it for prize probability.

**A thirty-minute decision rule.** Score the top three on the five components with a real number each, not a feeling. Tie-break on **demo clarity**, because a judge who cannot explain our project to the next judge will not vote for it.
