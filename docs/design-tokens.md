# FaceValue — design tokens

**Source of truth is `apps/web/app/globals.css`.** This document mirrors it. If
the two disagree, the CSS wins and this file is stale — fix the file, not the
code.

> This file was rewritten on the handoff's §7.2 instruction. The previous version
> described the pre-rework **gold / taupe** palette derived from Figma swatches.
> That palette is gone; the product runs a **lime** accent on warm-shifted dark
> surfaces. Any figure below was re-measured against the current colours.

The system is `elayadesign/ai-design-skills` / `landing-page-design`. The rules are
enforced in `globals.css` rather than in components, and are referred to as
**B1…B7**.

---

## 1. Surfaces (B4)

Six dark surfaces, and no others. Warm-shifted on purpose: a cold grey under
`#ccff00` reads as a clash, not a contrast.

| Token | Hex | Use |
|---|---|---|
| `--surface-0` | `#000000` | page edge, deepest recess |
| `--surface-1` | `#0d0f08` | — |
| `--surface-2` | `#121408` | **body background** |
| `--surface-3` | `#191c0e` | cards |
| `--surface-4` | `#222616` | card hover / raised |
| `--surface-5` | `#2c3120` | highest raise |

Flat backgrounds only. No surface gets a gradient (B5).

## 2. Text

| Token | Hex | Note |
|---|---|---|
| `--text-1` (`--ink`) | `#ffffff` | primary |
| `--text-2` (`--ink2`) | `#a8a8a8` | secondary |
| `--text-3` (`--ink3`) | `#7d7d7d` | tertiary / placeholder |

No italics anywhere (`em`, `i` are reset to normal). No weight above semibold.

## 3. Accent (B5-adjacent)

| Token | Hex | Measured |
|---|---|---|
| `--accent` | `#ccff00` (lime) | **15.83:1** on `--surface-2` — usable as text *and* fill |
| `--accent-ink` | `#000000` | black on lime = **17.87:1**; every accent fill carries it |
| `--accent-soft` | `#1c2408` | tint for faint accent surfaces |
| `--accent-warm` | `#ffff00` (yellow) | reserved for the hero heading gradient only |

The palette carries two brights — lime `#ccff00` and yellow `#ffff00` — that
measure only **1.09:1** against each other: to the eye they are the same colour,
so they serve **one accent family, not two meanings**. `#dfff00` is unused on
purpose; a third bright within 1.03:1 of the others adds noise, not information.

**There is exactly one gradient** (B5): `linear-gradient(to right, #ccff00 0%,
#ffff00 100%)` on the hero heading text via `.heading-gradient`. There is also a
hero video scrim, which is a variance, not a paint gradient. Do not add a third.

## 4. State colours

Each re-measured against `--surface-2`; all clear 4.5:1 for text.

| Token | Hex | State |
|---|---|---|
| `--state-active` | `#ccff00` | Active (licensable) |
| `--state-provisional` | `#c9b47a` | Provisional |
| `--state-review` | `#9db4d8` | Under review |
| `--state-disputed` | `#e89a6a` | Disputed |
| `--state-moved` | `#7fd4c0` | Moved (licensable, settles differently) |
| `--state-revoked` | `#8a9080` | Revoked — lifted to **5.65:1**; it was 3.91:1 after the surface swap and failed text |

`active` and `moved` are the only licensable states (`isLicensable()` in
`lib/types.ts`). Everything else refuses — see `ReasonPanel`.

## 5. Lines and motion

| Token | Value |
|---|---|
| `--line` | `rgba(255,255,255,0.09)` |
| `--line-strong` | `rgba(255,255,255,0.16)` |
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` |

Motion is transform + opacity only, on the above curve (B7). `.press` scales to
`0.98`. Reduced-motion removes all of it; the marquee drops to a scrollable list.

## 6. Spacing (B2)

**Do not declare `--spacing-*` in the `@theme` block.** Tailwind turns every
numeric utility into `calc(var(--spacing) * n)`; redefining a step makes `py-200`
mean 200 × 12px. The B2 steps map onto Tailwind's own 0.25rem grid:

```
0 -> 0     25 -> 1     50 -> 2     75 -> 3     100 -> 3
200 -> 8   300 -> 12   400 -> 16   500 -> 20   600 -> 24
700 -> 32  800 -> 40   900 -> 48
```

Use those integers. A bare `py-200` is a bug, not a large gap — it is 600px and
has silently produced a 640px empty box once already.

## 7. Type (B1)

One typeface: **Geist**, with **Geist Mono** only for chain data and numbers.
Sizes are on the scale below and applied by class name, never restyled ad hoc.

**Headings** — weight 600, negative tracking: `heading-display`
(clamp `2.75rem…11rem`, `lh .94`, `-0.04em`), `heading-1` (3.75rem), `heading-2`
(3rem), `heading-3` (2.25rem), `heading-4` (1.875rem), `heading-5` (1.5rem),
`heading-6` (1.25rem).

**Titles** — `title-1` (1.25rem/500) … `title-5` (0.75rem/500).

**Body** — `body-1` (1rem/600), `body-2` (1rem/500), `body-3` (1rem/400),
`body-4` (.875rem/600), `body-5` (.875rem/500), `body-6` (.875rem/400).

**Buttons** — `button-lg` (1.125rem/600), `button-md` (1rem/600), `button-sm`
(.875rem/600), `button-xsm` (.75rem/600).

**Captions** — `caption-1` … `caption-5` (0.75–0.875rem).

## 8. Focus

`:focus-visible` gets `outline: 2px solid var(--accent)` (lime), `outline-offset:
2px`, `border-radius: 2px`. **Always verify rings by pressing Tab** — `.focus()`
from script does not set `:focus-visible`. And check at **t=0**: `transition-colors`
also animates `outline-color`, so a ring animates in from grey over 150ms. Use
`transition-[color,background-color]` on anything focusable.

## 9. Anchor offset

`html { scroll-padding-top: 6rem }` compensates for the 70px floating header.
Without it an anchor jump parks its target under the nav.
