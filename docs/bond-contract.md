# Bond contract — `FaceValueBond.sol`

Companion to `dispute-spec.md` and `plan-facevalue.md` §4.4 / §11. One contract, ~70 lines of logic. It holds stakes and moves money. **It never decides identity.**

Deploy target: **Hedera EVM testnet** (chain id 296), same ecosystem as the x402 payments, so the demo stays on one network.

> Cost booked: shipping any `.sol` forfeits the Hedera "No Solidity Allowed" $2,000 track, which audits for zero Solidity files. Accepted deliberately — see `plan-facevalue.md` §11.

---

## 1. The one rule

```
identity  ← decided off-chain, deterministically (face embedding, thresholds)
money     ← decided on-chain, by this contract, from that one boolean
```

The contract's only inputs about a face are a `bool`. It never sees an image, an embedding, a nullifier, or a match score. This is what keeps "the face decides, not a vote" true even though the money is on-chain.

---

## 2. Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFaceValueBond {
    event Staked(bytes32 indexed likenessId, address indexed staker, uint256 amount);
    event Challenged(bytes32 indexed likenessId, bytes32 indexed challengeId, address challenger, uint256 amount);
    event ReviewApproved(bytes32 indexed challengeId, address resolver, bool verdict);
    event Resolved(bytes32 indexed likenessId, bytes32 indexed challengeId, bool faceWins, uint8 tier);
    event Withdrawn(address indexed who, uint256 amount);

    // --- stake ---
    function stake(bytes32 likenessId) external payable;                 // registrant
    function challenge(bytes32 likenessId, bytes32 challengeId) external payable; // challenger

    // --- settle ---
    function resolveTier1(bytes32 likenessId, bytes32 challengeId, bool faceWins) external; // MATCHER_ROLE
    function approveReview(bytes32 challengeId, bool verdict) external;                     // RESOLVER_ROLE
    function resolveReview(bytes32 challengeId) external;                                   // permissionless once quorum

    // --- money out (pull pattern) ---
    function withdraw() external;

    // --- views ---
    function stakes(bytes32 likenessId) external view returns (uint256 registrant, uint256 challengerPool);
    function credit(address who) external view returns (uint256);
}
```

---

## 3. Storage

```solidity
struct Likeness {
    address registrant;
    uint256 registrantStake;
    uint256 challengerPool;   // sum of all losing-challenger stakes
    bool    settled;
}

struct Challenge {
    bytes32 likenessId;
    address challenger;
    uint256 stake;
    uint8   approvals;        // distinct RESOLVER approvals for this verdict
    uint8   rejections;
    bool    open;
}

mapping(bytes32 => Likeness)  public likenesses;
mapping(bytes32 => Challenge) public challenges;
mapping(address => uint256)   public credit;   // withdrawable balance, pull pattern
mapping(bytes32 => mapping(address => bool)) public hasStaked;   // one stake per address per likeness
mapping(bytes32 => mapping(address => bool)) public hasApproved; // one approval per resolver per challenge
```

**One stake per address per likeness.** Both `stake()` and `challenge()` revert if `hasStaked[likenessId][msg.sender]`. This stops a person staking twice to inflate a pool, and stops the registrant also challenging its own likeness.

---

## 4. Resolution, and where the money goes

### Tier 1 — automatic (the 90% path)

`resolveTier1(likenessId, challengeId, faceWins)` is callable **only** by `MATCHER_ROLE` (a backend key or an oracle account). It requires that the challenge is open and its stake is already posted.

| `faceWins` | registrant gets | challenger gets | other challengers |
|---|---|---|---|
| `true` | `0` | `registrantStake + challengerPool` | their stakes are inside `challengerPool`, so they lose |
| `false` | `registrantStake + challengerPool` | `0` | lose |

Wait — `challengerPool` contains **all** challenger stakes, including the winner's. Correct accounting on a win:

```
payout = winnerStake + registrantStake + (challengerPool − winnerStake)
       = registrantStake + challengerPool
```

which is the whole pot. So the rule reads: **`faceWins` → the winning challenger takes the pot; otherwise the registrant takes the pot.** That is the dispute-spec §4 rule exactly, and it is symmetric.

### Tier 3 — the gray band

1. `approveReview(challengeId, verdict)` — `RESOLVER_ROLE` only, one approval per address per challenge.
2. At **2 approvals with the same verdict**, anyone calls `resolveReview(challengeId)`, which settles using that verdict.
3. 2 approvals split across verdicts, or fewer than 2 → stays open. It **cannot** resolve without a quorum.

### Tier 2 — no chain action

The evidence pack is off-chain. Nothing is written to the contract until a human votes, which lands in tier 3.

---

## 5. Access control

| Role | Held by | Can | Cannot |
|---|---|---|---|
| `DEFAULT_ADMIN` | deployer, renounced post-setup | set roles once | withdraw, resolve, approve |
| `MATCHER_ROLE` | backend service key | `resolveTier1` | move funds otherwise |
| `RESOLVER_ROLE` | the three resolver addresses | `approveReview` | `resolveTier1`, withdraw others' money |

**The contract has no owner-withdraw path.** There is deliberately no `emergencyWithdraw`, no `sweep`, and no upgradability. A key that can empty the pot is the exact centralisation this contract exists to remove.

`MATCHER_ROLE` is the only trusted input, and it is trusted for exactly one boolean. If it lies, it can settle the wrong way — so it must be constrained off-chain (deterministic thresholds, logged `cos` value, HCS record of every call). Say this on stage rather than implying the matcher is trustless.

---

## 6. Withdrawals — pull, never push

Every payout credits `credit[who]`; the recipient calls `withdraw()`. Reasons:

- A reverting recipient (contract address, full account) cannot brick a resolution.
- One `resolve` call costs O(1) instead of N transfers.
- The demo shows the withdraw step, which is where the money visibly moves.

`withdraw()` follows checks-effects-interactions and uses `call{value:}("")`, so it works for EOAs and contracts.

---

## 7. State mapping

| `dispute-spec.md` state | Contract state |
|---|---|
| `provisional` | `likenesses[id].registrantStake > 0`, no challenges |
| `disputed` | ≥1 challenge with `open == true` |
| `review` | a challenge with `approvals == 1` (or 2 split) |
| `moved` | resolved with `faceWins == true`; **ENS controller reassign is a separate off-chain step and must succeed before HCS `likeness.moved`** |
| `active` | resolved with `faceWins == false`, or never challenged |
| `revoked` | registrant stake returned; contract does not track revocation (ENS does) |

---

## 8. What the contract does NOT do

- **No identity.** No image, embedding, nullifier, or score.
- **No ENS.** The controller reassign stays an ENS write from the backend. If it fails after a winning challenge, status stays `disputed` and the resolution is retried — do not settle bonds before ENS lands (`dispute-spec.md` §5, anchor-before-release).
- **No HCS.** Every state change is mirrored to HCS by the backend after the tx confirms. The contract is the source of truth for money; HCS is the audit trail.
- **No licence logic.** Licences are ENS subnames + HTS receipts.

---

## 9. Test plan (do this before recording)

| # | Test | Expected |
|---|---|---|
| 1 | `stake` then `stake` again from the same address | second reverts |
| 2 | `challenge` with `msg.value != registrantStake` | reverts |
| 3 | `resolveTier1(faceWins=true)` by a non-matcher | reverts |
| 4 | Tier 1 win | winner's `credit == registrantStake + challengerPool` |
| 5 | Tier 1 loss | registrant's `credit == whole pot` |
| 6 | `approveReview` twice from the **same** resolver | second reverts |
| 7 | Two different resolvers, **opposite** verdicts | `resolveReview` reverts (no quorum) |
| 8 | Two different resolvers, **same** verdict | `resolveReview` settles |
| 9 | `withdraw` twice | second is a 0-value no-op, not a double pay |
| 10 | `resolveTier1` on an already-settled challenge | reverts |
| 11 | Third challenger stakes mid-dispute then registrant wins | registrant takes all three stakes |

Test 11 is the one that proves the many-challenger rule from `dispute-spec.md` §4.

---

## 10. Deployment notes

- Chain: Hedera EVM testnet (296). Fund the deployer with testnet HBAR.
- Record in the README: contract address, deploy tx, and **one `Resolved` tx on HashScan**.
- `MATCHER_ROLE` holder address must be in `.env`, never in the repo.
- No proxy, no factory. One deploy, one address, shown in the demo.

---

## 11. Open questions

1. **Bond denomination.** Native HBAR on Hedera EVM, or an ERC-20? Native is simpler; ERC-20 avoids gas/denomination confusion in the UI. Current answer: native.
2. **Does `MATCHER_ROLE` need a delay?** A timelock between `resolveTier1` and withdrawal would let a wrong resolution be caught. Costs ~15 min to add; worth it only if G5 lands early.
3. **Can the registrant top up a stake** after registration (to make a squat more expensive)? Not in v1; would break the "equal stakes" assumption in `challenge()`.
