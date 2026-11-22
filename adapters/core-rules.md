# OutSystems Live Style Guide: core rules (compact, for any agent)

You are designing, building, reviewing or migrating OutSystems UI (O11 Reactive, Mobile or Traditional Web, or ODC) on the OutSystems UI framework. The full skill is the `outsystems-live-style-guide/` folder:
- `SKILL.md` is the entry point;
- the `references/` files hold the details; read the relevant one before acting;
- these core rules always apply.

**Step 0: version.** Know whether the app uses OutSystems UI **Classic (2.x)** or **3.0** (design-token theme; the default for new apps since 2026) before giving any token or CSS advice. It's recorded in the project's AGENTS.md. In the browser console, an empty `--font-size-h1` or a `#f6f7fa` `--color-neutral-0` means 3.0. If it's unknown, ask, or write version-safe CSS (roles + `--space-*` + `var(--token-…, literal)`).

**Precedence**: project design system (brand values) > house UI standard (this skill) > OutSystems UI defaults and official docs. A brand may change token *values*, never the duty to use tokens, meet WCAG 2.2 AA and design every state. Flag conflicts with numbers. Architecture (where themes and blocks live) follows the companion skill `outsystems-architecture`.

**Tokens, never literals**:
- Both versions: `--color-primary`, status roles, `--space-xs…xxl` (4/8/16/24/32/40/48), utility classes (`.padding-m`, `.margin-top-base`, `.heading1–6`, `.font-size-s|xs`, `.shadow-s`); body 14px, minimum 12px.
- Classic: `--font-size-*`, `--shadow-*`, `--border-size-*`, `--color-neutral-0…10` (0 = white), `--border-radius-soft` (4px).
- 3.0, in this order:
  1. roles (`--color-text|-subtle|-subtlest`, `--color-background-surface`, `--color-border|-input`, `--border-radius-soft` (8px) / `-default`, `--layer-*`);
  2. component knobs (`--osui-{component}-{prop}`);
  3. `var(--token-…, literal)`, **always with a fallback**.
- 3.0 **retired names are silently dropped**: `--font-size-*`, `--shadow-*`, `--border-size-*`, `--font-light|regular|semi-bold|bold`, `--color-{hue}-{shade}`, `--color-*-light`, `--border-radius-circle`. In 3.0, `--color-neutral-0` isn't white.

**CSS placement**:
- global look → the theme (inherits the corporate theme; each variable set in one section, since hand-written beats Theme Editor);
- component look → the block stylesheet, with the module-acronym prefix;
- 3.0: override knobs and variables, never component rules;
- no inline styles; no generated-id selectors;
- don't restyle OSUI classes outside the theme;
- block CSS loads before theme CSS.

**Patterns first**:
- Button Group (2–4), Dropdown (5+), Dropdown Search/Tags (many);
- Tooltip / Balloon / Modal / Sidebar / Bottom Sheet / Overflow Menu;
- Master Detail, Wizard (steps), Tabs (≤6);
- Blank Slate (empty), Tag (status), Badge (count), Counter (KPI);
- Columns / Gallery (grids).

**Every screen**:
- the theme layout with `EnableAccessibilityFeatures = True`;
- a Title (including login); one H1; one primary action;
- every data area has loading, empty, error and populated states;
- every async action gives feedback; destructive actions are confirmed.

**Responsive**:
- `.phone/.tablet/.desktop` classes (Reactive phone < 700, tablet ≤ 1024; change only with `SetDeviceBreakpoints`);
- Columns breaks, Display/Move On Device, a responsive table mode;
- no pixel media queries or fixed widths;
- touch targets ≥ 44px (never < 24);
- reload after resizing when testing.

**Accessibility (WCAG 2.2 AA)**:
- text ≥ 4.5:1; borders and focus ≥ 3:1;
- default input borders (Classic neutral-5 1.49, 3.0 #d0d7df 1.45) and focus rings (#a3daff, #ffd337, #b5c0f7) fail, so harden them in the theme;
- never Classic neutral-6, warning, yellow, lime, green or orange, or 3.0 `--color-success|warning`, as text or under white text;
- visible, unobscured focus; labels bound to inputs; keyboard for everything;
- headings in order; color never alone;
- modals manage focus;
- `lang`/`dir` set;
- no drag-only actions, no redundant entry, paste allowed at login.

**Forms**:
- labels above inputs; helper text, not placeholders;
- validation messages say how to fix; the input is kept;
- Button Loading; server-side re-validation.

**i18n / RTL**:
- translatable strings, no concatenation;
- one format per app;
- logical CSS properties (Classic left/right utilities don't mirror; 3.0's do);
- scope RTL at `<html>` (popups ignore locale classes).

**Dark mode (3.0)**: `SetDarkTheme` → `.os-dark-theme` on `<html>`. Use roles that flip, verify both themes, and test light first.

**Governance**:
- a style-guide team owns the corporate theme, shared blocks and the Live Style Guide;
- registered prefixes;
- promote reusable local styles;
- shared blocks expose their own `--app-*` knobs.

**Verify**:
- `node outsystems-live-style-guide/scripts/lint-ui-css.mjs <css> [--osui 3] [--theme] [--rtl]` (exit 1 means Blocker or Major);
- `node outsystems-live-style-guide/scripts/contrast.mjs [--osui 3] <fg> <bg>`;
- check the rendered UI at 3 device sizes, keyboard-only, light and dark;
- report only what you saw.

**Reviews**: cite rule IDs from `references/review-checklist.md` (TOK, THM, LAY, RSP, A11Y, CMP, FRM, LST, FDB, TXT, PRF, GOV, LES).
