# UI/UX review checklist

Each rule has an ID, a severity, and how to check it.
- **Severity**:
  - **Blocker**: must be fixed before release (accessibility barriers, security-adjacent issues).
  - **Major**: fix in this iteration (design-system breaks, missing states, failed contrast).
  - **Minor**: fix when touching the area.
- **Check**:
  - `lint` = `node scripts/lint-ui-css.mjs` detects it;
  - `contrast` = `node scripts/contrast.mjs`;
  - `browser` = look at the rendered screen;
  - `model` = inspect the module in Service Studio.

## TOK: design tokens
| ID | Rule | Sev | Check |
|---|---|---|---|
| TOK-01 | No literal colors (hex, rgb, hsl, named) in CSS outside `:root` token definitions; use `var(--color-*)` or utility classes | Major | lint |
| TOK-02 | Font sizes come from the scale (`var(--font-size-*)` / heading classes); no literal px/rem sizes | Major | lint |
| TOK-03 | Spacing (margin, padding, gap, inset) uses `var(--space-*)` or spacing classes; on-scale literals are Minor, off-scale values Major | Minor/Major | lint |
| TOK-04 | Border radius and width use `--border-radius-*` / `--border-size-*` | Minor | lint |
| TOK-05 | Shadows use `--shadow-*`; at most two elevation levels per screen | Minor | lint, browser |
| TOK-06 | Font family is set only in the theme | Minor | lint |
| TOK-07 | No parallel tokens duplicating OSUI concepts (`--brand-blue` next to `--color-primary`); new tokens are prefixed | Major | model |
| TOK-08 | (OutSystems UI 3.0) No retired variables: `--font-size-*`, `--shadow-*`, `--border-size-*`, `--font-light/regular/semi-bold/bold`, `--color-{hue}-{shade}`, `--color-*-light`, `--border-radius-circle`, `--background-/text-/border-color-*` helpers | Major | lint `--osui 3` |
| TOK-09 | Every `var(--token-*)` has a literal fallback; prefer roles (`--color-*`, `--border-radius-*`, `--space-*`) | Major | lint |
| TOK-10 | (3.0) `--color-neutral-0` isn't used as white: surfaces use `--color-background-surface`, white text uses `--color-text-light` / `-inverse` | Minor | lint `--osui 3` |
| TOK-11 | The OutSystems UI version (Classic or 3.0) is known and recorded in the project's AGENTS.md; CSS and token choices match it | Major | model |

## THM: theme and CSS architecture
| ID | Rule | Sev | Check |
|---|---|---|---|
| THM-01 | The app theme inherits the corporate/Global theme (Base Theme) instead of copying it; one theme per app; the theme module holds no business logic | Major | model |
| THM-02 | No `!important` (except to defeat a framework inline style, with a comment) | Minor | lint |
| THM-03 | Custom classes are prefixed; framework classes (`.card`, `.alert`, `.btn`…) are restyled only in the theme, never in blocks or screens | Major | lint |
| THM-04 | No selectors on generated ids (`#b2-…`, `#wt…`), Service Studio internal classes or deep widget DOM | Major | lint |
| THM-05 | No inline styles (Style property / `style=` extended property) with literal values; email templates excepted | Major | lint (exports), model |
| THM-06 | Screens carry little or no CSS; block CSS lives in the block | Minor | model |
| THM-07 | One icon family per app; icons sized and colored with tokens | Minor | browser |
| THM-08 | (3.0) Components are restyled through their `--osui-*` knobs (or roles and tokens), not by rewriting component rules or using `!important` | Major | model, lint |
| THM-09 | Each variable is set in only one of the theme's two sections (hand-written wins over Theme Editor) | Minor | model |
| THM-10 | Dark mode (if offered): `.os-dark-theme` on `<html>` (3.0, via `SetDarkTheme`); custom CSS uses roles that flip; contrast verified in both themes; the user's choice persists and defaults to the OS preference | Major | browser, contrast |
| THM-11 | Fixed and stacked layers use the `--layer-*` (3.0) / z-index scale, not magic z-index values | Minor | model |
| THM-12 | Traditional Web themes brought over by **Convert to Reactive** are rebuilt on OutSystems UI (Base Theme inheritance, tokens, layouts and patterns) instead of porting their CSS | Major | model, lint |

## LAY: layout and navigation
| ID | Rule | Sev | Check |
|---|---|---|---|
| LAY-01 | Every screen uses the theme's layout; no per-screen headers or menus | Major | model |
| LAY-02 | Exactly one H1 (screen title) per screen, matching the menu entry or record; meaningful browser Title | Major | browser |
| LAY-03 | Standard anatomy: breadcrumbs (depth ≥ 2 only), title, actions, content; consistent spacing rhythm (`--space-m` between blocks) | Minor | browser |
| LAY-04 | Page grids use Columns / Gallery patterns, not hand-written flex/grid | Minor | model, lint |
| LAY-05 | Menu ≤ 9 top-level entries; the active state comes from the layout parameters | Minor | browser |
| LAY-06 | Hiding menu entries by role is backed by server-side role checks on the screen and its actions | Blocker | model |
| LAY-07 | Deep links: record screens take ids as input; lists keep their filter state on Back | Minor | browser |

## RSP: responsive
| ID | Rule | Sev | Check |
|---|---|---|---|
| RSP-01 | Tested at phone, tablet and desktop (reloading after resize); no horizontal page scroll at 320px | Major | browser |
| RSP-02 | Prefer device classes and responsive patterns; review literal media queries as house-policy warnings and document justified content-driven breakpoints | Minor | lint |
| RSP-03 | No fixed px widths over 320px on containers; use max-width, Columns, % | Major | lint |
| RSP-04 | Wide tables choose a responsive mode (cards, expandable or scrollable rows) with selected key columns | Major | browser |
| RSP-05 | Touch targets ≥ 44px where practical, never < 24px; spacing between targets ≥ `--space-s` | Major (< 24) / Minor | browser |
| RSP-06 | Phone forms use one column with labels above inputs and correct input types | Minor | browser |
| RSP-07 | Heavy content not needed on a device uses Display On Device (not CSS hiding) | Minor | model |
| RSP-08 | Breakpoints changed only once, app-wide, with `SetDeviceBreakpoints` (Reactive defaults: phone < 700, tablet ≤ 1024); mobile sticky and fixed elements use the safe-area and layout variables | Minor | model |

## A11Y: accessibility (WCAG 2.1 AA)
| ID | Rule | Sev | Check |
|---|---|---|---|
| A11Y-01 | Text contrast ≥ 4.5:1 (≥ 3:1 for large text); no neutral-6/warning/yellow/lime/green/orange as text or under white text | Major | contrast, lint |
| A11Y-02 | House readability target: meaningful text at least 12px (not a WCAG minimum) | Major | lint |
| A11Y-03 | Input borders, focus indicators, meaningful icons and chart lines ≥ 3:1 against adjacent colors | Major | contrast |
| A11Y-04 | Color is never the only signal (status, errors, charts, links) | Major | browser |
| A11Y-05 | Focus is always visible; no `outline:none` without a replacement; focus ring ≥ 3:1 | Blocker | lint, browser |
| A11Y-06 | Every input has a visible, linked label; placeholders are not labels; groups use a fieldset/legend | Blocker | model, browser |
| A11Y-07 | Everything clickable is keyboard operable (Button/Link widgets, or role + tabindex + keys) | Blocker | browser |
| A11Y-08 | Headings in order, landmarks intact, skip link present | Major | browser |
| A11Y-09 | Meaningful images have alt text, decorative ones `alt=""`; charts have a text alternative | Major | model |
| A11Y-10 | Modals, popups and sidebars: focus moves in, stays in, Esc closes, focus returns to the trigger | Major | browser |
| A11Y-11 | Status messages and async results are announced (`role="status"`/`"alert"`) | Minor | browser |
| A11Y-12 | `lang` matches the locale (and `dir="rtl"` for RTL) | Major | browser |
| A11Y-13 | No autoplay without pause; animations respect `prefers-reduced-motion` | Minor | browser, lint |
| A11Y-14 | Icon-only buttons have an accessible name and a tooltip | Major | browser |
| A11Y-15 | `EnableAccessibilityFeatures = True` on every layout in use (focus states, skip to content, accessible links, enhanced contrast) | Blocker | model |
| A11Y-16 | WCAG 2.2 additions: focus not obscured by sticky bars (2.4.11); targets ≥ 24px (2.5.8); drag actions have a click alternative (2.5.7); no redundant entry (3.3.7); accessible authentication, paste allowed (3.3.8); consistent help placement (3.2.6) | Major | browser |
| A11Y-17 | Every screen has a Title, **including the login screen** (blank by default) | Major | model |

## CMP: components and blocks
| ID | Rule | Sev | Check |
|---|---|---|---|
| CMP-01 | Blocks configure through inputs and communicate through Events; no navigation and no screen-state dependency inside blocks | Major | model |
| CMP-02 | Blocks own their loading, empty and error states; public blocks have a Description and an `ExtendedClass` input | Minor | model |
| CMP-03 | An OSUI pattern or widget is used when one fits; custom components are justified in the spec | Minor | model |
| CMP-04 | One primary button per view; verb+object labels; destructive buttons use the error style | Minor | browser |
| CMP-05 | Blocks are rebuilt in place (keep the key), never deleted and recreated | Major | model |

## FRM: forms
| ID | Rule | Sev | Check |
|---|---|---|---|
| FRM-01 | Labels above inputs; helper text for formats; read-only values shown as text, not disabled inputs | Minor | browser |
| FRM-02 | Validation messages sit beside the field and say how to fix it; a summary + focus on submit; the input is kept after an error | Major | browser |
| FRM-03 | Every client validation is repeated on the server (BL) | Blocker | model |
| FRM-04 | Saving shows Button Loading and blocks double submission; success and failure feedback | Major | browser |
| FRM-05 | Required (or optional) fields are marked consistently and explained once | Minor | browser |

## LST: lists, tables, dashboards
| ID | Rule | Sev | Check |
|---|---|---|---|
| LST-01 | Lists and tables paginate (or load more) with a matching Max Records | Major | model |
| LST-02 | Sorting on meaningful columns; search/filter when there are more than ~20 items; result count shown | Minor | browser |
| LST-03 | Numbers right-aligned; one date format app-wide; status as a Tag | Minor | browser |
| LST-04 | The empty state shows only after the data is fetched; distinct "no data" vs "no results" vs "error" | Minor | browser |
| LST-05 | Charts: the right type for the question, ≤ 6 colors, fixed category colors, labelled axes and units | Minor | browser |

## FDB: feedback and states
| ID | Rule | Sev | Check |
|---|---|---|---|
| FDB-01 | Every data area has loading, empty and error states | Major | browser |
| FDB-02 | Error messages are human, say what to do, and never expose stack traces or raw codes | Major | browser |
| FDB-03 | Every async action gives visible feedback | Major | browser |
| FDB-04 | Destructive actions are confirmed (a Modal stating the consequence) or undoable | Major | browser |
| FDB-05 | No-permission states explain what to do; never a blank page | Minor | browser |

## TXT: content, i18n and RTL
| ID | Rule | Sev | Check |
|---|---|---|---|
| TXT-01 | All UI strings are translatable; no concatenated sentences; plurals handled | Major (multilingual) / Minor | model |
| TXT-02 | RTL-ready CSS: logical properties or `.is-rtl` overrides; direction-bearing icons mirrored; RTL scoped at `<html>` (not a locale class popups miss) | Major (RTL apps) | lint `--rtl`, browser |
| TXT-03 | One date, number and currency format per app, from the locale | Minor | browser |
| TXT-04 | Clear, specific button and link texts; consistent glossary terms | Minor | browser |
| TXT-05 | No fixed widths on text containers (translations expand 30–40%) | Minor | browser |

## PRF: UI performance
| ID | Rule | Sev | Check |
|---|---|---|---|
| PRF-01 | Images are sized and compressed for display; use `.img-cover` in fixed-ratio wrappers | Minor | browser |
| PRF-02 | ≤ 2 font families, ≤ 4 weights; `font-display: swap` | Minor | model |
| PRF-03 | Below-the-fold heavy content uses Load On Visible; device-specific heavy content uses Display On Device | Minor | model |
| PRF-04 | No full-page blocking spinners for partial loads; skeletons in place | Minor | browser |

## GOV: style-guide governance
| ID | Rule | Sev | Check |
|---|---|---|---|
| GOV-01 | The app's theme inherits the corporate theme; a style-guide team owns the corporate theme, shared brand blocks and the Live Style Guide | Major | model |
| GOV-02 | Custom classes use the module acronym from the prefix registry; locally built styles that others need are promoted through the style-guide team, and the local copy is removed | Minor | model |
| GOV-03 | Theme changes are versioned and pass lint, contrast and a Live Style Guide visual check (light/dark, 3 device sizes) before release | Minor | model |
| GOV-04 | New apps start from the corporate app template (theme, layout, login, menu pre-set) | Minor | model |
| GOV-05 | Shared custom blocks expose their own prefixed CSS knobs (`--app-block-prop`) that default to roles or tokens | Minor | model |
| GOV-06 | CSS changed by an agent is verified on the **served** CSS file after publish (not by screenshot); fixes go to the theme stylesheet or a recreated style-only block | Major | browser |

## LES: lessons learned
See `lessons-learned.md` (LES-01 … LES-24). The linter checks LES-03 (List + flex/grid without hiding the script) and LES-18 (`border-radius: 100%`).


## Reliability and evidence (2026-11 review)

These manual checks complement, rather than extend the claimed coverage of, the static scripts. Details and acceptance cases: [verification and reliability](verification-and-reliability.md).

| ID | Severity | Rule |
|---|---|---|
| URV-01 | Major | Verify installed release and selected theme separately; do not infer either from a color. |
| URV-02 | Major | Verify rendered contrast and applicable WCAG criteria; distinguish AA requirements from house/AAA targets. |
| URV-03 | Major | Test dynamic focus, announcements, RTL and supported assistive settings. |
| URV-04 | Major | Record visual regression evidence and scope workarounds to the reproduced component/version. |

## Cross-skill acceptance

| ID | Severity | Rule | Check |
|---|---|---|---|
| URV-05 | Major | Trace accessibility acceptance to the agreed WCAG level, journey states, locale and rendered evidence. | Manual; verification-and-reliability reference. |
| URV-06 | Major | Review redundant entry and accessible authentication with their stated exceptions, and announce applicable status messages. | Manual; verify against the story acceptance cases. |
