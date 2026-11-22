# Responsive design

## How OutSystems UI decides the device
OutSystems UI adds classes to `<body>` at page load, based on the window size, orientation and user agent:
- device: `.phone` / `.tablet` / `.desktop` (plus finer classes such as `.desktop-small` in some versions);
- orientation: `.portrait` / `.landscape`;
- OS: `.windows`, `.ios`, `.android`, …;
- browser: `.chrome`, …;
- keyboard navigation: `.is--focusable`.

- **Reactive Web, Mobile and ODC** (OutSystems UI 2.x and 3.0, read from the `SetDeviceBreakpoints` source):
  - **phone < 700px**;
  - **tablet 700–1024px**;
  - **desktop > 1024px**.

  Detection also considers window height, orientation and (in Traditional Web) the user agent, so check `document.body.className` instead of assuming a class from the width alone.
- **Traditional Web** (OutSystems UI Web, `DeviceDetection.js`):
  - phone < 420px (or an iPhone user agent);
  - tablet up to 1024px;
  - desktop above that, with desktop-small < 1366 / desktop < 1600 / desktop-big ≥ 1920 sub-classes.
- Change breakpoints with the **`SetDeviceBreakpoints(phoneWidth, tabletWidth)`** client action, once, app-wide, from the layout. Don't use per-screen media queries. Changing them makes the framework's own patterns switch at the new widths too, which is the point.
- OutSystems' official guidance for agents is "responsiveness is class-driven: write `.phone .card { … }` rather than media queries".
- The class is set **when the page loads**. Resizing the window doesn't always re-evaluate it, so **reload after resizing** when you test. (Real project: "responsive bug" reports that were really stale device classes.)

## Rules
1. **Style per device with the body classes**, not with pixel media queries:
   ```css
   .phone .app-kpi-card { padding: var(--space-base); }
   .tablet .app-filters { flex-wrap: wrap; }
   ```
   Pixel `@media` queries are acceptable for print, and for components embedded outside OutSystems pages.
2. **Use framework mechanisms first**:
   - **Columns** patterns: choose the break behavior for tablet and phone (`.tablet-break-{all|first|last|middle|none}`, `.phone-break-…`). The default stays side by side on tablet and stacks on phone.
   - **Gallery**: set items per row for Desktop, Tablet and Phone (e.g. 4/2/1).
   - **Display On Device**: render content only on some devices. It doesn't render on the others, which beats hiding with CSS for heavy content.
   - **Move On Device**: move one element to another container per device, without duplicating it.
   - **Responsive Table Records** or Reactive Table responsive options: stacked cards (the default), **Expandable rows** (hide secondary columns), or **Scrollable rows** (keep the table and scroll sideways, for comparing rows).
   - Typography tokens already scale per device: Classic via `.tablet/.phone .headingN`, and 3.0's responsive type scale (e.g. display 36 → 32px on tablet). Don't add your own heading sizes per device.
   - In 3.0, use the safe-area variables (`--os-safe-area-top/right/bottom/left`) and the layout variables (`--header-size`, `--header-size-content`, `--bottom-bar-size`) for fixed or sticky elements on mobile. Never use hard-coded offsets.
3. **Design phone first for task screens.** Show the primary task and key data first. Move secondary data into accordions, tabs or "More". Keep the primary action in reach (bottom of the form, or Floating Actions on mobile-style apps).
4. **Touch**: interactive targets at least 44×44px on touch devices (WCAG 2.5.5 AAA; the AA minimum in 2.2 is 24×24 plus spacing). Space adjacent targets by at least `--space-s`. Inputs are 40px tall by default: keep them, don't shrink them.
5. **No horizontal page scroll** at 320px width (WCAG 1.4.10 Reflow), except inside tables, carousels or code blocks that scroll by design.
6. **No fixed widths** in px on containers. Use `max-width` with `width: 100%`, or Columns. Images use `max-width: 100%` and `.img-cover` inside fixed-ratio wrappers.
7. **Tables on phone**: never just shrink a wide table. Pick a responsive mode deliberately, and choose which 2–3 columns stay visible.
8. **Forms on phone**: one column. Labels go above inputs, never beside them. Use the right input types (Email, Phone, Number) so the right keyboard opens. Keep a sticky primary action on long forms if the theme supports it.
9. **Menus**: the layout's hamburger handles phone and tablet. Don't build a second mobile menu.
10. **Test matrix**: phone portrait (~375px), tablet portrait (~768px), tablet landscape (~1024px), desktop (≥1366px). In each, reload and check:
    - layout and overflow;
    - text wrapping, especially long Arabic or German strings;
    - tap targets;
    - modals and sidebars fit;
    - tables are usable;
    - nothing important is hidden.

## Mobile apps (OutSystems Mobile)
- Use native-feeling patterns: bottom tabs or the side menu from the mobile layout, pull to refresh on lists, Floating Actions for the main create action, Bottom Sheet or Action Sheet for contextual actions (OSUI 2.x).
- Respect safe areas (notch, home indicator). OSUI mobile layouts handle this, so don't add fixed headers outside the layout.
- Offline: show cached data with a clear "last synced" hint. Disable actions that need connectivity and explain why. Never let a spinner loop forever.
- Keep screen-level local storage small and denormalized (companion skill). Show a skeleton or placeholder while data loads.
- Use the platform transitions (`Transition` property on navigation). Don't chain heavy custom animations.
