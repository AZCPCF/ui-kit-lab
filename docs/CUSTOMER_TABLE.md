# Customer Table — Phase 1 Implementation Record

Status: **Complete** · Date: 2026-11-12 · Browser-verified (Playwright CLI, Chromium, dev server)

## 1. Architecture

```
App.tsx ── PlaygroundShell (src/app/)      ← neutral chrome, owns all shared state
        └─ SpikeShell (src/spike/, frozen) ← CSS-isolation regression harness
```

- `PlaygroundShell` owns `selectedKit`, `theme`, `direction` and the shared
  `CustomerTableState` contract. Only the selected kit's implementation
  renders in the scenario area. The chrome imports no UI kit.
- The spike remains reachable via a header link; a neutral return bar wraps
  it (SpikeShell itself is untouched).
- No router — the app is a two-view toggle; a router would be premature.
- Shared table state (search, city, status, sort, page, page size) survives
  kit switching because it lives in the shell (verified in browser: sorting
  state asc carried from antd into Mantine and shadcn).

## 2. Data model (`src/data/types.ts`)

- `Organization { id, name, city }`
- `Contact { id, firstName, lastName, fullName, organizationId,
  organizationName, phone, email, city, status, createdAt }`
- `CustomerStatus = 'active' | 'inactive' | 'pending' | 'blocked'`
- `fullName` is always derived from `firstName` + `lastName` at generation
  time; `organizationName` is copied from the referenced organization —
  no second source of truth can diverge (dev-time assertion).

## 3. Dataset generation (`src/data/fixtures.ts`)

- Exactly **385 organizations** and **1,395 contacts** (Hirad context figures).
- Deterministic: fixed seed `20261112`, mulberry32 PRNG, stable sequential
  IDs (`org-001…`, `contact-0001…`). Regenerating the module yields the
  byte-identical dataset.
- Persian synthetic names (40 first × 30 last parts combined), synthetic
  organization names (part + suffix + legal form), 15 Iranian cities.
- Status distribution: active 55% / pending 20% / inactive 15% / blocked 10%.
- Creation dates: fixed Gregorian window 2023-03-21 … 2025-10-31, stored as
  ISO strings (rendered as Jalali only at display time).
- Emails use `userN@` + reserved domains (`example.test`, `example.org`,
  `example.com`). Phones use the non-dialable `+98 000` operator block.
- Generated once at module load; dev-only assertions verify counts, unique
  IDs, organization referential integrity and `fullName` derivation.
- All data is synthetic; no real personal data anywhere.

## 4. Persian font integration

- `@fontsource-variable/vazirmatn` 5.3.0 (exact), imported once in
  `main.tsx` — self-hosted woff2 through the Vite build, no CDN requests.
- Applied via each kit's official mechanism:
  - **Mantine**: `theme.fontFamily` + `headings.fontFamily`
    (`src/kits/mantine/theme.ts`) → `--mantine-font-family` on the scoped root.
  - **antd**: `theme.token.fontFamily` (`src/kits/antd/theme.ts`) →
    CSS-in-JS token in every generated style, including portaled overlays.
  - **shadcn**: `font-family` on `.shadcn-panel` / `.shadcn-scope` roots in
    `shadcn-scope.css` (Preflight is disabled, so the scope roots must
    declare it; portals into the slot inherit it).
  - Shell: `app-shell.css` body rule.
- Browser-verified: computed `font-family` = `"Vazirmatn Variable"` on table
  cells of all three kits AND on portaled content (shadcn Select dropdown,
  shadcn actions popover — measured inside the portal slot).
- Theme objects are created at module scope: creating Mantine/antd themes
  inline caused identity churn (Mantine froze the page in combination with
  controlled TanStack state — browser-verified, then fixed).

## 5. Table implementation per kit

| | Mantine | Ant Design | shadcn/ui |
|---|---|---|---|
| Rendering | `@mantine/core Table` | native `Table` | shadcn `Table` primitives |
| Sorting | TanStack `getSortedRowModel` | native column `sorter` + controlled `sortOrder` | TanStack `getSortedRowModel` |
| Filtering UI | kit `Select` (toolbar) | native column filter menus **and** toolbar `Select` | kit `Select` (toolbar) |
| Pagination | TanStack `getPaginationRowModel` + `Pagination` | native `pagination` config | TanStack + prev/next buttons |
| Search | shared selector | shared selector | shared selector |
| Row actions | `Menu` (inline, no portal) | `Dropdown` | `Popover` (existing primitive, menu pattern) |
| Loading | `Loader` + text | `Table loading` + `Spin` | `animate-spin` icon + text |
| Empty / no results | caption-less centered text | `locale.emptyText` | centered text |
| Extra deps | `@tanstack/react-table` | **none** | `@tanstack/react-table` |
| Locales | — | `antd/locale/fa_IR` | — |

### Shared behavior contract (`scenarios/customer-table/shared.ts`)

- `CustomerTableState { query, city, status, sort, page, pageSize,
  simulateLoading, emptyDataset }` — typed, owned by the shell.
- Pure selectors shared by all kits: `searchContacts` (fullName,
  organizationName, phone, email — case-insensitive), `filterContacts`,
  `comparePersian` (Persian collation, used by TanStack `sortingFn`s and
  antd `sorter`s), `sortContacts`, `paginate`, `PAGE_SIZES = [10, 25, 50]`.
- Page-size / sort changes reset to page 1 (identical across kits).

### Controlled TanStack state (implementation note)

TanStack state is fully controlled from the shell contract with two
guardrails, both browser-verified as required:

1. `onPaginationChange`/`onSortingChange` propagate **only actual changes**
   (TanStack re-invokes handlers during state sync; unconditional setState
   loops forever).
2. Mantine theme object hoisted to module scope (identity stability).

## 6. Native vs custom (evidence for RESEARCH_MATRIX criterion 5)

- **antd**: every table capability (sort/filter/pagination/loading/empty)
  is native. RTL via `direction`, Persian locale via `fa_IR`. Zero custom
  table logic beyond contract mapping.
- **Mantine**: core `Table` is presentational (verified against official
  docs — Mantine ships no datagrid). Sorting/pagination = TanStack (headless,
  shared engine). Persian collation supplied manually via `sortingFn`.
- **shadcn**: the official Data Table recipe *is* TanStack Table; no native
  datagrid exists by design (open-code approach). Same division of labor as
  Mantine.

## 7. Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@fontsource-variable/vazirmatn` | 5.3.0 (exact) | self-hosted Persian variable font |
| `@tanstack/react-table` | 8.21.3 (lockfile-pinned) | table engine for Mantine + shadcn |

Nothing else was added. Community Mantine DataTable packages were
deliberately not installed (would blur kit-vs-ecosystem attribution).

## 8. Browser test results (all three kits, equivalent cases)

| Test | Mantine | antd | shadcn |
|---|---|---|---|
| Table renders, 10 rows/page, total ۱٬۳۹۵ | PASS | PASS | PASS |
| Persian font on cells + header | PASS | PASS | PASS |
| Search «سارا» → 35 results | PASS | PASS | PASS |
| City filter (تبریز + سارا → 1) | PASS | PASS | PASS |
| Status filter values | PASS | PASS (native menus) | PASS |
| Sort by name (Persian collation) | PASS | PASS | PASS |
| Identical page-1 rows for same contract state | **PASS (Mantine = antd, row-for-row)** | | **PASS (shadcn = antd)** |
| Pagination page 2 / prev-next | PASS | PASS | PASS |
| Page size 25 | PASS | PASS | PASS |
| Loading state | PASS | PASS | PASS |
| Empty dataset state | PASS | PASS | PASS |
| No-results state | PASS | PASS | PASS |
| Dark mode (colors + font) | PASS | PASS | PASS |
| RTL/LTR switching | PASS | PASS | PASS |
| Overlay typography (Select/popover portals) | PASS | n/a (no open in table) | PASS |
| Console errors | PASS — 0 errors / 0 warnings for the whole session | | |

### Screenshots (`.playwright-cli/`)

- `30-playground-mantine.png` — default view (Mantine, RTL, light)
- `31-mantine-table-dark.png` — Mantine dark
- `32-antd-table.png` — antd native table
- `33-antd-table-dark.png` — antd dark, sorted asc
- `34-shadcn-table.png` — shadcn table
- `35-shadcn-table-dark.png` — shadcn dark, sorted desc
- `36-shadcn-actions-dark.png` — row-actions popover (in-scope portal)
- `37-shadcn-table-ltr-dark.png` — LTR direction
- `38-spike-regression.png` — CSS-isolation spike still intact after the
  shadcn primitives move (dialog verified: white content, themed overlay)

## 9. Known limitations / open items

1. Row action items are stubs (details/edit/delete do nothing yet — forms
   and details are out of scope this phase).
2. antd column filter menus and the toolbar `Select` both write to the same
   shared filter state (by design); antd's native empty-text is overridden
   by the contract strings for cross-kit equivalence.
3. `useReactTable` triggers two informational React-Compiler lint warnings
   ("incompatible library") — expected, TanStack's API returns non-memoizable
   functions; no functional impact.
4. Jalali rendering uses `Intl` `fa-IR-u-ca-persian` with `Asia/Tehran` —
   deterministic across Chromium/Node; other engines (Safari) not yet tested.
5. Phone numbers use the non-dialable `+98 000` block; email local parts are
   `userN` (clearly synthetic).
6. The Mantine `kit-portal-slot` is reserved but unused this phase (row
   menus render inline); future portaled Mantine overlays must target it.
