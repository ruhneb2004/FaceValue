# FaceValue — design tokens

Every value here was **computed and measured in this repo**, not chosen by eye. Scripts used: OKLCH ramp generation + WCAG 2 relative-luminance contrast.

Brand anchors from the **Figma resource library**: gold `#BA8E23` (Golden Harmony) and taupe `#54463A`.
Sources: `figma.com/color-palettes/golden-harmony/`, `figma.com/colors/taupe/`.

---

## 1. Why the Figma swatches are not usable as-is

| Figma swatch | White text | Verdict |
|---|---|---|
| `#E8E000` | 1.39:1 | unusable for text |
| `#BA8E23` | 3.01:1 | fails 4.5:1 |
| `#C4BB89` | 1.94:1 | fails |
| `#FF9E54` | 2.04:1 | fails |

They are presentation swatches. We keep their **hues** and build ramps that hold hue constant and step lightness evenly.

Measured anchors in OKLCH:

- gold `#BA8E23` → `L 0.671, C 0.127, h 84°`
- taupe `#54463A` → `L 0.405, C 0.027, h 63°`

---

## 2. Primitives

```css
/* gold — hue 84° */
--gold-50:  #fff4cb;
--gold-100: #ffecbf;
--gold-200: #f8deab;
--gold-300: #e9cc90;
--gold-400: #d8b670;
--gold-500: #c69e49;
--gold-600: #b1861e;
--gold-700: #93701d;
--gold-800: #765a1a;
--gold-900: #594415;
--gold-950: #3e2f0e;

/* taupe — hue 63° */
--taupe-50:  #fcf5ef;
--taupe-100: #f5ede7;
--taupe-200: #e8dfd8;
--taupe-300: #d7cdc5;
--taupe-400: #c4b8ae;
--taupe-500: #afa297;
--taupe-600: #9a8b7e;
--taupe-700: #817367;
--taupe-800: #685d53;
--taupe-900: #4e463f;
--taupe-950: #37302b;

/* warm neutral — hue 63°, near-zero chroma */
--neutral-50:  #f9f6f4;
--neutral-100: #f1eeeb;
--neutral-200: #e4e1de;
--neutral-300: #d2cecb;
--neutral-400: #bebab6;
--neutral-500: #a8a49f;
--neutral-600: #928c88;
--neutral-700: #7a7571;
--neutral-800: #625e5b;
--neutral-900: #4a4744;
--neutral-950: #1f1e1c;
```

---

## 3. Semantics — components use ONLY these

```css
--color-bg-page:        var(--neutral-50);
--color-bg-surface:     var(--neutral-100);
--color-bg-sunken:      var(--neutral-200);
--color-bg-gold-tint:   var(--gold-100);

--color-text-primary:   var(--neutral-950);
--color-text-secondary: var(--neutral-900);
--color-text-muted:     var(--neutral-800);
--color-text-on-accent: #ffffff;

--color-accent-solid:   var(--gold-700);
--color-accent-hover:   var(--gold-800);
--color-accent-text:    var(--gold-800);

--color-secondary-solid: var(--taupe-800);
--color-border:          var(--neutral-700);
--color-border-subtle:   var(--neutral-300);
--color-focus-ring:      var(--gold-800);
```

---

## 4. Status states

Each state has its own hue; states are ≥15° apart in OKLCH so none reads as another.

```css
/* active — licensed, settled */
--state-active-text:  #1f6b45;
--state-active-bg:    #e8f2ec;
--state-active-solid: #1f6b45;

/* provisional — registered, not yet licensable */
--state-provisional-text:  #8a5a00;
--state-provisional-bg:    #fdf3e0;
--state-provisional-solid: #8a5a00;

/* disputed — challenge open */
--state-disputed-text:  #9a4737;
--state-disputed-bg:    #ffede5;
--state-disputed-solid: #9a4737;

/* review — 2-of-3 resolving */
--state-review-text:  #5f3f8a;
--state-review-bg:    #f2ecf7;
--state-review-solid: #5f3f8a;

/* moved — controller changed hands */
--state-moved-text:  #4e463f;
--state-moved-bg:    #f5ede7;
--state-moved-solid: #4e463f;
```

`provisional` is deliberately **not** gold. Gold means "you can buy this"; amber means "not yet".

---

## 5. Measured contrast (WCAG 2)

Foreground measured against the surface it actually renders on.

### Light mode

| Pair | Ratio | Required | |
|---|---|---|---|
| text-primary / page | **15.48:1** | 4.5 | ✅ AAA |
| text-secondary / page | **8.58:1** | 4.5 | ✅ AAA |
| text-muted / page | **5.97:1** | 4.5 | ✅ |
| accent-text / page | **6.01:1** | 4.5 | ✅ |
| white on gold-700 | **4.59:1** | 4.5 | ✅ |
| white on gold-800 | **6.47:1** | 4.5 | ✅ |
| white on taupe-800 | **6.40:1** | 4.5 | ✅ |
| dark on gold-200 | **12.71:1** | 4.5 | ✅ |
| input border / sunken | **3.50:1** | 3.0 | ✅ |
| focus ring / page | **6.01:1** | 3.0 | ✅ |

### Status

| State | Text on tint | White on solid |
|---|---|---|
| active | **5.65:1** ✅ | 6.47:1 ✅ |
| provisional | **5.38:1** ✅ | 5.93:1 ✅ |
| disputed | **5.55:1** ✅ | 6.31:1 ✅ |
| review | **7.06:1** ✅ | 8.19:1 ✅ |
| moved | **7.99:1** ✅ | 9.24:1 ✅ |

### Dark mode

| Pair | Ratio | |
|---|---|---|
| text / page | **14.41:1** | ✅ |
| gold-400 accent / page | **8.60:1** | ✅ |
| gold-500 accent / page | **6.65:1** | ✅ |
| taupe-400 / page | **8.58:1** | ✅ |

---

## 6. Decisions forced by measurement

1. **Primary fill is `gold-700`, not `gold-600`.** White on 600 is under 4.5:1.
2. **Muted text is `neutral-800`, not 700.** `neutral-700` on the page surface measures **4.23:1** (and **3.94:1** on a surface above the page) — both fail 4.5:1. `neutral-800` measures 5.97:1.
3. **Input border is `neutral-700`, not 600.** 600 measures 2.55:1, below the 3:1 UI requirement.
4. **Status text sits at the `-text` value, never the `-solid` value,** on tinted backgrounds — the solid steps are tuned for white labels, not for text on tint.

---

## 7. Tailwind wiring

Tailwind 4.3.4 uses CSS-first config; declare tokens in `app/globals.css` under `@theme` so utilities are generated from the variables rather than duplicated.

```css
@import "tailwindcss";

@theme {
  --color-page:    var(--neutral-50);
  --color-surface: var(--neutral-100);
  --color-sunken:  var(--neutral-200);
  --color-ink:     var(--neutral-950);
  --color-ink-2:   var(--neutral-900);
  --color-ink-3:   var(--neutral-800);
  --color-accent:  var(--gold-700);
  --color-border:  var(--neutral-700);
  --font-display:  var(--font-display);
  --font-sans:     var(--font-sans);
  --radius-control: 8px;
  --radius-card:    12px;
}
```

Then `bg-page`, `text-ink`, `bg-accent`, `text-ink-3`, `font-display` work as utilities.

---

## 8. Caveat

These values were generated and measured by script in this repo. They have **not been rendered in a browser**. Screenshot before locking, particularly the gold-on-taupe combinations, where perceived warmth is not captured by a contrast ratio.
