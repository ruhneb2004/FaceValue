# Ideas for a three-pick team: World ID + Arkiv + Ethereum Foundation

**Premise: three partner picks, three pillars, none decorative.** Every idea below is scored on the same test — remove a pillar and something specific and load-bearing breaks. If a pillar could be deleted without a loss, it is decoration and the idea is rejected.

---

## §1 Which trio, and why Hedera is the one dropped

The trio is **World ID + Arkiv + Ethereum Foundation**.

Reasons, in order:

1. **Anon-RPC is a privacy primitive; Hedera is not.** World ID proves *who may act*, Arkiv holds *what is known*, and Anon-RPC controls *who is watching*. Those are the three questions a privacy product has to answer. Hedera answers a fourth, different question — how to place a tamper-evident timestamp or a token on a ledger — and it answers it well, but no Hedera service makes the system more private.
2. **The three compose; a fourth is additive.** Section §3 shows that World ID + Arkiv *without* a private read layer actively destroys its own guarantee. That is a joint failure, and it is the strongest argument available for why these three specific partners belong in one build.
3. **It is what you asked for.** EF was raised because "anon rpc … might be useful in privacy" — and it is the only one of the four candidates whose Mumbai tracks are named after privacy properties (CROPS = censorship resistant, open source, private, secure).

This is a reversible decision. The original brief explicitly named Hedera's **"No Solidity Allowed" $2,000** track (S4), so §11 documents the swap in full — and it also explains why the trio choice and the idea choice are one linked decision, not two.

---

## §2 The three layers

| Layer | Partner | What it uniquely protects | Key mechanics (all sourced) |
|---|---|---|---|
| **Identity** | World ID | *Who may act* — that an actor is one unique human, and nothing else | ZK proof generated on-device; the app receives a proof, not personal data (S9). Nullifier derived from *(person, app, action)*, documented as unlinkable across apps (S10). Agent Pass returns a pairwise, sector-scoped `sub` (S14). `require_user_presence` adds liveness and fails with `user_presence_failed` (S12). |
| **Data** | Arkiv | *What is known* — public, wallet-owned, queryable claims that travel between dapps | Public by design — anyone can read and write (S15). Only the owner wallet can update, extend, transfer or delete (S15). Writes are transactions, reads are `arkiv_query` over Ethereum JSON-RPC; 2s blocks; `patchEntity`, not `updateEntity` (S15). Max 32 attributes; indexed vs stored-only; owner wallet pays (S15). `str` is capped at **128 bytes** (S16). Expiry is enforced and hard-capped (S17). **Rows per page 100** (`MAX_LIMIT`), with no documented aggregate or count method (S19). Change streams / watch events exist (S20). |
| **Access** | Ethereum Foundation | *Who is watching* — that a read happened at all, from where, and by whom | Anon-RPC: an on-chain specifier contract pins the worker bundle by `keccak256`; the harness accepts only a hash match and runs it in a **null-origin sandboxed iframe**; traffic leaves over **KPS**, unlinked from the IP (S34). Rationale, in EF's words: *"Centralized RPC providers see too much… concentration makes users vulnerable to censorship and surveillance"* (S34). Harness is **browser-only**; API is `new AnonRpcWorker({…})` then `worker.fetch()` (S35). CROPS rewards the property that is *"structural (works without you) beats cosmetic (a setting)"* (S33). |

---

## §3 Why these three belong together

World ID makes you **pseudonymous**. Arkiv makes your claims **public**. Put them together without a private read layer and you have built a system that identifies people by their curiosity:

- the handle is stable within a sector (S14),
- the claims attached to it are readable by anyone (S15),
- and every read is a query from an IP address to a concentrated RPC provider (S34).

So one un-anonymized lookup links **IP → handle → person**. The identity layer protects *who you are*; the access layer protects *the fact that you were looking*. For the scenarios that follow — an aid queue, a petition, a report desk — being seen to look is often more dangerous than being named, because it reveals intent, association and need.

**Pseudonymity over public data is destroyed by read metadata.** That single sentence is the reason this trio is a system rather than three sponsorships.

### The test every idea must pass

For each idea below, three rows: *remove this pillar → what breaks*. This mirrors what judges already reward — 0G's published prompt asks for "one sentence on what breaks if 0G is removed" (S1) — and it is the only honest way to claim three pillars are equal.

---

## §4 Idea 1 — Chhaya: the pseudonymous passport for scarce benefits

**The moment.** A mutual-aid pool, health camp or scholarship has 500 slots and a queue full of bots, resellers and duplicate accounts. Today the fix is to demand an ID — which turns *the list of people who needed help* into a surveillance artefact that outlives the programme. Chhaya enforces "one human, one slot" while the claimant's name never enters the system, and lets a second, unrelated organisation honour the same person's track record without either database being opened.

- **World.** Agent Pass gives a sector-scoped stable handle, so a person is recognisable *within* mutual aid and invisible across sectors (S14). IDKit `proofOfHuman` at the claim moment with `action = claim-slot:<id>`, `signal = handle`, and `require_user_presence` (S12). The nullifier is the one-slot-per-human brake (S10).
- **Arkiv.** Three schemas owned by the claimant's wallet — passport, attestation, claim — with expiry 30 days / 90 days / **15 minutes** for the self-releasing slot hold (S15, S17). Any second org queries them with no API key and no integration meeting (S15).
- **EF.** The reads are the leak: an aid org's lookup pattern reveals who is being screened, which for a health camp is stigma, not embarrassment. dapp B routes reads through Anon-RPC (S34); the CROPS property is that dapp B has no backend at all (S33).

| Remove | What breaks |
|---|---|
| World | "One human, one slot" becomes unenforceable; the queue is farmable by one script. |
| Arkiv | dapp B needs our API, and the profile cannot cross to a second organisation — the brief's core requirement dies. |
| EF | The provider, and anyone watching the wire, sees which handles an aid org inspected. The claimant is pseudonymous and simultaneously mapped. |

**Honest cost of dropping Hedera here:** we lose an *independent* tamper-evident timestamp. Arkiv's own write transaction plus `$createdAt` is what remains (S15). That is weaker than a separate ledger, and the submission should say so instead of implying equivalence.

**Feasibility:** highest continuity — reuses `flagship.md` wholesale. But EF is the *least* load-bearing pillar of the four ideas, which is exactly why it is not the top pick.

---

## §5 Idea 2 — The petition that cannot be shut down ★

**The moment.** A residents' association, a campus grievance, a labour petition. The organiser must prove "N distinct humans really signed this, and not one of them was exposed" — and the threat model includes the organiser's own employer or government, so an IP log is *physical* risk. A normal petition site is a single server that can be subpoenaed, shut down or edited.

- **World.** `action = sign:<campaignId>` makes every nullifier campaign-scoped: one human, one signature, and a signature cannot be transplanted to another campaign (S10).
- **Arkiv.** Each signature is a public, independently verifiable entity — campaign id, a hashed nullifier, timestamp, optional short comment (inside the 128-byte `str` cap, S16) — with campaign-scoped expiry (S17). Because entities are wallet-owned (S15), a signer carries their participation history to the next campaign without asking our permission.
- **EF.** Two jobs at once. **The read side is anonymized**: before signing, the page must check “has this campaign already got my signature?” and resolve the campaign’s current tally — those are queries, and through Anon-RPC the provider cannot tie them to a signer’s address (S34, S35). And **C** is the lead CROPS property, structurally: the frontend is static, so it keeps working when it loses its domain, backend or RPC provider (S33).

**Scope limit, stated up front:** Anon-RPC’s documented job is anonymizing **RPC reads** (S33, S34). The *write* — broadcasting the signature transaction — is outside that scope, and a submission IP is still a submission IP. We say this on camera rather than implying the read layer covers the write. EF explicitly welcomes that kind of scoping: *“if you choose to exclude some traffic as an intentional performance/anonymity tradeoff instead of implementation difficulty, that can be a good thing, just let us know”* (S33).

**Demo beats.** Three signatures land. A fourth attempt by the same human is rejected on nullifier. The counter updates live off Arkiv watch events (S20). Then kill the backend and reload — the petition still verifies.

**Honest constraints.** There is no documented aggregate or count, so tallies paginate at 100 rows per page (S19) — fine at demo scale, but say it out loud. And the *number* of signatures is public even though identities are not: that is the intended property, not a leak.

| Remove | What breaks |
|---|---|
| World | One person signs ten thousand times; the petition is worthless as evidence of anything. |
| Arkiv | The signature list lives in our database — the one thing the adversary can delete, edit or backdate. |
| EF | Every signature leaks an IP. For this threat model the product's entire purpose collapses, and the app becomes shuttable. |

**Feasibility:** highest WOW-per-hour of the four. One page, one schema, one counter, one kill-the-backend beat.

---

## §6 Idea 3 — The private sybil-resistant gate

**The moment.** A faucet, testnet allocation, beta allowlist or free-tier quota that must be one-per-human — but the operator must not accumulate a list of verified humans, **and neither must their infrastructure provider.**

- **World.** One claim per human, `action = claim:<gateId>` (S10), with `require_user_presence` optional at high-value gates (S12).
- **Arkiv.** The receipt becomes a portable "verified human" credit that *other* gates honour without integrating with us, because the entity is public and queryable with no API key (S15, S16). A short expiry makes the credit decay rather than accumulate (S17).
- **EF.** The sharpest argument in this document: the eligibility check *is a query*. A provider that observes it learns precisely which addresses belong to verified humans — a ready-made target list for attackers, worth more than the faucet itself. So the gate's reads must go through Anon-RPC (S34, S35).

**Demo beats.** Claim succeeds; a receipt appears on Arkiv. The same human's second claim is rejected on nullifier. A second, independently written gate accepts the Arkiv receipt without any of our code. The eligibility query never leaves the sandbox.

| Remove | What breaks |
|---|---|
| World | Unlimited claims from one script — the gate is decorative. |
| Arkiv | The credit is trapped in our database; no second gate can honour it, and the portability claim is false. |
| EF | We build the very target list we promised not to build. |

**Honest weaknesses.** The product is small and its "moment" is thinner than Idea 2's, so WOW is lower. And the portability claim is only *demonstrated* if a second gate really exists — which means writing two tiny apps, not one.

---

## §7 Idea 4 — The anonymous report registry

**The moment.** A workplace grievance, harassment report, safety incident or corruption tip. The reporter must be a real, unique person — otherwise the organisation dismisses it as a bot flood — and must never be identifiable. Worse: **checking whether your own report was triaged** is itself a signal the employer can use.

- **World.** Unique-human reporter, `action = report:<registryId>`, one report per human per matter, no identity (S10).
- **Arkiv.** A report *record* — matter id, commitment hash, category, timestamps, status transitions — with expiry, and owner-controlled so only the reporter can extend or delete it (S15, S17).
- **EF.** Every read is a leak: opening your own report, an auditor listing reports, a journalist checking status. All of it goes through Anon-RPC (S34).

**Hard limits, stated plainly.** Arkiv is public (S15), so **the report text must never go on Arkiv** — store a commitment and keep ciphertext elsewhere. The naive shortcut is worse than it looks: an encrypted Swarm reference *contains its key*, so it must never be stored raw in a public Arkiv entity (S3). That means real plumbing, not one field.

| Remove | What breaks |
|---|---|
| World | The registry is spammable, therefore dismissible — the exact outcome the reporter feared. |
| Arkiv | The record lives in the organisation's own database, i.e. with the adversary. |
| EF | The act of reading becomes evidence of dissent; reading your own case file convicts you. |

**Honest verdict:** highest stakes, worst effort-to-risk ratio for the time available. Most likely of the four to fail on demo day.

---

## §8 Scoreboard

Five ETHGlobal criteria (1–5, S5) plus how load-bearing each pillar is in that idea (1–5 each). Max 40.

| | Tech | Orig | Prac | Usab | WOW | World | Arkiv | EF | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| **2. Petition that can't be shut down** | 4 | 5 | 4 | 4 | 5 | 5 | 5 | 5 | **37** |
| **3. Private sybil gate** | 4 | 4 | 5 | 5 | 3 | 5 | 5 | 5 | **36** |
| **1. Chhaya passport** | 4 | 4 | 4 | 4 | 4 | 5 | 5 | 3 | **33** |
| **4. Anonymous report registry** | 5 | 5 | 3 | 3 | 5 | 5 | 4 | 5 | **35** |

Idea 4 scores high and should still not be built: its Practicality is the problem, and a hackathon is won on what reaches the demo.

## §9 Recommendation

**Build Idea 2 — the petition that cannot be shut down.**

It is the only candidate where **the EF pillar is as irreplaceable as the World pillar**: delete World and unique signatures vanish; delete EF and participant safety vanishes; delete Arkiv and the evidence itself becomes deletable. None of the three can be swapped for the other two, which is what "equal priority" has to mean in practice. It also gives EF its strongest available answer — a structural CROPS property rather than a setting — while keeping World ID's proof-of-human-only story intact.

If demo time runs short, **Idea 1 is the same skeleton** and reuses `flagship.md` wholesale: the passport is the petition's schema with different field names.

## §10 Fallback ladder

| If this dies | Fall back to |
|---|---|
| Agent Pass onboarding | IDKit-only; derive the handle server-side. Both other pillars intact. |
| The Anon-RPC spike (§2c of `ethereum-foundation.md`) | Claim **CROPS** instead, never Anon-RPC. A documented "we checked and here is what blocked it" beats a cosmetic integration (S33). |
| Arkiv testnet / access key | The plan is dead as specified — switch to idea G in `ideas.md`. Nothing else rescues the trio. |
| ~12 hours left, two pillars shaky | Shrink to Idea 3: one page, one schema, one receipt, one second gate. |
| Demo machine, browser sandbox, iframe quirks | Record the working run to video *before* iterating further. The submission is a video, not a live demo. |

## §11 If you would rather keep Hedera

Hedera replaces EF as pillar three. What changes:

- **Roles:** World = identity, Arkiv = data, **Hedera = integrity/anchor** via HCS (`TopicCreateTransaction` + `TopicMessageSubmitTransaction`, S26, S27) and an HTS voucher for non-transferability via `freeze` (S28). Never call the token "soulbound" — no source does.
- **What is lost:** the read-privacy pillar. Ideas 3 and 4 largely collapse, because the leak they fix *is* a read leak — a perfect timestamp does not stop an IP address from revealing intent.
- **What becomes strongest:** **Idea 1**, which is why `flagship.md` was written that way.
- **The linkage worth knowing:** the trio choice and the idea choice are the same decision. Hedera + Arkiv + World ⇒ build the passport. EF + Arkiv + World ⇒ build the petition. Choosing the trio first and the idea second, independently, is how a team ends up with a decorative pillar.

---

Sources: S1, S3, S4, S5, S9, S10, S12, S14, S15, S16, S17, S19, S20, S33, S34, S35 — see `sources.md`.
