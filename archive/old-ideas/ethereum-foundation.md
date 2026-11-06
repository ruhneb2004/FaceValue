# Ethereum Foundation — making Chhaya a CROPS app

Status: **co-equal priority with World / Arkiv / Hedera.** One hard problem remains (§0), and one pleasant surprise (§1): EF's *best* fit for this product is not Anon-RPC.

---

## §0 The quartet problem — settle this before promising anyone four prizes

> **Update: the decision has been taken.** The trio is committed up front — **World ID + Arkiv + Ethereum Foundation** — because only 3 picks exist and a fourth cannot be claimed. Strategy B below is therefore the *fallback*, not the plan: keep it in your pocket if the trio's third pillar is still unproven at T-2h. The one piece of EF work that can still reorder everything is the §2c Arkiv-worker spike. Ideas built on this trio: [`ideas-trio.md`](ideas-trio.md).

ETHGlobal's form takes **3 partner picks** (S5). World, Arkiv, Hedera and EF are four partners. Four *integrations* are fine. Four *picks* are impossible.

> "On the last step of the submission form, you can select up to 3 Partner Prizes to apply for. If a partner has multiple tracks, you can be eligible for all of them while only counting as 1 Partner Prize." — S5

Three ways to live with it:

| Strategy | What it costs | Verdict |
|---|---|---|
| **A.** Pick 3, integrate 4, never claim EF | EF work becomes unjudged decoration | Safe but wasteful |
| **B.** Build all 4, choose the 3 picks at T-2h from evidence | One extra integration; no eligibility lost | **Recommended** — the pick form is the *last* step of submission, so the choice can wait until you know what actually works on camera |
| **C.** Drop a partner now to keep the story tidy | Forfeits real money for tidiness | No |

**Why B is safe:** nothing about building an EF-shaped app requires selecting EF. The CROPS work in §1 is mostly a README section plus one deliberate demo beat. If it lands, you *may* spend a pick on it — and by then you will know exactly what to drop.

### The decision rule, written down now so Saturday-morning-you doesn't improvise

Rank by *proven on camera × realistic award*, and never drop World or Arkiv (they are the brief):

| Situation at T-2h | The 3 picks |
|---|---|
| Everything works, Anon-RPC did **not** land | **World + Arkiv + Hedera**; EF is integrated but unclaimed |
| Anon-RPC landed *and* the Arkiv-worker spike (§2c) produced something demoable | **World + Arkiv + EF** — Hedera's realistic $1,000 is the smallest prize on the table, and a working anon worker is a $2,500–$5,000 shot with real technical depth |
| Hedera's No-Solidity path is broken (no HTS voucher **and** no HCS write) | **World + Arkiv + EF** — Hedera cannot be claimed honestly anyway |
| Arkiv died | Nothing else matters; fall back to idea G (`ideas.md`) |

The asymmetry that makes this rule work: **EF's and Hedera's open pools are the same size — $13,500 each.** EF: Anon-RPC $5,000 + alt mempool $5,000 + CROPS $3,500. Hedera: x402 $6,500 + Tokenize $5,000 + No-Solidity $2,000 (S33, S4). So the choice is decided by *probability*, not pool size. No-Solidity is the most winnable track at the event; Anon-RPC is a crowded one — unless your Arkiv worker is genuinely novel, in which case it flips.

---

## §1 The surprise: our best EF track is **Best CROPS App ($3,500)**, not Anon-RPC

EF's four Mumbai tracks (S33):

| Track | Amount | Open to us? |
|---|---|---|
| Best Use of Anon-RPC | $5,000 (2.5k / 1.5k / 1k) | Yes |
| Best use of the Frame Transaction Alternative Mempool | $5,000 (2.5k / 1.5k / 1k) | Yes, but irrelevant to this product |
| **Best CROPS App** | **$3,500 (2k / 1k / 500)** | **Yes** |
| Best CROPS Upgrade to an Existing Project | $1,500 | ❌ Continuity only |

And the rule that makes entering cheap: *"One EF prize per project. You can submit to anon-rpc, the alt mempool and CROPS, but you will be placed in at most one. EF judges decide where it fits best."* (S33) So entering **both** CROPS and Anon-RPC costs nothing extra — EF arbitrates.

### Why CROPS fits structurally, not cosmetically

The track asks for "an app … where one CROPS property is the reason it exists, without giving up the other three", and warns that *"depth of the lead property: structural (works without you) beats cosmetic (a setting)"* (S33).

Chhaya's lead property is **P — what each third party learns about the user.** That is the product thesis, not an add-on. And the "moment it matters" EF asks to see is something the architecture already gives us:

> **Switch off the issuer backend and dapp B still renders the profile** — because it reads a public database (Arkiv) and a public mirror node (S15, S29). Our backend is not a chokepoint; it is a cache of a public fact.

That is a *structural* C, and it is the most persuasive 20 seconds available for the video. EF lists the exact shape: *"a frontend that keeps working when its domain, backend or RPC provider disappears"* (S33).

The required README section, written honestly:

```markdown
## CROPS

C — What we control that you depend on: the issuer backend (World RP signing,
verification, Arkiv writes, HCS submission) and the domain. If we vanish, new
attestations stop — but every existing passport and every Hedera anchor stays
readable, because dapp B has no backend and reads Arkiv + the Hedera mirror
node directly. What we cannot take away is history.

O — MIT licence. The repo builds with `npm i && npm run dev` plus a `.env`.
Reading data needs no private service of ours; only issuing new attestations does.

P — What each third party learns:
  • World: that a proof was requested for our app+action — not who. Nullifiers
    are app+action scoped and unlinkable across apps (S10).
  • Our backend: the World pairwise `sub`, from which the handle is derived.
    We never receive a name, face or document (S9).
  • Arkiv: everything published, because Arkiv is public by design (S15). The
    profile therefore carries predicates only — there is no name field.
  • Hedera: topic messages containing a handle and a nullifier hash, no
    personal data.
  • No analytics, no third-party trackers in either client.

S — Keys: the World RP signing key and the Arkiv/Hedera operator keys live only
in backend env vars (S10). Proof generation runs on the user's own device (S9).
Trust assumption, stated openly: you trust the issuer not to correlate across
sectors — that is a deployment rule, not something we hide.
```

That is the whole CROPS deliverable, plus no trackers, plus a video of **3 minutes max** (S33) — which is *shorter* than the 2–4 minutes ETHGlobal wants (S5). **The intersection is 2–3 minutes**, so the demo target moves from 3:30 to **3:00** (`submission.md` §4).

---

## §2 Anon-RPC — what it is, and where it genuinely fits

### 2a. What it does (S34)

> "anon-rpc makes it easy for wallets and applications to anonymize their RPC requests. Just provide an Ethereum address at run-time and get an anonymized `fetch` function — anon-rpc plumbs the requests to a sandboxed worker running the network's hash-pinned client code."

An on-chain **specifier contract** pins the worker bundle by `keccak256`. The harness fetches the bundle, refuses anything whose hash doesn't match, and runs it in a Web Worker inside a **null-origin sandboxed iframe** — no DOM, no cookies, no wallet keys. Traffic leaves over **KPS** (key-pinned streams: WebRTC in the browser, QUIC natively), so requests are unlinked from your IP.

Integration is one class (S35):

```ts
import { AnonRpcWorker } from "@anon-rpc/browser-harness"

const worker = new AnonRpcWorker({
  address: "0x…",   // the anonymizing network's specifier contract
  config: undefined,
  preExisting: { rpcProvider: { request: ({ method, params }) => myProvider.request({ method, params }) } },
})

const res = await worker.fetch("https://rpc.example/", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
})
worker.close()
```

⚠️ Two documented traps (S34, S35):
1. The **`passthrough`** worker "fulfils calls with an ordinary fetch, so requests are not anonymized. It demonstrates the sandbox and hash pinning, not privacy." If the demo uses passthrough, we must not call it privacy.
2. The harness is **browser-only** (null-origin iframe + WebRTC). Anonymization therefore has to happen in dapp A/B's client, never in our Node backend.

### 2b. The honest scope problem

The qualification is *"Your app routes its RPC reads through Anon-RPC by default"* (S33). Our reads:

| Read | Protocol | Covered by Anon-RPC? |
|---|---|---|
| Passport / attestation / claim queries | Arkiv `arkiv_query` over JSON-RPC (S15) | **Not documented** — undetermined (§2c) |
| Voucher + HCS history | Hedera mirror node **REST** (S29) | No — not EVM RPC |
| Anything EVM (balances, L2 attestations) | `eth_*` | **Yes** |

Without new work, Anon-RPC would cover **none** of our real traffic. Bolting on an EVM read purely to have something to anonymize is exactly the "cosmetic" version EF marks down (S33), and judges would see it.

**The clause that saves us from pretending otherwise** (S33):

> "if you choose to exclude some traffic as an intentional performance/anonymity tradeoff instead of implementation difficulty, that can be a good thing, just let us know"

That is an explicit invitation to scope honestly. Take it, in writing.

### 2c. Where Anon-RPC becomes real — the best technical-depth story here

EF's idea list includes **"new network"** and *"implement/fork the anon-rpc harness to bring anon-rpc to a new platform"* (S33). Arkiv is an **Ethereum-aligned DB-chain that speaks Ethereum's JSON-RPC** (S15). If its read method can be served by a hash-pinned worker, *every profile lookup* becomes anonymized — which matters here far more than in a portfolio dashboard, because **the lookup pattern is the leak.** An aid organisation's IP asking for 14 specific handles reveals who is being screened, even though every entity is pseudonymous.

Treat this as a research spike, never a promise:

| | |
|---|---|
| **Hypothesis** | `arkiv_query` can be served by an anon-rpc worker, giving dapp B anonymized profile reads |
| **Spike** | 45 min: read `SPEC.md`'s capability API (S34) and decide whether a minimal specifier + worker is feasible today |
| **Pass** | dapp B issues one Arkiv query through `worker.fetch` and gets a correct result |
| **Fail** | Record the finding in the submission ("we checked whether Arkiv could be an anon-rpc network; here is what blocked it"). Under EF's own criteria a documented, correct scope decision scores better than a cosmetic integration |
| **Never** | Claim Anon-RPC privacy while using the passthrough worker, or while the only anonymized calls are dummy `eth_blockNumber` calls |

If it passes, it is the strongest single piece of engineering in the project — and it flips the pick decision in §0.

---

## §3 Cost and sequencing

| Deliverable | Effort | Prize it touches |
|---|---|---|
| `CROPS` README section (§1) | 30 min | EF CROPS $3,500 |
| "Kill the backend" demo beat (backend off → dapp B still loads) | 15 min to stage; already true | EF CROPS |
| No third-party analytics in either client | 0 (just don't add any) | EF CROPS |
| `@anon-rpc/browser-harness` wired into dapp B for whatever `eth_*` reads exist | 45–60 min | EF Anon-RPC $5,000 |
| Arkiv-as-anon-network spike (§2c) | 45 min, hard stop | EF Anon-RPC (technical depth) |
| **Total** | **~2.5 h** | 4 EF tracks, 1 pick |

Two and a half hours buys a credible shot at EF's $3,500 CROPS track — cheaper than any other partner's qualification path in this project. That is why EF is now a co-equal priority rather than an afterthought.

---

Sources: S4, S5, S9, S10, S15, S29, S33, S34, S35 — see `sources.md`.
