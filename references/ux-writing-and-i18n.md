# UX writing, formats, multilingual apps and RTL

## UX writing
- **Plain, specific, short.** Write for the user's task, not the system's internals: "Request sent to your manager", not "Workflow instance created".
- Use **sentence case** for titles, labels and buttons ("Create request", not "Create Request"), unless the brand guide says otherwise. Apply it consistently.
- **Buttons** are a verb plus an object ("Approve request"). **Links** describe their destination ("View all requests"), never "click here".
- **Labels** are nouns ("Due date"). Helper text explains the format or the why ("We'll send the code to this number").
- **Errors**: what happened + how to fix it, with no codes in the main text ("This file is larger than 10 MB. Choose a smaller file."). Put the technical reference id in small text if support needs it.
- **Empty states**: what this area is for + the first action ("No requests yet. Create your first request to get started.").
- **Confirmations** state the consequence ("Delete 3 documents? This can't be undone.").
- **Numbers and counts**: "1 request" / "3 requests". Handle the plurals, and for Arabic use the proper plural forms (zero, one, two, few, many, other). Build these strings with translations, never by concatenating text.
- Keep the same word for the same thing everywhere (don't mix "Request", "Application" and "Case" for one concept). Keep a project glossary.
- Never put text in images.

## Formats
- **Dates**: one display format per app, taken from the user's locale or a site property, never hard-coded per screen. Dates in lists use a short format (e.g. `dd MMM yyyy`). Relative times ("2 hours ago") are for feeds only. Show the full date and time on hover.
- **Times**: 24-hour or 12-hour by locale. Show the time zone when users span time zones.
- **Numbers**: locale thousands and decimal separators, right-aligned in tables, units in the column header ("Amount (AED)").
- **Currency**: the code or symbol by locale, and a consistent number of decimals.
- **Phone, ID, IBAN**: format on display, store raw values. Mask sensitive identifiers except for the last few digits.

## Multilingual apps (OutSystems)
- Enable multilingual locales in the module (e.g. `en-US`, `ar-AE`). Every user-facing string goes in a widget, expression or message, so it's translatable. Don't build sentences by concatenation. Use whole translatable sentences with placeholders.
- Manage translations through Service Studio's export and import of translatable resources. Review them with native speakers.
- Switch the locale with `SetCurrentLocale` (an action in the layout or user menu). Persist the user's choice and apply it at login.
- Leave space for text expansion: German and Arabic UI strings can be 30–40% longer. Don't fix button widths or truncate labels.
- Translate data too, where needed (lookup and static entities with translatable labels, or separate label columns per language).

## RTL (Arabic, Hebrew, Urdu)
- OutSystems UI supports RTL. Switching the locale with `SetCurrentLocale` to an RTL language (e.g. `ar-AE`) puts the `is-rtl` class on the page (`is-rtl-device` when the device itself is RTL), and the patterns mirror themselves. Set `dir="rtl"` on the html element for RTL locales if your version doesn't.
- **Custom CSS must be direction-agnostic**: use logical properties.
  - `margin-inline-start` / `padding-inline-end` / `inset-inline-start` / `text-align: start` / `border-inline-start`, instead of left and right.
  - Where you must use physical sides, add an `.is-rtl` override next to the rule.
- Mirror direction-bearing icons (arrows, chevrons, progress, back/forward) and don't mirror the rest (checkmarks, play, logos, clocks). Use `.is-rtl .app-icon-forward { transform: scaleX(-1); }` for icons that need it.
- Numbers, phone numbers, codes and Latin text inside Arabic stay left-to-right. Wrap them so they render correctly (`<bdi>` or `unicode-bidi: isolate`).
- **Utility classes depend on the version.** In OutSystems UI **Classic (2.x)**, `.margin-left-base` and `.text-align-left` are physical and **don't flip**: prefer the symmetric utilities (`.margin-x-*`, `.padding-x-*`) or logical custom CSS. In **3.0**, left and right utilities compile to `margin-inline-start` / `text-align: start` and **do flip**. Framework rules there are logical too, so a custom `padding-left` on the same element doesn't reliably override `padding-inline-start`.
- Run `node scripts/lint-ui-css.mjs <css> --rtl` to list physical properties (TXT-02).
- Known RTL issues from the OutSystems community:
  - **Dropdown Search / Tags (VirtualSelect)** may not mirror for every RTL language. Set `textDirection: "rtl"` through the pattern's `SetVirtualSelectConfigs` client action when the locale is RTL. The selected-value margin is a known issue.
  - **Popups ignore locale-scoped CSS** (e.g. rules under `.ar-AE`), because they render outside that scope. Scope RTL rules with `.is-rtl` / `[dir=rtl]` on `<html>` instead.
  - **Inline styles** on widgets are the usual cause of "this one element doesn't mirror".
  - Numbers stay LTR inside RTL text by design. Wrap mixed fragments (`<bdi>`).
- Tooling: the Forge component *RTL/LTR Bug Inspector* (O11 Reactive) scans rendered screens for direction conflicts, overflow and mixed-script issues. Treat its findings as candidates to verify by hand.
- Test every screen in both directions: alignment, icons, the order of form actions (primary at the end side), table column order, charts (axes usually stay LTR), and breadcrumb separators.
- Arabic typography: choose a font with good Arabic glyphs, use a slightly larger line-height (1.6–1.7) for body text, never use letter-spacing on Arabic, and avoid uppercase transforms (they have no effect in Arabic but break Latin fragments).
