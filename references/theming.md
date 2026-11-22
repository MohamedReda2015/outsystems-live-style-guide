# Theming and CSS architecture

## 1. Theme hierarchy (front-end architecture)
```
OutSystems UI (framework, never edited: Classic or 3.0)
  └─ Corporate / Global theme  (<Org>_Th, Foundation: brand tokens, fonts, corporate layouts, shared patterns, images)
       └─ Sub-brand theme       (optional, e.g. B2B_Th or B2C_Th: only the deltas)
            └─ App theme         (<App>_Th: app-specific overrides only)
                 └─ Block stylesheets (CW / MCW blocks: block-scoped, prefixed rules)
                      └─ Screen stylesheet (exceptional; prefer a block or theme rule)
Live Style Guide app: showcases the themes, patterns and templates; the reference for designers and devs (see style-guide-governance.md)
```
- **One theme per app**, set in the module properties (Theme) and on every UI flow. Screens inherit it.
- Build each theme **on top of** its parent (Base Theme property) instead of copying it. A copy forks the design system, and later fixes to the corporate theme never reach the app. Themes can form a chain; CSS loads from the base theme down to the child theme.
- A theme module holds: the CSS, the layout blocks (if customized), logos and images, the login and exception flows, and the menu. Nothing else: no business logic and no utility actions (companion skill: outsystems-architecture, `_Th`).
- In ODC, a **Theme Library** shares themes, layouts and images across apps. In O11, the corporate theme module sits in a Foundation app.
- The theme also owns the **grid settings** (columns, gutter, min/max width, layout type) and the **icon library** (O11 uses Font Awesome; ODC uses Phosphor and Font Awesome).

## 2. Changing tokens (both versions)
1. **Theme Editor** (Service Studio / ODC Studio → theme → Theme Editor). It sets brand color, font, base font size, border radius and spacing, and generates `:root` variable overrides. Use it for the main brand values: it's safe and reversible.
2. **The theme CSS has two sections**: the hand-written section (left, in O11's editor) and the Theme Editor section (right). **The hand-written section wins over the Theme Editor section** (confirmed by OutSystems MVPs on the forum). Don't set the same variable in both, or a later Theme Editor change will appear to do nothing.
3. **Manual overrides** go together in one `:root` block at the **top** of the theme CSS (`templates/theme-starter.css` for Classic, `templates/theme-starter-osui3.css` for 3.0).
4. Change *values*. **Never rename or add parallel tokens** for the same concept (`--brand-blue` next to `--color-primary`). Add new tokens only for concepts OutSystems UI doesn't have, and prefix them (`--app-chart-1`).
5. After any brand change, re-check contrast (`node scripts/contrast.mjs [--osui 3]`) and update `scripts/tokens*.json` if you use the linter with your brand values.

## 3. OutSystems UI 3.0: override variables, never component rules
3.0 styles every property through a chain: component knob `--osui-{component}-{prop}` → theme role (`--color-*`, `--border-radius-*`) → `--token-*`. Intercept at the highest level that fits:

| Goal | Do this |
|---|---|
| Rebrand primary everywhere | `:root { --color-primary: #…; --color-primary-hover: #…; }` (links read `--token-semantics-primary-base`, so set it too, with a fallback) |
| Rounder or squarer controls everywhere | `:root { --border-radius-default: 12px; }`, or add `.shape-round` / `.shape-rectangular` / `.shape-soft` to a container |
| One component type, app-wide | in the theme: `.card { --osui-card-padding: var(--space-l); }`, using the **knob**, not `padding:` |
| One instance | add a Style Class: `.app-card-promo { --osui-card-shadow: var(--token-elevation-2, 0 8px 25px rgba(0,0,0,.08)); }` |
| Global token re-skin | `:root { --token-bg-surface-default: #…; }` (always also verify components that read roles) |

- Look up the knobs in the **OutSystems UI Storybook** (CSS API per component) or `docs-ai/llms-tokens.txt` / `llms-components.txt` in the `outsystems-ui` repository.
- If a component has no knob for what you need, that's a gap in its CSS API. Write the narrowest rule with your own prefixed class, comment it (`/* no --osui knob for X as of 3.0.0 */`), and revisit after upgrades.
- Classic (2.x) has no component CSS API. There you override framework classes, in the theme only (§6).

## 4. Where CSS goes
| Need | Put it in | Why |
|---|---|---|
| Brand values, fonts, global element look | Theme (Global or app) `:root` + theme rules | one place to change; every screen and block follows |
| A reusable component's look | That block's stylesheet (CW/MCW) | travels with the block; scoped by prefix |
| A one-off adjustment on a screen | Utility classes in Style Classes; if impossible, the screen stylesheet | keeps CSS out of screens |
| Anything dynamic (state-based) | Conditional Style Classes (`If(IsActive, "is--active", "")`) or a knob set through a class | no inline styles; stays in the token system |
| A local class that other teams also need | Promote it to the corporate theme through the style-guide team (style-guide-governance.md) | avoids N copies of the same component |

**No inline `Style` attributes** with literal values. The `Style` property and Extended Properties `style=` bypass the theme and can't be overridden cleanly. They also break RTL and dark mode.
- Exception: setting a documented `--osui-*` knob inline on one instance (`style="--osui-card-padding: var(--space-s)"`) is acceptable in 3.0. It's the framework's intended per-instance hook.
- Exception: email templates.

## 5. CSS load order and specificity
Plain CSS rules decide: specificity first, then source order. The OutSystems load order is **(earliest, weakest at equal specificity) → (latest)**:

1. **Block stylesheets** (they load *before* the themes)
2. OutSystems UI → base theme(s) → child / app theme (Theme Editor section, then hand-written section)
3. Screen stylesheet
4. Inline styles (always win; avoid)

- Forum answers on this disagree. The block-before-theme order above is the one confirmed by OutSystems MVPs and by our own projects (LES-04). Verify in DevTools (Sources / computed styles) when it matters.
- Consequence: a block rule with the same specificity as a theme or screen rule **loses**. Style a block through its own prefixed classes, and never override theme or framework classes from a block.
- Avoid `!important`. In 3.0 it's almost never needed (use the knob). In Classic it's acceptable only to defeat a framework inline style that has no other hook. Comment why (`/* lint-ignore THM-02: … */`).
- Never select generated ids (`#b3-Container2`, `#wt45_…`), Service Studio internal classes (`.OSInline`, `.OSFillParent`, Reactive `.ThemeGrid_*`) or deep widget DOM (`div > div > span`). Add a Style Class and target that.

## 6. Naming custom classes
- Prefix everything custom with the module or app **acronym**, which the style-guide team keeps in a registry (`sfl-` for SoccerFields, `sfb-` for its back office).
  - Block root: `sfl-kpi-card`. Parts: `sfl-kpi-card__value`. Modifiers: `sfl-kpi-card--compact` (BEM-like).
  - States: reuse the framework's `is--{state}` convention.
- **Don't** reuse names OutSystems UI already styles (`.card`, `.alert`, `.tag`, `.badge`, `.list`, `.section`, `.modal`, `.tooltip`, `.btn`, `.input`, `.tabs`, `.wizard`, `.header`, `.menu`, `.layout`, `.columns`…).
- Use kebab-case and describe the purpose (`sfl-status-chip`), not the look (`blue-box`).
- Note: OutSystems UI's own classes don't strictly follow BEM. Don't "fix" them; apply BEM only to your own classes.

## 7. Customizing framework components
1. Prefer a **token or role** (`--color-primary`, `--border-radius-soft` in Classic, `--border-radius-default` in 3.0).
2. In 3.0: the component's **`--osui-*` knob**.
3. Otherwise change the component **once, in the Global or app theme**, with a comment block (`/* === OVERRIDE: Buttons — brand spec v2 === */`), using tokens only.
4. Never in a block (it leaks into every consuming app) or a screen.

## 8. Dark mode
- **OutSystems UI 3.0** ships it: the `SetDarkTheme(IsDark)` client action adds `.os-dark-theme` to `<html>`. `.os-dark-mode` is added automatically when the OS prefers dark; it's a signal only, with no styles.
  - Respect the user's choice: offer a toggle, default to the OS preference, and persist it.
  - Use **roles** (`--color-text`, `--color-background-surface`, `--color-border`) in all custom CSS. Neutral steps and literals don't flip correctly.
  - Text on images or colored scrims uses `--color-text-light`, never `neutral-0`.
  - If the app already has its own dark class, add `.os-dark-theme` too.
  - Re-check contrast in **both** themes, and test light first (see the `--token-*` fallback gotcha in osui-versions-and-migration.md).
- **Classic**: there's no built-in dark theme. Use a body or html class that redefines the neutral and surface variables (`html.app-dark { --color-neutral-0: …; --color-neutral-9: …; --color-background-body: … }`). This only works if all custom CSS uses tokens, and every contrast pair must be re-verified.
- Respect `prefers-color-scheme` as the default, and never force dark on users who chose light.

## 9. Multiple brands or tenants at runtime
- **Different apps, different brands**: a Global theme for the shared structure, plus one brand theme per app that inherits it and overrides only `:root` tokens and logos.
- **One app, brand per tenant or user** (the OutSystems-documented approach):
  1. store each tenant's variable overrides as a generated stylesheet;
  2. serve it from a REST endpoint keyed by a version token, so it can be cached;
  3. inject a `<link>` from the layout's OnInitialize, through a library client action.

  Because everything reads variables, no screen changes. Never maintain parallel full stylesheets.
- **Small switches** (two to three brands): a class on `<html>` (`html.brand-x { --color-primary: … }`), toggled from the layout. In 3.0, put the class on `<html>`, not `<body>`, because roles resolve there.

## 10. Icons
- Use **one** icon family per app. O11 uses Font Awesome (no native Phosphor in O11, per OutSystems); ODC uses Phosphor 2.0 (and Font Awesome). Don't mix families on one screen.
- Size icons with type tokens, and color them with text or icon roles.
- Decorative icons get `aria-hidden="true"`. Icon-only buttons need an accessible name (see accessibility.md).
- For custom SVG icon sets, use the InlineSVG pattern (ODC/3.0) or an SVG sprite, colored with `currentColor`.

## 11. Fonts
- Classic uses the system font stack; **3.0 uses Inter** (bundled with the design tokens) with the system stack as fallback.
- Brand fonts: self-host them as theme resources or use the corporate CDN. Declare `@font-face` once in the Global theme with `font-display: swap`. Load at most 2 families and 3–4 weights.
- For Arabic, check the font has Arabic glyphs. Inter covers Latin, Greek and Cyrillic but not Arabic, so in 3.0 Arabic text falls back to the system font unless you pair Inter with an Arabic face for `:lang(ar)` (a licensed brand font, or a well-hinted open font). Use line-height 1.6–1.7 for body text and no letter-spacing.
