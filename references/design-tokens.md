# Design tokens: OutSystems UI Classic (2.x)

> **Which version?** This file documents the **Classic** token set:
> - OutSystems UI 2.x Reactive and Mobile;
> - OutSystems UI Web (Traditional);
> - existing apps that haven't opted into 3.0.
>
> **OutSystems UI 3.0** (the default for new O11/ODC apps since 2026) uses a design-token theme instead, with retired names and changed values. For it, use `osui-versions-and-migration.md` and `--osui 3` on the scripts. Detect the version first (§1 there).
>
> What carries over to 3.0 unchanged:
> - the role names `--color-primary`, `--color-secondary`, the status roles, `--color-neutral-0…10` (re-based values!) and the 12 palette bases;
> - `--space-*`, `--border-radius-none/soft/rounded`, `--header-size`, `--side-menu-size`;
> - every utility class name.

Values read from the live OutSystems UI base theme (`Theme.BaseTheme.css`, OutSystems UI Web style guide) and the `outsystems-ui@2.30.0` bundle, November 2026. Reactive 2.x and ODC Classic use the same variable and class names. Your corporate theme may change the **values**, but the **names** stay the same, so always reference the names.

Differences between Reactive 2.x and the Traditional Web base theme:
- Reactive 2.x also defines `--font-size-label` (11px). That's below this skill's 12px minimum, so don't use it for meaningful text.
- In Reactive 2.x the tablet and phone headings are computed as `calc(var(--font-size-hN) - 2px)` and `- 4px`. Traditional Web uses fixed per-device values (table below); the results are almost identical.
- The utility classes `.margin-left-*` and `.text-align-left` are **physical** in 2.x (they don't mirror in RTL); in 3.0 they're logical.

How to use a token:
- **In Style Classes** (no CSS): `background-primary text-neutral-0 padding-m margin-bottom-base border-radius-soft shadow-s`
- **In CSS**: `color: var(--color-neutral-9); padding: var(--space-base); box-shadow: var(--shadow-s);`
- **In a calc**: `top: calc(var(--header-size) + var(--space-base));`

## Contents
1. Color: brand, extended, neutral, semantic, surfaces
2. Typography
3. Spacing
4. Border
5. Shadow
6. Layout variables
7. Utility classes (non-token)
8. Verifying tokens in your version

---

## 1. Color

Every color has a background class, a text class and a variable: `.background-{name}`, `.text-{name}`, `--color-{name}`. A `.background-transparent` class and a `.text-transparent` class also exist.

### Brand
| Token | Value | Use |
|---|---|---|
| `--color-primary` | #1068eb | primary actions, links, active and selected states, focus ring (house rule) |
| `--color-primary-hover` | #295fd6 | hover on primary |
| `--color-primary-selected` | rgba(20,110,245,.12) | selected row or item background |
| `--color-secondary` | #303d60 | optional second brand color (headers, dark surfaces) |

Rebrand by overriding these in the theme (Theme Editor or `:root { --color-primary: … }`). The rest of the framework follows. After rebranding, re-run `node scripts/contrast.mjs <new-primary> neutral-0`: white text on the new primary and primary text on white must both be at least 4.5:1.

### Extended palette (data visualization, categories, tags, illustrations)
Shades: `-darkest`, `-darker`, `-dark`, *(base)*, `-light`, `-lighter`, `-lightest`.

| Hue | Darkest | Darker | Dark | Base | Light | Lighter | Lightest |
|---|---|---|---|---|---|---|---|
| red | #6f1717 | #8d1d1d | #ab2424 | #c92a2a | #d96a6a | #e9aaaa | #faeaea |
| orange | #883904 | #ad4805 | #d25806 | #f76707 | #f99551 | #fcc29c | #fef0e6 |
| yellow | #875700 | #ac6f00 | #d08700 | #f59f00 | #f8bc4c | #fbd999 | #fef5e5 |
| lime | #40650c | #51810f | #639c13 | #74b816 | #9ecd5c | #c7e3a2 | #f1f8e8 |
| green | #1e622a | #267d36 | #2f9741 | #37b24d | #73c982 | #afe0b8 | #ebf7ed |
| teal | #044632 | #065940 | #076c4d | #087f5b | #52a58c | #9cccbd | #e6f2ef |
| cyan | #074650 | #095a66 | #0b6d7b | #0d8091 | #56a6b2 | #9eccd3 | #e7f2f4 |
| blue | #0e4370 | #12558e | #1667ad | #1a79cb | #5fa1db | #a3c9ea | #e8f2fa |
| indigo | #243681 | #2e45a5 | #3854c8 | #4263eb | #7b92f1 | #b3c1f7 | #eceffd |
| violet | #3e2880 | #4e32a2 | #5f3dc5 | #7048e8 | #9b7fef | #c6b6f6 | #f1edfd |
| grape | #60226f | #7a2b8d | #9435ab | #ae3ec9 | #c678d9 | #dfb2e9 | #f7ecfa |
| pink | #761c3b | #96244c | #b62b5c | #d6336c | #e27098 | #efadc4 | #fbebf0 |

### Neutral (text, borders, surfaces)
| Token | Value | Contrast on white | Use |
|---|---|---|---|
| `neutral-10` | #101213 | 18.9 | strongest text, text on bright fills |
| `neutral-9` | #272b30 | 14.2 | **body text** (framework default input text) |
| `neutral-8` | #4f575e | 7.4 | secondary text, labels |
| `neutral-7` | #6a7178 | 4.95 | muted text, helper text, **the lightest allowed for text**; accessible input borders |
| `neutral-6` | #adb5bd | 2.07 | disabled text and icons only (exempt from WCAG), decorative |
| `neutral-5` | #ced4da | 1.49 | default input border, which is **not** enough for WCAG 1.4.11; see accessibility.md |
| `neutral-4` | #dee2e6 | – | dividers, separators, table lines |
| `neutral-3` | #e9ecef | – | subtle fills, hover backgrounds |
| `neutral-2` | #f1f3f5 | – | zebra rows, inset areas |
| `neutral-1` | #f8f9fa | – | lightest fill |
| `neutral-0` | #ffffff | – | cards, inputs, modals |

### Semantic
| Token | Value | Light variant | As text on white |
|---|---|---|---|
| `info` | #017aad | `info-light` #e5f5fc | 4.79 ✔ |
| `success` | #29823b | `success-light` #eaf3eb | 4.83 ✔ |
| `warning` | #e9a100 | `warning-light` #fdf6e5 | **2.20 ✘**: never use as text, and use dark text on it |
| `error` | #dc2020 | `error-light` #fceaea | 4.92 ✔ |

Each semantic base on its own `-light` background is about 4.25:1, which **fails** AA for normal text. For alerts and feedback, use `neutral-9` text on the `-light` background and show the color through the icon, a left border or the title only. The framework's `.alert.background-{type}` uses a solid fill with white text. That passes for info, success and error (4.8–4.9:1) but **not** for warning, so give warning alerts dark text.

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--color-background-body` | #f3f6f8 | page background behind cards |
| `--color-neutral-0` | #ffffff | card, panel, modal, input surface |

### Quick color-on-color guide (WCAG AA, normal text)
- On white or the body background, OK as text: primary, secondary, neutral-7…10, info, success, error, red, teal, cyan, blue, indigo, violet, grape, pink, and every `-dark`/`-darker`/`-darkest` except `orange-dark` (4.09), `green-dark` (3.73) and `yellow-darker` (4.18).
- **Not OK as text**: neutral-6 and lighter, warning, yellow, lime, green, orange, and every `-light`/`-lighter`/`-lightest`.
- White text is OK on: primary, secondary, info, success, error, red, teal, cyan, blue, indigo, violet, grape, pink. **Not OK** on warning, yellow, lime, green or orange. Use `neutral-10` text on those (6.2–8.8:1).
- "Is Light" tags and badges (`-lightest` background + `-darker` text): OK for every hue **except yellow (3.86) and lime (4.30)**. For those, use `-darkest` text (5.7 / 6.3).
- Run `node scripts/contrast.mjs --suggest <background>` for any other pair.

## 2. Typography

Font: the system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` + emoji fonts). Override it only in the theme (see theming.md). For Arabic, use a font with good Arabic glyphs (e.g. the system font, or a licensed brand font with Arabic support).

**Body text default is `--font-size-s` (14px) with line-height 1.5.** Inputs also use 14px and are 40px tall.

| Style | Class | Variable | Desktop | Tablet | Phone | Line height |
|---|---|---|---|---|---|---|
| Display | `.font-size-display` | `--font-size-display` | 36px | 34px | 32px | 1.25 |
| Heading 1 | `.heading1` | `--font-size-h1` | 32px | 30px | 28px | 1.25 |
| Heading 2 | `.heading2` | `--font-size-h2` | 28px | 26px | 24px | 1.25 |
| Heading 3 | `.heading3` | `--font-size-h3` | 26px | 24px | 22px | 1.25 |
| Heading 4 | `.heading4` | `--font-size-h4` | 22px | 21px | 20px | 1.25 |
| Heading 5 | `.heading5` | `--font-size-h5` | 20px | 19px | 18px | 1.25 |
| Heading 6 | `.heading6` | `--font-size-h6` | 18px | 17px | 16px | 1.25 |
| Body | `.font-size-base` | `--font-size-base` | 16px | 16px | 16px | 1.5 |
| Body small (default) | `.font-size-s` | `--font-size-s` | 14px | 14px | 14px | 1.5 |
| Extra small | `.font-size-xs` | `--font-size-xs` | 12px | 12px | 12px | 1.5 |

The tablet and phone sizes are applied by `.tablet .heading1 { --font-size-h1: 30px }` and similar rules. This works only when you use the classes or variables.

Use them like this:
- Display: KPI numbers and hero titles.
- H1: one per screen, the screen title.
- H2–H4: sections.
- H5–H6: card and panel titles.
- Base: long-form reading text.
- S: general UI.
- XS: captions, helper text, table meta. **12px is the minimum size for any text.**

Weights: `.font-light` 300 · `.font-regular` 400 · `.font-semi-bold` 600 · `.font-bold` 700 (variables `--font-light` … `--font-bold`). Use semi-bold for labels, titles and buttons, and bold sparingly. Avoid light under 16px.

Transforms: `.text-lowercase`, `.text-uppercase` (short labels only; it hurts readability and screen readers may spell it out), `.text-capitalize`, `.text-ellipsis` (single line, overflow hidden; pair it with a tooltip or title so the full text stays reachable).

Alignment: `.text-align-left|center|right`. In RTL apps, prefer logical alignment (`text-align: start`) in custom CSS.

## 3. Spacing (8px grid, plus 4px for tightly related items)

| Name | Value | Variable | Typical use |
|---|---|---|---|
| none | 0 | `--space-none` | reset |
| xs | 4px | `--space-xs` | icon ↔ text, label ↔ helper text |
| s | 8px | `--space-s` | between related controls, tag gaps |
| base | 16px | `--space-base` | card padding (compact), between form fields |
| m | 24px | `--space-m` | card padding (default), between cards and sections |
| l | 32px | `--space-l` | between major sections |
| xl | 40px | `--space-xl` | page-level separation |
| xxl | 48px | `--space-xxl` | hero and empty-state breathing room |

Classes, with `{s}` = none, xs, s, base, m, l, xl, xxl:
- All sides: `.padding-{s}`, `.margin-{s}`
- One side: `.padding-top-{s}`, `.padding-right-{s}`, `.padding-bottom-{s}`, `.padding-left-{s}`, and the same for `margin-`
- Axis: `.padding-x-{s}`, `.padding-y-{s}`, `.margin-x-{s}`, `.margin-y-{s}`
- Columns gap: `.gutter-{s}`

In RTL, prefer `margin-inline-start` / `padding-inline-end` in custom CSS. In Classic, the left and right utility classes don't flip (in OutSystems UI 3.0 they compile to logical properties and do flip).

## 4. Border

| Token | Value | Class |
|---|---|---|
| `--border-radius-none` | 0 | `.border-radius-none` |
| `--border-radius-soft` | 4px (default for inputs, buttons, cards) | `.border-radius-soft` |
| `--border-radius-rounded` | 100px (pill) | `.border-radius-rounded` |
| `--border-radius-circle` | 100% | `.border-radius-circle` |
| `--border-size-none` | 0 | `.border-size-none` |
| `--border-size-s` | 1px (default) | `.border-size-s` |
| `--border-size-m` | 2px (focus, emphasis) | `.border-size-m` |
| `--border-size-l` | 3px (strong accent, e.g. left status bar) | `.border-size-l` |

## 5. Shadow (elevation)

| Token | Value | Use |
|---|---|---|
| `--shadow-none` | none | flat |
| `--shadow-xs` | 0 1px 2px rgba(0,0,0,.1) | resting cards in dense layouts |
| `--shadow-s` | 0 2px 4px rgba(0,0,0,.1) | resting cards |
| `--shadow-m` | 0 4px 6px rgba(0,0,0,.1) | hover on cards, dropdowns |
| `--shadow-l` | 0 6px 8px rgba(0,0,0,.1) | popovers, sticky headers |
| `--shadow-xl` | 0 8px 10px rgba(0,0,0,.1) | modals, sidebars |

Classes: `.shadow-none` … `.shadow-xl`. Use at most two elevation levels on a screen (resting and raised). Don't use a shadow and a strong border on the same element.

## 6. Layout variables

| Variable | Value | Use |
|---|---|---|
| `--header-size` | 56px | sticky offsets, full-height calcs: `height: calc(100vh - var(--header-size))` |
| `--side-menu-size` | 300px | side-menu width; offsets for fixed elements |
| `--header-gutter` | `var(--header-size)` | spacing under a fixed header |

## 7. Utility classes (non-token, verified in the base theme)

- Display and flex: `.display-flex`, `.display-block`, `.flex-direction-row|column`, `.align-items-center`, `.center-align`, `.full-width`, `.full-height`
- Text: `.text-align-*`, `.text-ellipsis`
- Visibility and state (set by patterns): `.is--visible`, `.is--hidden`, `.is--open`, `.is--active`, `.is--expanded`, `.is--disabled`, `.is--loading`
- Images: `.img-cover`
- Studio-only: `.hide-on-service-studio`
- Screen readers: `.wcag-hide-text` (visually hidden, still announced)

## 8. Verifying tokens in your version

Token names are stable across OutSystems UI 2.x, but values can differ between versions and themes. Before relying on a value:
- open the app in a browser, run `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` in the console, and read the variables the theme actually sets; or
- open the theme's CSS in Service Studio (Interface → Themes).

If your brand values differ, update `scripts/tokens.json` so the linter and contrast checker use them.
