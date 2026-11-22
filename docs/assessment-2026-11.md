# Research and assessment: OutSystems UI/UX style guide (November 2026)

This assessment covers the style guide implementation and skill as they stood before version 2.0:
- `outsystems-live-style-guide` v1.0.0;
- the `OutSystemsUI_StyleGuide_Reference.md` digest.

It records the sources researched, the gaps and problems found, and the recommendations that version 2.0.0 of the skill implements.

## 1. Sources

### Official OutSystems (primary)
- **OutSystems UI 3.0 announcement** (OutSystems forums, UI Components team).
  - New design-token theme for O11 and ODC; a component CSS API (~390 `--osui-*` properties, 79 components); dark mode; Inter font.
  - Classic theme kept (`OutSystemsUIClassic`); retired variables; the Storybook is now the official docs; a Figma kit.
- **`OutSystems/outsystems-ui` GitHub repository**:
  - `CSS-ARCHITECTURE.md` (four-tier model, theming invariants, dark mode on `<html>`);
  - `THEME-MIGRATION-GUIDE.md` (retired names, value changes, gotchas, verification);
  - `.claude/skills/osui-design-tokens`;
  - `.claude/skills/osui-theme-migration` (variable-mapping, recipes);
  - ADR-0010 (shape and radius), ADR-0018 and ADR-0020 (focus ring scope and renames);
  - `docs-ai/llms.txt` (+ tokens, utilities, components, patterns, blocks, platform).
- **npm packages**, analyzed directly:
  - `outsystems-ui@3.0.0` and `@2.30.0` (`dist/O11.OutSystemsUI.css/.js`);
  - `outsystems-design-tokens@2.6.0` (`dist/_root.css`, `_utilities.css`).
- **ODC documentation, Accessibility**: `EnableAccessibilityFeatures`, the Accessibility Conformance Report (WCAG 2.2 A/AA, VPAT), page titles (the login title is blank by default), `ToggleTextSpacing`, label binding, headings via the HTML Element widget, and the UI patterns accessibility reference.
- **ODC documentation, platform pages** (via `llms-platform.txt`): Screens (LayoutTopMenu placeholders), Reuse UI, Themes (Theme Editor, Theme Library, grid settings), the pattern catalog and its six categories.
- **OutSystems UI Web live style guide** (outsystemsui.outsystems.com): the base theme CSS and the DeviceDetection script (read earlier in this conversation).
- **OutSystems blog**, "How to Manage Multiple Themes for Applications" (front-end architecture, the Live Style Guide, runtime theming through a variable stylesheet).

### Community and practitioner (secondary; verified where possible)
- OutSystems forum, "How does CSS priority work… (Theme vs Screen vs Web Block)" (2025):
  - MVP correction that block CSS loads before theme CSS;
  - the theme's hand-written section beats its Theme Editor section.
- OutSystems forums on RTL:
  - the Dropdown Search `textDirection` workaround;
  - popups ignore locale-scoped CSS;
  - the RTL/LTR Bug Inspector (Forge).
- Synobsys, "OutSystems standards and guidelines" (StyleGuide team, module acronym prefixes, the promotion workflow for new classes).
- ITNEXT, "Style guides architecture in OutSystems 11" (four style-guide scenarios, custom app templates).
- The OutSystems webinar "Building a Live Style Guide" (ownership by one team, templates, a patterns repository).
- Forge listings: Live Style Guide (O11/ODC) and accessibility helper components (e.g. Accessible AF), which shows audits still find issues in OutSystems UI apps.

### Industry standards
- **WCAG 2.2** (2.4.11 Focus Not Obscured, 2.5.7 Dragging Movements, 2.5.8 Target Size Minimum, 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication).
- **WCAG 1.4.11** for focus and border contrast.
- The European Accessibility Act (applicable since June 2025).
- Design-token practice: three tiers (primitive → semantic → component), roles over raw values, the CSS custom-property API per component.

## 2. Assessment of the previous skill and style guide

| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | **Version blind spot**: the skill only modelled OutSystems UI Classic. On 3.0 (the default for new apps), its recommended `--font-size-*`, `--shadow-*`, `--border-size-*`, palette shades and `-light` variables are retired and **silently dropped** | Critical | 3.0 bundle: none of those variables are defined; the official migration guide |
| 2 | Values presented as universal changed in 3.0: `--color-neutral-0` isn't white (#f6f7fa); radius soft 4 → 8px; H1 32 → 28px; primary #1068eb → #105cef; system font → Inter | High | the 3.0 `:root` |
| 3 | No model of the 3.0 **component CSS API** (`--osui-*`) or the four tiers; the skill pushed class overrides, which 3.0 says to avoid | High | CSS-ARCHITECTURE.md |
| 4 | Accessibility missed **`EnableAccessibilityFeatures`** (off by default: no focus ring, no skip link), the ACR/WCAG 2.2 baseline, the real client-action list (`ToggleTextSpacing` missing), the blank login title, and the Alert roles | High | ODC accessibility docs; ADR-0020 |
| 5 | The focus-ring guidance was Traditional-Web-specific (#a3daff). Reactive 2.x uses #ffd337 (1.44:1), and 3.0 uses #b5c0f7 (1.77:1); all fail 3:1 against white | Medium | the bundles; contrast computed |
| 6 | No 3.0 contrast data. 3.0 fixes semantic text on light backgrounds (≈5:1), but `--color-success` (2.74) and `--color-warning` (1.41) fail as text, and borders/inputs (1.45) still fail 3:1 | Medium | computed from the 3.0 tokens |
| 7 | The RTL claim "left/right utilities don't flip" is only true for Classic; 3.0 utilities are logical. Known community RTL issues (Dropdown Search, popups) were missing | Medium | 2.30 vs 3.0 CSS; forums |
| 8 | Reactive breakpoints were unverified ("check your version"). The source shows phone < 700, tablet ≤ 1024 (`SetDeviceBreakpoints`); Traditional Web uses 420/1024 | Medium | the bundles' JS |
| 9 | No style-guide **governance**: ownership, prefix registry, promotion workflow, Live Style Guide, templates, versioning, upgrade policy | Medium | webinar, Synobsys, ITNEXT, blog |
| 10 | No dark-mode guidance (3.0 `SetDarkTheme`, `.os-dark-theme` on `<html>`, the button-label and link-color traps) | Medium | migration guide |
| 11 | The pattern catalog reflected the Traditional Web style guide only; Reactive/ODC categories and patterns were missing (Master Detail, Notification, Bottom/Action Sheet, Overflow Menu, Pagination, Submenu, Rating, Dropdown Search/Tags, Date Picker Range, Month Picker…) | Medium | llms-platform.txt |
| 12 | CSS load order: the skill had block-before-theme (correct). Missing: theme chain order, hand-written vs Theme Editor sections, and the fact that community answers conflict | Low | forum |
| 13 | The linter couldn't detect 3.0 issues (retired names, bare tokens, the neutral-0 trap) or RTL physical properties; its suggestions were Classic-only | Medium | the scripts |
| 14 | The digest `OutSystemsUI_StyleGuide_Reference.md` describes Classic / Traditional Web only and doesn't say so prominently | Low | the file |
| 15 | No guidance for third-party widgets (charts, maps) that inline their own styles, or on giving custom blocks their own CSS API | Low | migration guide; 3.0 pattern |

## 3. Recommendations (all implemented in skill v2.0.0)
1. Make version detection **Step 0**, and keep dual token documentation (Classic in design-tokens.md; 3.0 in the new osui-versions-and-migration.md).
2. Teach the 3.0 authoring order: roles → `--osui-*` knobs → `--token-*` **with fallback** → local literal. A theme overrides variables only.
3. Add a retired → replacement map and a migration procedure (triage: stopped working / collides / just looks different; accept new defaults by default).
4. Accessibility:
   - make `EnableAccessibilityFeatures` mandatory (Blocker);
   - adopt WCAG 2.2 AA with the six new criteria;
   - harden the default input borders and focus rings in every theme starter;
   - list the verified client actions;
   - require titles on all screens, including login.
5. Add a style-guide governance reference: scenarios, architecture, a style-guide team, a prefix registry, a promotion workflow, versioning, quality gates and upgrades.
6. Add dark mode, runtime multi-brand, layers (`--layer-*`), safe areas, and a CSS API for custom blocks.
7. Update the patterns catalog with the Reactive/ODC categories and new patterns, plus pointers to the Storybook and `docs-ai` cards.
8. Correct RTL (version-dependent utilities, logical properties, known issues, tooling) and the breakpoints (verified values).
9. Extend the tooling:
   - linter `--osui 3` (TOK-08/09/10), `--rtl` (TXT-02) and LES-18;
   - version-aware suggestions;
   - `tokens-osui3.json` generated from the official packages;
   - a contrast checker `--osui 3`;
   - a 3.0 theme starter;
   - new examples and an eval case.
10. Record the version and decisions in each project's AGENTS.md (the adapters were updated).

## 4. Open items to re-check on future OutSystems UI releases
- The focus-variable renames (`--osui-color-focus` etc., ADR-0020) were on the repository's dev branch and not yet in the published 3.0.0 bundle. The theme starter sets both names.
- The dark-mode client action is `SetDarkTheme` in the 3.0.0 code; the announcement says "SetDarkMode". Use whatever the Toolbox shows.
- Re-run `contrast.mjs --osui 3 --audit` after each OutSystems UI upgrade, and regenerate `tokens-osui3.json` from the new packages if values change.


## Reliability review — 2026-11-22

See [verification and reliability](../references/verification-and-reliability.md) for primary sources, provenance and acceptance cases. Platform facts are separated from house policy and anonymized project observations. A community mirror is not an official publication; installed contracts and version-matched official sources take precedence. Runtime claims were not retested in a live tenant during this documentation review.

## Eight-skill delivery review — 2026-11-22

- Official: [OutSystems testing guidelines](https://success.outsystems.com/documentation/11/testing_apps/outsystems_testing_guidelines/); [develop for testability](https://success.outsystems.com/documentation/11/testing_apps/develop_for_testability/); [ODC UI testing](https://success.outsystems.com/documentation/outsystems_developer_cloud/testing_apps/web_ui_testing/).
- Standard: [Scrum Guide](https://scrumguides.org/scrum-guide.html); W3C [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) and [accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) where UI criteria apply.
- Engineering recommendations and generalized project observations: source/app baselines, historical identity, complete consumer imports, action-specific fields, mock/live consistency and honest blocked-work reporting. See `references/verification-and-reliability.md`; these recommendations are distinguished from platform facts.
