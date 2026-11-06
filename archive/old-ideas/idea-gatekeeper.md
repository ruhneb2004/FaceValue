# Gatekeeper — spec and feasibility

Companion to `ideas-10.md` §3 (ranked #1) and `sources.md`. This is a product definition and a feasibility analysis. It is **not** an implementation plan and contains no code; the build sequence belongs in a `build-plan`-style doc if this is picked.

One line: **one human, once per action, and the site never learns which human.**

---

## §0 What it is

A site drops in a script tag and a server call. On the handful of actions where a duplicate human actually costs money — free-tier signup, trial start, promo code, referral, vote, review, waitlist — the visitor confirms with World ID. The site receives a yes/no, plus a stable **per-site pseudonym** it can check against, and nothing else: no name, no email, no behavioural score, no IP profile, no fingerprint. The site is billed per check.

The promise in a judge's words: *a person can be a customer once, and the site still cannot say who they are.*

**What it is not.** Not a bot filter (that is a solved, free problem — §1). Not a login (no session identity, no account). Not an identity provider (it never yields an identifier usable anywhere else).

---

## §1 The thing it inserts into

### What a CAPTCHA actually proves

reCAPTCHA, hCaptcha and Cloudflare Turnstile answer one question: *does this session look human right now?* They answer it with behavioural scoring and risk signals, per session (⟨ours⟩ — a description of the category, not a claim about any vendor's internals). They are also, as far as published pricing goes, free to the site ⟨ours — pricing is not captured as a source here; verify before putting a number in a pitch⟩.

That creates two hard facts this product has to survive:

1. **"Human vs bot" has a $0 price benchmark.** Any pitch that starts with "replace your CAPTCHA" is asking a site to pay money and add a World App install in exchange for something it already gets free. That version of the idea is dead on arrival.
2. **"This session looks human" is not "this is a different human".** A CAPTCHA is session-scoped by construction. It cannot tell a site that signup #2 is the same person as signup #1, or that eighty of them are one person with eighty browsers. A paid click farm passes a CAPTCHA every time, because the humans are real.

### The gap that is actually worth money

⟨ours⟩ The abuse that costs money is not bots, it is **duplicate humans**: the same person claiming a free tier eleven times, farming referral credit, stuffing a vote, or joining a waitlist forty times to game allocation. Every defence against that today is *identity* — phone number, email domain, card fingerprint, KYC — and each of those is a privacy cost and a conversion cost.

So the product is the opposite trade: **prove distinctness, keep no identity.** That is a thing a CAPTCHA structurally cannot do and a thing KYC does expensively.

**Buyer.** ⟨ours⟩ Not the webmaster. The fraud/trust or growth-engineering owner at a company with a free tier or a scarce allocation, who already budgets for abuse and already pays for something worse.

---

## §2 The product

| Surface | Who | What they touch |
|---|---|---|
| Snippet + one server call | Site developer | Two lines of setup, one `action` name per protected flow |
| Confirmation sheet | End visitor | One World App prompt, ~10 seconds, once per action |
| Verify + meter | Operator (us, or self-hosted) | Proof verification, the pseudonym store, the billing meter |
| Daily receipts | Anyone | Aggregate per-site counts on Arkiv — no per-person data |
| Dashboard | Buyer | Checks issued, completions, duplicates blocked, spend |

### The flow, as a person experiences it

1. A visitor clicks **Start free trial**.
2. Instead of a grid of traffic lights, the page shows a World ID button.
3. They approve in World App — the only step that involves a phone.
4. The page continues. They never see a "verification" screen, a puzzle, or a redirect.
5. If that pseudonym has already claimed this action, the site gets `duplicate` instead of `new`, and decides what to do — the product does not decide for them.

### The flow, as the site experiences it

The site keeps its own World app identity (`app_id`/`rp_id`/`signing_key`), so proofs are scoped to that site by World's own design (S10, S11). The middleware returns one of `new`, `duplicate`, `expired`, `failed`, along with a short-lived token the site can attach to the action. Nothing else. Billing runs per check over x402. The operator exists to share the pseudonym state, the dashboard and the metering; because the site owns its World app and the middleware is self-hostable, switching or leaving the operator costs configuration, not the identity (⟨ours⟩ — a no-lock-in design that is also the answer to the obvious question of why a middleman exists).

---

## §3 How it actually works

### Verification (all of this is documented, not invented)

- The relying-party signature is generated **server-side only**, never in the browser (S10).
- The client requests with `rp_context`, an `action` (one per protected flow), a `signal` that binds the proof to the specific challenge (S12), and `allow_legacy_proofs` where the audience warrants it (S10).
- Two credential tiers:
  - **Tier 1 — Orb**, via the `orbLegacy` preset: the highest-assurance uniqueness signal (S11).
  - **Tier 2 — Selfie Check** (`selfieCheck`, "Proof of Presence"): a medium-assurance camera biometric that returns a `sybil_score` and an integrity bundle which **must be verified server-side before use** (S12). ⟨ours⟩ This is the adoption escape hatch: no Orb visit, no queue.
- The payload is forwarded **as-is** to `POST https://developer.world.org/api/v4/verify/{rp_id}`; the response must satisfy `success === true` **and** an `environment` assertion, compared before and after (S10). `expires_at_min` (S10) rejects stale proofs.
- Replay defence is ours to build: a challenge nonce, single-use, with a short TTL ⟨ours⟩.

### The pseudonym, and the one privacy claim that has to be exact

Uniqueness requires storing *something* per site. So the doc does not say "we store nothing":

> The operator stores `HMAC_k(nullifier)` scoped to `(site, action)`, never the nullifier itself.

Why this is defensible: the nullifier is a 256-bit value (S11), so an HMAC of it is not invertible by search, and the site never receives it. The stored value is a keyed pseudonym, useful only for "have I seen this one before, for this action, on this site".

The trade-offs, stated rather than hidden:

| Trade-off | Consequence | Mitigation |
|---|---|---|
| The key `k` is a single point of failure | Key compromise plus a nullifier leak would link users to actions | Key in KMS/HSM, per-site keys, rotation plan |
| Rotating `k` resets uniqueness | Everyone looks "new" after rotation | Keep old keys for verification only; document the reset as a business decision |
| The pseudonym is still personal data under most privacy regimes ⟨ours⟩ | It is linkable *within one site* by design | Publish the schema; keep no IPs/UA; short retention; no cross-site scope possible |

Note what World ID gives for free here: a per-app nullifier is already unlinkable across apps (S9), so cross-site correlation is not a policy promise we could break — it is outside the data we hold.

### Money

Each successful check is one x402 request: the site's backend pays the operator, the **facilitator pays the Hedera network fee** so the site needs no HBAR (S37), and settlement is per-request and discrete, which is exactly the shape a per-check price wants (S37, S38). No subscription, no invoice, no API key (S38).

### Receipts

One Arkiv entity per site per day: `{siteRef, actionClass, checks, completions, duplicatesBlocked, windowStart, schemaVersion}`. No per-person data of any kind. Because the entity is written by the operator and Arkiv is owner-writable (S15), the receipt is auditable by a third party and can be extended but not rewritten — which is the whole point of putting it somewhere we do not control.

Two honest limits: Arkiv entities have a **maximum lifetime of 7,884,000 blocks ≈182.5 days** (S17), so "permanent audit trail" is false unless someone extends them; and Arkiv can *count* entities (`client.count()` / `.withCount()`, S19) but has no sum or aggregate, so any monetary total is our arithmetic over pages of up to 100 rows (S19) — the number is our arithmetic, the existence and timing of the receipt are notarised ⟨ours⟩.

### Failure paths

| Situation | Product behaviour |
|---|---|
| Proof expired (`expires_at_min` passed) | `expired`; the site re-challenges; no charge ⟨ours: refund policy⟩ |
| Replayed proof / reused nonce | `failed`; logged as an attack signal |
| `environment` mismatch (staging proof in production) | `failed` — explicitly asserted, because S10 requires it |
| User cancels in World App | `cancelled`; the site falls back to its own policy (block, rate-limit, allow) |
| No World App installed | The sheet explains the install; ⟨ours⟩ this is the biggest conversion leak in the product |
| Duplicate human | `duplicate` — a *success* for the product and a business decision for the site |

---

## §4 What has to be true

Each assumption has a cheapest falsifying test, so this section is checkable rather than rhetorical.

| # | Assumption | Cheapest test that kills it |
|---|---|---|
| A1 | Target users will install World App at the moment of value | Ask 10 people in the room to install it; count how many finish before losing interest |
| A2 | A site will pay per check when a free alternative exists | Three conversations with someone who owns abuse budgets; ask what they spend today |
| A3 | `sybil_score` is a usable tier-2 threshold | 20 Selfie Checks, look at the score distribution; if it does not separate, tier 2 is decoration |
| A4 | A proof can be produced end-to-end during the event | One real proof in `staging` against the simulator (S10), then one in production |
| A5 | Per-check x402 latency is tolerable inside a signup flow | Time `verify` + `/settle` in sequence; if it exceeds a couple of seconds, batch or pre-authorise ⟨ours⟩ |
| A6 | The "duplicate" answer is worth more than the "human" answer | Show the same buyer the two pitches; see which one they repeat back |

---

## §5 Feasibility

### 5a Technical

| Component | Status | Effort ⟨ours⟩ | Real blocker |
|---|---|---|---|
| Developer Portal app, `app_id`/`rp_id`/`signing_key` | Documented (S10) | 1h | None |
| Server-side RP signature | Documented (S10) | 2h | None |
| IDKit client, `orbLegacy` + `selfieCheck` | Documented (S10, S12) | 3h | A device that can produce a proof |
| Verify + `success`/`environment` assertions | Documented (S10) | 1h | None |
| HMAC pseudonym store + nonce replay defence | ⟨ours⟩, simple | 2h | Key management discipline |
| x402 meter on Hedera | Documented (S37, S38) | 4–6h | **Facilitator access and a funded, token-associated account** |
| Daily Arkiv receipts | Documented (S15, S17, S19) | 2h | 182.5-day lifetime is a known limit, not a blocker |
| Demo site with one protected flow | ⟨ours⟩ | 2h | None |
| **Credible demo** | | **~18h** (sum of the rows) | Facilitator onboarding is the risk |
| **Stranger could self-host** | | **~30h** | Docs, config, error states |

The technical shape is unusually favourable: every hard primitive is someone else's documented service, and the only genuinely unknown piece is facilitator onboarding.

### 5b Commercial

⟨ours⟩ This is where the idea is weakest and the doc should not pretend otherwise.

- **The price anchor is zero.** A site already gets "human vs bot" free. Gatekeeper's chargeable claim is narrower: *the same human cannot be counted twice, and you still hold no identity.* That is worth money only where duplicates are expensive.
- **Where duplicates are expensive**, ranked by how easily a buyer says yes: (1) AI products with free tiers and trial abuse; (2) scarce-allocation drops and waitlists; (3) review/rating integrity; (4) polls and governance; (5) referral and promo budgets.
- **Unit economics** ⟨ours, illustrative only — no market data was collected⟩: a per-check price in fractions of a cent is plausible only at volume; the realistic model is a small monthly platform fee plus metered checks, because the buyer needs a dashboard anyway.
- **Distribution is the real cost.** A developer tool needs docs, self-serve onboarding and trust; none of that fits a weekend. Which is why the honest pitch is a *demo of the abuse being stopped*, not a claim of a business.
- **The status quo to beat** is not a CAPTCHA, it is a spreadsheet of heuristics: device fingerprints, email-domain rules, card BIN checks. Those are worse for privacy and roughly as annoying. That comparison is winnable; the CAPTCHA one is not.

### 5c Legal and ethical

- **Data minimisation** is the design, not a policy: no PII is received (S9 says relying parties get proofs, not personal data), and the only stored artefact is a keyed pseudonym ⟨ours: still personal data under GDPR-shaped law⟩. The document that matters is a short, public data-flow page, not a privacy policy.
- **Consent and clarity**: the visitor must understand they are proving humanity to *this site*, not logging in.
- **Exclusion** is a real ethical cost: a World-App-only check excludes anyone without a compatible smartphone, and Orb verification is unavailable in some places. The product must always have a documented fallback path for the site to choose.
- **Not legal advice**: whether a keyed pseudonym counts as personal data, and what retention you may claim, needs a lawyer in the operating jurisdiction.
- **Minors**: uniqueness checks on services used by minors need explicit thought; ⟨ours⟩ default to "not for services aimed at children".

---

## §6 Failure modes, ranked

| # | Failure | Early signal | Severity |
|---|---|---|---|
| 1 | Install friction kills conversion at the exact moment of value | Drop-off measured between button and approval above ~50% in a test | **Fatal to the product** |
| 2 | Buyer says "Turnstile is free" and stops listening | The first question is about price, not about duplicates | Fatal to the pitch |
| 3 | Not enough verified humans in the population | Same person cannot get through the flow twice without an Orb | Severe |
| 4 | Operator key compromise | Unexplained spike in `duplicate` across sites | Severe, reputational |
| 5 | Receipts silently expire at 182.5 days | Audit query returns nothing for old windows | Moderate, and embarrassing if claimed as permanent |
| 6 | Judge reads it as "another World login" | The demo shows the sheet before it shows the blocked duplicate | Moderate — a demo-ordering problem, fixable |

---

## §7 Verdict

**Build it — but demo the abuse, not the login.**

The technical feasibility is high (~18h to a credible demo, every primitive documented), the privacy design is real rather than rhetorical, and the demo has a single legible moment: *the second account is refused, and the site still cannot name the first one.*

**Claims we can make on stage:** a distinct human cannot take the same action twice on a site; the site receives no identity; the check is metered and settles per request with fees sponsored; the receipt is written where the operator cannot quietly rewrite it.

**Claims we cannot make:** that this stops bots (Turnstile does that, free); that it is anonymous (we hold a keyed pseudonym); that it works for every site today (it needs World App); that the audit trail is permanent (182.5 days, S17); that anyone has agreed to pay for it (no buyer conversations have happened).

**Score cross-check against `ideas-10.md` §13.** Prize math (12) and integration (10) hold. Feasibility should drop **8 → 7**, because facilitator onboarding is a genuine unknown and the rest is ~18h of documented plumbing. Demo clarity (4) holds if the abuse story is shown first. **Net 38/40, still #1** — the recommendation in `ideas-10.md` §14 does not change.

---

## §8 Open questions to close before committing

1. Which facilitator — official x402, Ax402, Blocky402, or self-run (S37) — and does it serve testnet today?
2. Do we demo Tier 1 (Orb) or Tier 2 (Selfie Check)? Tier 2 is more adoptable, Tier 1 is a stronger uniqueness claim.
3. Is the buyer "free-tier abuse" or "scarce allocation"? They need different dashboards and different demos.
4. Does a `duplicate` result cost the site money? If billing is per check issued, duplicates are revenue; if per *unique* human, they are a cost. That pricing decision shapes the incentive and the pitch ⟨ours⟩.
5. What is the retention period for the pseudonym, and who owns the key on a self-hosted install?
