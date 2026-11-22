<!-- Copy to .github/copilot-instructions.md (GitHub Copilot), or paste into any assistant's custom instructions / system prompt. -->

# OutSystems Live Style Guide

When helping with OutSystems screens, blocks, themes, CSS, UX or OutSystems UI upgrades, follow the `outsystems-live-style-guide` skill:
- Read `outsystems-live-style-guide/SKILL.md`, and the `references/` file for the topic at hand.
- Apply the always-on rules in `outsystems-live-style-guide/adapters/core-rules.md`. They're summarized below for assistants that can't open files.

<!-- BEGIN core rules: keep in sync with adapters/core-rules.md -->
**Step 0**: know the OutSystems UI version, Classic (2.x) or 3.0 (design-token theme, the default for new apps). In 3.0 these names are retired and silently dropped:
- `--font-size-*`, `--shadow-*`, `--border-size-*`;
- `--font-light|regular|semi-bold|bold`;
- `--color-{hue}-{shade}`, `--color-*-light`;
- `--border-radius-circle`.

In 3.0, `--color-neutral-0` isn't white.

Project brand values choose supported design options; house defaults guide omissions, and the installed framework determines available APIs. Use tokens, meet WCAG 2.2 AA and design every state, whatever the brand.

Tokens, never literals:
- both versions: `--color-primary`, status roles, `--space-xs…xxl`, utility classes;
- 3.0: roles (`--color-text`, `--color-background-surface`, `--color-border-input`) → `--osui-*` knobs → `var(--token-*, literal)` (always with a fallback).

CSS:
- global look in the theme (inheriting the corporate theme), component look in prefixed block CSS;
- 3.0: override variables, never component rules;
- no inline styles; no generated-id selectors;
- don't restyle `.card`/`.alert`/`.btn`… outside the theme.

Patterns first:
- Button Group (2–4), Dropdown (5+), Dropdown Search/Tags;
- Tooltip / Balloon / Modal / Sidebar / Bottom Sheet;
- Master Detail, Wizard, Tabs (≤6);
- Blank Slate, Tag, Badge, Counter;
- Columns / Gallery.

Screens:
- `EnableAccessibilityFeatures = True`;
- a Title on every screen (including login); one H1; one primary action;
- loading, empty and error states; feedback on every action; confirmation for destructive actions.

Responsive:
- `.phone/.tablet/.desktop` (Reactive phone < 700, tablet ≤ 1024; `SetDeviceBreakpoints`);
- Columns breaks; no fixed widths; touch targets ≥ 44px.

Accessibility:
- text ≥ 4.5:1, borders and focus ≥ 3:1 (harden the default input border and focus ring);
- no Classic warning/yellow/lime/green/orange or 3.0 `--color-success|warning` as text or under white text;
- labels bound to inputs; full keyboard use; headings in order; color never alone; `lang`/`dir` set.

Forms: labels above inputs; actionable validation messages; Button Loading; server-side re-validation.

i18n: translatable strings; logical CSS for RTL; RTL scoped at `<html>`.

Dark mode (3.0): `SetDarkTheme` → `.os-dark-theme` on `<html>`; test light first.

Verify:
- `node outsystems-live-style-guide/scripts/lint-ui-css.mjs [--osui 3] [--rtl]` and `contrast.mjs [--osui 3]`;
- check 3 device sizes, keyboard-only, light and dark.
- Use `references/verification-and-reliability.md` for evidence and domain acceptance checks. Distinguish prepared, validated, merged, published and runtime verified; preserve task scope and existing authorization.
<!-- END core rules -->
