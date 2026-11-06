# FaceValue — action plan

Companion to `docs/plan-facevalue.md` (strategy) and `docs/dispute-spec.md` (state machine).
This file is the **build order**. It answers one question: what do we do, in what order, and how do we know it worked.

Deadline: **Sat 7 Nov 2026, 09:00 IST.**

---

## 0. Situation check (read this before anything)

| Fact | Status | Source |
|---|---|---|
| ~30h wall clock remaining | ⚠️ assumed at session start | session |
| Picks: ENSv2, World IDKit, Hedera x402 | ✅ | `docs/prize-map.md` |
| Bond contract forfeits No-Solidity (−$2,000) | ✅ accepted | `docs/bond-contract.md` §7 |
| Subagents available | ❌ **not loaded this session** | extension installed 11:53, session started 13:32 |
| Git repo | ❌ does not exist | `ls -a` |
| App code | ❌ none | no `package.json` |

**The subagent problem.** The fan-out asked for is not possible in the current session process; extensions load at startup and this session predates the install. Consequence: **I am the only worker until restart.** This plan is therefore sequenced so that a single agent can execute it serially, with the parallel splits marked where a restart would help.

Pinned versions (verified via `npm view`, 6 Nov 2026):

| Package | Version |
|---|---|
| `next` | 16.4.5 |
| `react` | 19.3.1 |
| `tailwindcss` | 4.3.4 |
| `viem` | 2.57.16 |
| `wagmi` | 3.7.11 |
| `@worldcoin/idkit` | 4.6.0 |
| `@ensdomains/ensjs` | 5.2.12 |
| `@hashgraph/sdk` | 2.81.0 |

Sources: `npm view <pkg> version` run in this repo, 6 Nov 2026.

---

## 1. The five workstreams

Each is independently shippable and independently demoable. Ordered by **what kills the submission if it is missing**, not by what is interesting.

| # | Workstream | Ship value | Risk | Blocking? |
|---|---|---|---|---|
| **W1** | Repo + deploy skeleton | submission is valid at all | low | **yes** |
| **W2** | Bond contract + tests | custody story; Hedera pick | medium (EVM deploy) | no |
| **W3** | Registry core (ENS + matching) | the product | **high** (embedding) | **yes** |
| **W4** | Web UI (Next.js) | everything a judge sees | low | **yes** |
| **W5** | Demo + video + README | prizes are actually claimed | low | **yes** |

**Rule:** W1 before anything. W3 before W4 is polished. W5 never waits for perfection.

---

## W1 — Repo and deploy skeleton

**Goal:** a deployable Next.js app on a public URL, and a git history that proves work over time.

Why the history matters: submission rules on most hackathon platforms warn that a single-commit upload can be disqualified, and a judge opening a repo with one 6-hour-old commit learns nothing about how it was built. Commit early, commit often.

```
/Users/admin/ethglobal_mumbai
├─ package.json              # pnpm workspace root? NO — single app, keep it simple
├─ apps/web/                 # Next.js 16 app router
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  └─ package.json
├─ contracts/
│  └─ FaceValueBond.sol
├─ docs/
├─ .env.example
├─ README.md
└─ .gitignore
```

**Steps**

1. `git init`, `.gitignore` (`node_modules`, `.next`, `.env*.local`, `out`)
2. `pnpm create next-app@latest apps/web --ts --tailwind --app --eslint --src-dir=false --import-alias="@/*"`
3. Write `.env.example` with **names only, no values** — give every secret a placeholder.
4. First commit: `feat: scaffold Next.js app + docs`
5. Deploy to Vercel immediately, **before any feature exists** — proves the pipe works and gives a URL to put in the submission.
6. Commit + deploy after **every** workstream below. Minimum 12 commits by deadline.

**Done when:** `pnpm build` succeeds and a public URL renders a placeholder page.

**Failure fallback:** if Vercel is slow, `next build && next start` locally and screenshot. A live URL is worth real points but a working local build is worth more than a broken deploy.

---

## W2 — Bond contract

**Goal:** `FaceValueBond.sol` deployed to Hedera EVM testnet (chain 296) with passing tests.

Spec is already written: `docs/bond-contract.md` §2 (interface), §3 (storage), §4 (access control), §9 (11 tests). Do not redesign it; transcribe it.

**Steps**

1. `contracts/FaceValueBond.sol` — transcribe the interface from the spec verbatim.
2. Fast test harness: **Foundry** if `forge` is on PATH, else Hardhat. Prefer Foundry (no JS config, fast).
3. Implement the 11 tests from `bond-contract.md` §9.
4. Deploy to 296, fund deployer from the Hedera testnet faucet.
5. Record the address in `.env.example` **name** and in the README.

**Why this is W2 and not W4:** the contract has a hard external dependency (testnet faucet, RPC). External dependencies are the ones that fail at 03:00. Start it early, and it does not block the UI, because the UI can read a mock until the address exists.

**Done when:** 11/11 tests pass, address on HashScan, one `resolveTier1` tx visible.

**Failure fallback:** if deploy fails, ship the contract + tests + a `deploy:dry` script that logs the bytecode hash, and state in the README that deployment was blocked by testnet access. Honest and still earns the engineering credit.

---

## W3 — Registry core

**Goal:** register → match → license, backed by ENS and a real embedding.

This is the highest-risk stream and the only one where the risk is **technical unknown**, not effort.

**The embedding decision.** `plan-facevalue.md` says "face embedding" throughout but never names a model. That is a hole to close in the first hour, because the choice changes the API, the hashing, and the threshold semantics.

| Option | Pros | Cons |
|---|---|---|
| `face-api.js` (TFJS, in-browser) | no server cost, runs in demo, easy | 128-d descriptor, older, quality varies |
| `@vladmandic/face-api` (maintained fork) | same API, current | larger bundle |
| InsightFace via Python service | best accuracy | second runtime, deploy complexity, **rejected on time** |
| Cloud vision API | accuracy | PII leaves the box, violates the hashing rule in spirit, cost |

**Recommendation: `@vladmandic/face-api`, browser-side,** because it keeps the image never leaving the device, which is a statement the product actually makes. Thresholds in `dispute-spec.md` (`0.65` / `0.45`) are cosine values that were **never measured** — they must be calibrated against a handful of real image pairs before the demo, or the demo will argue against itself.

**Steps**

1. Embedding spike: two images of one person, two of another, measure both cosine scores. **Write the numbers down.** This converts the thresholds from guesses into measured values.
2. `/lib/match.ts` — pure function `cosine(a, b)`, no I/O, unit-testable.
3. ENS: subnames under a registered test name. Use `ensjs` 5.2.12. Register the parent name on Sepolia first, then write resolver records via server-side `viem` wallet client.
4. API route handlers: `POST /api/likeness`, `GET /api/likeness/[id]`, `POST /api/challenge`, `POST /api/license`.
5. Persist to SQLite (better-sqlite3) — no Postgres for a 30h build.

**Hard rule carried from the plan:** only **hashes** of face data go on ENS or HCS. Never an embedding, never an image, never a nullifier.

**Done when:** a likeness registered in one browser can be challenged from another and the state changes.

**Failure fallback:** if face matching is unreliable, the demo shows the *mechanism* (two images, a score, a state transition) with a clearly-labelled "calibration pending" note. Never fake a match result.

---

## W4 — Web UI

**Goal:** the five screens a judge will actually see.

Full spec: `docs/design-spec.md` (the design document for this build).

| Route | Screen | Judged on |
|---|---|---|
| `/` | marketplace — browse faces | does it look like a product |
| `/likeness/[id]` | detail — price per use, licence button, challenge | is the state legible |
| `/register` | live capture + World ID | does onboarding work |
| `/challenge/[id]` | challenger flow + stake | is the dispute fair-looking |
| `/admin/review` | 2-of-3 resolver queue | is custody believable |

**Build order:** layout + tokens → `/` → `/likeness/[id]` → `/register` → `/challenge/[id]` → `/admin/review`.

Build `/` first with seeded data. A marketplace that looks finished with fake data is worth far more at judging than a half-built one that is technically connected.

**Done when:** all five routes render at 1440px and 390px with no layout break, and keyboard focus is visible on every control.

---

## W5 — Demo and submission

**Goal:** claim the prize money.

1. README: what it is, architecture diagram, the three partner integrations with transaction IDs and links, what works, what does not.
2. 3:00 video (limit is 5:00 — shorter is better): register → license → challenge → resolve. Cold open on the problem, not a logo.
3. Every prize requirement in `plan-facevalue.md` §7.4 checked off with a link.
4. **Record the video on the deployed URL, not localhost.**

**Done when:** a judge with no context can answer "what is this, does it work, which partners are integrated" in 60 seconds.

---

## 2. Order of execution

```
W1 (repo+deploy)                    0:00 ── 1:30
  └─ W3.1 embedding spike           1:30 ── 2:30   ← kill-or-continue gate
W2 (contract)                       2:30 ── 5:30   parallel-safe
W3 (registry)                       5:30 ── 11:00
W4 (UI)                            11:00 ── 19:00
W5 (demo+readme)                   19:00 ── 22:00
buffer                             22:00 ── 30:00
```

**The 03:00 gate.** If the embedding spike at +2:30 has not produced two distinguishable cosine scores, cut the challenge flow to a scripted state transition and spend the time on W4 and W5. A beautiful marketplace with a working licence flow scores; a broken dispute flow with no UI does not.

**Where parallelism helps (after restart):**

- `facevalue-frontend` builds W4 against `docs/design-spec.md` while the main agent does W3.
- `facevalue-verify` runs the W5 checklist against the live URL.
- `scout` maps any unfamiliar package.

---

## 3. What to cut, in order

Decided now, in cold blood, so nobody argues at 06:00.

1. **Agent Pass (World, $5,000)** — stretch. Cut unless W3–W4 are done by +18:00.
2. **AI evidence summary** (`dispute-spec.md` tier 2) — the LLM never decides identity, so it is narrative only. Cut it; the tier becomes "skip straight to multisig".
3. **Multi-challenger UI** — the model supports it; the demo shows one. Keep the code, drop the screen.
4. **Dark mode** — tokens exist; toggle is optional.
5. **ENS subname tree** — flat names are enough.

**Never cut:** the licence `409` behaviour on non-licensable states, the visible stake amounts, the 2-of-3 approval display. Those are the whole claim.

---

## 4. Risks

| Risk | P | Impact | Mitigation |
|---|---|---|---|
| Embedding too weak to distinguish people | M | **demo contradicts itself** | spike at +2:30, gate at §2 |
| Hedera EVM testnet RPC/flaky | M | no contract deploy | ship tests + dry-run, say so in README |
| World ID app not approved in time | M | IDKit step fails live | stage-verification fallback, pre-approved staging app |
| ENS registration needs funding | L | no on-chain names | pre-register parent now, write records server-side |
| Time lost to UI polish | **H** | no demo video | W5 starts at +19:00 regardless of state |
| Single agent only (no subagents) | **H** | slower | serial plan above; restart early |

---

## 5. Honest notes

- The `0.65` / `0.45` thresholds are **placeholders**. Until the spike in W3.1 they are numbers someone typed. If the measured separation is different, the spec changes, not the measurement.
- `dispute-spec.md` §5 said "no Solidity" and contradicted the accepted §11 decision; **fixed during this plan**. Recorded here so the change is auditable.
- "Verified likeness" must not appear in any UI string until registration-time liveness ships. It is on the W3 list; if W3 slips, the word comes off the site.
- The contract is trusted for one boolean (`faceWins`). Say that out loud in the README instead of implying the match is trustless.

---

## 6. Sources

| Claim | Source |
|---|---|
| Next.js, React, Tailwind versions | `npm view next|react|tailwindcss version`, 6 Nov 2026 |
| SDK versions | `npm view @worldcoin/idkit|@ensdomains/ensjs|@hashgraph/sdk version` |
| `next/font` + CSS variable pattern | Next.js docs, `app/03-api-reference/02-components/font.mdx` via `docs_lookup`, library_id `/vercel/next.js` |
| Next.js + Tailwind as stack | `docs/plan-facevalue.md:316` |
| Repo layout | `docs/plan-facevalue.md:821` |
| Contract interface, storage, 11 tests | `docs/bond-contract.md` §2–§5, §9 |
| State machine, thresholds, payout table | `docs/dispute-spec.md` §2, §4 |
| No-Solidity forfeit | `docs/bond-contract.md:7`, `plan-facevalue.md:698` |
| Prize amounts | `docs/prize-map.md`, `plan-facevalue.md:895` |
