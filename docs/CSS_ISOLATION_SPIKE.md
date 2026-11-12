# CSS Isolation Spike — Results

Status: **Complete** · Date: 2026-11-12 (browser-tested same day, Vite dev server)
Overlay-fix phase: 2026-11-12 (broken Mantine Modal / shadcn Dialog debugged,
fixed and re-verified in the browser — see §7).

## 1. Question

Can Mantine, Ant Design and shadcn/ui coexist in one React SPA without
unacceptable CSS or theme interference?

## 2. Installed packages (exact, verified in `pnpm-lock.yaml`)

| Package | Version | Notes |
|---|---|---|
| `@mantine/core` / `@mantine/hooks` | 9.8.0 | peer `react ^19.2` ✅ with 19.3.1 |
| `antd` | 6.7.0 | peer `react >=18` ✅ |
| `radix-ui` (unified) | 1.8.1 | exports `Dialog`, `Popover`, `Slot`, `Direction` |
| `tailwindcss` + `@tailwindcss/vite` | 4.3.5 | Vite 8.3.7 compatible |
| `class-variance-authority` | 0.7.1 | shadcn button variants |
| `lucide-react` | 1.72.0 | dialog close icon |
| `clsx` + `tailwind-merge` | 2.1.1 / 3.7.0 | `cn` helper |
| `tw-animate-css` | 1.4.0 | shadcn animation utilities |

Environment notes:
- Node-modules store was migrated (pnpm 10 → 11 store v10 → v11) via a full
  `pnpm install`; pnpm 11's supply-chain age policy rejected a fresh
  resolution of packages published <1 day earlier (rolldown 1.2.19 etc.);
  resolved by `pnpm clean --lockfile` + fresh resolution (Vite 8.3.7 instead
  of 8.3.8).
- pnpm auto-added `minimumReleaseAgeExclude: lucide-react@1.72.0` to a new
  `pnpm-workspace.yaml` (the version was <1 day old at install time).
  Review this entry before the next phase.

## 3. Actual implementation strategy

Panels live in `src/spike/`, each rendering its own `PanelCard` with
panel-level providers and per-panel controls (light/dark, RTL/LTR). The
shell (`src/spike/shell.css`, `SpikeShell.tsx`) uses plain CSS and contains
a header, nav, headings, a neutral-notes section with a button/input pair,
and a footer — all leak detectors. `document.documentElement` has no `dir`
and no color-scheme attributes; the shell sets `dir="rtl"` on its own root.

### Mantine (`mantine/MantinePanel.tsx`)

- `getRootElement={() => document.getElementById('mantine-panel-root')}` —
  the `data-mantine-color-scheme` attribute is set on the **panel root**,
  not `<html>` (documented prop, verified in browser).
- `cssVariablesSelector="#mantine-panel-root"` — all `--mantine-*` variables
  are scoped to the panel instead of `:root`.
- `forceColorScheme={scheme}` — React-controlled scheme, no localStorage;
  changing the prop value at runtime re-applies the scheme (verified).
- `classNamesPrefix="spike-mantine"` — renames `mantine-*` static classes.
- `DirectionProvider` is keyed on `dir` (Mantine reads the initial direction
  once per mount); the panel root also gets the `dir` attribute for text
  flow (logical properties handle the rest).
- Modal: `portalProps={{ target }}` mounts into a portal slot that lives
  **inside `#mantine-panel-root`** (phase-2 fix, see §7/F1 — as a card-level
  sibling the slot saw no `--mantine-*` variables and no color-scheme
  attribute, which broke the Modal and would have broken the Popover).
  `PanelCard.portalSlot` is passed `null` for Mantine.
- **Body styles on the scope root** (phase-2 fix, §7/F1): with
  `cssVariablesSelector`, Mantine no longer targets `<body>`, so
  `background-color: var(--mantine-color-body)` and
  `color: var(--mantine-color-text)` are applied inline on
  `#mantine-panel-root`. Without them, dark mode inherited the shell's
  light ink (browser-verified failure).
- Popover: `withinPortal` + `portalProps={{ target }}`; trigger wired with an
  explicit `onClick` (see workaround W2).
- A dedicated provider subtree is not needed for portals — React context
  survives DOM portals, so overlays stay inside the panel's provider tree.

### Ant Design (`antd/AntdPanel.tsx`)

- Panel-level `ConfigProvider` with `prefixCls="spike-ant"` and
  `iconPrefixCls="spike-anticon"` — every generated class is renamed; a
  style-sheet audit found **no un-prefixed global selectors**.
- `theme={{ algorithm: darkAlgorithm|defaultAlgorithm, cssVar: { key } }}` —
  token-driven dark mode; **no document-level class is written**; no
  `--ant-*` variables were found at `:root`.
- `direction` prop + `dir` attribute on the panel root.
- Overlay containment: `getPopupContainer` (Dropdown, message via `App`
  hook) and `getContainer` (Modal) target a portal slot that lives
  **inside `.antd-panel-root`** (phase-2 fix, §7/F2 — antd does not set
  `dir` on its portals; with the slot as a card-level sibling, overlays
  inherited the shell's direction and showed RTL while the panel was LTR).
- Only hook-based feedback (`App.useApp()`) is used; static
  `message.xxx`/`Modal.xxx` APIs would bypass the context (documented
  antd behavior) and are avoided.

### shadcn/ui (`shadcn/`)

- Tailwind v4 imported **without Preflight**
  (`theme.css` + `utilities.css` with `source('./')` in
  `shadcn/shadcn-scope.css`), so no global element reset exists.
- **Token → utility mapping** (phase-2 fix, §7/F3): a `@theme` block maps
  `--color-*`/`--radius-*` tokens to the panel-scoped raw tokens, and the
  same mappings are **re-declared inside `.shadcn-panel, .shadcn-scope`**
  so their `var()` references resolve per element. Two documented
  Tailwind v4.3.5 findings (browser-verified, see §7/F3):
  `@theme inline` blocks and a `theme(inline)` modifier on the
  `theme.css` import both fail to inline in the individual-imports mode.
- Theme tokens live on `.shadcn-panel` (light) and
  `[data-mode='dark']` (dark) instead of `:root`/`.dark`; the scaffold's
  `@layer base { * { ... } body { ... } }` global rules were **not**
  reproduced. No `.dark` class exists anywhere (verified).
- `dark:` variant redefined to key off `data-mode`.
- A micro-reset scoped to the panel subtree (box-sizing, `font: inherit`,
  heading margins, button/input reset) lives in `@layer base` — required
  because Preflight is disabled, and layered so utilities always win.
- Radix `Dialog.Portal` / `Popover.Portal` accept a `container` prop →
  card's portal slot. Because the slot sits outside `.shadcn-panel`, it
  carries a `shadcn-scope` class that re-declares the tokens.
- `Direction` (Radix) provider at panel level; `dir` attribute on panel
  roots. Components are hand-written copies of classic shadcn/ui source
  (button, input, dialog, popover) adapted to the unified `radix-ui` package
  and logical utilities.

## 4. CSS problems discovered (browser-verified unless noted)

### L1 — Mantine global styles (the largest real leak)

`@mantine/core/styles.css` (≈299 KB in dev) applies, unconditionally:

```css
:root, :host { color-scheme: var(--mantine-color-scheme); }
*, *::before, *::after { box-sizing: border-box; }
input, button, textarea, select { font: inherit; }
button, select { text-transform: none; }
body, :host {
  margin: 0;
  font-family: var(--mantine-font-family);
  font-size: var(--mantine-font-size-md);
  line-height: var(--mantine-line-height);
  background-color: var(--mantine-color-body);
  color: var(--mantine-color-text);
  /* + font smoothing */
}
```

Observed effects before mitigation:
- `body` font-family became Mantine's stack (leaked over the shell font).
- `body` background-color became *invalid at computed-value time* (the
  `--mantine-color-body` variable is scoped away by `cssVariablesSelector`)
  → transparent → the shell's neutral background was lost.
- The `*` box-sizing reset and form-control `font: inherit` normalization
  applied document-wide (shell elements' box-sizing changed to border-box).

`color-scheme` itself stayed `normal` (its variable is undefined at
`:root`). Mantine does not document a way to exclude these global rules
from `styles.css`; `cssVariablesSelector` only relocates the variables.

### L2 — Radix dialog body scroll lock (shadcn panel)

While the shadcn dialog is open, `document.body` receives
`overflow: hidden`, `pointer-events: none` and `data-scroll-locked="1"`
(via Radix `RemoveScroll`). All values are removed on close (verified).
Transient, contained, but it is a document-level side effect.

### L3 — tw-animate-css is document-global

Its `@keyframes` and utility classes (`.animate-in`, `.fade-in-0`, …) are
global once imported. They only take effect on elements using those class
names (shadcn components); no collision exists with `mantine-*` /
`spike-ant-*` names. Accepted.

### L4 — Tailwind theme variables on `:root` (inert)

`tailwindcss/theme.css` emits default token variables on `:root`. They are
consumed only by generated utilities (scanned exclusively from
`src/spike/shadcn/` via `source('./')`), so they are inert outside the
shadcn panel. Accepted.

### L5 — antd: no global selectors found

Every antd rule is scoped under `:where(<hash>).spike-ant-*` or
`.spike-anticon`. No `--ant-*` variables reach `:root` (cssVar tokens are
scoped to the panel's variable class). Cleanest of the three kits.

### Mantine dark-mode scoping — solved

With `getRootElement` + `cssVariablesSelector` + `forceColorScheme`, Mantine
dark mode is fully panel-scoped: `data-mantine-color-scheme` never appears
on `<html>` (verified), and sibling panels are unaffected. The planning-phase
risk "Mantine dark mode may be document-level" is **resolved**.

## 5. Workarounds (documented, none hide a conflict silently)

| ID | Problem | Workaround |
|---|---|---|
| W1 | Mantine global `body` rules leak over the shell (L1) | `html body { ... }` re-declaration in `shell.css` (higher specificity restores shell font/background/color/size). Documented; not a generic abstraction. |
| W2 | Mantine controlled `Popover` with both `opened` + `onChange` and the built-in Target click handler netted to "never opens" (aria-expanded stayed false) | Explicit `onClick={() => setPopoverOpen(o => !o)}` on the Target button (Mantine docs' controlled pattern). |
| W3 | Preflight omitted → panel-native form controls/headings unstyled | Micro-reset in `@layer base`, scoped to `.shadcn-panel`/`.shadcn-scope` only. |
| W4 | Radix overlays portal outside `.shadcn-panel` (no token scope there) | Portal slot carries `shadcn-scope` class re-declaring tokens; `dark:` variant matches both scope roots. |
| W5 | Mantine `DirectionProvider` reads direction once per mount | Provider keyed on `dir` (remount on direction change). |
| W6 | Mantine portals into a card-level slot lost variables + color-scheme | Portal slot moved **inside** `#mantine-panel-root` (official API: `portalProps.target` — only the destination moved). See F1. |
| W7 | With `cssVariablesSelector`, Mantine's body styles (themed bg + text color) have no target | `background-color`/`color` applied inline on the scope root — the documented manual equivalent of Mantine's unscoped `body` rules. See F1. |
| W8 | antd overlays inherit the shell's `dir` (antd RTL relies on the DOM context) | Portal slot moved inside `.antd-panel-root` so overlays inherit the panel's `dir`. See F2. |
| W9 | Tailwind emits mapped `--color-*` tokens on `:root` where the panel-scoped raw tokens don't resolve; `@theme inline` / `theme(inline)` do not inline in individual-imports mode | Re-declare the `--color-*`/`--radius-*` mappings inside `.shadcn-panel, .shadcn-scope` (scoped CSS, not a global override). See F3. |

## 6. Browser test results (Playwright CLI, Chromium)

| # | Test | Result | Evidence |
|---|---|---|---|
| 1 | Initial rendering of all three panels (Button, Input, Modal, Popover) | **PASS** | 01, 02, 15 |
| 2 | Independent light/dark per panel | **PASS** — pairwise verified (Mantine dark while antd/shadcn light; antd dark while Mantine dark + shadcn light; shadcn dark while others light). Full 2³-combination matrix not exhaustively screenshotted. | 03, 05, 07, 08 |
| 3 | Independent RTL/LTR per panel | **PASS** — panel `dir` + provider change; `document.dir` stays unset; neighbors unchanged | 04, 06, 08 |
| 4 | Open/close each Dialog/Modal | **PASS** (Escape closes all three) | 09, 10, 13 |
| 5 | Portal-based components open/render | **PASS** (after W2 for Mantine) | 11, 12 |
| 6 | Interaction in one panel does not change neighbors | **PASS** — toggles verified isolation; Mantine popover closing on outside-click when clicking another panel is expected popover behavior, not leakage | eval probes |
| 7 | Shell typography and layout unaffected | **PASS with W1** (FAIL without workaround — see L1) | baseline vs post-W1 probes |
| 8 | Overlays render in the intended panel | **PASS** — all 5 overlay types (Mantine Modal/Popover, antd Modal/Dropdown/message, shadcn Dialog/Popover) mount inside their own card's `.spike-portal-slot` (DOM parent-chain verified). | 09–13 + probes |
| 9 | Browser console errors | **PASS** — 0 errors, 0 warnings (antd `Space` `direction` deprecation fixed → `orientation`) | console log |
| 10 | Overlay theming inside portals (Mantine/antd/shadcn modals) | **FAIL → fixed in phase 2** (§7: F1–F3; re-verified PASS) | 16–28 |

### Overlay z-index inventory (measured)

| Overlay | z-index |
|---|---|
| Mantine Modal inner | 200 |
| Mantine Popover dropdown | 300 (`--mantine-z-index-popover`, scoped) |
| shadcn Dialog/Popover (z-50) | 50 |
| antd Modal wrap | 1000 |
| antd Dropdown | 1050 |
| antd message | 2010 |

Simultaneous multi-panel **modals** cannot be opened via real clicks — each
modal's fixed scrim covers the viewport and intercepts further clicks
(verified; expected modal UX). Cross-panel **popovers/dropdowns** coexist
freely (screenshot 11). If two overlays from different panels were visible at
once, the higher z-index (antd family) would cover the lower ones (shadcn
50, Mantine 200/300) — a stacking-context consideration for later phases,
not a CSS interference bug.

### Screenshots

All in `.playwright-cli/` (paths relative to repo root):

- `01-initial-viewport.png` — first render (pre-layer-fix, borders missing)
- `02-initial-after-layer-fix.png` — corrected scoped micro-reset
- `03-mantine-dark.png`, `04-mantine-dark-ltr.png` — Mantine independence
- `05-antd-dark.png`, `06-antd-ltr.png` — antd independence
- `07-shadcn-dark.png`, `08-shadcn-dark-ltr.png` — shadcn independence
- `09-antd-modal-open.png`, `10-mantine-modal-open.png` — modals (z 1000/200)
- `11-antd-dropdown-shadcn-popover.png` — cross-panel popovers coexisting
- `12-mantine-popover-open.png` — popover in own slot
- `13-shadcn-dialog-open.png` — Radix dialog (scroll-lock active)
- `14-responsive-900.png` — single-column responsive layout (popover
  overlapping the neighbor card: inherent popover positioning, documented)
- `15-final-clean.png` — final clean state
- `16-mantine-modal-fixed.png`, `17-shadcn-dialog-fixed.png` — phase-2 fixes (light)
- `18-antd-modal-recheck.png` — antd re-verified after the other fixes
- `19-antd-modal-dark.png`, `20-mantine-modal-dark.png`,
  `21-shadcn-dialog-dark.png` — dark-mode overlays
- `22-mantine-modal-ltr-dark.png`, `23-mantine-modal-rtl-dark.png`,
  `24-antd-modal-ltr-dark.png`, `25-antd-modal-rtl-dark.png`,
  `26-shadcn-dialog-ltr-dark.png`, `27-shadcn-dialog-rtl-dark.png` — RTL/LTR mirror checks
- `28-antd-modal-light-recheck.png` — antd light after the slot move

## 7. Overlay debugging & fixes (phase 2, 2026-11-12)

Both broken overlays were debugged in the browser (computed styles, DOM
parent chains, emitted CSSOM rules), fixed with minimal scoped changes, and
re-verified across the full matrix. The working antd Modal was untouched
and re-verified afterwards.

### F1 — Mantine Modal (transparent paper, unthemed colors)

**Root cause (browser evidence):** the portal slot was a **sibling** of
`#mantine-panel-root`, so portaled Modal content matched neither the
`--mantine-*` variables (`cssVariablesSelector` scopes them to the root)
nor any `[data-mantine-color-scheme]` rule: measured `--mantine-color-body`
/ `-text` / `-duration-sm` = undefined at the modal, content background
`rgba(0,0,0,0)`, no scheme attribute anywhere in its ancestor chain.
(The overlay scrim still looked right because its `rgba(0,0,0,.6)` is
hardcoded in `@mantine/core/styles.css`.) antd does not have this problem
because cssVar mode attaches the variable-holding class to the modal root
element itself; Mantine relies on an external selector element.

Second failure found during dark-mode testing: Mantine normally paints
`body` with `--mantine-color-body`/`--mantine-color-text`; with
`cssVariablesSelector` those body rules have no target, so in dark mode
the modal paper was dark but text inherited the shell's light ink
(title `rgb(33,31,27)` on `rgb(36,36,36)` paper — measured).

**Fix (`mantine/MantinePanel.tsx`, only file):**
1. Portal slot moved **inside** `#mantine-panel-root` (`PanelCard.portalSlot={null}`).
2. Body styles applied on the scope root (W7).

**Verified after fix:** light content `rgb(255,255,255)`, dark content
`rgb(36,36,36)` with title `rgb(201,201,201)` and primary button
`rgb(25,113,194)`; scheme attribute present (`mantine-panel-root:light/dark`)
and never on `<html>`; transition `opacity 0.2s, transform 0.2s`;
overlay `rgba(0,0,0,0.6)`, z 200; RTL close button LEFT / LTR RIGHT;
slot inside root confirmed by DOM chain. Screenshots 16, 20, 22, 23.

### F2 — antd Modal direction (found during re-verification)

**Root cause:** the antd portal slot was a card-level sibling of
`.antd-panel-root`; antd does not set `dir` on its portals (official RTL
support relies on the DOM context), so the modal inherited the shell's
`dir="rtl"` and rendered RTL even when the panel was LTR. Mask/bg/z-index
were always correct.

**Fix (`antd/AntdPanel.tsx`, only file):** slot moved inside
`.antd-panel-root` (same geometry fix as F1; the working Modal logic
itself is unchanged).

**Verified after fix:** LTR modal `dir=ltr`, close RIGHT, title
start-aligned; RTL modal `dir=rtl`, close LEFT; light `rgb(255,255,255)`
/ dark `rgb(31,31,31)` container, mask `rgba(0,0,0,0.45)`, z 1000;
DOM chain `spike-ant-modal-root → spike-portal-slot → antd-panel-root`.
Screenshots 18, 19, 24, 25, 28.

### F3 — shadcn/ui Dialog (transparent content, no color utilities)

**Root cause (browser evidence):** the `@theme` block mapping
`--color-*`/`--radius-*` tokens was **missing from
`shadcn/shadcn-scope.css`** (lost in an earlier file restructure). The raw
tokens (`--popover` etc.) resolved fine at the dialog content, but no
mapped color utility was ever generated: `.bg-popover`, `.bg-primary`,
`.text-popover-foreground`, `.text-muted-foreground`, `.border-border`,
`ring-ring/50` were absent from the emitted CSSOM while structural
utilities (`.fixed`, `.shadow-lg`, `.text-sm`, `bg-black/60`) existed.
The "broken animation" was the transparent content fading/zooming —
`@keyframes enter`, `animation: enter 0.2s` and the overlay
(`bg-black/60` → `oklab(0 0 0 / 0.6)`, z 50) were always intact.

**Documented Tailwind v4.3.5 behavior found while fixing (browser-verified
twice):** in the individual-imports mode used here, **both** an
`@theme inline { ... }` block **and** a `theme(inline)` modifier on the
`theme.css` import fail to inline — utilities still emit
`background-color: var(--color-popover)` with the mapped token emitted on
`:root`, where `var(--popover)` does not resolve (transparent again).
This contradicts the naive reading of the official docs (`theme(inline)`
"is placed on the theme.css import" in individual-imports mode per
preflight.mdx) and is recorded here as a verified finding.

**Fix (`shadcn/shadcn-scope.css`, only file):**
1. Plain `@theme { ... }` block restored (registers tokens so utilities generate).
2. All mapped `--color-*`/`--radius-*` tokens re-declared inside
   `.shadcn-panel, .shadcn-scope` (light) — the dark block only overrides
   the raw tokens, so dark works through the same references (W9).

Bonus fix: Dialog close button `left-4` → `end-4` (direction-aware
positioning) in `shadcn/ui/dialog.tsx`.

**Verified after fix:** light content `oklch(1 0 0)` with foreground
`oklch(0.145 0 0)`, confirm button `oklch(0.205 0 0)` bg; dark content
`oklch(0.205 0 0)` with foreground `oklch(0.985 0 0)`; border-radius 10px
(`--radius` resolves); animation `enter` 0.2s; overlay `oklab(0 0 0/0.6)`;
content in the `.shadcn-scope` slot; RTL close LEFT / LTR RIGHT.
Screenshots 17, 21, 26, 27.

### Phase-2 test matrix (Playwright CLI, Chromium, dev server)

| # | Test | Mantine | antd | shadcn |
|---|---|---|---|---|
| 1 | Modal opens/closes (Escape or close button) | PASS | PASS | PASS |
| 2 | Content background/foreground (light) | PASS | PASS | PASS |
| 3 | Content background/foreground (dark) | PASS | PASS | PASS |
| 4 | Overlay color/opacity/z-index | PASS | PASS | PASS |
| 5 | Open/close animation/transition | PASS | PASS | PASS |
| 6 | Independent light/dark per panel with modal open | PASS | PASS | PASS |
| 7 | Independent RTL/LTR (close-button side mirrored, `dir` correct) | PASS | PASS | PASS |
| 8 | Portal containment (content inside panel root / scope) | PASS | PASS | PASS |
| 9 | Neighbor isolation while overlay open (html attrs, neighbor styles) | PASS | PASS | PASS |
| 10 | Document restored after close (scroll lock, overflow) | PASS | PASS | PASS |
| 11 | Console errors | PASS — 0 errors, 0 warnings across the whole session | | |

NOT TESTED in this phase: antd Dropdown/message (unchanged code, verified
in phase 1); Mantine Popover visual re-check (same portal mechanism as the
fixed Modal, phase-1 verified); exhaustive 2³ light/dark matrix (pairwise
coverage only).



## 8. Verdict

**Is Single SPA acceptable? — Yes, conditionally (Approach A is viable).**

- antd contributes **zero** measured global interference.
- shadcn/ui coexists cleanly given: no-Preflight import, panel-scoped tokens,
  scoped micro-reset (all implemented once in `shadcn-scope.css`).
- Mantine coexists with **two accepted, documented leaks**: global `body`
  styles (mitigated by W1) and the global `*` box-sizing + form-control
  normalization resets (active document-wide, not mitigated — they are
  benign for a CRM app that would set border-box anyway, but they are real
  document-level changes and must be re-evaluated if the host app needs
  content-box or UA form styles).
- Radix body scroll-lock is transient and cleaned up on close.
- Lazy loading was **not** relied on for isolation anywhere; all styles of
  the three kits are loaded and audited.

**Do Shadow DOM / iframe deserve further investigation?**

- **Shadow DOM (B): downgrade to "not recommended without a dedicated spike".**
  antd is the only candidate with explicit `ShadowRoot` support in its
  documented API (`getPopupContainer` types accept `ShadowRoot`). Mantine
  documents no shadow-DOM story (its styles live in `document.head` and its
  variables select via document selectors); Radix portals accept
  `DocumentFragment` containers, but Tailwind v4 utility generation and
  `@layer` semantics inside shadow roots are unverified. The single-SPA
  result makes the heavy migration cost hard to justify.
- **iframe (C): keep as the documented fallback.** Only if a future phase
  demands zero document-level side effects (e.g., Mantine's global resets
  become unacceptable) — at the cost of theming/RTL sync complexity and
  layout integration. Not exercised in this spike.

## 9. Remaining risks / open items

1. Mantine global `*` and form-control resets remain active document-wide
   (accepted for the spike; revisit if the final app needs UA defaults).
2. Escape did not close the Mantine Popover in one session (outside click
   did) — verify focus/escape handling for popovers when building scenarios.
3. The full 8-combination light/dark matrix was reasoned from pairwise
   evidence, not exhaustively screenshotted.
4. Mantine's `withGlobalClasses` (default true) injects global utility
   classes for `visibleFrom`/`hiddenFrom`/`lightHidden`/`darkHidden`; not
   yet exercised by these components — check when responsive scenarios land.
5. antd v6 `zeroRuntime`/CSS-extraction mode untested (runtime CSS-in-JS was
   sufficient for the spike; reconsider for production performance).
6. Tailwind content scanning is locked to `src/spike/shadcn/` via
   `source('./')`; any future shadcn code outside that folder must update
   `shadcn-scope.css`.
7. `pnpm-workspace.yaml` contains an auto-generated
   `minimumReleaseAgeExclude` for `lucide-react@1.72.0` — review before the
   next dependency update.
8. Mantine is by far the heaviest stylesheet (~299 KB raw in dev); bundle
   impact per kit should be measured in the performance phase.
9. Phase-2 portal-slot placement: overlays now mount inside each panel's
   theme root (Mantine/antd) or scope element (shadcn). Verify that
   full-viewport overlay positioning still behaves when a panel scrolls
   inside a container in later scenario work (the spike page does not
   scroll per-panel).
10. Tailwind `@theme inline` / `theme(inline)` silently not inlining in
    individual-imports mode is a tooling-level surprise (F3); re-check
    against newer Tailwind v4 point releases before relying on it.
