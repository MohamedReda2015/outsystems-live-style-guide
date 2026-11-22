# UI evidence, accessibility and visual regression

## Release and theme evidence (URV-01)

Record installed OutSystems UI release, selected theme/base chain, app type and platform. Package version and theme selection are separate: a 3.x package may use Classic. Brand colors, fonts and missing variables cannot establish the release. Confirm loaded CSS and public component APIs against that release; distinguish release documentation from the repository's development branch.

Use the CSS linter's appropriate theme mode. Treat its findings as heuristics, not proof of accessibility or rendered correctness. Before adopting a token/component knob, check that the loaded release defines it. A fallback can protect a missing value but cannot make an unsupported component API exist.

## Contrast and conformance evidence (URV-02)

- Measure **rendered foreground/background pairs** in each relevant state and theme, including opacity, overlays and gradients. Palette ratios are examples for their stated backgrounds, not a compliance certificate for a branded screen.
- WCAG 2.2 AA normal text uses 4.5:1; large text uses 3:1 under the criterion's definition. Non-text contrast applies to visual information needed to identify controls/states, not every decorative border. Increasing a border's width does not improve its color contrast ratio.
- Target size 24 CSS px is the AA baseline with stated exceptions, including spacing and inline targets. The 44px touch target and 12px minimum meaningful text are house choices. The 2px-area **Focus Appearance** criterion is AAA; visible focus and not-entirely-obscured focus remain relevant AA checks.
- Test reflow at the equivalent of 320 CSS px (for example 1280px at 400% zoom), plus 200% text enlargement and text-spacing overrides. Two-dimensional content such as a data table may use its applicable exception; surrounding controls and cell content must remain usable.
- An accessibility flag, passing linter, framework ACR or automated scan does not prove application conformance. Record the actual keyboard and assistive-technology tests and their scope.

## Dynamic interaction and localization (URV-03)

Check modal focus entry/trap/return, first invalid field and error summary, live announcements for loading/results, and focus recovery after deleting the focused item. Do not add duplicate live regions where the pattern already announces. Loading overlays must not silently trap keyboard focus.

Exercise RTL with Arabic text, mixed-direction identifiers and numbers, long translated labels, dates and currency. Use logical spacing; isolate mixed-direction fragments where needed and do not blindly mirror logos, numbers or every icon. Verify sorting/date-entry behavior separately from text alignment. A tooltip or title attribute alone is insufficient access to truncated content on touch/keyboard.

Respect reduced-motion and forced-colors settings in custom components. A CSS background used as the only indicator may disappear in forced colors; verify a semantic alternative. Do not disable platform accessibility behavior to match a mockup.

## Visual acceptance (URV-04)

Use representative screens: dense table, long form, dialog, empty/error/loading views and a role-restricted action panel. Compare before/after in the installed theme at actual breakpoints and intermediate widths, after resize and after reload where device-class behavior differs. Include light/dark only when supported by the app, without inventing a dark-mode scope.

Prefer tokens and public pattern APIs. Fixed icon geometry, hairlines, zero values and content-driven breakpoints can be legitimate; document a local exception instead of treating every literal or media query as a platform violation. Scope any workaround to the observed component/version. For example, a List/flex child workaround or cache reload from a previous project is a diagnostic hypothesis until reproduced.

Report viewport, browser, theme, locale, state, expected behavior and observed result. Keep screenshots free of personal/production data when they enter reusable documentation.

## Sources and provenance

- [Official OutSystems UI release notes](https://www.outsystems.com/forge/component-overview/15931/outsystems-ui-odc) and [OutSystems UI agent documentation](https://github.com/OutSystems/outsystems-ui/blob/dev/docs-ai/llms.txt). The latter is a development branch; use the installed release's matching contract.
- W3C [contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance).
- Anonymized project observations reviewed 2026-11-22: action panels and required reason fields must be tested per role; private data must not enter reusable screenshots. Older stylesheet/load-order workarounds remain version-scoped observations.
