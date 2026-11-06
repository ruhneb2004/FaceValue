# ENSv2 — what it actually does

Reference note, 2026-11-05, from the full ENS docs capture (`md/ens-full.txt`, 28.6k lines; S47) and the two agent ENSIPs (S48). Everything factual carries an S-id; anything that is our reading is marked ⟨ours⟩.

One line: **the same names, on completely rebuilt contracts** — hierarchical registries instead of one flat table, roles instead of fuses, a resolver per account instead of one shared one, and names as single-owner tokens whose IDs move when permissions move.

**What it is not.** Not a new naming system, not a new TLD, not a rename of `.eth`. `alice.eth` is still `alice.eth`. What changes is who can do what to it, where its records live, and how the contracts are arranged underneath.

---

## §1 Status today — read this before planning anything

There are two deployments and they are not the same stage (S47):

| Chain | State |
|---|---|
| **Ethereum Mainnet** | ENSv2 contracts **deployed ahead of launch**; *"Until the launch completes, resolution and registrations on Mainnet continue through the ENSv1 contracts"* |
| **Sepolia** | **Runs ENSv2** — the Sepolia ENS app and explorer resolve through it |

So: **build on Sepolia, say so on stage.** That is allowed by the ENSv2 track, which accepts ENSv2 on mainnet *or Sepolia* as the centre of the product (S1).

The Universal Resolver is an **upgradeable proxy owned by the ENS DAO, at the same address on mainnet and Sepolia** (S47). Libraries ship that address, so "targeting ENSv2" is nothing more than selecting the Sepolia chain. **Never hardcode a Universal Resolver address** — the docs warn that any implementation address pinned today can be superseded while the proxy stays current.

### Library readiness (S47)

| Language | Minimum version |
|---|---|
| viem | **≥ 2.35.0** |
| ethers | **≥ 6.17.0** (or the ENS ethers patch) |
| ENSjs | **≥ 4.2.3** — of the four shown in the docs (viem, wagmi, ethers, ENSjs), the only one with purpose-built **write** helpers |
| web3.py | ≥ 7.16.0 |
| web3j | ≥ 5.0.3 |
| go-ens | ≥ 4.0.0 |
| alloy-rs | ≥ 2.4.2 |
| Nethereum | ≥ 7.0.0 |
| web3.js | deprecated |

For a **read-only** integration, updating the library *is* the whole migration (S47). Writes are the part that needs ENSv2 understanding.

### Two one-line integration tests (S47)

- Resolve `ur.integration-tests.eth` → must return `0x2222222222222222222222222222222222222222`. Getting `0x1111…1111` means the library is too old.
- Resolve `test.offchaindemo.eth` → must return `0x779981590E7Ccc0CFAe8040Ce7151324747cDb97`. If it fails, CCIP-Read is not wired up.

---

## §2 Architecture in one page

```
root registry
  └─ eth            (registry)  ──resolver──▶ PermissionedResolver (alice's)
       └─ alice     (entry)     ──subregistry──▶ UserRegistry (alice.eth)
            └─ sub  (entry, ERC1155Singleton token)
```

- **A full name does not exist as one object.** It is a **chain of entries** across registries, linked by `subregistry` pointers; the full name is reconstructed by walking up (S47).
- Every registry — root, `.eth`, or a user's own — implements the same three-function interface: `getSubregistry(label)`, `getResolver(label)`, `getParent()` (S47). `IRegistry` says nothing about tokens or permissions, so a custom registry can implement a completely different ownership model.
- Entries link three things: an owner (an ERC1155Singleton token, if registered), a **resolver**, and optionally a **subregistry**.
- Registries and resolvers are deployed as **proxies by a Verifiable Factory**, so instances are cheap and individually upgradeable (S47).

**Resolution** walks down from root and the **deepest resolver wins** (longest matching suffix); a name with no resolver inherits its closest ancestor's (S47). One consequence worth knowing: because the walk passes through every parent, **if a parent expires or its subregistry is removed, every subname under it stops resolving** (S47).

---

## §3 What it does — capability by capability

### 3.1 Hierarchical registries

- Each name can own **its own registry** for its subnames, deployed on demand (S47).
- **Subtree operations**: transfer `montoya.eth` and the new owner can swap in their own subregistry, removing every previous subdomain and resolver in a single operation (S47).
- **Namespace aliasing**: point two different names at the same subregistry and their namespace becomes shared (S47) ⟨ours: useful for "same tree, two brands" products⟩.
- Subnames form **separate token collections** per parent registry (S47).

### 3.2 Enhanced Access Control (EAC) — fuses replaced by roles

| Property | Value (S47) |
|---|---|
| Resources | up to 2^256 (usually one per name) |
| Roles per resource | 64 — 32 regular + 32 admin |
| Holders per role per resource | **15** |
| `ROOT_RESOURCE` (`0x0`) | master key: a role there applies to every name |
| Admin roles | grant/revoke the matching regular role, and themselves |
| Grant/revoke calls | `grantRoles`/`revokeRoles` for a name; `grantRootRoles`/`revokeRootRoles` for root |
| Guardrail | the name-scoped functions **reject** `ROOT_RESOURCE`, so a global grant cannot happen by accident |
| Reversibility | grant/revoke is **reversible**; ENSv1 fuses were a one-way burn |

Roles are packed into one `uint256`: regular roles in the low half, admins at `role << 128`, one nybble each. The 15-holder limit is not a policy — it is the largest number a 4-bit nybble can hold (S47).

### 3.3 Permissioned Registry — 10 roles

The standard registry: tokenised entries, expiry, permissions (S47).

| Role | Value | Scope | Allows |
|---|---|---|---|
| `ROLE_REGISTRAR` | `1<<0` | root | register or reserve names |
| `ROLE_REGISTER_RESERVED` | `1<<4` | root | promote a reserved name to registered |
| `ROLE_SET_PARENT` | `1<<8` | root | set parent registry |
| `ROLE_UNREGISTER` | `1<<12` | root or name | unregister |
| `ROLE_RENEW` | `1<<16` | root or name | extend expiry |
| `ROLE_SET_SUBREGISTRY` | `1<<20` | root or name | attach a child registry |
| `ROLE_SET_RESOLVER` | `1<<24` | root or name | change the resolver |
| `ROLE_CAN_TRANSFER_ADMIN` | `(1<<28)<<128` | name | permit the owner to transfer the token |
| `ROLE_SET_URI` | `1<<36` | root | metadata URI and renderer |
| `ROLE_UPGRADE` | `1<<124` | root | authorise proxy upgrades |

Lifecycle details that bite (S47):

- `register()` takes label, owner, subregistry, resolver, initial role bitmap and expiry. **Owner `address(0)` reserves the name instead of registering it**, and the role bitmap must then be zero.
- A non-expired name cannot be re-registered; it must be unregistered first.
- `unregister()` sets expiry to now and burns the token.
- `renew()` extends but never shortens; **an expired name can be revived by `renew()`** (same owner, token and roles) or re-registered fresh (new owner, new token, new roles).
- **`ownerOf()` returns `address(0)` for expired names** — ownership is time-bounded. `latestOwnerOf()` still reports the last owner.
- `anyId` polymorphism: most functions accept a labelhash, token ID, resource or canonical ID interchangeably.
- `setApprovalForAll` gives an operator **all of the owner's roles on every name the owner holds** — all-or-nothing, no scoping (S47).

### 3.4 Emancipation — a checkable promise

A registry is **emancipated** when no account holds a dangerous role on its `ROOT_RESOURCE`; every registry exposes `isEmancipated()` (S47).

- **Dangerous**: `ROLE_SET_RESOLVER`, `ROLE_SET_SUBREGISTRY`, `ROLE_UNREGISTER`, plus `ROLE_CAN_TRANSFER_ADMIN` (blocks even though it cannot transfer), and for `UserRegistry` also `ROLE_UPGRADE`.
- **Not dangerous**: `ROLE_REGISTRAR` and `ROLE_RENEW` — which is exactly how `.eth` works.
- It is **irreversible**: re-granting a dangerous role needs its admin role, which nobody holds any more.
- It must hold **at every level**: an emancipated `.eth` under a non-emancipated root can still be overridden.
- **Verify the implementation first** — `isEmancipated()` on an arbitrary contract can simply return `true`; use the factory's on-chain verification (S47).

### 3.5 Permissioned Resolver — a resolver per account

ENSv1 had one shared Public Resolver. ENSv2 gives **each account its own proxy**, with per-record permissions and record linking (S47).

| Role | Value | Scope | Allows |
|---|---|---|---|
| `ROLE_SET_ADDRESS` | `1<<0` | root or coin type | address records |
| `ROLE_SET_TEXT` | `1<<4` | root or **text key** | one text record or all |
| `ROLE_SET_CONTENTHASH` | `1<<8` | root | content hash |
| `ROLE_SET_ABI` | `1<<12` | root or content type | ABI records |
| `ROLE_SET_INTERFACE` | `1<<16` | root or interface ID | EIP-165 records |
| `ROLE_SET_NAME` | `1<<20` | root | reverse name |
| `ROLE_SET_DATA` | `1<<24` | root or data key | arbitrary data |
| `ROLE_LINK` | `1<<28` | root | link/unlink record bundles |

The powerful part: **`grantSetterRoles()` can authorise a service to change one key only** — a payment provider gets the Bitcoin address, not the avatar, not the Ethereum address (S47).

**Record linking**: several names can point at one record bundle, so updating the bundle updates every linked name. Names without their own bundle use the resolver's **default bundle**, written under the DNS-encoded empty name (`0x00`). Once a name has its own bundle it stops using the default *entirely* — missing fields do not fall back individually; `linkToRecord(name, 0)` restores the default (S47).

> **The trap in this section.** *"There is no per-name scoping: a role holder can write the covered records on every name served by the resolver instance"* (S47). One resolver serving many customers means one customer's text-key grant can touch everyone's records. Multi-tenant products need **separate resolver instances per tenant**.

### 3.6 ERC1155Singleton tokens

Each registered name is an ERC1155 token with **exactly one owner** — no balances, no fungible-style arithmetic (S47). Token metadata can be a static URI template or a **dynamic renderer** contract that composes SVG/JSON from on-chain state (S47).

### 3.7 Mutable token IDs — the security design, and the indexing hazard

Internally a name is tracked by a **canonical ID**: `keccak256(label)` with the low 32 bits zeroed — it never changes (S47). Two version counters are encoded into the low 32 bits to derive:

| ID | Low 32 bits | Used for |
|---|---|---|
| canonical ID | `0` | storage key |
| token ID | `tokenVersionId` | ERC1155 ownership, marketplace approvals |
| resource | `eacVersionId` | permission storage |

**A token ID changes in exactly three cases** (S47): a role is granted or revoked; the name is re-registered after expiry; the name is unregistered. **Transfers and renewals never change it.**

When it changes, the old token is burned and a new one minted to the same owner — a `TokenRegenerated(old, new)` event. This solves two real attacks: stale permissions carrying over to a new registrant, and **transfer griefing**, where a seller front-runs a sale by revoking roles so the buyer receives a degraded name (S47).

Safe transfers also revert `TransferUnsafeUntilRegistryIsEmancipated` and `TransferUnsafeWithMultipleAssignees`; `unsafeTransfer`/`unsafeBatchTransfer` exist for people who know what they are doing.

**For an indexer or a cache, this is the headline**: a token ID is not a stable key for a name. Use the canonical ID.

### 3.8 ETH Registrar — registration, price, expiry

Commit-reveal is retained from ENSv1, with changes (S47):

| | ENSv1 | ENSv2 |
|---|---|---|
| Grace period | 90 days | **28 days** |
| Payment | ETH only | **ERC20 too** — USDC and DAI at launch |
| Pricing | USD, no discounts | USD + **multi-year discounts** |
| Token | ERC721 (+ optional wrapper) | ERC1155Singleton |

- **Grace period**: 28 days, during which the expired name can still be renewed **by anyone**, not just the owner.
- **After grace**: a **21-day temporary premium** starting at ~$100M and halving daily, to stop sniping.
- **Base rates**: 3 chars $640/yr, 4 chars $160/yr, 5+ chars $8/yr.
- **Discounts** by total term in one transaction: 12.5% at 2 years, ~31% at 3–5 years, ~44% at 6 years — so **6 years costs less than 5** ($27 vs $27.50 for a 5+ char name).
- Two price functions: the registrar's `getRegisterPrice` is stateful and true; the oracle's is hypothetical and useful for a calculator (S47).

### 3.9 Universal Resolver V2 and the factory

- **URv2** is the single public entry point; it walks the tree and returns the deepest resolver, and carries all the CCIP-Read/wildcard machinery. `UniversalHelper` exposes hierarchy inspection separately (S47).
- **Verifiable Factory**: `deployProxy(implementation, salt, data)` uses CREATE2 with `outerSalt = keccak256(msg.sender, salt)`, so the address is deterministic per caller and does not collide across callers. The proxy is a **77-byte** minimal proxy (45-byte EIP-1167 + the 32-byte salt) delegating to one shared `UUPSProxyLogic`, with the implementation in the ERC-1967 slot. `verifyContract(proxy)` proves on-chain that a proxy came from the factory (S47).

### 3.10 Three ways to issue subnames

| Approach | Use when | Cost |
|---|---|---|
| **Resolver records** — write records for `alice.wallet.eth` on the parent's resolver | you manage every subname | no token per subname |
| **UserRegistry** — deploy a registry on the parent, register each label | subnames need owners or should appear as tokens | a token + registry |
| **Reserved entry** — register with owner `0x0`, zero roles | routing a subtree, holding protected labels | no token |

And for automation, grant a contract **`ROLE_REGISTRAR`** (plus `ROLE_RENEW`) on the registry, and it enforces your pricing and eligibility rules (S47).

### 3.11 Agent identity (both still drafts)

| Standard | Mechanism | What it gives an agent |
|---|---|---|
| **ENSIP-25** | text record `agent-registration[<registry>][<agentId>]`, non-empty = attested; registry as an ERC-7930 address | an ENS name provably linked to an **ERC-8004** registry entry |
| **ENSIP-26** | `agent-context` + `agent-endpoint[mcp]`, `[a2a]`, `[web]` | one identity that advertises how to reach the agent |

⟨ours⟩ This is the piece that makes an ENS name a **discovery document for an agent that pays over x402**: resolve the name, read `agent-context`, find `agent-endpoint[mcp]`, call it, get a `402` with a price. No directory, no API key, no registry of our own. Neither ENSIP is final, so a build should say "draft standard" out loud.

---

## §4 What changed from ENSv1, in one table

| Concern | ENSv1 | ENSv2 |
|---|---|---|
| Registry | one flat table | hierarchical, one per name if wanted |
| Permissions | Name Wrapper fuses (one-way burn) | EAC roles (reversible, 15 holders, per-record) |
| Resolver | one shared Public Resolver | a Permissioned Resolver per account |
| Name token | ERC721 + optional ERC1155 wrapper | ERC1155Singleton |
| Token ID | stable | **mutable** on role changes / re-registration |
| Grace period | 90 days | 28 days |
| Premium | — | 21 days decaying from ~$100M |
| Payment | ETH | ETH, USDC, DAI |
| Pricing | flat per year | multi-year discounts |
| Upgrades | monolithic | per-instance proxies via a verifiable factory |

---

## §5 What a builder must do differently

1. **Reads are free** — update the library and you are done (S47).
2. **Writes go to the name's actual resolver**, not a well-known shared one; and the caller needs the record role (S47).
3. **Indexers must handle regeneration** — key on the canonical ID, not the token ID (S47).
4. **Multi-tenant = separate resolvers**, because resolver roles are resolver-wide (S47).
5. **Grant deliberately at registration**: admin roles on a name can only be assigned *at registration time*; afterwards only regular roles can be granted (S47).
6. **Check emancipation** before claiming a name is safe, and verify the implementation first.

---

## §6 The traps, ranked by how much time they cost

| # | Trap | Consequence |
|---|---|---|
| 1 | Assuming mainnet is live | ENSv2 mainnet is pre-launch; resolution and registration still go through ENSv1 (S47) |
| 2 | Hardcoding a Universal Resolver address | Breaks silently on upgrade; use the library's canonical proxy |
| 3 | Treating a token ID as a stable name key | It regenerates on any role change |
| 4 | One resolver for many customers | Resolver roles are not name-scoped — cross-tenant writes |
| 5 | Reading `ownerOf()` as "the owner" | Returns `0x0` for expired names; use `latestOwnerOf()` when you mean the last owner |
| 6 | Expecting field-level fallback to the default bundle | Once a name has its own bundle, missing fields do **not** inherit |
| 7 | `setApprovalForAll` as a convenience | It hands over **every** role on **every** name the owner holds |

---

## §7 What this means for the Mumbai ENSv2 track

The track is $7,000 (3k/2k/1k/1k) and requires ENSv2 to be the **centre** of the product, not decoration (S1). Two honest consequences:

- **Sepolia is allowed**, which removes the "mainnet isn't live" objection entirely.
- **The bar is positioning, not plumbing.** A product where ENS is a text record on the side does not qualify; a product where the name *is* the address, the permission or the discovery document does.

⟨ours⟩ And ENSv2 is unusually well suited to *this* repo's existing threads, because permissions-per-record and per-name registries are exactly the "who may write what" problem that agent marketplaces and multi-tenant products keep re-inventing badly.

---

## §8 Correction: an earlier claim in this repo was wrong

An earlier note (now archived at `archive/old-ideas/ideas-10.md`) said ENSv2 has "no SDK yet". **That is false.** ENSv2-ready versions of viem, ethers, ENSjs, web3.py, web3j, go-ens, alloy-rs and Nethereum all exist (S47), and for read-only use a library bump is the entire migration.

What was right in that note: **mutable token IDs** — they really do change, and they really do affect indexers and caches. FaceValue must not cache a token ID across a controller move.

---

## §9 Open questions

1. When does the mainnet launch complete, and does the Sepolia deployment track the same implementation versions?
2. For a subname product, is a `UserRegistry` per parent cheaper than resolver records at our scale? (Needs a gas measurement, not a guess.)
3. Do ENSjs's write helpers cover `grantSetterRoles` and record linking, or does that need raw contract calls?
4. Does the ENSv2 track's judge actually accept Sepolia-only, or do they expect a mainnet intent? (Track text says Sepolia is fine — S1 — but this is worth a mentor question.)
5. If we build the agent-discovery angle (§3.11), how do we demonstrate it without depending on an ERC-8004 registry that is still draft in places (S40)?
