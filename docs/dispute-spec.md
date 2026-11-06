# Dispute & bond spec

Companion to `plan-facevalue.md` §1.4 (B2, R). This file is the implementation contract: state machine, storage, events, payout table, thresholds. If the plan and this file disagree, **this file wins** and the plan gets amended (§11 there).

Decisions taken: **no UMA contracts** (pattern only), **one bond contract** (`FaceValueBond.sol`, Hedera EVM testnet) which forfeits the $2,000 No-Solidity track — see `plan-facevalue.md` §11, **identity is decided by a face embedding, not by a model and not by a vote**.

---

## 1. Roles

| Role | Identified by | Can |
|---|---|---|
| **Registrant** | wallet + World ID nullifier (server-side) | register one likeness, revoke, license, withdraw |
| **Challenger** | wallet + a **different** World ID nullifier | open challenges, withdraw |
| **Resolver** | one of three `RESOLVER` addresses; any **2 of 3** approve | resolve a `review` challenge; nothing else |
| **Service** | backend key | write status/records, relay HCS, never move funds |

The service **never** holds a key that can move bonds. Escrow release is either automatic (tier 1) or multisig (tier 3). If the service could release bonds, the custody disclaimer in §3.8 of the plan would be false.

---

## 2. State machine

```
                    register + bond
                          │
                          ▼
                   ┌─────────────┐
        window     │ PROVISIONAL │◄──────── revoke (bond returned)
        passes     └──────┬──────┘
        unchallenged      │ CHARGE opened (≥1 challenger)
        ┌─────────────────┴──────────────┐
        ▼                                ▼
   ┌─────────┐                     ┌──────────┐
   │ ACTIVE  │◄────────────────────│ DISPUTED │
   │(defended│   all challenges    └────┬─────┘
   │ or won) │   lost (cos < 0.45)      │
   └────┬────┘                          │
        │                               ├── any challenge, cos ≥ 0.65
        │                               │        └──► MOVED (seized)
        │                               │
        │                               └── any challenge, 0.45 ≤ cos < 0.65
        │                                        └──► REVIEW (bonds held)
        │                                                  │
        └──────────────────────────────────────────────────┴── multisig verdict
```

| State | Licensable | Challengeable | Bonds |
|---|---|---|---|
| `provisional` | **no** (`409`) | yes | registrant's held |
| `active` | **yes** | yes (door never closes) | registrant's held |
| `disputed` | **no** (`409`) | yes (more challengers may join) | all held |
| `review` | **no** (`409`) | yes | all held, frozen |
| `moved` | yes, by the new controller | yes | settled |
| `revoked` | no | no | registrant's returned |

`disputed` is entered when the first challenge opens and left when no challenge remains open. It is a **derived** state: `open > 0`.

---

## 3. Resolution tiers

Thresholds are on **cosine similarity** of an ArcFace-class 512-d embedding against the **frozen** registration reference.

| Tier | Trigger | Decider | Latency | On-chain |
|---|---|---|---|---|
| **T1** | `cos ≥ 0.65` or `cos < 0.45` | none — deterministic | immediate | automatic settle |
| **T2** | `0.45 ≤ cos < 0.65` | evidence bundle built by a model | ~seconds | none |
| **T3** | any T2 case, or an appeal | **2-of-3 resolvers** (§4a) | manual | `resolve()` |

**Rules that do not bend:**

1. The tier-1 thresholds are **published** in the repo and in the UI. A judge must be able to re-run the match and get the same band.
2. A model may assemble the T3 pack (score, crops, EXIF, timestamps, prior challenges). It **must not** output the verdict. Its output is stored as `review_pack_hash` and is evidence.
3. The model's output is **never** fed back as a threshold. No learned adjustment.
4. Every resolution writes its `cos`, its `tier` and either `auto` or the multisig tx id.

**Published, not claimed as accuracy.** These are placeholders tuned on the demo set. Do not print "99% accurate" anywhere; we have not measured that and the plan forbids publishing accuracy claims (§3.4).

---

## 4a. Resolver set — three addresses, 2-of-3, transferable

The resolver is **not** a Gnosis Safe. It is a small resolver registry in the app + a `RESOLVER` table, because a Safe adds a second wallet UX to the demo for no benefit at this scale. The property that matters is the same: **no single address can decide a review alone.**

### The set

```text
resolvers(address, active, added_at, added_by)
           -- exactly three active rows in the demo
review_votes(challenge_id, resolver_address, verdict,               -- NEW
             vote_hash, voted_at, tx_hash,
             PRIMARY KEY (challenge_id, resolver_address))
```

The `review_votes` table is an **index of contract calls**, not the authority. The contract's `hasApproved` mapping is what actually prevents a double vote; the table exists so the UI can show who voted without a chain read per row. If the two disagree, the contract wins.

| Property | Rule |
|---|---|
| Set size | exactly **3** active resolvers |
| Quorum | **2 of 3** on the same verdict resolves the challenge — enforced in `FaceValueBond.sol`, not in the DB |
| Self-resolution | a resolver may not vote on a likeness it owns or has challenged |
| Vote mutability | a vote is final once cast; no switching |
| Result | at 2 matching votes → `resolve()` fires, bonds settle, `review.resolved` to HCS |
| Deadlock | 3 votes, no verdict reaching 2 → stays `review`, bonds frozen, surfaced in the UI |

### Transferring the role

```http
POST /api/resolvers/transfer
{ "from": "0xOld…", "to": "0xNew…", "sigFrom": "0x…", "sigTo": "0x…" }
```

Both the outgoing and the incoming address sign the transfer. Rules:

1. **Exactly three stays true.** Transfer replaces in place; it never grows or shrinks the set. Add/remove would be a separate admin operation with its own audit trail.
2. **Both signatures required** — the new key proves it controls its address, so a resolver cannot burn the role into an address nobody holds.
3. **Pending votes are reassigned** to the new address, so an in-flight `review` does not strand.
4. **Every transfer writes HCS** `resolver.transferred` with both addresses and the tx/attestation id.
5. **Cooldown of 1 hour** between transfers of the same seat, so the set cannot be shuffled mid-review.
6. **Quorum is unaffected** by a transfer: it is always 2 of whatever three are active.

### Why this satisfies the honesty test

A judge asks "can one of you decide who owns a face?" The answer is: no — 2 of 3 independent addresses must agree, which is why the demo runs three separate browser profiles with three separate burner wallets. That is still a **demo arbitration**, not a court, and the README says so. Do not describe it as decentralised governance.

### Demo setup

Three browser profiles (or three private windows), one burner wallet each, funded with testnet HBAR for the review votes. Register all three addresses as active resolvers before recording. Show the transfer once — swap one seat — to prove the role is transferable.

---

## 4. Payout table

**Rule in one line: the person the face identifies takes every stake; everyone else loses theirs.**

Let `B_r` = registrant bond, `B_c` = per-challenger bond (equal to `B_r`), `n` = number of challengers on that likeness.

| Outcome | Registrant receives | Winning challenger receives | Each losing challenger receives |
|---|---|---|---|
| No challenge in window | `B_r` (on revoke/verify) | — | — |
| Registrant defends (all `cos < 0.45`) | `B_r + n·B_c` | — | `0` |
| Challenger *k* wins | `0` | `B_c + B_r + (n−1)·B_c` | `0` |
| Registrant defends, 1 challenge in `review` | held | held | held |
| `moved`, then new controller revokes | `0` | `B_c + B_r` | — |

**Why losing challengers pay the winner, not the loser.** If a failed challenge paid the registrant but a successful one left the losers' stakes with the registrant, a registrant could farm challenges. Tying all stakes to the face's answer means a spurious challenge always costs the challenger and always benefits the party who was right.

**Why no half-burn to a store contract** (UMA does this). UMA burns half the losing bond to prevent a malicious proposer front-running an honest disputer to dispute themselves. We have no proposer race: the registrant does not choose who disputes, and a self-dispute gains nothing because the challenger would have to post a stake equal to the bond and could not recover it. Skip the burn; it would just destroy user funds in the demo.

---

## 5. Escrow mechanics (Hedera EVM, one bond contract)

Bonds are held by **`FaceValueBond.sol`** on Hedera EVM testnet. The backend holds no key that can move the pool. Full interface and test plan: `docs/bond-contract.md`.

| Concern | Where it lives |
|---|---|
| Stake custody | contract |
| Equal-stake enforcement | contract (`challenge()` reverts on a mismatch) |
| Payout split | contract (`resolveTier1` / `resolveReview`) |
| 2-of-3 quorum | contract (`approvals >= 2`, one vote per resolver address) |
| Match result | off-chain, passed in as `faceWins: bool` by `MATCHER_ROLE` |
| Audit trail | HCS, written by the backend **after** the tx confirms |
| ENS controller move | off-chain ENS write, **must land before** HCS `likeness.moved` |

**Ordering, and why it matters.** The contract settles money; ENS settles ownership. On a winning challenge: ENS reassign first, *then* `resolveTier1`, *then* HCS. A failed ENS write leaves the record in `disputed` with the bond still in the contract, which is recoverable. The reverse order would pay the challenger for a name they do not control.

**The contract decides nothing about identity.** It takes one boolean. It never sees an image, an embedding, a score or a nullifier. That is what keeps "the face decides, not a vote" true while the money is on-chain — and it is also the limit: `MATCHER_ROLE` is trusted for that one boolean, so off-chain determinism and the logged `cos` value are the actual guarantee. Say this out loud rather than implying the contract makes matching trustless.

---

## 6. Data model additions

```text
challenges(id, likeness_id, challenger_user_id, challenger_nullifier,
           live_embedding_hash, match_confidence, tier,          -- NEW: 1|2|3
           challenger_bond_tx_id, review_pack_hash,              -- NEW: model evidence
           resolved_by,                                          -- NEW: 'auto' | 'multisig'
           status CHECK (status IN ('open','won','lost','review')),
           created_at, resolved_at)

-- NEW: a challenger may hold only one open challenge per likeness, but a likeness
-- may hold many challenges.
UNIQUE (likeness_id, challenger_user_id) WHERE status = 'open'

bond_ledger(id, likeness_id, challenge_id, kind,                 -- NEW table
            from_account, to_account, amount, asset, hcs_sequence,
            tx_id, created_at)
```

Invariants:

- `status = 'review'` ⇒ every bond on that likeness is frozen.
- A `licenses` row may reference only an `active` or `moved` likeness.
- `moved` requires a successful ENS controller reassignment before the bond settles. If ENS fails, stay `disputed` and retry (§3.9 of the plan).
- `bond_ledger` must sum to zero per likeness once settled.

---

## 7. Events (HCS)

```json
{"type":"bond.staked","likeness":"alice.facevalue-demo.eth","kind":"challenge",
 "challenger":"ch_123","amount":"0.01","asset":"HBAR","contractTx":"0x…","ts":1762…}

{"type":"challenge.opened","likeness":"alice.facevalue-demo.eth","challengeId":"ch_123",
 "cos":0.93,"tier":1,"contractTx":"0x…","ts":1762…}

{"type":"challenge.resolved","likeness":"alice.facevalue-demo.eth","challengeId":"ch_123",
 "outcome":"won","cos":0.93,"tier":1,"resolvedBy":"auto","ts":1762…}

{"type":"likeness.moved","likeness":"alice.facevalue-demo.eth",
 "from":"0x…","to":"0x…","ts":1762…}

{"type":"bond.settled","likeness":"alice.facevalue-demo.eth",
 "challengeId":"ch_123","to":"0x…","amount":"0.02","contractTx":"0x…","ts":1762…}

{"type":"review.requested","likeness":"alice.facevalue-demo.eth","challengeId":"ch_123",
 "cos":0.54,"packHash":"0x…","ts":1762…}

{"type":"review.resolved","likeness":"alice.facevalue-demo.eth","challengeId":"ch_123",
 "verdict":"registrant","resolver":"2of3","votes":2,"contractTx":"0x…","ts":1762…}

{"type":"resolver.transferred","from":"0x…","to":"0x…","newKeySigHash":"0x…","ts":1762…}
```

No nullifier, no embedding, no image on HCS. `cos` is published because it is the evidence; the embedding it came from is not.

---

## 8. UI states this creates

The frontend must render each of these; several do not exist in the current plan.

| Screen | State | What must be visible |
|---|---|---|
| Likeness card | `provisional` | badge, bond, deadline, **licence button disabled with a reason** |
| Likeness card | `disputed` (n challengers) | **the challenger count**, each with an outcome |
| Likeness card | `review` | "under review", bonds held, no licence |
| Likeness card | `moved` | **who holds it now**, with the ENS before/after link |
| Challenge panel | open | stake amount, threshold band, what happens on each outcome |
| Challenge panel | tier 2 | "evidence being assembled — **2 of 3** resolvers must agree" |
| Challenge panel | votes cast | each resolver's address and verdict, with the count towards quorum |
| Admin | resolvers | the three active addresses, and the transfer control |
| Challenge panel | resolved | the `cos` value and the band it fell in |

The refusal has to name the reason: `409 PROVISIONAL` surfaces as "this likeness is not licensable until it is settled", never as a spinner.

---

## 9. Build order and cost

| Piece | Hours | Gate |
|---|---|---|
| Single-challenger loop, tier 1, auto-settle | 2 | **G5** — in the 20h plan as written |
| Multi-challenger: N open challenges, payout split | +1 | only if G5 green by 20:45 |
| Tier 2 pack + tier 3 2-of-3 votes + transfer | +1.5 | cut first |
| Bond contract deploy + tests (`docs/bond-contract.md` §9) | +1 | **G5**, replaces the escrow-account work |
| UI states in §8 | +1 | cut second |

**The 20h plan ships only the first row.** Multi-challenger and human review are designed here so the schema does not have to be rewritten, not because they fit the clock.

---

## 10. Open questions

1. **Thresholds.** `0.65`/`0.45` are starting points; tune on demo faces and publish whatever you land on.
2. **Who is the multisig?** **Resolved:** three addresses in the demo, **2-of-3** quorum, role transferable with both signatures (§4a). Three browser profiles with three burner wallets. Labelled "demo arbitration", not a court.
2a. **Where does the resolver set live?** **Resolved:** the set of three addresses is in the app DB and mirrored into the contract's `RESOLVER_ROLE` grants. A transfer updates both. On-chain voting is the authority; the DB is a UI index.
3. **Appeal path.** A losing challenger may escalate once within the cooldown; does that reopen `disputed` or stay in `review`? Current answer: escalate → `review`, bonds stay frozen.
4. **Can a `moved` likeness be challenged again?** Yes — the door never closes, so the new controller faces the same ladder.
