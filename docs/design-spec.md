# FaceValue — design specification

The design document for `apps/web`. Read with `docs/action-plan.md` (build order) and `docs/dispute-spec.md` §8 (required UI states).

Brand: **Golden Harmony + Taupe** (Figma resource library, see `docs/design-tokens.md` for full ramps).

---

## 1. What we are designing, in one line

A **marketplace for likeness rights**, where a face is a listing, a licence is a purchase, and a dispute is a visible, bonded, two-of-three process rather than a support ticket.

The design has one job: make the human subject of the data feel like a **rights holder**, not a data point. Every screen should look like something a rights agency would use, not like a crypto dashboard.

---

## 2. Design principles

1. **The state is the design.** This product is a state machine with a face on it. `provisional`, `active`, `disputed`, `review`, `moved` are the five things a user must be able to read at a glance. Colour, badge and button availability all move together.
2. **Refusal over spinner.** A blocked action says why in words. Never a disabled button with no reason, never a loading state that means "no".
3. **Money is always visible.** A stake is a number with a unit and a consequence. Never "enter amount" without saying what is at risk.
4. **One filled action per view.** If everything is a primary button, nothing is.
5. **Warm, editorial, serious.** Gold and taupe, generous white space, large type. The energy comes from typography and layout, not from saturation.

---

## 3. Colour

Full ramps and measured ratios: **`docs/design-tokens.md`**. Summary of the contract:

| Token | Value | Contrast |
|---|---|---|
| `--color-bg-page` | `#f9f6f4` | — |
| `--color-text-primary` | `#1f1e1c` | 15.48:1 ✅ |
| `--color-text-secondary` | `#4a4744` | 8.58:1 ✅ |
| `--color-text-muted` | `#625e5b` | 5.97:1 ✅ |
| `--color-accent-solid` | `#93701d` (gold-700) | white label 4.59:1 ✅ |
| `--color-accent-hover` | `#765a1a` (gold-800) | white label 6.47:1 ✅ |
| `--color-accent-text` | `#765a1a` | 6.01:1 ✅ |
| `--color-border` | `#7a7571` (neutral-700) | 3.50:1 on sunken ✅ |
| `--color-focus-ring` | `#765a1a` | 6.01:1 ✅ |

**Rules**
- Fill uses `gold-700` or darker. `gold-600` and above fail white-text contrast — do not use them for fills.
- Text never uses `neutral-600` or lighter.
- Borders on inputs use `neutral-700`. `neutral-600` measures 2.55:1 and fails the 3:1 UI requirement.

### Status colour, one hue per state

No state may be identified by colour alone — every badge ships an icon **and** a word.

| State | Hue | Solid | Tint bg | Text on tint |
|---|---|---|---|---|
| `active` | green ~150° | `#1f6b45` | `#e8f2ec` | 5.65:1 |
| `provisional` | amber ~75° | `#8a5a00` | `#fdf3e0` | 5.38:1 |
| `disputed` | terracotta ~32° | `#9a4737` | `#ffede5` | 5.55:1 |
| `review` | violet ~300° | `#5f3f8a` | `#f2ecf7` | 7.06:1 |
| `moved` | taupe | `#4e463f` | `#f5ede7` | 7.99:1 |

Hues are ≥15° apart in OKLCH so no two read as the same colour. `provisional` must never use gold, or it looks purchasable.

---

## 4. Typography

```ts
// app/layout.tsx
import { Fraunces, Inter } from 'next/font/google'

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const sans    = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
```

`next/font` self-hosts and emits CSS variables; apply both on `<html>`.
Source: Next.js `app/03-api-reference/02-components/font.mdx`, library_id `/vercel/next.js`.

**Fraunces** for display — a soft-serif with optical sizing, warm and editorial, which is exactly the "rights agency" register. **Inter** for UI and body.

| Role | Class | Size / line-height |
|---|---|---|
| Hero h1 | `font-display text-5xl md:text-6xl font-normal tracking-[-0.02em]` | 48/56 → 60/64 |
| Page h1 | `font-display text-3xl md:text-4xl tracking-[-0.01em]` | 30/36 → 36/40 |
| Section h2 | `font-display text-2xl` | 24/32 |
| Card title | `font-sans text-base font-semibold` | 16/24 |
| Body | `font-sans text-base` | 16/26 |
| Small / meta | `font-sans text-sm` | 14/20 |
| Badge | `font-sans text-xs font-medium uppercase tracking-[0.06em]` | 12/16 |
| Numeric / money | `font-sans tabular-nums` | — |

Rules: measure 60–75ch for body. Never centre body text over four lines. Money always `tabular-nums` so columns align. Do not use `text-xs` for anything a user must read to act.

---

## 5. Layout and spacing

- **Container:** `mx-auto w-full max-w-[1200px] px-5 md:px-8`.
- **Spacing scale:** 4px base — `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- **Card grid:** 1 col mobile, 2 at `md`, 3 at `lg`, 4 at `xl`. Gap `24px`.
- **Breakpoints tested:** 390 (iPhone), 768, 1024, 1440.
- **Radius:** `8px` controls, `12px` cards, `9999px` badges. Consistent; pick one and hold it.
- **Elevation:** one shadow only — `0 1px 2px rgba(31,30,28,.06), 0 8px 24px -12px rgba(31,30,28,.12)`. No stacked shadows, no glow.
- **Motion:** 120ms ease-out for hover, 200ms for panel reveal. Honour `prefers-reduced-motion` and remove transforms entirely.

Reading order must match visual order at every breakpoint. Never reorder with CSS `order` in a way that separates a heading from its content for screen readers.

---

## 6. Screens

### 6.1 `/` — marketplace

```
┌──────────────────────────────────────────────────────────┐
│ FaceValue           Browse · Register · Docs    [Connect] │
├──────────────────────────────────────────────────────────┤
│  Likeness rights, cleared.                               │
│  Find a face. Licence it for one use. The bond is public. │
│                                                           │
│  [ search ]              [ All states ▾ ]  [ Use case ▾ ] │
├──────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│ │ photo  │ │ photo  │ │ photo  │ │ photo  │              │
│ │ ●active│ │●provis.│ │●disput.│ │ ●moved │              │
│ │ Name   │ │ Name   │ │ Name   │ │ Name   │              │
│ │ 40 HBAR│ │  —     │ │  —     │ │ 40 HBAR│              │
│ └────────┘ └────────┘ └────────┘ └────────┘              │
└──────────────────────────────────────────────────────────┘
```

Card contents: image (1:1, `object-cover`), state badge top-left over the image with a tinted scrim for legibility, name, per-use price **or a short reason it has no price**, and the challenger count if any.

A card with no price must say why: *"Not licensable — challenge open"*.

### 6.2 `/likeness/[id]` — detail

Two columns at `lg` (7/5 split), one column at mobile, **price and action block first** on mobile.

Left: image, name, registered date, controller address (truncated, copyable), ENS name with an Etherscan/Sepolia link.
Right: the action card.

```
┌─────────────────────────────┐
│ Licence this likeness       │
│ Per use                    │
│ 40.00 HBAR                  │
│                             │
│ Use case  [ Advertising ▾ ] │
│                             │
│ [      Licence          ]   │  ← gold-700 fill, white label
│ [      Challenge        ]   │  ← outline, neutral
└─────────────────────────────┘
```

Non-licensable states replace the primary button with a **reason panel**, not a disabled control:

```
┌─────────────────────────────┐
│ ⚠ Not licensable yet        │
│ This likeness is provisional│
│ until 7 Nov, 18:00 IST. A   │
│ dispute opened against it   │
│ would extend that window.   │
│ [ Challenge instead ]       │
└─────────────────────────────┘
```

### 6.3 `/register` — capture

Four steps, one visible at a time, with a persistent step indicator.

1. **Live capture** — camera preview, liveness prompt ("turn your head left"), explicit note that the image never leaves the device.
2. **Confirm** — captured frame, retake.
3. **World ID** — IDKit widget.
4. **Listing** — name, per-use price, bond amount with the consequence stated.

**Never say "verified" here.** Until registration-time liveness is enforced end to end, the copy is *"Likeness registered"*, and the badge explains it is provisional.

### 6.4 `/challenge/[id]` — dispute

The screen that decides whether judges believe the product.

```
┌──────────────────────────────────────────────────┐
│ Challenge this likeness                          │
│                                                  │
│ Stake required        40.00 HBAR                 │
│ matched to the registrant's bond — both sides    │
│ have the same amount at risk.                    │
│                                                  │
│ If the face matches you:   you take the bond     │
│ If it does not:            you forfeit your stake│
│ If it is close:            2 of 3 resolvers      │
│                            decide, bonds frozen  │
│                                                  │
│ [ Capture your face ]                            │
└──────────────────────────────────────────────────┘
```

After capture, show the outcome band **and the number**:

```
Match confidence  0.71   ● strong match
                          ─────────────────────
                          no match   close   match
                          0.45       0.65
```

Resolved panel shows each resolver's truncated address and verdict, plus `2 of 3` progress:

```
Resolvers   0x4f…a1  ✔ match
            0x9c…2e  ✔ match
            0x13…7b  —
            ───────────────────
            2 of 3 reached — bonds released
```

### 6.5 `/admin/review` — resolver queue

A table, not cards. Columns: challenge id, likeness, `cos`, tier, votes, age, action. Each row's action is a two-button pair (Match / No match) with a confirm step, because these move money.

Show the three resolver addresses at the top with an "active / rotated" mark and the transfer control.

---

## 7. Responsive

| Breakpoint | Change |
|---|---|
| `< 640` | 1-col cards; action card moves above detail; nav collapses to icon + sheet |
| `640–1023` | 2-col cards; detail stacks |
| `1024–1279` | 3-col cards; detail 7/5 |
| `≥ 1280` | 4-col cards; max width 1200 |

No horizontal scroll at any width. Test at 320px — the smallest phone that matters.

---

## 8. Accessibility

Target **WCAG 2.2 AA**.

- All interactive elements reachable and operable by keyboard; `:focus-visible` ring `2px` `--color-focus-ring` with `2px` offset.
- Every image has an `alt` that describes the *listing*, not the person's appearance beyond the listing needs.
- Form controls have a `<label>`; errors are in text next to the field and announced via `aria-live="polite"`.
- Colour is never the only carrier of state — badge icon + word always.
- No motion above 200ms; respect `prefers-reduced-motion`.
- Zoom to 200% must not clip or overlap.
- Touch targets ≥ 44×44px.
- Resolver buttons and challenge confirmation are deliberately two-step; never autofocus a destructive action.

---

## 9. Copy rules

Voice: plain, precise, never cute. We are handling someone's face and their money.

| Instead of | Write |
|---|---|
| "Oops! Something went wrong" | "The licence could not be issued. This likeness is under review." |
| "Processing…" | "Matching against the registered face…" |
| "Are you sure?" | "Open a challenge? This stakes 40 HBAR against the registrant's bond." |
| "Verified" (pre-liveness) | "Registered" |
| "NFT" | "likeness record" |
| "Mint" | "Register" |

Never use exclamation marks. Never blame the user. Name the next step in every error.

---

## 10. Component inventory

| Component | Notes |
|---|---|
| `SiteHeader` | mark, nav, wallet connect, 44px targets |
| `StateBadge` | icon + word + tint; the only place state colour is decided |
| `LikenessCard` | image, badge, name, price-or-reason |
| `ActionPanel` | the variant switcher for licensable vs blocked |
| `ReasonPanel` | blocked-action explanation with a next step |
| `PriceRow` | label, amount, unit, `tabular-nums` |
| `StakeSummary` | amount at risk and what happens on each outcome |
| `ConfidenceBand` | numeric `cos` + three-zone bar with labelled thresholds |
| `ResolverVotes` | addresses, verdicts, quorum progress |
| `Stepper` | register flow progress |
| `Field` | label + input + hint + error, `aria-describedby` wired |

Every component: default, hover, focus-visible, active, disabled, loading. Loading never replaces a layout with a spinner in place of content — reserve the space.

---

## 11. What this design must not do

- Not render the word **verified** until liveness ships.
- Not show a licence price for a likeness that cannot be licensed.
- Not hide the stake amount behind a tooltip or a second screen.
- Not show "2 of 3" as a percentage, a progress bar without a denominator, or anything that suggests a simple majority decides identity.
- Not animate the confidence score. The number is evidence, not a reveal.
- Not use a face image as a background, a hero, or decoration. The subject is a rights holder.

---

## 12. Sources

| Claim | Source |
|---|---|
| Stack: Next.js + Tailwind | `docs/plan-facevalue.md:316` |
| Required UI states per screen | `docs/dispute-spec.md` §8 |
| Status semantics, `409` on non-licensable | `docs/dispute-spec.md` §2 |
| Thresholds `0.65` / `0.45` (unmeasured) | `docs/dispute-spec.md` §4 |
| 2-of-3 resolver quorum | `docs/dispute-spec.md` §4a |
| Golden taupe palette | Figma resource library, `figma.com/color-palettes/golden-harmony/` and `figma.com/colors/taupe/` |
| Colour ratios | computed in this repo, see `docs/design-tokens.md` |
| `next/font` variable pattern | Next.js docs `app/03-api-reference/02-components/font.mdx`, `/vercel/next.js` |
| WCAG 2.2 AA thresholds | W3C WCAG 2.2 |
| Version pins | `npm view ... version`, 6 Nov 2026 |
