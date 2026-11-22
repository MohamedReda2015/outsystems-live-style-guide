# UI/UX review: <Application / screens / blocks>

Date: <yyyy-mm-dd> · Reviewer: <name/agent> · Scope: <screens, blocks, theme files> · Devices checked: desktop <w> / tablet <w> / phone <w> · Languages/directions: <en LTR, ar RTL>

## Summary
- Blockers: <n> · Major: <n> · Minor: <n>
- Top 3 user-facing risks: 1) <…> 2) <…> 3) <…>
- Verdict: ready / ready after blockers fixed / needs rework

## Findings (most severe first)
| # | Rule ID | Sev | Where (Module › Screen/Block › element or file:line) | Evidence (selector, ratio, screenshot, steps) | Fix (in tokens/patterns) |
|---|---|---|---|---|---|
| 1 | A11Y-05 | Blocker | App_Th.css:142 | `.btn:focus{outline:0}` with no replacement | remove it; theme focus ring `outline: var(--border-size-m) solid var(--color-primary)` |

## Automated checks
```
<node scripts/lint-ui-css.mjs output>
<node scripts/contrast.mjs output for key pairs>
```

## Manual checks
- Keyboard-only task "<task>": <pass/fail + notes>
- Screen reader spot check: <title, headings, labels, errors>
- 200% zoom / 320px reflow: <…>
- States seen: loading <✓/✗> · empty <✓/✗> · error <✓/✗> · no permission <✓/✗>

## Good practices observed
- <…>
