# Research Matrix

## Candidate Libraries

| Candidate | Category | POC Priority |
|---|---|---|
| Mantine | React component library | Primary |
| Ant Design | React component library | Primary |
| shadcn/ui | Open-code component collection | Primary |
| Material UI | React component library | Secondary |
| PrimeReact | React component library | Secondary |

Related tools must be classified separately rather than compared as direct equivalents.

## Evaluation Criteria

For every candidate, investigate:

1. Component coverage
2. RTL support
3. Persian localization
4. Jalali calendar integration
5. Data table capabilities
6. Form capabilities
7. Select and autocomplete
8. Dialog and drawer components
9. Theming and dark mode
10. Customization flexibility
11. Accessibility
12. Developer experience
13. Documentation quality
14. Ecosystem and maintenance
15. Bundle size and runtime performance

## Evidence Classification

For every capability, record one of:

- Native: supported by the library itself.
- Official integration: supported through an official integration.
- Third-party: provided by an external package.
- Custom: requires project-specific implementation.
- Unsupported: unavailable or impractical.

## Scoring

Use a score from 1 to 5 only when evidence is available.

| Score | Meaning |
|---|---|
| 1 | Poor or unavailable |
| 2 | Significant limitations |
| 3 | Acceptable with workarounds |
| 4 | Good support |
| 5 | Excellent support |

Do not assign a score based only on marketing claims or personal preference.

## Evidence Record Template

For each important finding, record:

- Candidate:
- Feature:
- Support classification:
- Library version:
- Evidence URL:
- Test performed:
- Result:
- Limitations:
- Research date:

## Final Comparison

The final report must explain both scores and trade-offs. A numerical score alone is not a sufficient recommendation.

## Implementation Evidence — Criterion 5: Data Table Capabilities

Recorded from the Customer Table scenario (phase 1, 2026-11-12). Full
implementation record: `docs/CUSTOMER_TABLE.md`; decision rationale:
`docs/DECISIONS.md` (D-01). All three implementations share one behavioral
contract and one deterministic dataset (1,395 contacts), so results are
directly comparable. Every row below was browser-verified with Playwright
CLI against the dev build, not just documented.

### Mantine

- Candidate: Mantine
- Feature: Data table
- Support classification: **Native: rendering only** (`@mantine/core` `Table`
  is presentational — no native sorting/filtering/pagination). Sorting +
  pagination require a headless engine (**Custom wiring + Official
  recommendation: TanStack Table**).
- Library version: Mantine 8.x (installed), TanStack Table 8.21.3
- Evidence URL: https://mantine.dev/core/table/ (Table is markup-only; no
  datagrid API on the component)
- Test performed: implemented `CustomerTableMantine.tsx` (TanStack
  `getSortedRowModel`/`getPaginationRowModel` over the Mantine `Table`),
  Persian collation via custom `sortingFn`s
- Result: PASS — search, city/status filters, Persian sort, pagination
  (10/25/50), loading/empty/no-results, dark mode, RTL/LTR; row-for-row
  page-1 equivalence with antd for the same contract state
- Limitations: Persian collation is manual (`comparePersian`); no native
  filter UI (toolbar `Select`s are Mantine components, not table features)
- Research date: 2026-11-12

### Ant Design

- Candidate: Ant Design
- Feature: Data table
- Support classification: **Native** (full datagrid: sorting, column filter
  menus, pagination, loading, controlled modes). RTL + Persian locale are
  **Native** (`direction` prop, `fa_IR` locale).
- Library version: antd 5.x (installed, `fa_IR` locale from the package)
- Evidence URL: https://ant.design/components/table
- Test performed: implemented `CustomerTableAntd.tsx` using native
  `sorter`, `filters`/`filteredValue`, native `pagination` with
  `showSizeChanger`/`showTotal`; controlled via the shared contract
- Result: PASS — all behavioral-contract cases; native sort/filter/pagination
  UX; dark mode via `darkAlgorithm`; RTL/LTR switching
- Limitations: column filter menus and toolbar filters both write to the
  shared filter state (design choice); table column order/header semantics
  include a leading measure row in the accessibility tree (documented quirk)
- Research date: 2026-11-12

### shadcn/ui

- Candidate: shadcn/ui
- Feature: Data table
- Support classification: **Official integration (TanStack Table is the
  documented Data Table recipe) + Custom markup** (hand-written `Table`
  primitives are part of the shadcn model — open code owned by the project).
- Library version: shadcn-style primitives (project-owned, `src/kits/shadcn/`),
  TanStack Table 8.21.3, Radix UI via `radix-ui`
- Evidence URL: https://ui.shadcn.com/docs/components/data-table (official
  recipe: TanStack Table + shadcn Table primitives)
- Test performed: implemented `CustomerTableShadcn.tsx` (TanStack engine +
  project-owned primitives); overlays ported into the isolation-scope slot
- Result: PASS — all behavioral-contract cases; Persian sort via custom
  `sortingFn`s; Select dropdown and actions popover verified inside the
  portal slot with correct tokens, dark mode, direction and Persian font
- Limitations: most implementation effort of the three (markup + engine
  wiring are project code); Persian collation manual (same as Mantine)
- Research date: 2026-11-12

No scores are assigned yet — this is single-criterion implementation
evidence. Remaining criteria (2, 3, 4, 6–15) still require their own
scenarios before any final comparison.
