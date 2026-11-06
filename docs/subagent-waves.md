# Subagent fan-out for the FaceValue design build

Requires: restart once so the `subagent` tool loads.

```bash
npx free-pi-cli@latest --continue
```

Repo state when this was written: `apps/web` scaffolded on Next.js 16.4.5, `pnpm build` passes, 2 commits.
Source of the tool's limits: `~/.free-pi/agent/extensions/subagent/index.ts` (`MAX_PARALLEL_TASKS = 8`).

---

## Why your original block would have failed

| Problem | Consequence |
|---|---|
| All 4 build tasks ran before `apps/web` existed | four agents each scaffold their own Next.js app into one folder |
| Marketplace task needed `LikenessCard`, detail task needed `StateBadge`, both built concurrently | two competing implementations of the same component |
| `facevalue-verify` audited "docs vs code" with zero code written | empty report, wasted slot |

Fixed by: scaffold first (done), one wave for primitives, one wave for pages, verify last.

---

## Wave 1 — primitives (parallel, 3 tasks, disjoint files)

Paste after restart:

```
Use the subagent tool with mode parallel:

- agent: facevalue-frontend
  task: In apps/web, implement the design tokens exactly as specified in docs/design-tokens.md. Write the ramps and semantic tokens into app/globals.css using Tailwind 4 CSS-first @theme. Then load Fraunces and Inter via next/font/google in app/layout.tsx and apply both on <html>. Do NOT touch app/page.tsx or create any components. Verify with `pnpm build`.

- agent: facevalue-frontend
  task: In apps/web, create components/StateBadge.tsx and components/SiteHeader.tsx. StateBadge renders one of active|provisional|disputed|review|moved using the --state-* tokens from docs/design-tokens.md §4, always with an icon AND a word, never colour alone. SiteHeader has the FaceValue mark, nav (Browse, Register, Docs) and a wallet connect button, all 44px targets. Read docs/design-spec.md §6.1 and §10. Do not create other components or touch globals.css.

- agent: facevalue-integrator
  task: In apps/web, create lib/types.ts with the Likeness and Challenge types matching docs/dispute-spec.md §6 (data model) and the five-state enum. Create lib/match.ts exporting a pure `cosine(a: number[], b: number[]): number` plus `bandOf(cos: number): 'no-match' | 'review' | 'match'` using thresholds 0.65 and 0.45 marked as UNMEASURED placeholders. Add a node test proving cosine of identical vectors is 1 and orthogonal is 0. Touch no UI files.
```

**Why this split is safe:** tokens land in `globals.css` + `layout.tsx`; components land in `components/`; the integrator lands in `lib/`. No file is written twice.

**One risk to accept:** task 2 uses `--state-*` tokens that task 1 is writing at the same time. That is fine — the CSS variable names are fixed in `docs/design-tokens.md`, so neither needs the other's file to exist.

---

## Wave 2 — pages (parallel, 3 tasks, disjoint routes)

Run only after Wave 1's build passes.

```
Use the subagent tool with mode parallel:

- agent: facevalue-frontend
  task: Build apps/web/app/page.tsx — the marketplace at /. Follow docs/design-spec.md §6.1 exactly: hero, search + filters, a responsive card grid (1/2/3/4 cols). Create components/LikenessCard.tsx for the card. Seed 8 likenesses covering all five states. A card that is not licensable must show the reason in words, never a blank price. Do not touch app/likeness/**.

- agent: facevalue-frontend
  task: Build apps/web/app/likeness/[id]/page.tsx — the detail screen. Follow docs/design-spec.md §6.2: 7/5 split at lg, action panel first on mobile, and a ReasonPanel (not a disabled button) for the four non-licensable states, with the specific refusal copy. Create components/ActionPanel.tsx, components/ReasonPanel.tsx and components/PriceRow.tsx. Do not touch app/page.tsx.

- agent: facevalue-frontend
  task: Build apps/web/app/register/page.tsx — the four-step capture flow per docs/design-spec.md §6.3 with a Stepper. Camera preview is a placeholder element for now; wire no real camera. Copy must say "Likeness registered", never "verified". Create components/Stepper.tsx and components/Field.tsx (label + input + hint + error with aria-describedby). Do not touch app/page.tsx or app/likeness/**.
```

---

## Wave 3 — audit (single)

```
Use the subagent tool with mode single:

- agent: facevalue-verify
  task: Audit apps/web against docs/design-spec.md and docs/design-tokens.md. Report, per screen: any hardcoded hex instead of a semantic token, any use of gold for the provisional state, any occurrence of the word "verified", any disabled button without a stated reason, any badge carrying state by colour alone, and any missing focus-visible ring. Do not fix anything. List findings with file:line.
```

---

## If a wave fails

Do not re-run the whole wave. Read the failing agent's output, fix that one file yourself, commit, then re-run only the failed task. Parallel agents write to disk directly with no merge step, so a re-run can overwrite good work.

Commit after each wave:

```bash
git add -A && git commit -m "feat: design primitives"     # wave 1
git add -A && git commit -m "feat: marketplace + detail + register"  # wave 2
```
