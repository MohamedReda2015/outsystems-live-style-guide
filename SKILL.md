---
name: outsystems-live-style-guide
description: Design, style, review and migrate OutSystems interfaces using the installed OutSystems UI theme, design tokens, responsive layouts, WCAG accessibility and RTL. Includes CSS and contrast tools. Use for visual design, themes and accessibility in O11 or ODC; frontend logic belongs in outsystems-frontend-conventions.
license: MIT
metadata:
  version: 2.1.0
  updated: "2026-11-22"
  platform: OutSystems 11 (Reactive Web, Mobile, Traditional Web) and ODC; OutSystems UI Classic 2.x and 3.0
  agent-independent: "true"
  companion-skill: outsystems-architecture (optional, separate; architecture, layering, data, logic); outsystems-ai-mentor (end-to-end lifecycle orchestrator)
---

# OutSystems Live Style Guide

## Scope, evidence and consistency

- Run bundled scripts from the skill directory or use absolute paths; do not assume they exist in the application checkout.
- Establish O11/ODC, application type, installed component versions and the target environment from available evidence; ask only for information that changes the work.
- Separate **platform facts**, **house defaults**, **project decisions** and **observed lessons**. Project conventions choose among supported designs; they cannot change runtime behavior. The FE/CW/BL/CS chain is an O11 house pattern, not an ODC requirement.
- Preserve the user's requested scope and existing authorization. Continue routine reversible work; a skill does not authorize publishing, dependency changes or production operations beyond that scope. Do not introduce phase-by-phase approval unless the user or environment requires it.
- Prefer installed API signatures and version-matched official documentation. A repository development branch, community workaround or old project observation is evidence to investigate, not a release guarantee.
- Report evidence separately: **prepared → model validated → merged → published → runtime verified**. A static checker passing proves only its covered checks on the supplied inventory. Unknown, blocked and not tested remain explicit.
- Agent work through the Service Studio MCP follows the shared MCP reference in outsystems-architecture (its `service-studio-mcp` reference, rule `OPS-10`): confirm the environment with the user (the MCP can't report it) and stay in Development; one writer per module and a fresh edit session after any human edit or partial merge; read back every write and lay out its flows before merging; keep an agent change log; publish only on an explicit yes. For styles: prefer the theme stylesheet; an edit to a non-empty block or screen stylesheet can merge yet publish the old CSS, so fetch the served CSS file after publishing; block CSS loads before the theme CSS (override with higher specificity); reload after resizing, because the device class is fixed at page load.
- Related skills: outsystems-architecture (layers, shared MCP reference), outsystems-frontend-conventions (behaviour), outsystems-ai-mentor (end-to-end lifecycle).
- Read [verification and reliability](references/verification-and-reliability.md) when changing data contracts, concurrent operations, runtime behavior or verification. It contains the concrete acceptance checks and sources for this skill.


This skill makes an agent design, build and review OutSystems interfaces the way a senior OutSystems UI/UX lead would:
- on top of the **OutSystems UI** framework (Classic or 3.0);
- driven by **design tokens** instead of hard-coded values;
- assembled from **standard patterns**;
- **responsive** by device class;
- **accessible** to WCAG 2.2 AA;
- governed through one **style guide**, so every app looks and behaves the same.

It works for any agent (Claude, Copilot, Cursor, Codex, Gemini, a custom LLM agent) and for humans. Everything is plain Markdown plus two zero-dependency Node.js scripts.

## Why this matters

OutSystems apps share themes, blocks and patterns across many teams. Every hard-coded `#1068eb`, `margin: 13px` or `.card { … }` override becomes a fork of the design system: rebranding means hunting through stylesheets, apps drift apart visually, and shared blocks break in other apps' themes.

OutSystems UI 3.0 raised the stakes. It **retired** several Classic variables (`--font-size-*`, `--shadow-*`, `--border-size-*`, palette shades), and declarations that use them are **silently dropped**. CSS written against the wrong version fails without an error.

Accessibility and responsiveness can't be retrofitted cheaply. Government and enterprise clients audit both, and the European Accessibility Act applies in the EU. The rules below exist so a theme change re-skins everything, every block works in every app, upgrades are mechanical, and every screen passes an audit the first time.

## Step 0: know the OutSystems UI version (before any CSS or token advice)

| | **Classic (2.x)**: existing apps, Traditional Web | **3.0**: default for new O11/ODC apps since 2026 |
|---|---|---|
| Model | variables + class overrides in the theme | 4 tiers: `--osui-{component}-{prop}` knob → role (`--color-*`, `--border-radius-*`, `--space-*`) → `--token-*` |
| Type | `--font-size-h1` (32px) … `--font-size-xs` | `var(--token-font-size-700, 1.75rem)` (H1 28px) …; `.heading1–6` classes in both |
| Shadow / border width | `--shadow-xs…xl`, `--border-size-s/m/l` | `--token-elevation-1…4`, `--token-border-size-025/050/075` (always with fallback) |
| Neutral-0 | `#ffffff` | `#f6f7fa`; flips in dark mode (use `--color-background-surface`, `--color-text-light`) |
| Radius soft | 4px | 8px; `--border-radius-default` + `.shape-soft/round/rectangular` |
| Font | system stack | Inter |
| Dark mode | none built in | `SetDarkTheme` → `.os-dark-theme` on `<html>` |
| left/right utilities | physical (don't mirror in RTL) | logical (mirror) |
| Same in both | `--color-primary`, status roles, 12 palette bases, `--space-*`, utility class names, patterns, `.phone/.tablet/.desktop` |

How to detect it:
- Inspect the installed OutSystems UI dependency version and the actual base-theme chain first. Package version and selected theme are separate facts: a 3.x installation can retain Classic.
- Compare loaded CSS/public APIs with that release; custom colors, fonts or missing variables are clues only, since overrides and failed stylesheet loads can mimic another version.
- Record the release/theme evidence in the project’s design notes; use the matching linter mode.

If it's unknown, ask, or write version-safe CSS (roles + `--space-*` + `var(--token-…, literal)`). Details and the full retired → replacement map: `references/osui-versions-and-migration.md`.

## Applying conventions

Use the project's documented architecture, naming and design choices where supported. Use this skill's house defaults when the project has no decision. Official documentation and installed contracts determine platform behavior; house preferences never override those facts. Record a consequential deviation and its reason. Escalate unresolved security, data-integrity or compatibility conflicts, not ordinary naming or layout choices.

## Core principles
1. **Tokens first.** Every color, size, space, radius, shadow and layer comes from a variable or utility class, and you rebrand by changing the variable.
   - Classic: `var(--color-primary)`, `.margin-top-m`.
   - 3.0: roles first, then component knobs, then `var(--token-*, literal)`.
2. **Patterns before custom.** Use an OutSystems UI pattern or widget if one fits (`references/patterns-catalog.md`). Build custom only when nothing fits, as a CW block built *from* tokens, with its own prefixed CSS knobs.
3. **The theme owns global styling; variables, not rule fights.**
   - Global look goes in the theme (inheriting the corporate theme).
   - Block look goes in the block stylesheet, prefixed.
   - Screens carry almost no CSS. No inline styles.
   - In 3.0, restyle components through their `--osui-*` knobs.
4. **Design every state.** Data areas have loading, empty (Blank Slate), error and populated states. Actions give in-progress, success and failure feedback. Controls show hover, focus, active, disabled and error states, in light and (if offered) dark.
5. **Responsive by device class.** Design phone, tablet and desktop. Use Columns breaks, `.phone/.tablet/.desktop`, Display/Move On Device, and Responsive tables. Breakpoints change only through `SetDeviceBreakpoints` (Reactive defaults: phone < 700, tablet ≤ 1024).
6. **Accessible by default (WCAG 2.2 AA).**
   - `EnableAccessibilityFeatures = True` on layouts;
   - text ≥ 4.5:1; large text ≥ 3:1; required non-text indicators ≥ 3:1 against adjacent colors; verify actual rendered states;
   - labels bound to inputs; full keyboard use with a visible, unobscured focus ring;
   - targets normally ≥ 24 CSS px under WCAG 2.2 AA, with its stated exceptions; 44px on touch is the house target;
   - headings in order; titles on every screen (including login);
   - color never the only signal.
7. **One page anatomy.** Layout (Header · Breadcrumbs · Title · Actions · MainContent · Footer), with the same spacing rhythm everywhere.
8. **Governed.** A style-guide team owns the corporate theme, shared blocks and the Live Style Guide. App teams use registered prefixes and promote reusable styles (`references/style-guide-governance.md`).
9. **Verify in the browser.** Check real screens at three device sizes (reload after resizing), keyboard-only, in light and dark, before calling something done.

## Tokens cheat sheet (full tables: `references/design-tokens.md` Classic, `references/osui-versions-and-migration.md` 3.0)

| Need | Classic (2.x) | 3.0 |
|---|---|---|
| Body text / muted text | `--color-neutral-9` / `--color-neutral-7` (4.95) | `--color-text` / `--color-text-subtlest` (4.85) |
| Surface / page | `--color-neutral-0` / `--color-background-body` #f3f6f8 | `--color-background-surface` / `--color-background-body` |
| Borders (decorative / inputs) | `--color-neutral-4` / input `neutral-5` (**1.49, harden to neutral-7**) | `--color-border-subtle` / `--color-border-input` (**1.45, harden to `-input-press`**) |
| Brand | `--color-primary` #1068eb, `--color-secondary` | `--color-primary` #105cef (`-hover`, `-selected`); links read `--token-semantics-primary-base` |
| Status text | `--color-error/success/info` ok; **warning fails (2.2)**; never on its own `-light` bg (4.25) | `--token-text-danger/success/warning/info` with fallbacks (all ≥ 5.4); **`--color-success` 2.74 and `--color-warning` 1.41 fail as text** |
| Type | `.heading1–6`, `.font-size-display/base/s/xs`, `--font-size-*` | the same classes; `--token-font-size-275…900` (with fallback) |
| Spacing (both) | `--space-xs 4 · s 8 · base 16 · m 24 · l 32 · xl 40 · xxl 48`, `.padding-*`, `.margin-*`, `.gutter-*` | same; plus `.gap-*`; finer steps `--token-scale-*` |
| Radius | `--border-radius-soft` 4 · `rounded` · `circle` | `--border-radius-soft` 8 · `rounded` · tiers `-2xs…-2xl` · `-default` |
| Elevation | `--shadow-xs…xl` | `.shadow-xs…xl` classes or `--token-elevation-1…4` |
| Layers / layout | literal z-index · `--header-size`, `--side-menu-size` | `--layer-global-*`, `--layer-local-tier-*` · plus `--header-size-content`, `--bottom-bar-size`, `--os-safe-area-*` |

**House minimum text size: 12px (not a WCAG minimum).** The 11px label sizes exist in both versions but aren't allowed for meaningful text.

## Choosing a pattern (details in `references/patterns-catalog.md`)
- **Pick one option**:
  - 2–4 options → Button Group;
  - 5+ → Dropdown;
  - searchable → Dropdown Search, or Dropdown Select (Classic Web);
  - several → Dropdown Tags or checkboxes;
  - on/off → Switch or Toggle.
- **Overlays**:
  - plain-text hint → Tooltip;
  - rich anchored content → Balloon or Popover;
  - blocking decision → Modal or Popup;
  - side details or filters → Sidebar;
  - actions on phone → Bottom Sheet or Action Sheet;
  - row or secondary actions → Overflow Menu.
- **Structure**:
  - list + detail → Master Detail;
  - steps → Wizard;
  - parallel views → Tabs (≤ 6);
  - long page → Section, Section Group + Section Index;
  - related fields → Fieldset;
  - grids → Columns or Gallery.
- **Collections**: Table + Pagination + sort; Gallery or Cards; Timeline.
- **Status and numbers**: Tag (status), Badge / Icon Badge (counts), Counter (KPI), Progress Bar or Circle (one style per action), Rating.
- **Feedback**: Blank Slate (empty, with a next action), Alert (inline; `role=alert` for errors and warnings), Notification / Feedback Message (transient), Button Loading (slow action).

## Standard screen anatomy
```
Layout (Top Menu or Side Menu, chosen once in the theme; EnableAccessibilityFeatures = True)
├─ Header: logo · menu · user (from the layout; never rebuilt per screen)
└─ MainContent
   ├─ Breadcrumbs        (depth ≥ 2 only)
   ├─ Title (H1, one per screen) ........ Actions (max 1 primary, at the end side)
   └─ Content: filters row → sections/cards (gap --space-m, padding --space-base/m) → footer actions on long forms
```
Full rules: `references/layout-and-navigation.md`.

## How to work

### Designing a screen or block
1. **Inventory first**: OutSystems UI version, theme chain and overrides, layout, existing CW and shared brand blocks, and the Live Style Guide. Reuse before creating.
2. Fill in `templates/screen-spec.md`:
   - goal and primary action;
   - anatomy and the pattern per area;
   - states;
   - phone, tablet and desktop behavior;
   - accessibility;
   - texts in every language.
3. Write down why you chose any custom component. If other apps will need it, plan its promotion to the style guide.

### Building
1. Global styles go in the theme (`references/theming.md`): one `:root` block of overrides, each variable in one section only (hand-written beats Theme Editor). Block styles go in the block stylesheet, prefixed with the module acronym. No inline styles.
2. Use utility classes first: `card padding-m shadow-s`, grammar `<property>[-<side>][-<value>]`, long form. Then roles, knobs or tokens in CSS.
3. Build forms, lists, tables and feedback as described in `references/components-and-forms.md`.
4. Wire accessibility while building: label ↔ input, headings, titles, focus management (`SetFocus`), ARIA (`SetAccessibilityRole`, `SetAriaHidden`), and the pattern ARIA notes (`references/accessibility.md`).
5. Build responsive behavior as you go (`references/responsive.md`). Use logical properties (`margin-inline-start`) for RTL (`references/ux-writing-and-i18n.md`).
6. **Lint every stylesheet you touched**:
   ```
   node scripts/lint-ui-css.mjs <file-or-folder> [--osui 3] [--theme] [--rtl] [--json]
   ```
   Fix every Blocker or Major. Justify any Minor you keep (`/* lint-ignore ID: reason */`).
7. Check every non-token color pair:
   ```
   node scripts/contrast.mjs [--osui 3] <fg> <bg>
   node scripts/contrast.mjs [--osui 3] --suggest <bg>
   ```
8. Verify in the browser: phone, tablet and desktop (reload after resizing); empty, error and loading states; keyboard-only; light and dark. Report what you saw.

### Reviewing or enforcing
1. Establish the version, then run the linter in that mode and the contrast checker on the pairs you find.
2. Walk through `references/review-checklist.md`. Every rule has an ID (`TOK-08`, `A11Y-15`, `GOV-02`…) and a severity.
3. Look at the rendered UI at all three device sizes, keyboard-only, and in both themes.
4. Write `templates/ui-review-report.md`: findings with the most severe first, each with its rule ID, evidence and a concrete fix in tokens and patterns.

### Migrating Classic → 3.0
Follow `references/osui-versions-and-migration.md` §7:
1. inventory;
2. `lint --osui 3`;
3. triage into "stopped working", "collides" and "just looks different" (accept the last by default);
4. rewrite with roles, knobs, then tokens with fallbacks;
5. compare side by side in light and dark;
6. re-check contrast.

## Rules most often broken
- Hard-coded colors, sizes or spacing (TOK-01…05). The linter suggests the token for the right version.
- **Classic variables in a 3.0 app** (TOK-08), or **a bare `var(--token-x)` with no fallback** (TOK-09). Both are silent failures; a bare token works only in dark mode.
- `--color-neutral-0` used as white in 3.0 (TOK-10).
- Low-contrast text:
  - Classic neutral-6, warning, yellow, lime, green or orange; 3.0 `--color-success` or `--color-warning` as text or under white text;
  - semantic text on its own light background in Classic (A11Y-01).
- `EnableAccessibilityFeatures` left off (A11Y-15).
- `outline: none` with no replacement (A11Y-05).
- Default input-border and focus-ring contrast left below 3:1 (A11Y-03).
- Login screen without a title (A11Y-17).
- Restyling framework classes from blocks or screens, unprefixed custom classes (THM-03); rewriting 3.0 component rules instead of setting knobs (THM-08).
- Generated-id selectors (THM-04). Inline styles (THM-05).
- Missing empty, loading or error states (FDB-01). More than one primary button (CMP-04). Unconfirmed destructive actions (FDB-04).
- Pixel media queries or fixed widths (RSP-02/03). Physical left/right in RTL apps (TXT-02, lint `--rtl`).
- `border-radius: 100%` ellipses (LES-18). Reactive List + flex without `.list > script{display:none}` (LES-03).

## Reference map (read only what the task needs)

| File | Read when |
|---|---|
| `references/osui-versions-and-migration.md` | **any token or CSS work**: version detection, the 3.0 model, roles and token scales, retired map, gotchas, migration, official agent docs |
| `references/design-tokens.md` | Classic (2.x) token values and contrast facts |
| `references/theming.md` | theme hierarchy, Theme Editor sections, 3.0 knobs, CSS placement and load order, prefixes, dark mode, runtime branding, fonts, icons |
| `references/style-guide-governance.md` | style-guide architecture, Live Style Guide, ownership, prefix registry, promotion workflow, versioning, upgrades |
| `references/layout-and-navigation.md` | layouts and placeholders, page anatomy, menus, breadcrumbs, screen types, grids |
| `references/responsive.md` | device classes and breakpoints, Columns breaks, responsive tables, safe areas, mobile apps |
| `references/accessibility.md` | EnableAccessibilityFeatures, ACR, contrast data for both versions, focus, WCAG 2.2 additions, forms, ARIA, audit procedure |
| `references/patterns-catalog.md` | picking or configuring any pattern: Reactive/ODC catalog, Web catalog, CSS anatomy, chooser |
| `references/components-and-forms.md` | reusable blocks with CSS APIs, buttons (3.0 knobs), forms, lists, tables, dashboards, third-party widgets, feedback |
| `references/ux-writing-and-i18n.md` | microcopy, formats, multilingual, RTL (version differences, known issues, tooling) |
| `references/lessons-learned.md` | before any real build: UI mistakes already made once (LES-01…24) |
| `references/review-checklist.md` | any review, audit or "is this correct?" question |
| `templates/screen-spec.md` · `templates/ui-review-report.md` | designing a screen; writing a review |
| `templates/theme-starter.css` · `templates/theme-starter-osui3.css` | starting or cleaning up a theme (Classic / 3.0) |
| `scripts/lint-ui-css.mjs` | linting CSS or HTML/XML exports (`--osui 3`, `--theme`, `--rtl`, `--json`) |
| `scripts/contrast.mjs` | color pairs, `--suggest`, `--audit` (`--osui 3` for the 3.0 palette) |
| `scripts/tokens.json` · `scripts/tokens-osui3.json` | machine-readable token sets (edit the values for your brand) |
| `docs/assessment-2026-11.md` | the research sources and the gap assessment behind version 2.0 of this skill |

For requirement-to-runtime handoffs, also use the cross-skill acceptance section in [verification and reliability](references/verification-and-reliability.md); preserve source/story/criterion IDs and the tested application version.
