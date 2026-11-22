# Accessibility (target: WCAG 2.2 AA)

Accessibility is a requirement here, not a polish step. Government and enterprise clients audit it, and the European Accessibility Act has applied to many consumer-facing services in the EU since June 2025. Fixing accessibility after the build costs several times more. Most of it is free if you use the framework correctly.

**What OutSystems provides:** OutSystems publishes an **Accessibility Conformance Report (ACR, VPAT format)** stating how web apps built with OutSystems UI conform to **WCAG 2.2 A and AA**, and the patterns ship with ARIA roles and keyboard behavior. That covers the *framework*. **Your screens, content, custom CSS, custom blocks and color choices are your responsibility**, and real audits still flag issues in apps built on it. Audit your own screens.

## 0. Switch the built-in features on (do this first)
Set the layout's **`EnableAccessibilityFeatures`** input parameter to **True**:
- O11 Reactive and Mobile: in the layout blocks of your theme or app.
- ODC: UI Flows → Layouts → the layout's parameter, Default Value.

It turns on, for every screen using the layout:
- **focus states**;
- **skip to content** (the target defaults to `MainContentWrapper`);
- **accessible links** (higher contrast);
- **enhanced contrast**.

In OutSystems UI 3.0 (repository dev branch, ADR-0020) the focus ring is moving to *always on* for every app. Keep the parameter on anyway: it still drives skip-to-content and the contrast features.

OutSystems UI **accessibility client actions** (OutSystemsUI → Accessibility), verified in the 2.30 and 3.0 bundles:
- `SetAccessibilityRole`, `SetAriaHidden`;
- `SetFocus` (move focus after open/close or save);
- `SkipToContent`;
- `SetLang` (page language);
- `ToggleTextSpacing` (WCAG 1.4.12 text spacing; offer it as a user setting).

High contrast: the framework styles `.os-high-contrast` (focus outlines and several patterns). You can expose it as a user preference.

## 1. Color and contrast
| Content | Minimum ratio | WCAG |
|---|---|---|
| Normal text (< 18.66px bold or < 24px regular) | 4.5:1 | 1.4.3 |
| Large text (≥ 24px, or ≥ 18.66px bold) | 3:1 | 1.4.3 |
| UI component boundaries (input borders, toggles, checkboxes), focus indicators, meaningful icons and chart lines | 3:1 against adjacent colors | 1.4.11 |
| Disabled controls, decorative elements, logos | exempt | – |

Check every pair with `node scripts/contrast.mjs <fg> <bg>`. Add `--osui 3` for the 3.0 palette.

### OutSystems UI Classic (2.x / Traditional Web) palette facts
- **Text-safe on white**: primary 5.00 · secondary 10.7 · neutral-7 4.95 · neutral-8 7.35 · neutral-9 14.2 · info 4.79 · success 4.83 · error 4.92 · red 5.46 · teal 5.00 · cyan 4.65 · blue 4.52 · indigo 4.98 · violet 5.55 · grape 4.85 · pink 4.62.
  - On the Classic body background `#f3f6f8`, these drop about 8%. Blue (4.17), cyan (4.29), pink (4.25), info (4.41) and success (4.45) then **fail**. Put small colored text on white cards.
- **Never as text, and never under white text**: neutral-6 (2.07) · warning (2.20) · yellow (2.13) · lime (2.44) · green (2.75) · orange (3.04). On those fills, use `neutral-10` text.
- **Semantic text on its own `-light` background** is about 4.25:1 and **fails**. Use `neutral-9` text and carry the color in the icon or border.
- Light tags (`-lightest` + `-darker`) pass, **except yellow (3.86) and lime (4.30)**. Use `-darkest` for those.
- **Input border `neutral-5`: 1.49:1, fails 1.4.11.** Use `neutral-7` in accessible themes.
- **Focus rings**:
  - Traditional Web `#a3daff`: 1.5:1.
  - Reactive 2.x accessible-features ring `#ffd337`: a yellow wash, 1.44:1 against white.
  - Neither reaches 3:1 against white, so harden them (§2).

### OutSystems UI 3.0 palette facts (light theme)
- **Text roles are good**: `--color-text` 15.3 · `-subtle` 10.8 · `-subtlest` 4.85 (the lightest allowed for text) · `--color-primary` 5.53.
  - Status **text tokens** pass: `--token-text-danger` 5.56 · `-success` 6.16 · `-warning` 5.44 · `-info` 6.36.
  - **Status text on its own subtle background passes** (≈5.0–5.9:1), a real improvement over Classic.
- **Fail as text or under white text**: `--color-success` #4aae83 (2.74) · `--color-warning` #ffd600 (1.41) · `--color-text-disabled` (2.48, exempt only for genuinely disabled controls).
  - For status text, use `--token-text-success|warning` (with fallbacks), not the `--color-*` fills. On warning or yellow fills, use `--color-text` or `--color-text-dark` (≈10.9–13:1).
  - Palette bases sit right on the threshold: orange 4.53, green 4.51, lime 4.58. Use them for large text or fills only, or re-check them on tinted backgrounds.
- **Borders and focus still fail 3:1 by default**:
  - `--color-border` / `--color-border-input` #d0d7df: 1.45;
  - input hover border #9fa5ad: 2.48;
  - the focus color `--token-border-focus-default` #b5c0f7: 1.77.

  Accessible themes set the input border to `--color-border-input-press` (#7e858e, 3.73), or put a 2px border on inputs, and set the focus ring color to `--color-primary` (5.53). The 3.0 knobs:
  - 3.0.0: `--osui-focus-shadow-color`, `--osui-focus-shadow-width`;
  - dev branch: `--osui-color-focus`, `--osui-focus-ring-width`.

### For every version
- **Color is never the only signal** (1.4.1): status carries text or an icon, errors carry a message, charts carry labels or patterns, and links in body text are underlined.
- **Dark mode** (3.0 `.os-dark-theme`, or a custom one) needs its own contrast pass. Neutral steps flip; saturated fills keep their hue, so white text on them can drop below 4.5.

## 2. Keyboard and focus
- Everything works by keyboard (2.1.1): menus, dropdowns, date pickers, tabs, accordions, modals, sidebars, carousels, table sort.
  - OutSystems UI patterns support this. **A Container with an OnClick is not a button**: use a Button or Link widget, or add `role="button"`, `tabindex="0"` and Enter/Space handling.
- **Visible focus** at all times (2.4.7):
  - Never write `:focus { outline: 0 }` without a replacement.
  - The framework resets `:focus { outline: 0 }` and draws its own ring under `:focus-visible` (3.0 dev branch: always; earlier: under `.has-accessible-features` / `.is--focusable`). Keep that mechanism and raise its contrast:
  ```css
  /* Classic / 2.x theme */
  .has-accessible-features :focus-visible, .is--focusable :focus { outline: 2px solid var(--color-primary); outline-offset: 2px; }
  /* 3.0 theme: set the knob, not a rule (name depends on your 3.0.x build) */
  :root { --osui-focus-shadow-color: var(--color-primary); --osui-color-focus: var(--color-primary); }
  ```
- **Focus not obscured** (2.4.11, new in WCAG 2.2): a focused element must not be fully hidden behind sticky headers, bottom bars or cookie banners. Use `scroll-padding-top: calc(var(--header-size) + var(--space-base))` on `html` when the header is fixed.
- **Focus order** follows the visual order (2.4.3). Don't use positive `tabindex`.
- **Modals, popups, sidebars, bottom sheets**: move focus in on open (`SetFocus`, or the pattern's own behavior), keep it inside while open, close on Esc, and return focus to the trigger on close.
- **Skip link**: provided by `EnableAccessibilityFeatures` (`.skip-nav`). Keep it as the first Tab stop.
- After async actions (save, filter), move focus or announce the result (§5).

## 3. Structure and semantics
- **One H1 per screen**, with headings in order (1.3.1, 2.4.6). Use the HTML Element widget with tag `h1`…`h6`, or Heading widgets. Change size with classes, never by skipping levels.
- **Page title** (2.4.2): every screen's Title property is set. The default **login page title is blank**: set it (UI Flows → Common → Login).
- **Language** (3.1.1, 3.1.2): the page language comes from the app locale (`SetLang` when it changes). Mixed-language fragments get their own `lang`.
- **Landmarks**: the layout provides header, nav and main. Don't nest a second main.
- **Lists** use the List widget; **tables** use the Table widget with header cells, never for layout.
- **Images**: alt text that states the information. Decorative images get `alt=""` (Attributes → `alt`). Charts get a text summary or data table.
- **ARIA for dynamic content**: use Extended Properties or the accessibility client actions (`SetAccessibilityRole`, `SetAriaHidden`). Check the official **UI patterns accessibility reference** for what each pattern already applies. Examples:
  - Alert uses `role="alert"` for Error and Warning, and `role="status"` for Success and Info;
  - Master Detail needs a tabindex and `MasterDetailSetContentFocus`.

## 4. Forms
- Every input has a **visible label bound to it** (Label → *Input Widget* property) (1.3.1, 3.3.2, 4.1.2). Use `aria-labelledby` for complex cases. Placeholders aren't labels.
- Mark required fields with the Mandatory property (`*`), and explain the asterisk once.
- **Errors** (3.3.1, 3.3.3):
  - built-in validation messages next to the field, saying how to fix the problem;
  - on submit, a summary and focus on the first invalid field;
  - set `aria-invalid` dynamically for screen readers (the official ODC docs give an example of setting ARIA dynamically).
- Group related inputs with Fieldset and a legend.
- Add `autocomplete` hints on personal-data fields (1.3.5).
- **WCAG 2.2 additions**:
  - **Redundant entry** (3.3.7): don't ask again for data already given in the same process. Prefill it or offer "same as above".
  - **Accessible authentication** (3.3.8): no cognitive tests (puzzles, transcribing codes without paste) for login. Allow paste and password managers.
  - **Consistent help** (3.2.6): help links and contact options sit in the same place on every screen (layout header or footer).
- Session time-outs warn and let the user extend (2.2.1).

## 5. Dynamic content and feedback
- Toasts and feedback messages must be announced (4.1.3). Reactive Message nodes and Alerts use live regions. For custom ones, add `role="status"` (polite) or `role="alert"`.
- Loading states: give spinners a label, and don't trap focus.
- Don't auto-advance carousels without a pause control (2.2.2). Avoid autoplay video with sound.
- **Dragging** (2.5.7, WCAG 2.2): anything done by drag (sortable lists, range sliders, drag-and-drop uploads) also works with single clicks or taps (buttons, inputs, a file picker).
- **Target size** (2.5.8, WCAG 2.2 AA): interactive targets at least **24×24px**, or spaced so 24px circles don't overlap. The house rule is 44px on touch devices.
- Respect `prefers-reduced-motion` in custom animations (OutSystems UI doesn't ship a global reduced-motion rule; the theme starters add one).

## 6. Text and zoom
- Text resizes to 200% (1.4.4). Reflow at 320px width (1.4.10). Text-spacing overrides don't break the layout (1.4.12); `ToggleTextSpacing` lets you test this.
- Minimum text size is 12px (house rule). Avoid Classic `--font-size-label` and 3.0 `--token-font-size-275` (11px) for meaningful text.
- `.text-ellipsis` truncation keeps the full text reachable (a title attribute, tooltip or detail view).

## 7. Audit procedure (for reviews)
1. Confirm `EnableAccessibilityFeatures = True` on every layout in use.
2. Lint the CSS (`lint-ui-css.mjs [--osui 3]`) for focus removal, tiny text and literal colors. Run `contrast.mjs` on every text/background pair, and the border and focus pairs, **in light and dark** if the app has dark mode.
3. **Keyboard-only run** of the main task: reach everything, see focus (never hidden by sticky bars), operate modals, submit, recover from an error.
4. **Screen-reader spot check** (NVDA + Chrome, or VoiceOver + Safari): screen title (including login), headings, labels, error announcement, button names, alert roles.
5. **Zoom to 200%**, a **320px** width, and the text-spacing toggle: no loss, no horizontal scroll.
6. An automated scan (axe DevTools, Lighthouse, or a Forge scanner) is a floor, not a pass.
7. Report findings with WCAG success-criterion numbers and checklist IDs (A11Y-xx).
