# Dependency graph — FaceValue

Generated from the source, not from memory. Regenerate with the script in §6.

**Scope:** `apps/web` — 35 TypeScript modules, 42 resolved import edges (`@/*` and `./` both resolved).
**Excluded:** `node_modules`, `.next`, `.git`, and external packages.

---

## 1. Layer summary

```
            ┌─────────────────────────────────────────────┐
  ROUTES    │ /        /explore   /legal/*   not-found    │  6 pages
            └────────────────────┬────────────────────────┘
                                 │ 24 edges
            ┌────────────────────▼────────────────────────┐
  VIEWS     │ 20 components                               │
            └────────────────────┬────────────────────────┘
                                 │ 18 edges
            ┌────────────────────▼────────────────────────┐
  CORE      │ types · seed · wallet · cn                  │  6 modules
            └─────────────────────────────────────────────┘
```

---

## 2. Core — the most depended-on modules

Ranked by importer count. **A change here reaches the whole app.**

| Importers | Module | Role |
|---|---|---|
| **7** | `lib/types.ts` | `Likeness`, `Challenge`, state enum, `isLicensable()` |
| **5** | `components/SiteHeader.tsx` | the bar, on every route |
| **5** | `lib/seed.ts` | 8 seeded likenesses |
| 3 | `lib/wallet.tsx` | connect / address / status |
| 3 | `lib/cn.ts` | class merge |

> `types.ts` is the true keystone. `isLicensable()` in it is what both the card and the nav's status readout use to decide "licensable" — so those two can never disagree.

---

## 3. Route → component graph

### `/` — landing (13 components, the heaviest page)

```
app/page.tsx
├── SiteHeader ──── SiteHeader ─────────────────┐
├── Hero                                        │
├── TaglineReveal                               │  every page
├── HowItWorks                                  │  pulls the bar
├── RegistryMarquee ─┐                          │
├── StatusStages ────┤                          │
├── RegistrySample ──┤                          │
├── DisputeRecord ───┤                          │
├── Faq              │                          │
├── Footer           │                          │
└── Button ──────────┘                          │
                     │                          │
        LikenessAvatar ◄── DisputeRecord        │
                     └── StatusStages           │
        StateBadge ◄──── StatusStages           │
                                    lib/seed ◄──┘
                                    lib/types
```

### `/explore` — registry grid

```
app/explore/page.tsx
├── ConnectGate ──► lib/wallet.tsx      (gates the grid)
├── ExploreHeader
├── LikenessCard ──► lib/types.ts
├── SiteHeader
└── lib/seed.ts
```

### `/legal/privacy` · `/legal/terms`

```
app/legal/*/page.tsx
├── LegalPage        (shared shell — 2 importers)
└── SiteHeader
```

### `not-found`

```
app/not-found.tsx
├── SiteHeader
└── Button ──► lib/cn.ts
```

---

## 4. Shared components

| Component | Importers | Used by |
|---|---|---|
| `SiteHeader` | **5** | every route |
| `LegalPage` | 2 | both legal pages |
| `Button` | 2 | `page.tsx`, `not-found` |
| `LikenessAvatar` | 2 | `DisputeRecord`, `StatusStages` |
| `StateBadge` | 1 | `StatusStages` |
| `Footer` | 1 | `page.tsx` only |
| `Sheet` | 1 | `SiteHeader` (named import — a naive orphan scan misses it) |

---

## 5. Dead code — 4 modules, 0 importers

Confirmed by grep, not by the graph alone:

| Module | Lines | Status |
|---|---|---|
| `components/ApeArt.tsx` | 153 | **dead** — zero importers |
| `components/ui/accordion.tsx` | 85 | **dead** — `Benefits.tsx` was deleted in `beb9e02`, but its Radix dependency stayed |
| `lib/match.ts` | 39 | **only imported by its own test** — no product code calls `cosine()` or `bandOf()` |
| `lib/match.test.ts` | 37 | orphaned test — **passes 7/7**, so the engine is correct but unused |

> `lib/match.ts` being unreachable is the sharpest signal in this graph. **The cosine matching engine is wired to nothing.** It exists, it is tested, and no route uses it — which is the same gap the handoff records as "the embedding spike never ran."

`@radix-ui/react-accordion` (`^1.3.1`) is still in `package.json`; the only import of it is inside `accordion.tsx` itself, so both can go together.

---

## 6. Regenerate

The extractor is committed at `docs/graph-extract.js` (copied from the session's `/tmp/graph.js`), so this document is reproducible:

```bash
cd apps/web
# walk .ts/.tsx, strip use client, collect `from "…"`, resolve @/ → root
node ../../docs/graph-extract.js > /tmp/graph.json
node -e 'const g=require("/tmp/graph.json");
  console.log("nodes",Object.keys(g.nodes).length,"edges",g.edges.length);'
```

---

## 7. What the graph says about the remaining work

Mapping the 7 missing Wave 2 files onto the existing graph, each one attaches to a node that already exists:

| Missing file | Would import | Missing route it unblocks |
|---|---|---|
| `app/likeness/[id]/page.tsx` | `lib/types`, `lib/seed`, `SiteHeader` | **all 8 cards** |
| `components/ActionPanel.tsx` | `Button`, `lib/types` | `/likeness/[id]` |
| `components/ReasonPanel.tsx` | `lib/types` | the `409` refusal path |
| `components/PriceRow.tsx` | `lib/types` | — |
| `app/register/page.tsx` | `SiteHeader`, `Field`, `Stepper` | nav + footer + CTA |
| `components/Stepper.tsx` | `lib/cn` | `/register` |
| `components/Field.tsx` | `lib/cn`, `lib/types` | `/register` |

Nothing needs a new core module. Every new file hangs off `lib/types.ts`, which is already the most-imported node — so the leaf work is additive and low-risk.

The one structural change worth making: **`lib/match.ts` should become reachable** from `ActionPanel`/`ReasonPanel` once the verdict path exists, or be deleted. Right now it is a tested engine no screen calls.
