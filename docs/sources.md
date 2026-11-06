# Source registry

Every factual claim in the live docs points at one of these IDs.

- **S#** = an external source I actually fetched and read on **2026-11-05**.
- Local copies: `site/` (raw HTML), `text/` (ETHGlobal pages as text), `md/` (developer docs as Markdown — the doc sites serve clean `.md`, which is how these were captured).
- A claim with **no S# is a design decision we made**, left untagged on purpose. I do not invent facts.
- Where two sources disagree, both are listed and the conflict is called out (see S25 and S22).
- The current build is **FaceValue** (`docs/plan-facevalue.md`). Some sections below support archived comparison work or tracks that were **cut** (Arkiv, Ethereum Foundation/Anon-RPC). They are kept so the S-numbering stays stable; each unused section says so.

---

## Event + prizes

| ID | Source | What it is used for |
|----|--------|---------------------|
| S1 | https://ethglobal.com/events/mumbai/prizes | Prize index. 12 sponsor pages: 0G, 1inch, Arc, Arkiv, Chainlink, Definitive, ENS, Ethereum Foundation, Hedera, Uniswap Foundation, Whitechain, World. |
| S2 | https://ethglobal.com/events/mumbai/prizes/world | World tracks: Agent Pass $5,000 (open), Agent Pass $2,500 (Continuity only), IDKit $2,500 (2× $1,250), IDKit Continuity $2,500. Qualification requirements + resource links. |
| S3 | https://ethglobal.com/events/mumbai/prizes/arkiv | Arkiv tracks: Mirror $4,000, Build from scratch $4,000, Build existing $4,000 (Continuity), Node tooling $2,000, Swarm bonus $500 ×2. Exact required repo artefacts (`/arkiv/*.md`) and judging weights (25% each). |
| S4 | https://ethglobal.com/events/mumbai/prizes/hedera | Hedera tracks: x402 $6,500, Tokenize with Studios $5,000, **"No Solidity Allowed" $2,000 (2× $1,000)**, Continuity $1,500. |
| S5 | https://ethglobal.com/events/mumbai/info/details | Submission deadline **Sat 7 Nov 2026, 09:00 IST**; **max 3 partner prizes**; a partner with multiple tracks counts as **1** pick; Classic vs Continuity rules; commit-history and AI-attribution rules; 5 judging criteria; 4 min demo + 3 min Q&A. |
| S6 | https://buildpodium.com/prepare/ethglobal-mumbai-2026 | *(secondary)* Confirms the pool and lists past World-track winners: Airlock, Lifeline (both "Best Use of World ID for Agents", Tokyo 2026), Lortnoc Tahc. Used only for originality checks. |
| S7 | https://ethglobal.com/showcase/agents-list-z7fie | *(prior art)* "Agent's List" — Tokyo 2026 project where a *fresh* World ID approval authorises agent payments inside limits. Used to avoid re-treading a known winner. |
| S8 | https://hacklist.io/hackathon/1a412b60-9718-4aa2-9899-5720c92d25cd | *(secondary)* Independent summary of Arkiv's five Mumbai tracks. |

## World ID

| ID | Source | What it is used for |
|----|--------|---------------------|
| S9 | https://docs.world.org/world-id/overview | World ID = privacy-preserving proof of unique human; ZK proofs unlinkable across apps; proof generation happens on-device; relying party receives proofs, not personal data. Credential menu. |
| S10 | https://docs.world.org/world-id/idkit/integrate | The IDKit integration contract: `app_id`/`rp_id`/`signing_key`; RP signature **must** be generated server-side, never client-side; `IDKit.request(...)`; response shapes incl. `nullifier` and `expires_at_min`; backend verification at `POST https://developer.world.org/api/v4/verify/{rp_id}`; must check `success === true` **and** `environment`; the `nullifier` uniqueness check is *our* backend's job; store nullifier as `NUMERIC(78,0)`. |
| S11 | https://docs.world.org/world-id/credentials/1 | Proof-of-Human credential — highest-assurance uniqueness signal from Orb verification. |
| S12 | https://docs.world.org/world-id/idkit/credentials | Presets (`proofOfHuman`, `passport`, `selfieCheck`, `identityCheck`), `require_user_presence` (fails with `user_presence_failed`), `signal` binding, `allow_legacy_proofs`; Selfie Check returns `sybil_score` + `integrity_bundle` that must be verified server-side before use. **Also states: "Depending on the credential requested, World ID matches the user's live selfie to the credential image, such as the passport photo or the image captured during Orb verification."** That is the citation for FaceValue's registration gap — and it is **S12, not S1**. The app does not receive the live image or the credential image, so `signal = hash(photo)` is coupling, not proof of ownership. |
| S13 | https://docs.world.org/world-id/idkit/verification-flows | Hot / cold / semi-cold flows; iOS has no deferred deep linking → invite-code mode, 15-min TTL, one-shot codes. Matters for a 35-hour demo plan. |
| S14 | https://auth.world.org/docs | **World ID Agent Pass / Human Continuity**: OIDC IdP; stable **pairwise `sub`** per *sector* — same sector ⇒ same identifier, different sector ⇒ different identifier; fresh step-up authentication (RFC 9470); MCP OAuth endpoints; the stated build goals "power human-backed agents", "protect scarce benefits", "enforce lasting consequences". |

## Arkiv

> **Not used by the current build.** Arkiv was cut on 6 Nov 2026 (see `docs/plan-facevalue.md` §4.1/§9.5). The rows are kept so the citation registry stays stable; do not cite them in the submission.

| ID | Source | What it is used for |
|----|--------|---------------------|
| S15 | https://docs.arkiv.network/start-here/introduction (`.md`) | Entities; `$key/$owner/$creator/$createdAt/$updatedAt/$expiresAt`; max **32 attributes**; indexed vs stored-only; **only the owner wallet can update/extend/transfer/delete**; expiry removes the entity from the query surface; **Arkiv is public — anyone can write and read**; writes paid in GLM; Rabdi testnet block time **2s**. |
| S16 | https://docs.arkiv.network/start-here/first-entity (`.md`) | Exact SDK: `defineSchema("my-app.posts", {...})`, `createPublicClient`/`createWalletClient`, `rabdi({ accessKey })`, `createEntity(schema, values, { expiration })`, `.select().from().ownedBy().fetch()`, typed values via `addr()/dec()/.value`. Needs an **access key** (public RPC is rate limited). |
| S17 | https://docs.arkiv.network/writing/expiration (`.md`) | `ExpirationTime.fromMinutes/fromDays/atDate/max`; hard cap ≈**182.5 days** (`MAX_LIFETIME`, 7,884,000 blocks); `extendEntity` counts from *now*; **Arkiv emits no event when an entity expires** — you must drop it yourself. |
| S18 | https://docs.arkiv.network/querying/filter (`.md`) | `eq/gt/gte/lt/lte/between/startsWith/exists/hasType`, `and/or`; conditions may only name **indexed** columns; wrong type ⇒ compile error or `InvalidPredicateError`. |
| S19 | https://docs.arkiv.network/llms.txt | Machine-readable conventions list: `$`-prefixed entity fields; **`bytes` is never indexed**; `str` max 128 bytes; **no `updateEntity`, use `patchEntity`**; `limit` max 100; no `getEntityCount` (use `client.count()` / `.withCount()`); filter by `.ownedBy()`/`.createdBy()` because anyone can forge your schema tag; sort via `@arkiv-network/sdk/query`. |
| S20 | https://docs.arkiv.network/querying/watch-events (`.md`) | `watchEntityEvents` for live updates — powers the "your hold just expired" UI. |
| S21 | https://hub.arkiv.network/ecosystem | Arkiv's own "**Nobody built this yet**" gap list, including *"Shared Cross-App Schemas — an event created in one app can't appear in another or feed a shared attendance reputation. Define a common entity schema and make two apps interoperate."* Also 116 existing projects / 27 winners, i.e. an overlap check. |
| S22 | https://docs.arkiv.network/typescript-sdk/best-practices | **Stale / conflicting**: targets the Tiramisu testnet and uses `createEntity({ payload, contentType, attributes, expires })`, an API that differs from S16/S17 (Rabdi, schema-based). Recorded as friction evidence for `/arkiv/friction.md`, **not** as guidance. |

## Hedera

| ID | Source | What it is used for |
|----|--------|---------------------|
| S23 | https://docs.hedera.com/llms.txt | Hedera's own agent instructions: JS import is **`@hiero-ledger/sdk`**, *not* `@hashgraph/sdk`; never call Hedera a "blockchain" (it is a hashgraph DLT); write "Hedera testnet" lowercase; HBAR singular and uppercase. |
| S24 | https://docs.hedera.com/learn/core-concepts/tokens/hts-overview | HTS native tokens/NFTs **without deploying smart contracts**; built-in KYC, freeze/unfreeze, pause, wipe, account association; custom fees; role keys (admin/supply/freeze/KYC/wipe/pause/fee-schedule/metadata). |
| S25 | https://docs.hedera.com/learn/core-concepts/accounts/auto-account-creation | Auto account creation: EVM address (rightmost 20 bytes of keccak256 of the ECDSA pubkey) used as alias, account ID `0.0.<evmAddress>`; **this page cites HIP-583**. ⚠️ Conflict: S23's index blurb says "HIP-32 and HIP-542". Trust the page; re-verify before depending on it. |
| S26 | https://docs.hedera.com/native/consensus/create-topic | `TopicCreateTransaction`; admin key vs **submit key** (private topic); memo; auto-renew bounds; custom fees on topics; `receipt.topicId`. |
| S27 | https://docs.hedera.com/native/consensus/submit-message | `TopicMessageSubmitTransaction`; message sequencing; chunking. |
| S28 | https://docs.hedera.com/native/tokens/define | `TokenCreateTransaction` for fungible/NFT tokens with keys, supply, treasury. |
| S29 | https://docs.hedera.com/operators/mirror-node/ | Mirror node REST **testnet root `https://testnet.mirrornode.hedera.com/api/v1`**; HCS gRPC testnet `testnet.mirrornode.hedera.com:443`; mirror nodes are the cheap historical read path. |
| S30 | https://docs.hedera.com/native/index | SDK install (`npm install @hiero-ledger/sdk`); HTS, HCS, scheduled transactions and the file service are all reachable from the SDKs. |
| S46 | https://docs.hedera.com/native/tokens/custom-fees (local `md/hedera-custom-fees.md`) | Up to **10 custom fees per token**, disbursed to fee-collector accounts on every programmatic transfer; types **fixed, fractional, royalty**. **The fee direction is the trap: "The token receiver (fee collector account) pays these fees by default"**, and only with `net_of_transfers` / `setAssessmentMethod(true)` does the **sender** pay and the receiver keep the full amount. Fractional fees are ≤ 1, fungible-only, with optional per-transfer `min`/`max`. A percentage split is therefore a token *config*, not application code — and the default setting takes the money from whoever receives the transfer. |

## Ethereum Foundation (not used by FaceValue)

| ID | Source | Used for |
|----|--------|----------|
| S33 | https://ethglobal.com/events/mumbai/prizes/ethereum-foundation (captured at `text/ethereum-foundation.txt`) | Four Mumbai tracks: **Best Use of Anon-RPC $5,000** (2.5k/1.5k/1k), **Frame Transaction Alt Mempool $5,000**, **Best CROPS App $3,500** (2k/1k/500), CROPS Upgrade $1,500 (**Continuity only**). Anon-RPC qualification: *"Your app routes its RPC reads through Anon-RPC by default."* CROPS qualification: FOSS licence (MIT/Apache-2.0/GPL/MPL), public repo with run instructions, a README section **titled `CROPS`** with one-two lines per letter (C/O/P/S), a demo video **3 minutes max** showing *"the moment it matters"*, *"No third-party trackers or analytics in the client."* Judging: *"depth of the lead property: structural (works without you) beats cosmetic (a setting)"*. *"One EF prize per project. You can submit to anon-rpc, the alt mempool and CROPS, but you will be placed in at most one."* Explicit permission to scope honestly: *"if you choose to exclude some traffic as an intentional performance/anonymity tradeoff instead of implementation difficulty, that can be a good thing, just let us know"*. Idea list includes **"new network"** and *"implement/fork the anon-rpc harness to bring anon-rpc to a new platform"*. |
| S34 | https://ethereum.github.io/anon-rpc/ · https://github.com/ethereum/anon-rpc | Anon-RPC mechanics: an on-chain **specifier contract** pins the network's worker bundle by `keccak256`; the harness fetches the bundle, accepts it only on a hash match, and runs it in a **Web Worker inside a null-origin sandboxed iframe** (no DOM, cookies or wallet keys); traffic leaves over **KPS** (key-pinned streams, WebRTC in the browser / QUIC natively) so requests are unlinked from the IP. *"Just provide an Ethereum address at run-time and get an anonymized `fetch` function."* |
| S35 | https://ethereum.github.io/anon-rpc/wallets/ | Integration API: `new AnonRpcWorker({ address, config, preExisting: { rpcProvider } })` then `worker.fetch(url, { jsonrpc body })`, from `@anon-rpc/browser-harness`. **Browser-only** (null-origin iframe + WebRTC KPS). Available workers include `passthrough`, `tor-js`, `nym`, `nox`; the `passthrough` worker *"fulfils calls with an ordinary fetch, so requests are not anonymized. It demonstrates the sandbox and hash pinning, not privacy."* |

## ENSv2

Captured 2026-11-05 from `docs.ens.domains/llms-full.txt` (local `md/ens-full.txt`, 28.6k lines). Used for `ensv2.md`. Earlier-ranking notes that referenced this capture are archived at `archive/old-ideas/ideas-10.md`.

| ID | Source | Used for |
|----|--------|----------|
| S47 | https://docs.ens.domains (full capture at `md/ens-full.txt`) | ENSv2 architecture and status. **The two load-bearing facts**: (a) *"The ENSv2 contracts are deployed on Ethereum Mainnet ahead of the ENSv2 launch. Until the launch completes, resolution and registrations on Mainnet continue through the ENSv1 contracts"*, while **Sepolia runs ENSv2** and the Sepolia ENS app/explorer resolve through it; (b) **ENSv2-ready libraries exist** — viem ≥2.35.0, ethers ≥6.17.0 (or the ENS ethers patch), web3.py ≥7.16.0, ENSjs ≥4.2.3, web3j ≥5.0.3, go-ens ≥4.0.0, alloy-rs ≥2.4.2, Nethereum ≥7.0.0, web3.js deprecated — and for read-only integrations *"updating to a supported library is the whole job"*. The Universal Resolver is an upgradeable DAO-owned proxy at the **same address on mainnet and Sepolia**, so targeting ENSv2 is just selecting Sepolia; do not hardcode it. Tests: `ur.integration-tests.eth` → `0x2222…2222` (a `0x1111…1111` result means the library is too old), `test.offchaindemo.eth` → `0x779981590E7Ccc0CFAe8040Ce7151324747cDb97`. Also: 28-day grace period, 21-day decaying premium from ~$100M, multi-year discounts, USDC/DAI payment, EAC roles with exact bit values, mutable token IDs, Verifiable Factory. |
| S48 | https://docs.ens.domains/ensip/25 · https://docs.ens.domains/ensip/26 (in the same capture) | **ENSIP-25** (draft, Oct 2025): a parameterised text record `agent-registration[<registry>][<agentId>]` attests that an ENS name is associated with an entry in an on-chain agent registry such as **ERC-8004**, with the registry given as an ERC-7930 address. **ENSIP-26** (draft, May 2025): `agent-context` plus `agent-endpoint[<protocol>]` for `mcp`, `a2a` and `web` — one identity, one place for context and discovery. Together they are the documented bridge between an ENS name and an agent that pays over x402. |

---

## Other tracks (referenced only where noted)

| ID | Source | Used for |
|----|--------|----------|
| S31 | https://docs.ethswarm.org | Swarm upload / postage stamp basics — only relevant if we chase Arkiv's +$500 Swarm bonus (S3). |
| S32 | https://docs.chain.link/cre · https://docs.ens.domains/ensv2/overview | Linked from S1 sponsor pages; **not used** in the picked design. Listed so the "we deliberately skipped these" note is auditable. |

## Agent economy (x402 / ERC-8004 / agentic commerce)

Captured 2026-11-05 for agent-economy research. FaceValue uses **S37–S38** for the x402 payment flow; the rest is background and originality calibration. Earlier idea notes are archived under `archive/old-ideas/`.

| ID | Source | Used for |
|----|--------|----------|
| S36 | https://ethglobal.com/showcase (raw at `archive/research/showcase.html`) | The **ETHGlobal Tokyo 2026 cohort — 33 projects on the page as captured**, the event immediately before Mumbai. Read only as competitive calibration. Saturated clusters counted from the pitch lines: agent payment guardrails/approval (Izanagi, Agent PayGuard, DSAP Protocol, Proviso, Surety Project, NaAP, My Agent Ohana, Axis — 8), human-attention/fair-allocation (KawaiPay, ScalpLess, Dedan, BrandMyStuff — 4), AMM/DeFi hooks (Iceberg, RateSpace, OniBlock, Unison, YieldSolver — 5). Also present: **Tollgate** (agents buy leftover API credits per call in USDC via x402), **Meigi** (confirmation-of-payee for stablecoins and agents), **Waterline** (proof of delivered GPU), **Tap Pay** (ENS-verified NFC terminal). Used for originality checks only — it is a showcase listing, not a winners list. |
| S37 | https://docs.hedera.com/solutions/ai/x402/how-it-works (local `md/hed-solutions-ai-x402-how-it-works.md`) | The six-step flow and the **fee-payer model**: client builds a `TransferTransaction`, sets payer to the facilitator's `feePayer`, partially signs, Base64 → `PaymentPayload`; server calls facilitator `/verify` then `/settle`; **the facilitator pays the network fee**, so merchant and paying agent need no HBAR for gas. Limits, stated verbatim: facilitator required; client account must be funded and (for HTS) associated; **"Settlement is per-request and discrete… not built for streaming payments or multi-hop routing"**; **"No native privacy"**; "facilitator concentration is a real risk"; alias auto-account-creation policy defaults to `reject`. |
| S38 | https://docs.hedera.com/solutions/ai/x402 (local `md/hed-solutions-ai-x402.md`) | x402 on Hedera settles in **HBAR or HTS tokens including USDC**; brings back HTTP `402 Payment Required` so a server quotes a price and a client pays inside an ordinary request — "no checkout page, signup, or API key". |
| S39 | https://eips.ethereum.org/EIPS/eip-8004 | **ERC-8004 Trustless Agents.** Three registries: **Identity** (ERC-721 + URIStorage, `agentURI` → registration file), **Reputation** (feedback signals, on-chain and off-chain aggregation), **Validation** (hooks for independent validators). Explicitly: *"Payments are orthogonal to this protocol and not covered here"*, with examples of how x402 payments enrich feedback. Positions MCP (tools) and A2A (agent-to-agent) as communication layers that don't cover discovery/trust. |
| S40 | https://www.8004.org/learn | ERC-8004 is a *"discovery and trust protocol"*; **the Validation Registry "is still undergoing technical due diligence and is not yet available"**; one deployment per chain is a deliberate singleton; agent identity must be portable across platforms. |
| S41 | https://www.pymnts.com/news/artificial-intelligence/2026/the-alphabet-soup-of-agentic-standards-a-vocab-playbook-for-merchants-and-psps/ | Merchant-facing map of the stack (MCP = an agent uses things; A2A = agents talk; commerce protocols = how it buys). Consumer appetite: **56% will let an agent search and compare products, 35% will grant an agent access to saved payment credentials** (PYMNTS Intelligence). Frames it as layering, not a standards war. |
| S42 | https://c9group.dev/en/articles/acp-ucp-ap2-agentic-commerce-protocols-compared | State of the three commerce specs on **22 Oct 2026**: **ACP** (OpenAI+Stripe) beta `2026-04-17`, nothing committed since 17 Jul 2026, ChatGPT moved off standalone checkout in March 2026; **UCP** (Google+Shopify) published breaking `2026-08-25` while Google's own surfaces run `2026-04-08`, US early access; **AP2** donated to the **FIDO Alliance 28 Apr 2026**, v0.2, signed Checkout/Payment Mandates, no Google product documents it. ACP discovery = `/.well-known/acp.json`. |
| S43 | https://www.agenticcommerce.dev/ | ACP is **Apache-2.0**, REST- and MCP-compatible, and designed to sit on a merchant's *existing* commerce backend and payment processor; the business stays **merchant of record**. |
| S44 | https://fenbs.ai/blog/agentic-commerce | The most useful honest read (30 Sep 2026): agents are good at **finding and comparing**; *"paying without a person present is specified far more fully than it is used"*; and of the three meanings of agentic commerce, **a business's agent paying per API call "is the least settled"**. |
| S45 | https://openai.com/index/buy-it-in-chatgpt/ | Origin of ACP (29 Sep 2025): Instant Checkout in ChatGPT with Etsy sellers, Shopify merchants coming, **"Orders, payments, and fulfillment are handled by the merchant using their existing systems"**, merchants pay a fee on completed purchases, product results stay organic/unsponsored. |

---

## Claims I am not making

- No source says a World ID nullifier is safe to publish. **That reasoning is ours**; the nullifier stays server-side, and HCS gets a commitment, not the nullifier.
- **No source says `signal = hash(photo)` proves the registrant owns the photo.** S12 says World matches the user's live selfie to the **credential image** (passport/Orb) inside World's verifier; the app receives only `signal_hash`, `nullifier`, `sybil_score`, and an integrity bundle. The attack, the binding ladder, and the dispute mechanism are **ours**.
- No source says a liveness vendor returns a reference image/embedding. Fix A is gated on a 20-minute check and is never assumed.
- No source says a face-match score is a legal determination; the product produces evidence, not conclusions.
- No source says a coincidental lookalike is actionable; laws vary, and the gate returns `unknown` / `possible_match`.
- No source calls a bonded challenge a legal remedy. It is a product mechanism with a human-review fallback, not arbitration.
- **No source says Arkiv is a tamper-proof ledger.** It is public and anyone can write. Arkiv is cut from FaceValue anyway.
- No source calls an HTS token "soulbound"; FaceValue does not use that framing.
- No source guarantees Agent Pass works for a from-scratch hackathon app in the timebox. It is a stretch with a documented fallback.
- **x402 is not a metering system.** S37 says settlement is per-request and discrete and explicitly excludes streaming; FaceValue bills whole requests.
- **Nothing here is a market-size claim.** The business model is a design hypothesis; no TAM figures were fetched.
- **ERC-8004's Validation Registry is not available (S40).** The optional ENSIP-25 registration is scoped to identity only, or omitted.
- Prize amounts and rules are as published on 2026-11-05; ETHGlobal can change them.
- "FaceValue" is a working title. Naming is an aesthetic choice with no source; check it for collisions before the demo.
