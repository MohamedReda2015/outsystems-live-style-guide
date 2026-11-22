# OutSystems UI versions: Classic (2.x) vs 3.0 design-token theme, and migrating

**Read this first in any task that touches tokens or CSS.** In 2026, OutSystems UI shipped **3.0** for both O11 and ODC. It brings a new default theme built on **OutSystems Design Tokens**, the same token set Mobile UI uses. New apps start on it. Existing apps keep the old look, now called **Classic** (`OutSystemsUIClassic`), until they opt in.

3.0 changes **styles only**: pattern HTML, classes, parameters and JavaScript APIs are unchanged. But several Classic variables were **retired** and some values changed, so CSS written for one version can silently fail on the other.

Sources:
- OutSystems forum announcement *Announcing OutSystems UI 3.0*;
- the `OutSystems/outsystems-ui` repository: `CSS-ARCHITECTURE.md`, `THEME-MIGRATION-GUIDE.md`, `docs-ai/llms*.txt`;
- npm `outsystems-ui@3.0.0` and `outsystems-design-tokens@2.6.0`.

All values below were read from those packages in November 2026.

## Contents
1. Detect the version · 2. What changed · 3. The 3.0 styling model · 4. Retired → replacement map · 5. Same name, new value · 6. Gotchas · 7. Migration procedure · 8. Official docs for agents

---

## 1. Detect the version before writing CSS

Confirm the installed dependency release **and** selected base theme first. A 3.x package can keep the Classic theme. The visual probes below are diagnostic hints only: brand overrides, inheritance and missing CSS can change their results. Development-branch APIs must not be assumed present in the installed release.
| Check | Classic (2.x) | 3.0 |
|---|---|---|
| Browser console: `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` | `#1068eb` | `#105cef` (or your brand) |
| `getComputedStyle(document.documentElement).getPropertyValue('--font-size-h1')` | `32px` | `""` (retired) |
| `--color-neutral-0` | `#ffffff` | `#f6f7fa` |
| Body font | system stack | **Inter** (+ system fallback) |
| Theme name in Service Studio / ODC Studio | OutSystems UI (2.x) | new default theme; Classic shows as `OutSystemsUIClassic` |
| CSS you inherit | `--font-size-*`, `--shadow-*`, `--border-size-*` | `--token-*`, `--osui-{component}-{prop}` |

Run the linter in the matching mode (`--osui 3` for 3.0) and check contrast with the matching token set (`contrast.mjs --osui 3`). If you can't tell which version an app uses, ask, or write CSS that is valid in both (roles + `--space-*` + literal-fallback tokens; see §6).

## 2. What changed in 3.0
- **New default theme.** Every pattern was redesigned against a new Figma kit: colors, spacing, shapes, shadows and states.
- **Design tokens.** Colors, spacing, typography, radius and shadows come from one shared token set (`--token-*`). Change a role such as `--color-primary` or `--border-radius-default` once and it flows through the library.
- **A CSS API per component.** About 390 documented `--osui-{component}-{property}` custom properties across 79 components. Restyle a component by overriding its documented properties, not its internal rules.
- **Dark mode.** The class `.os-dark-theme` on `<html>`, toggled by the client action **`SetDarkTheme`**. The announcement says "SetDarkMode", but the 3.0.0 code exposes `SetDarkTheme`, so check your Toolbox. `.os-dark-mode` is a signal-only class mirroring `prefers-color-scheme`.
- **Inter** is the default font. The type scale is responsive.
- **Updated defaults.**
  - Form controls use the **Soft** shape (8px), with `.shape-soft` / `.shape-round` / `.shape-rectangular` profiles.
  - Alerts use the **Light** style by default (a bold utility is available).
- **Logical properties throughout.** Utility classes `.margin-left-*` → `margin-inline-start`, `.text-align-left` → `start`. In 3.0 **left/right utilities mirror in RTL**; in Classic they don't.
- **Official documentation moved** to the **OutSystems UI Storybook** (every pattern in light and dark, with the CSS API per component). It replaces the old OutSystems UI website.

## 3. The 3.0 styling model (four tiers)
```
property → var(--osui-{component}-{prop})   Tier 4  component CSS API      (override one component / instance)
             → var(--{role})                   Tier 3  framework theme roles   (--color-*, --border-radius-*, --space-* at :root)
               → $token-…  (SCSS, build time)  Tier 2
                 → var(--token-…, literal)     Tier 1  design tokens           (global re-skin surface)
```
- **Re-skin one role app-wide**: `:root { --color-primary: #6d28d9; }`.
- **Re-radius all controls**: `:root { --border-radius-default: 12px; }`. This feeds the tier slots `--border-radius-2xs…2xl`, but **not** `--border-radius-soft/none/rounded`.
- **Re-skin at token level**: `:root { --token-bg-surface-default: …; }`. It cascades through every role and component.
- **Restyle one component**: set its knob on its own class: `.app-promo.card { --osui-card-padding: var(--space-l); --osui-card-shadow: var(--token-elevation-2, …); }`.
- **Invariant**: a theme sets **variables only**. If you need to edit a component *rule*, that's a gap in the component's CSS API. Use the knob if one exists, or report it, instead of fighting specificity.
- **Authoring order of preference**:
  1. a role (`--color-*`, `--border-radius-*`, `--space-*`), which is defined at `:root` and follows dark mode;
  2. a component knob `--osui-*`;
  3. a `--token-*` **with a literal fallback**;
  4. a literal, only when no token exists, kept local.

### Roles defined at `:root` in 3.0 (light values)
| Group | Roles |
|---|---|
| Surfaces | `--color-background-body` #fff · `-surface` #fff · `-raised` · `-panel` · `-header` · `-sidemenu` · `-footer` · `-login` · `-input` · `-input-disabled` #f6f7fa |
| Text | `--color-text` #242528 (15.3:1) · `-subtle` #383e45 · `-subtlest` #6c727a (4.85:1, the lightest allowed for text) · `-disabled` #9fa5ad · `-inverse` · `-light` (white in both themes) · `-dark` |
| Borders | `--color-border` #d0d7df · `-subtle` #e6eaee · `-input` #d0d7df · `-input-hover` #9fa5ad · `-input-press` #7e858e · `-primary` |
| Brand / status | `--color-primary` #105cef (`-hover`, `-selected`, `-active`) · `--color-secondary` #383e45 · `--color-error` #e0243a · `--color-warning` #ffd600 · `--color-success` #4aae83 · `--color-info` #105cef |
| Neutrals | `--color-neutral-0` #f6f7fa … `--color-neutral-10` #242528 (**re-based: 0 is not white**) |
| Palette (base only) | `--color-red, orange, yellow, lime, green, teal, cyan, blue, indigo, violet, grape, pink` (recoloured; the shades are retired) |
| Radius | `--border-radius-none` 0 · `-soft` **8px** · `-rounded` 999px · tier slots `-2xs` 4 · `-xs` 8 · `-sm` 12 · `-md` 16 · `-lg` 8 · `-xl` 12 · `-2xl` 16 (Soft profile) · `--border-radius-default` (hook) |
| Spacing | `--space-none…xxl` = 0/4/8/16/24/32/40/48. **Not retired**, same values. The framework itself reads `--token-scale-*`, so overriding `--space-base` moves only your rules (and Gallery gaps) |
| Layout plumbing | `--header-size` 56px · `--header-size-content` 48px · `--side-menu-size` 300px · `--bottom-bar-size` 56px · `--footer-height` · `--os-safe-area-top/right/bottom/left` |
| Layers | `--layer-global-screen` 0 · `-elevated` 100 · `-navigation` 200 · `-off-canvas` 300 · `-instant-interaction` 400 · `--layer-local-tier-1…5`. **Use these instead of magic z-index values** |

### Design-token scales (use with a fallback: `var(--token-…, <value>)`)
- **Font size** (rem, base 16): `275` 11px · `300` 12 · `350` 14 (body) · `400` 16 · `450` 18 · `500` 20 · `550` 22 · `600` 24 · `650` 26 · `700` 28 · `800` 32 · `900` 36.
- **Weights** are word-named: `--token-font-weight-light|regular|medium|semi-bold|bold` (`--token-font-weight-400` does not exist and silently fails).
- **Scale / space**: `--token-scale-0, 025 (1px), 050 (2), 075 (3), 100 (4), 150 (6), 200 (8), 250 (10), 300 (12), 400 (16), 500 (20), 600 (24), 700 (28), 800 (32), 900 (36), 1000 (40), 1100 (44), 1200 (48)` … `9000` (360).
- **Border size**: `--token-border-size-0 | 025 (1px) | 050 (2px) | 075 (3px)`.
- **Radius**: `--token-border-radius-0 | 025 | 100 (4) | 200 (8) | 300 (12) | 400 (16) | 500 (20) | 800 | 1000 | full (999px)`.
- **Elevation**: `--token-elevation-1…4` (composite shadows). Utilities `.shadow-xs/s` → 1, `m` → 2, `l` → 3, `xl` → 4.
- **Semantic colors**: `--token-text-{default|subtle|subtlest|disabled|primary|info|success|danger|warning|link-default|inverse}`, `--token-bg-{body|surface-default|primary|info|success|warning|danger}-{base|subtle}-default`, `--token-border-{default|subtle|input-default|focus-default|primary|danger-default|boldest}`, `--token-icon-*`. Note the names: **danger** (not error), **aqua** (not cyan), **purple** (not grape).
- **Other**: `--token-z-index-*`, `--token-transition-duration-*`, `--token-transition-curve-*`, `--token-backdrop`.

**Body text in 3.0** is 14px (`--token-font-size-350`) with line-height ≈1.71. Headings on desktop are display 36 · H1 **28** · H2 26 · H3 24 · H4 22 · H5 20 · H6 18, scaled down on tablet and phone automatically.

## 4. Retired → replacement (silently dropped if you keep them)
| Classic (retired) | 3.0 replacement |
|---|---|
| `--font-size-display / h1…h6 / base / s / xs / label` | `--token-font-size-900 / 700 / 650 / 600 / 550 / 500 / 450 / 400 / 350 / 300 / 275`. **H1–H3 render smaller** (28/26/24 vs 32/28/26), so decide deliberately |
| `--shadow-none / xs / s / m / l / xl` | `none` / `--token-elevation-1 / 1 / 2 / 3 / 4` |
| `--border-size-none / s / m / l` | `--token-border-size-0 / 025 / 050 / 075` |
| `--font-light / regular / semi-bold / bold` | `--token-font-weight-light / regular / semi-bold / bold` |
| `--color-{hue}-{lightest…darkest}` (72 shades) | status roles, or `--token-primitives-{family}-{300 lighter, 500 light, 800 dark, 900 darker, 1000 darkest}` / `--token-bg-extended-{family}-subtle-default` (lightest). **Recoloured**: confirm with design |
| `--color-error/warning/success/info-light` | `--token-semantics-{danger|warning|success|info}-100` (or `--token-bg-*-subtle-default`) |
| `--color-primary-lightest` | `--token-bg-primary-subtle-default` |
| `--border-radius-circle` | `50%` (square element) or `--border-radius-rounded` |
| `--background-color-*` (except `-body`, `-header`, `-login`, which are still read as hooks) | `--color-*` roles (`-neutral-0` → `--color-background-surface` for cards) |
| `--text-color-neutral-9/10` · `-0` · `-N` | `--color-text` · `--color-text-light` · `--color-text-subtle/-subtlest` |
| `--border-color-primary` · `-neutral-N` | `--color-border-primary` · `--color-border` / `-subtle` |
| `--header-color` · `--overlay-background` | `--color-background-header` · `var(--token-backdrop, rgba(0,0,0,.25))` |
| Focus (repository dev branch, ADR-0020; may come after 3.0.0): `--color-focus-outer/-inner`, `--osui-focus-shadow-*` | `--osui-color-focus`, `--osui-focus-gap`, `--osui-focus-ring-width`, `--token-border-boldest` |

`node scripts/lint-ui-css.mjs <css> --osui 3` reports every retired name (TOK-08) with its replacement.

## 5. Same name, new value (no error; it just looks different)
- `--color-neutral-0…10` were re-based: **neutral-0 is #f6f7fa**, and the neutrals flip in dark mode. For white text use `--color-text-light` (on primary, red, green or blue fills, which stay dark in dark mode) or `--color-text-inverse` (on fills that lighten in dark). For card surfaces use `--color-background-surface`.
- `--border-radius-soft` went from **4px to 8px**; `-rounded` from 100px to 999px.
- `--color-primary` is #105cef, and the palette bases were recoloured.
- **Links don't read `--color-primary`**: they use `--token-semantics-primary-base`. Override that token (with a fallback) to recolor links.
- Body text no longer follows `--color-neutral-9`: `html { color: var(--color-text) }`.

## 6. Gotchas (each cost real time in OutSystems' own migration notes)
1. **`--token-*` must always have a literal fallback.** The 3.0 bundle doesn't declare light `--token-*` values at `:root`; it relies on internal fallbacks. Your bare `var(--token-x)` resolves **only in dark mode** (where `.os-dark-theme` declares about 447 tokens), so it looks right in dark and fails for every light-mode user. **Always verify in light.** In a shorthand, one invalid term kills the whole declaration (`border: var(--token-border-size-025) solid …` → no border at all).
2. **Retired names fail silently.** There's no build error, just a dropped declaration ("the page looks slightly off").
3. **Logical vs physical**: framework rules use `padding-inline-start` and similar. A custom `padding-left` on the same element has no specificity relationship with it (whichever comes later wins), so partial physical overrides can do nothing. Write logical properties.
4. **`border-radius: 100%` makes ellipses** once a line-height change makes badges or tags non-square. Use `50%` (square) or `--border-radius-rounded` (pill).
5. **The dark-mode class goes on `<html>`**, not `<body>`. The `--color-*` roles are substituted on `<html>`, so a body-level override resolves too late.
6. **Dark-mode button labels**: `--osui-btn-primary-color` defaults to `--color-text-light` (white in both themes). Set button knobs on the element class (`.os-dark-theme .btn-primary { --osui-btn-primary-color: … }`), **not** on `:root`, because `.btn` re-declares them.
7. Your own `.icon` elements don't follow `--token-icon-*`. Set `.icon { color: … }` (or `inherit` inside buttons) when you retint framework icons.
8. **Old menu markup** (`.menu-icon` + three `.menu-icon-line` bars): 3.0 no longer styles the bars, so the button renders empty with native chrome. Replace it with the template's Icon widget.
9. **Overriding `--space-*` no longer re-spaces the framework** (it reads `--token-scale-*`). Override the matching `--token-scale-*` step to move framework spacing.
10. **Third-party widgets** (charts, maps, rich-text editors, date libraries) apply their own inline fonts and colors. A visual difference there usually isn't the theme.
11. **Delete, don't port, `!important` overrides.** Most existed because no knob did. Check the component's CSS API first.

## 7. Migration procedure (Classic → 3.0)
1. **Inventory** all custom CSS: theme(s), blocks, screens, and `style` / Extended Properties.
2. **Grep before you look**: `--font-size-`, `--shadow-`, `--border-size-`, `--background-color-`, `--text-color-`, `--border-color-`, `--font-(light|regular|semi-bold|bold)`, `--color-{hue}-{shade}`, `-light)`, `--border-radius-circle`, or run `lint-ui-css.mjs --osui 3` on every stylesheet.
3. **Triage each finding** into: *your CSS stopped working* (fix); *our change broke your rule* (fix, e.g. a new `gap` stacking on your margin); *it just looks different* (**accept by default**: every pinned-back default is CSS you maintain forever).
4. **Rewrite**: roles first, then component knobs, then tokens with fallbacks. Convert physical properties to logical ones.
5. **Compare screens side by side** with the old app, **in light and dark**, including hover, selected, disabled, focus and error states.
6. Re-run contrast (`contrast.mjs --osui 3`). 3.0's `--color-success` (2.74:1) and `--color-warning` (1.41:1) fail as text or under white text; the `--token-text-success/-warning` tokens pass.
7. OutSystems also publishes a Claude Code **`osui-theme-migration`** skill in the `outsystems-ui` repository (`.claude/skills/osui-theme-migration`). Use it for large automated migrations and review its output against this skill's accessibility rules.

## 8. Official docs written for agents
The `outsystems-ui` repository ships machine-oriented documentation in `docs-ai/`:
- `llms.txt` (index and gotchas);
- `llms-components.txt` (each pattern's props, events, API, CSS classes and `--osui-*` knobs);
- `llms-tokens.txt` (roles and every knob);
- `llms-utilities.txt` (utility grammar);
- `llms-blocks.txt` (91 blocks for OML producers);
- `llms-platform.txt` (ODC concepts and the pattern catalog with doc links);
- JSON schemas per pattern config.

Prefer these over memory when an exact knob, prop or class name matters. Utility grammar: `<property>[-<side>][-<value>]` in long form (`margin-top-base`, `justify-content-space-between`). Tailwind-style names (`p-4`) don't exist.
