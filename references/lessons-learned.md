# UI/UX lessons learned from real OutSystems projects

Collected from several enterprise and public-sector OutSystems 11 Reactive builds (request portals, executive dashboards, case-management apps) and from auditing the OutSystems UI framework itself. Names are generalized. Format: **problem → cause → rule**. IDs (`LES-xx`) can be cited in reviews.

## Theme and CSS
- **LES-01: The corporate theme decides the layout.**
  - *Problem*: the first screens were built on the default OutSystems UI layout and had to be redone.
  - *Cause*: the client's corporate theme had its own header, menu placeholder and footer, plus a required script (jQuery) that had to be added to each screen.
  - **Rule**: before building any screen, set the app theme's base theme to the corporate one, then open an existing app built on the same theme and copy its layout setup.
- **LES-02: A custom class collided with OutSystems UI.**
  - *Problem*: a custom `.alert` box picked up OSUI Alert padding and colors.
  - *Cause*: it reused a framework class name.
  - **Rule**: prefix every custom class (`app-`, `abc-`). The linter's THM-03 flags bare framework names.
- **LES-03: Reactive List + flex or grid gave an empty first cell.**
  - *Cause*: the List renders an inner `<script>` element, which becomes a flex or grid item.
  - **Rule**: wherever a List gets `display:flex|grid`, add `.list > script { display:none }`. The linter checks for this.
- **LES-04: Block overrides didn't apply.**
  - *Cause*: **block CSS loads before theme CSS**, so equal specificity loses.
  - **Rule**: never override theme or framework classes from a block. Style the block's own prefixed classes. Change shared looks in the theme.
- **LES-05: Selectors on generated ids broke after a republish.**
  - *Cause*: ids like `#b3-Container2` are regenerated.
  - **Rule**: add a Style Class and target that (THM-04).

## Responsive
- **LES-06: Responsive "bugs" that weren't bugs.**
  - *Problem*: a layout looked wrong after resizing the browser.
  - *Cause*: the device class (`phone`/`tablet`/`desktop`) is set at page load.
  - **Rule**: reload after every resize when testing. After republishing a Reactive app, clear the cache and reload, because the browser can serve old JS.
- **LES-07: Values read in a narrow window were the phone values.**
  - *Problem*: the typography sizes copied from the live style guide (H1 = 28px) were the **phone** sizes. The browser pane was narrow, so the body had the `phone` class.
  - **Rule**: when reading token values from a live page, check `document.body.className` first, or read the theme's `:root` definitions. Desktop H1 is 32px.

## Accessibility (found by auditing framework defaults)
- **LES-08: Framework defaults are not automatically WCAG AA.**
  - Input border `neutral-5` is 1.49:1. The focus ring `#a3daff` is 1.5:1. Warning, yellow, lime, green and orange fail as text and under white text. Semantic text on its own `-light` background is about 4.25:1. Light yellow and lime tags fail.
  - **Rule**: accessible themes override the input border (neutral-7) and the focus ring (primary), and use the color rules in accessibility.md. Run `contrast.mjs` after every brand change.
- **LES-09: Clickable cards weren't reachable by keyboard.**
  - *Cause*: a Container with an OnClick has no role or tabindex.
  - **Rule**: use Link or Button widgets for anything clickable, or add `role`, `tabindex` and key handling (A11Y-07).

## Content and states
- **LES-10: The empty state flashed before the data arrived.**
  - *Cause*: the "no records" condition didn't check `IsDataFetched`.
  - **Rule**: show empty states only after the fetch completes. Show a skeleton or spinner before that.
- **LES-11: Mock data looked real in demos.**
  - *Problem*: stakeholders took mock values as live.
  - **Rule**: while a data source is still a mock (see the companion skill: mark unknown sources `NOT FOUND`), show a visible "Sample data" Tag on the widget. Remove it when the real source is connected.
- **LES-12: Arabic text broke fixed-width buttons and cards.**
  - *Cause*: widths were fitted to the English labels.
  - **Rule**: no fixed widths on text containers. Test both languages and both directions before sign-off.

## OutSystems UI 3.0 and framework research (2026)
Collected from OutSystems' own migration notes (`THEME-MIGRATION-GUIDE.md`, `CSS-ARCHITECTURE.md`, ADRs), the OutSystems forums, and auditing the 3.0 bundle.
- **LES-15: Retired variables fail silently.**
  - *Problem*: after moving to the 3.0 theme, `var(--font-size-h1)`, `var(--shadow-s)` and `var(--border-size-s)` simply stopped applying. There's no error; the page just "looks slightly off".
  - **Rule**: lint every stylesheet with `--osui 3` before and after switching (TOK-08), and use the replacement map in osui-versions-and-migration.md.
- **LES-16: A bare `--token-*` works only in dark mode.**
  - *Cause*: the 3.0 bundle declares `--token-*` values only under `.os-dark-theme`; light relies on internal fallbacks.
  - *Problem*: CSS tested in dark looked right and failed for every light-mode user.
  - **Rule**: always `var(--token-x, <literal>)`, prefer the roles, and verify in light first (TOK-09).
- **LES-17: `--color-neutral-0` isn't white in 3.0** (#f6f7fa), and it flips in dark mode.
  - **Rule**: surfaces use `--color-background-surface`; white text uses `--color-text-light` / `--color-text-inverse` (TOK-10).
- **LES-18: `border-radius: 100%` made oval badges.**
  - *Cause*: a non-square element after a line-height change.
  - **Rule**: use 50% on square elements, or `--border-radius-rounded` for pills. The linter checks this.
- **LES-19: Theme Editor changes "didn't work".**
  - *Cause*: the same variable was also set in the theme's hand-written section, which wins over the Theme Editor section.
  - **Rule**: each variable is set in exactly one of the two sections.
- **LES-20: Forum answers on CSS load order contradict each other.**
  - Some say block CSS loads last; MVPs and our projects say it loads **before** the theme.
  - **Rule**: don't design around a claimed order. Use your own prefixed classes so the order doesn't matter, and verify in DevTools when it does.
- **LES-21: The login screen had no page title.**
  - *Cause*: the default login page title is blank, so screen readers announced nothing.
  - **Rule**: set the Title of every screen, including Common → Login (A11Y-08).
- **LES-22: RTL fixes scoped to `.ar-AE` didn't reach popups.** Dropdown Search didn't mirror for some RTL languages.
  - **Rule**: scope RTL on `.is-rtl` / `[dir=rtl]` at the `<html>` level, and set VirtualSelect `textDirection: "rtl"` for Dropdown Search / Tags (TXT-02).
- **LES-23: The hamburger went blank after the 3.0 upgrade.**
  - *Cause*: old menu markup (`.menu-icon-line` bars) is no longer styled.
  - **Rule**: replace it with the template's Icon widget.
- **LES-24: Keyboard users had no focus ring.**
  - *Cause*: `EnableAccessibilityFeatures` is **off by default** on layouts, and the framework resets `:focus { outline: 0 }`.
  - **Rule**: switch it on in every layout (A11Y-15), and harden the ring's contrast in the theme.

## Process
- **LES-13: "Done" without looking.**
  - *Problem*: UI work was reported complete from the model and the code, but the rendered page differed (wrong theme, overridden CSS, stale device class).
  - **Rule**: verify in the browser at three device sizes, plus the empty and error states, before reporting. Attach screenshots or describe what you saw.
- **LES-14: Large modules are slow to change through automation.**
  - **Rule**: build new UI as blocks in a small CW module and drop them into large screens. Don't automate edits inside very large front-end modules (companion skill: service-studio-mcp).
