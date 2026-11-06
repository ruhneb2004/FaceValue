# Handoff — FaceValue

**Written:** end of the nav rework session
**Repo:** `/Users/admin/ethglobal_mumbai`
**HEAD:** `ca9dcb9` — *feat(landing): rebuild the closing prompt and the footer*
**Uncommitted:** `apps/web/components/SiteHeader.tsx` (nav rework, verified, not yet committed)

Read this first. It states what is true now, what is broken now, and what to do next — not what was planned.

---

## 1. What this product is

FaceValue is a **likeness rights registry and clearance API**. An owner registers a face. A buyer clears one specific use at a stated price. A dispute over identity is resolved by comparing the claim against a frozen reference — **the face decides, not the count**, so a 2-of-1 vote is recorded as a split, not a majority.

**Event:** ETHGlobal Mumbai. **Deadline:** Sat 7 Nov 2026, 09:00 IST.
**Prizes targeted:** ENS + World + Hedera. Arkiv was cut deliberately.
Hedera's "No Solidity Allowed" track ($2,000) was **forfeited on purpose** to keep smart contracts.

---

## 2. Decisions that must not be re-litigated

These were argued and settled. Reopening them costs time the deadline does not have.

| Decision | Why |
|---|---|
| **The AI never returns the identity verdict** | An LLM may summarise evidence. The verdict comes from cosine + human multisig. |
| **No face, embedding, nullifier or PII on ENS or HCS** | Hashes only. This is the privacy claim; a leak makes it false. |
| **Payout follows the face** | Whoever the reference identifies takes every stake. Not proportional to vote count. |
| **`moved` is a distinct status from `active`** | A likeness that changed hands behaves differently at settlement. |
| **Resolver = app DB table + HCS attestation** | Not Gnosis Safe. 3 addresses, 2-of-3 quorum, transferable. |
| **Uma's contracts were not adopted** | Only the staking/dispute *pattern*. |
| **Thresholds `0.65` / `0.45` are unmeasured placeholders** | See §7. Do not present them as tuned. |
| **Illustrated avatars only, never photographs** | DiceBear `pixel-art`. Shipping invented photographs of people is not acceptable. |

---

## 3. Stack and where things are

**Versions are pinned.** Do not bump them before the deadline.

```
next 16.4.5 · react 19.3.0 · tailwindcss 4.3.4 · motion 14.9.1
@phosphor-icons/react 2.1.10 · @radix-ui/react-{dialog,accordion} 1.3.1
viem 2.57.16 · wagmi 3.7.11 · @worldcoin/idkit 4.6.0
@ensdomains/ensjs 5.2.12 · @hashgraph/sdk 2.81.0 · @dicebear/* 9.4.x
```

```
apps/web/app/
  page.tsx                    landing (7 sections)
  explore/page.tsx            registry grid — behind ConnectGate
  legal/{privacy,terms}/      static
  globals.css                 tokens + named text styles
apps/web/components/          19 components (see §4)
apps/web/lib/                 seed, types, match, wallet, cn
docs/                         plan, dispute-spec, bond-contract, design-spec, …
```

**Phosphor import path is `@phosphor-icons/react/ssr`.** There is no `Search` — use `MagnifyingGlass`.

---

## 4. What is actually live

| Route | State |
|---|---|
| `/` | **Live.** 7 sections, all `aria-labelledby` resolve. |
| `/explore` | **Live.** 8 cards, gated behind connect. |
| `/legal/privacy` | Live |
| `/legal/terms` | Live |
| `/likeness/[id]` | **404 — all 8 cards link here** |
| `/register` | **404 — linked from nav + footer + landing CTA** |
| `/challenge` | **404 — linked from nav** |
| `/admin/review` | **404 — linked from nav + footer** |

**This is the single largest gap.** Four of the eight navigable destinations are dead. Every card, the primary nav, the footer and the closing CTA all lead somewhere that 404s.

Landing section order and ids:
`hero` → `tagline` → `how` → `recent` → `benefits` → `registry` → `face` → `faq` → closing.

---

## 5. The nav rework (uncommitted — read before touching)

`apps/web/components/SiteHeader.tsx`. **A backup of the pre-rework file is at `/tmp/SiteHeader.BACKUP.tsx`.**

### The problem
The bar was one flex row of `[mark][links] ...... [CTA]`. Every pixel of leftover width collected in **one 559px trough** between the last link and the button. The marks and links sat 16px apart with nothing between them, so the left side read as two loose fragments.

### The fix
The bar is now three zones, each with a job:

1. **Brand + links** — a hairline divider closes the brand group, then the links, spread with `justify-between` so the slack is distributed across all three gaps (measured **81px each**) instead of pooling in one place.
2. **Status readout** — `8 ENTRIES · 3 LICENSABLE`, counted from the seed. This occupies the space that was dead and answers the first question a visitor has before connecting.
3. **CTA** — unchanged capsule, now `shrink-0`.

### Container size is preserved
**1312 × 70 at 1440** — identical to before the rework, as required. Verified at 1440 / 1100 / 1024 / 768 / 390 / 320: **70px at every width**, no overflow.

### Bugs found and fixed during the rework
| Bug | Cause | Fix |
|---|---|---|
| Grey focus ring on nav links | `transition-colors` includes `outline-color`, so the ring animated from grey to lime over 150ms | `transition-[color,background-color]` |
| Bar grew to **75px** at 1024 | CTA label "Connect wallet" wrapped | `whitespace-nowrap` |
| **21px horizontal overflow** at 1024 | `flex-1` on the nav squeezed the CTA past the edge | `min-w-0` on nav, `shrink-0` on CTA, status drops to `xl` |
| 40px tap targets | `min-h-10` | `min-h-11` (44px) |
| Screen reader read **"8entries"** | adjacent spans concatenate with no whitespace | visual fragments `aria-hidden`, one `sr-only` sentence |

### Verified
- Focus rings all lime on the **first frame** (the transition bug recurs easily — re-check at t=0, not after settling).
- Contrast: inactive links **7.92:1**, active **16.03:1**, stat numbers **18.84:1**, CTA label on lime **17.87:1**.
- Tab order: skip → home → 4 links → CTA. Correct, no traps.
- `aria-current="page"` present exactly once.
- Accessibility tree carries only the readable sentence — verified via CDP `getAccessibilityFullAXTree`, **not** `textContent` (which misleadingly shows both).
- Reduced motion: bar unchanged at 1312×70.
- Mobile sheet: 4 links, closes on navigate.
- `tsc --noEmit` clean.

**Commit this before starting anything else**, so there is a restore point:

```
git -c user.email=dev@facevalue.local -c user.name="FaceValue" commit -am "feat(nav): ..."
```

---

## 6. Design system rules that keep biting

The project runs the `elayadesign/ai-design-skills` landing-page system with a **lime** palette. These are the traps, each one paid for once already:

```
--accent #ccff00 · black #000 · --accent-ink on any accent fill (17.87:1)
--ink / --ink2 / --ink3 · --line / --linestrong · --surface 1-4
```

- **Ink on bright:** any accent fill carries `var(--accent-ink)`. Black on lime = 17.87:1.
- **Saturation is audited by a script, not by eye.** The user dislikes colours that "pop".
- **No fake controls.** No control that does nothing.
- **One fact, one place.** A card must not repeat its own information.
- **`Reveal`/motion must never start hidden.** Render visible in markup; arm only after the client confirms motion runs *and* the element is below the fold. `initial={false}` is **not** sufficient — the JS-disabled case still goes invisible.
- **Navbar container size is frozen.** Text, highlighting and buttons may change; the box may not.
- **Two gradients exist by deliberate variance** — hero heading + hero video scrim. Do not add a third.
- **Do not ship invented photographs of people.**

Known traps, all previously hit:

- `md:col-start-N` inside a single-column grid creates a **phantom column** → always declare `grid-cols-1` explicitly.
- `col-start` without `row-start` lets auto-placement push content to a **new row** → always pin `md:row-start-1`.
- A sticky child only travels while its parent is taller → `lg:self-stretch` + remove `items-start`.
- `.focus()` from script does **not** set `:focus-visible`. Verify rings by pressing Tab.
- `transition-colors` animates `outline-color` → focus rings animate in. Check at t=0.
- Duplicate SVG ids are invalid HTML → namespace per seed.
- DiceBear near-neutral skin ramp reads as **cadaverous**; the palette is warm-shifted deliberately.

---

## 7. Known unknowns — do not present as done

1. **Thresholds `0.65` / `0.45` in `lib/match.ts` are unmeasured placeholders.** `W3.1` (the embedding spike) never ran. Either run it or state plainly in the demo that the numbers are provisional. **Do not claim they are tuned.**
2. **`docs/design-tokens.md` is stale** — it still describes the pre-lime palette. Rewrite or delete.
3. **Duplicate `id`s in the `recent` marquee** (`beardVariant01-a` ×2) inside `aria-hidden` tracks. Invalid HTML, low impact.
4. **`lc-003` is named "Campaign still"** — a photograph name, not a likeness owner. The user already flagged this as confusing.
5. **No automated test coverage** beyond `lib/match.test.ts`.

---

## 8. Next steps, in order

1. **Commit the nav rework** (§5). It is verified and uncommitted.
2. **Build `/likeness/[id]`.** Eight cards currently 404. Needs `ActionPanel` (buy a licence), `ReasonPanel` (why it is blocked), and the **`409` refusal** for non-licensable states. Only `active` and `moved` are licensable; `provisional`, `review`, `revoked` must refuse with a readable reason.
3. **Build `/register`** — it is linked from the nav, the footer *and* the closing CTA, so it is the most-exposed 404.
4. **Build `/challenge/[id]` and `/admin/review`** — the dispute story is the differentiator and it currently has no UI at all beyond the landing illustration.
5. **Resolve the threshold placeholders** (§7.1).
6. Delete or rewrite `docs/design-tokens.md`.

Until step 3 lands, consider pointing the nav's Register link at `/explore` or disabling it — a visible dead link in the primary nav is the worst version of this gap.

---

## 9. Running it

```bash
cd apps/web
lsof -ti :3333 | xargs -r kill -9      # ALWAYS, before starting
pnpm start -p 3333                      # http://localhost:3333
```

Playwright scripts must live in **`/tmp/pw`** — `require("playwright")` fails from `/tmp`.
`look_at_image` only reads images **inside the project** — copy screenshots into `tmp-shots/` first.

**Trust measurements over vision descriptions.** The vision model has repeatedly misread 1px lines, 2× DPR captures and sticky-nav overlap, and **cannot judge motion from stills**.

Never print whole env or config files. Search for the specific name; never echo a secret.
