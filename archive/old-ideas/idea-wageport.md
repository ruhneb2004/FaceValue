# WagePort — spec and feasibility

Companion to `ideas-10.md` §4 (ranked #2) and `sources.md`. Product definition and feasibility, not an implementation plan.

One line: **the benefit travels with the worker, not with the app.**

The heading in `ideas-10.md` — "the 1% that becomes a pension" — is a metaphor. The word "pension" does not appear in the product, and §5c explains why.

---

## §0 What it is

A settlement rail. When a platform pays a gig worker, a fixed share is split off *at the token level* and routed into an account the worker owns, and a small record of that period of work is written somewhere the worker owns it too. The record is portable: it outlives the app, the account and the platform.

The promise in a judge's words: *a rider can change platforms and still have proof of the work they did and the cover they built.*

**What it is not.** Not a pension product, not an insurer, not a wallet, not payroll software. We do not hold anyone's money and we do not promise a benefit. The licensed partner holds the money; we build the split and the record.

**What it replaces.** A payout with no memory and no attachment.

---

## §1 The thing it inserts into

### How a gig payout works today

⟨ours — described generically; no specific platform's terms are cited here⟩ A platform aggregates a worker's completed tasks, deducts its commission, and pays out on a schedule through a payment rail into a bank account or wallet. The rail carries **money and almost nothing else**: a reference number, an amount, a timestamp.

Four consequences follow, and they are the reason this idea has a wedge:

1. **Contributions are a payroll function, and gig payouts are not payroll.** Employer-side contributions attach to an employment relationship. Where the relationship is a series of tasks, nothing attaches ⟨ours⟩.
2. **History dies with the account.** Switch platforms and the earning history stays behind, because the platform owns it. The worker's own record of their work is a screenshot ⟨ours⟩.
3. **No portable income proof means no credit and no underwriting.** A lender or insurer cannot price a worker whose income is invisible; the worker therefore pays more for less cover ⟨ours⟩.
4. **Anything voluntary is the first thing dropped.** A "save for later" button in an app competes with the worker's rent. Benefits that depend on the worker choosing them at the end of a shift do not get chosen ⟨ours⟩.

### Why the money movement is the right place to intervene

It already happens, on a schedule, with an amount and an identity. Adding a split at settlement costs one token configuration (S46) instead of a new product the worker has to adopt. That is the "product placement" property: the rail is not new, the attachment is.

---

## §2 The product

| Surface | Who | What they touch |
|---|---|---|
| Token / payout config | Platform finance + engineering | One fee configuration, one report |
| Contribution account | Worker | Balance, destination, and the record |
| Record viewer | Worker | Their history, exportable, presented to a partner |
| Partner reader | Insurer / lender / pension provider | A verifiable history with the worker's consent |
| Audit view | Regulator or researcher | Aggregate flows, no identities |

### The flow, as the worker experiences it

1. They join a platform and confirm they are a distinct human, once — this is a fraud control, not a login (§3).
2. They choose where contributions go: a partner product, or an account they hold themselves.
3. Each payout arrives slightly smaller on the platform's side and slightly larger in the contribution account — **funded by the platform, never deducted from their pay** (§3, and this is the correction that matters).
4. Every period of work adds a line to a record they can open, export, and show to someone who is deciding whether to lend to them.

### The flow, as the platform experiences it

Configure the token once, keep paying out as before, and get a report of contributions routed and records issued. The platform can never edit or delete a worker's record (S15) — that is the feature, and it is also the support burden.

---

## §3 How it actually works

### The split, and the trap in it

Hedera tokens can carry up to **10 custom fees**, disbursed to fee-collector accounts on every programmatic transfer; the types are fixed, fractional and royalty (S46). A percentage split is therefore a **token configuration, not application code** — it cannot be skipped by anything that transfers the token.

The trap, and the reason this section exists:

> **By default the *receiver* pays a fractional custom fee** (S46). Set up naively, a "1% contribution" is taken out of the worker's payout. That is a pay cut with a benefit-shaped label.

So the design decision is explicit: the fee is configured with the assessment method set so the **sender** pays and the receiver keeps the full transfer amount (S46). Concretely — the platform funds the contribution, the worker's take-home is unchanged, and the doc says so on stage rather than discovering it in a judge's question.

Constraints worth knowing before promising anything: fractional fees are fungible-token only, capped at ≤1, with optional per-transfer `min`/`max` (S46) — so a large payout and a tiny one need caps that do not distort either. Custom fees pay a fee-collector account; "the worker owns the contribution" is therefore an *account-control* question, not a fee-schedule one ⟨ours⟩.

**Second path, for task-level pay.** Where a platform pays per task rather than per period, an x402 request per task fits better: the facilitator pays the network fee, so the worker (or their agent) needs no HBAR, and settlement is per-request and discrete (S37, S38). It is explicitly **not** built for streaming or continuous settlement (S37), so it cannot model a running meter — only whole tasks.

### The record

One Arkiv entity per pay period, **owned by the worker's wallet** (S15):

| Field | Why it exists |
|---|---|
| `periodStart`, `periodEnd` | Bounds the claim; makes fraud auditable |
| `platformRef` | Who paid; lets a partner sanity-check the source |
| `hoursBand`, `earningsBand` | Enough for underwriting, less identifying than exact figures |
| `contribution` | What actually reached the account |
| `payoutTxRef` | Hash of the settlement, so the record is anchored to money that moved |
| `schemaVersion` | Records outlive app versions |

**Deliberately not stored:** name, phone, address, national ID, bank details, and — by default — exact earnings. Exact figures are more useful to a lender and more identifying to everyone else, so they are an opt-in per record ⟨ours⟩. The bands are the privacy/usefulness compromise, and the doc should say that the compromise is a choice, not a law.

Three mechanical truths that shape the product:

- **Owner-only writes.** Only the owner wallet can update, extend, transfer or delete an entity (S15). The platform cannot rewrite history — good — but it also cannot correct a mistake, so corrections must be *appended* as a superseding entity ⟨ours⟩.
- **Records expire.** Maximum lifetime is 7,884,000 blocks, ≈**182.5 days** (S17), and Arkiv emits **no event on expiry** (S17). A "portable lifetime record" is therefore false unless someone renews it, and the renewal has to be signed by the owner, who is a rider with other things to do. This is the single biggest design debt in the idea; §6 treats it as a failure mode rather than a footnote.
- **Totals are ours.** Arkiv can count entities (`.withCount()`, S19) but has no sum or aggregate, and queries page at 100 rows (S19), so "total contributed" is our arithmetic over the worker's records. Fine for a UI, but the claim must be "computed from records", not "attested total".

### Uniqueness, and why World ID is here

One human, one contribution account. Without it, the exploitable path is obvious and cheap: twenty wallets, twenty accounts, twenty times the matched contribution. World ID supplies a per-action nullifier so a human can be counted once per benefit programme without the platform learning who they are (S11, S9). This is a fraud control doing a narrow job — not a login, and not a KYC substitute.

**And it must never gate the benefit.** ⟨ours⟩ A worker without World App cannot be allowed to lose money they have already earned; the fallback is a platform-attested record with a worker dispute window, with World ID as the higher-trust tier. Stating this is both an ethical requirement and a judge-facing sign that the design has been thought through.

---

## §4 What has to be true

| # | Assumption | Cheapest test that kills it |
|---|---|---|
| A1 | A platform will fund a contribution it is not obliged to fund | Ask someone who runs platform ops what they already spend on rider insurance or incentives |
| A2 | A worker values a portable record enough to onboard once | Show the record screen to five riders; ask what they would use it for |
| A3 | A lender or insurer will accept a worker-owned record as evidence | One underwriter conversation; if they insist on bank statements, the record is decorative |
| A4 | Sender-paid fractional fees behave as documented | One token, one transfer, check both balances against the expected split (S46) |
| A5 | Renewal at 182.5 days is survivable operationally | Simulate 12 months of records with renewals; count how many expire unattended |
| A6 | The unit is meaningful at all | Arithmetic on a realistic payout, with every number marked ⟨ours⟩; if 1% is trivial, the pitch is wrong, not the rail |

---

## §5 Feasibility

### 5a Technical

| Component | Status | Effort ⟨ours⟩ | Real blocker |
|---|---|---|---|
| HTS token with fractional fee, sender-paid assessment | Documented (S46, S24) | 3–4h | Fee collector account + key handling |
| Payout integration with a mock platform | ⟨ours⟩ | 3h | None |
| x402 per-task path | Documented (S37) | 4–6h | Facilitator access, funded + associated account |
| Arkiv record schema + ownership | Documented (S15, S16) | 3h | Ownership/handover design |
| Renewal job + expiry handling | Documented (S17) but *no expiry event* | 3h | Expiry is invisible; needs a scheduler |
| Worker viewer + export | ⟨ours⟩ | 4h | None |
| Partner reader (lender screen) | ⟨ours⟩ | 2h | None |
| World ID onboarding + fallback path | Documented (S10, S11) | 3h | Two paths, not one |
| **Credible demo** | | **~25h** (sum of the rows) | Heavier than Gatekeeper: token + two wallets |

The technical risk is concentrated in one place: token fee mechanics. Everything else is a small app around documented primitives.

### 5b Commercial

⟨ours⟩ Three funding models, ranked by how likely they are to survive contact with a platform:

| Model | Who pays | Honest assessment |
|---|---|---|
| **Employer-funded** (platform pays, worker keeps full pay) | Platform | The right design, and the hard sell: it is a cost against take rate, justified by retention and by being able to say something a competitor cannot |
| **Brand-funded** | A brand or the end customer, per order | The most likely to actually happen, because it comes out of marketing/CSR budget rather than payroll, and it is legible: "this delivery funded 1% of a rider's cover" |
| **Worker-funded** | The worker | **Rejected.** It is a pay cut with better branding, and the fee default (S46) makes it the accidental outcome if nobody checks |

- **Customer:** a platform (B2B sales, slow) or a brand (sponsorship, faster, smaller). The benefit partner is a *channel*, not usually the payer.
- **The payer's alternative:** doing nothing, or an insurance add-on the worker buys. The pitch has to beat "we already offer a top-up".
- **Unit economics** ⟨ours, no market data collected⟩: a single-digit-percent split of a small payout is a small absolute number, so the rail is only interesting aggregated across a platform or funded per-transaction by a brand. The record may be worth more than the money — it is the thing that makes a worker legible to a lender.

### 5c Legal and ethical

- **We do not hold the money.** Routing contributions to a licensed partner is the design; anything that looks like taking deposits, intermediating insurance, or running a pension is a regulated activity and is out of scope. This needs a lawyer in the operating jurisdiction; nothing here is legal advice.
- **The record is personal data** even in bands, and it is worker-owned and consent-scoped. A partner reading it needs a lawful basis; "the worker showed us" is the simplest one ⟨ours⟩.
- **Labour framing matters.** Call it a contribution account, never a pension, and never imply an employment relationship or statutory entitlement that does not exist.
- **Exclusion is the sharp ethical edge.** Gating a *benefit* behind a smartphone app is heavier than gating a signup, which is why the fallback path in §3 is mandatory rather than nice-to-have.
- **Correction rights.** Because the platform cannot rewrite a worker-owned record (S15), there must be an append-only dispute path, or a wrong record becomes permanent.

---

## §6 Failure modes, ranked

| # | Failure | Early signal | Severity |
|---|---|---|---|
| 1 | Fee direction defaults to receiver-paid, so the worker silently funds their own benefit | Take-home is lower than before the rail; nobody notices because the number still looks plausible | **Fatal and reputational** |
| 2 | No one will fund it — platform says margin, brand says no budget | Every conversation ends at "who pays?" | Fatal to the business |
| 3 | Records expire at 182.5 days with no event (S17), so "portable" quietly becomes "temporary" | An old record returns nothing and nobody was alerted | Severe, and it undercuts the main claim |
| 4 | A lender will not accept a worker-owned record | Underwriter asks for bank statements | Severe — the record becomes decorative |
| 5 | World ID gate excludes the workers who need it most | A rider cannot onboard without installing an app | Severe, ethical |
| 6 | Worker loses the owner key | Record frozen; owner-only writes (S15) mean no recovery | Moderate, structural |
| 7 | Read as "another payout app with a dashboard" | The demo starts with balances instead of the portable record | Moderate — demo ordering |

---

## §7 Verdict

**Build it narrower than the title suggests.** The rail and the record are real, documented and demoable; the pension is not ours to promise.

The demo that works is three beats: a payout splits **without reducing the worker's pay**; the record appears in a viewer the platform cannot edit; a lender screen reads it and returns a decision. That is a complete story about portability in under a minute of footage.

**Claims we can make on stage:** a contribution can be split at settlement and enforced by the token rather than by our code (S46); it can be funded by the payer, not the worker; a worker-owned record survives leaving the platform and cannot be edited by it (S15); the split is x402-meterable for task-level pay with the fee sponsored (S37).

**Claims we cannot make:** that this is a pension or an insured benefit; that the record is permanent (182.5 days, S17); that any platform or lender has agreed to it (no conversations have happened); that 1% is a meaningful amount (no arithmetic has been validated against real payouts); that it works for a worker without a smartphone.

**Score cross-check against `ideas-10.md` §13.** Prize math (12) and integration (10) hold, and the fee-direction correction arguably strengthens integration because it is a real product insight. Feasibility should drop **7 → 6**: token plumbing plus a renewal scheduler plus two onboarding paths is more than a weekend of certainty. Non-rerun (5) and demo clarity (3) hold. **Net 36/40, still #2** — `ideas-10.md` §14 keeps Gatekeeper as the build and this as the local-relevance alternative.

---

## §8 Open questions to close before committing

1. Who is the payer in the demo — the platform or a brand? The story changes completely, and the brand version is easier to film.
2. Are the bands enough for a partner, or does the demo need exact amounts with consent? Test with one underwriter.
3. What renews a record at 182.5 days — the worker's wallet, a delegate, or nobody (accepting a rolling window)?
4. Does the contribution account belong to the worker or to the partner, and who can move the money?
5. Is World ID required for the *contribution* or only for the *matched top-up*? The second is much easier to defend ethically.
