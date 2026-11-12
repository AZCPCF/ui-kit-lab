# Architecture & Research Decisions

Append-only log. Each entry: date, decision, rationale, evidence.

---

## D-01 — TanStack Table as a shared engine (Mantine + shadcn), antd stays native

Date: 2026-11-12 (research via Context7, verified against installed versions)

**Decision.** The Customer Table scenario uses TanStack Table
(v8.21.3, lockfile-pinned) as the sorting/pagination engine for **Mantine**
and **shadcn/ui**. Ant Design uses its **native Table** for all datagrid
capabilities.

**Rationale.**

1. **shadcn/ui has no table component of its own.** Its official Data Table
   recipe is TanStack Table + hand-written markup primitives — TanStack is
   its documented dependency. Using anything else would not be "shadcn".
2. **Mantine has no datagrid either.** `@mantine/core`'s `Table` is
   presentational (scroll container, stripes, sticky rows). Mantine's own
   guidance for data grids points to TanStack Table combined with the
   Mantine Table component, or community packages.
3. **antd's Table is a full-featured native datagrid** (sorting, filtering,
   pagination, loading, controlled and uncontrolled modes). Adding TanStack
   on top would *hide* antd's native capability — the exact opposite of this
   project's evidence-driven goal.

**Why shared at all?** The comparison is fairer this way: Mantine and shadcn
differ only in their *rendering* layer while sharing one sorting/pagination
engine, so observed behavioral differences are attributable to the kit, not
to two different headless libraries. antd represents the "native datagrid"
strategy. This difference is deliberately **visible**, not hidden behind an
abstraction (project principle 5).

**Why not community Mantine packages** (`mantine-datatable`,
Mantine React Table)? They are third-party ecosystem products; installing
them would attribute ecosystem effort to the kit itself and add
dependencies. Recorded as rejected alternatives.

**Non-goals.** No cross-kit table abstraction was built; each implementation
maps the shared typed contract (`CustomerTableState`) onto its own
components. Shared logic lives only in pure selectors
(`src/scenarios/customer-table/shared.ts`).

---

## D-02 — shadcn primitives move to `src/kits/shadcn/`

Date: 2026-11-12

**Decision.** Hand-written shadcn primitives (button, input, dialog,
popover, table, select + `lib/utils.ts` + `shadcn-scope.css`) moved from
`src/spike/shadcn/` to `src/kits/shadcn/` as the single source of truth. The
spike's `ShadcnPanel.tsx` imports them from the new location; the spike
folder keeps only its panel component.

**Tailwind scanning.** `shadcn-scope.css` now lives in `src/kits/shadcn/`
and scans that folder via `source('./')`; an explicit
`@source '../../spike/shadcn'` keeps the spike panel's own utility classes
scanned. **Browser-verified regression:** the spike's shadcn Dialog still
renders with full theming (`oklch(1 0 0)` content, themed overlay,
in-scope portal) after the move.

**Rejected alternative:** duplicating the primitives into a second folder —
two copies of open-code components would diverge silently.

---

## D-03 — No router yet

Date: 2026-11-12

**Decision.** The playground/spike switch is a two-state toggle in
`App.tsx`. A router would be premature for a two-view R&D app; revisit when
scenarios need deep-linking or URL state.

---

## D-04 — Fonts: self-hosted Vazirmatn via each kit's official theme API

Date: 2026-11-12

**Decision.** `@fontsource-variable/vazirmatn` (5.3.0 exact) imported once
in `main.tsx`; applied via Mantine `theme.fontFamily`, antd
`theme.token.fontFamily`, and the shadcn scope roots (Preflight disabled →
scope roots declare `font-family`). No CDN requests.

**Evidence.** Computed styles verified in the browser on all three kits'
table cells and on portaled overlay content (shadcn Select dropdown and
popover measured inside the portal slot).

**Note.** Kit theme objects must be created at module scope; per-render
identity churn (Mantine) caused a page freeze in combination with
controlled TanStack state — browser-verified, then fixed.
