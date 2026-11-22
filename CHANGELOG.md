# Changelog

## Unreleased — reliability review (2026-11-22)

- Clarified platform facts versus house/project conventions and verification evidence.
- Added domain-specific reliability guidance, source provenance and acceptance cases.
- Added review/template checks and corrected over-broad or inconsistent claims.
- Extended repository consistency checks to the new reliability rule IDs and aligned contributor guidance with the full checkout.


All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/). The version is also in the `metadata.version` field of `SKILL.md`.

## [Unreleased]

## [2.0.0] - 2026-11-22
Research-driven update for **OutSystems UI 3.0**, and the first public release. Background and sources: `docs/assessment-2026-11.md`.

**Renamed** from `outsystems-ui-ux` to **`outsystems-live-style-guide`** (display name "OutSystems Live Style Guide"). This covers the skill name, folder, repository, Cursor adapter file and package. If you installed the old name, remove `~/.claude/skills/outsystems-ui-ux` (or the old Claude.ai skill) to avoid two copies.

**Install:** download `outsystems-live-style-guide.zip` from this release and upload it to Claude.ai / Claude Desktop (Settings → Capabilities → Skills), or clone the repository into `~/.claude/skills/` for Claude Code. Other agents: see the README.

### Added
- **OutSystems UI 3.0 support** (`references/osui-versions-and-migration.md`):
  - version detection;
  - the four-tier styling model (`--osui-*` knob → role → `--token-*`);
  - roles and token scales;
  - a retired → replacement map;
  - gotchas;
  - a migration procedure;
  - pointers to OutSystems' official agent docs (`docs-ai/llms*.txt`).
- `references/style-guide-governance.md`: style-guide scenarios, Live Style Guide, ownership, prefix registry, promotion workflow, versioning and upgrades.
- Dark mode guidance (`SetDarkTheme`, `.os-dark-theme` on `<html>`), runtime multi-brand theming, layers (`--layer-*`), safe areas, and CSS APIs for custom blocks.
- WCAG 2.2 AA criteria, `EnableAccessibilityFeatures`, the OutSystems Accessibility Conformance Report, the verified accessibility client actions, and contrast data for both versions.
- The Reactive/ODC pattern catalog (six categories, newer patterns) with ARIA notes.
- Linter:
  - `--osui 3` mode: TOK-08 retired variables, TOK-09 `--token-*` without fallback, TOK-10 `neutral-0` used as white;
  - `--rtl` mode (TXT-02);
  - LES-18 (`border-radius: 100%`);
  - version-aware fix suggestions.
- `contrast.mjs --osui 3`, `scripts/tokens-osui3.json`, `templates/theme-starter-osui3.css`, new examples and the `migrate-css-to-osui3` eval case.
- New checklist rules: TOK-08…11, THM-08…11, RSP-08, A11Y-15…17, GOV-01…05. Lessons LES-15…24.
- Repository files: LICENSE (MIT), third-party notices, contributing guide, CI and a test suite.

### Changed
- `SKILL.md`: Step 0 (know the OutSystems UI version), tokens cheat sheet per version, updated principles, workflows and reference map.
- CI and release workflows use `actions/checkout` and `actions/setup-node` v7, and test on Node 22 and 24. The tools still run on Node 18+.
- README links the companion skill [outsystems-architecture](https://github.com/MohamedReda2015/outsystems-architecture).
- Responsive: verified breakpoints (Reactive phone < 700 / tablet ≤ 1024; Traditional Web 420/1024) and `SetDeviceBreakpoints`.
- RTL: utility classes are physical in Classic and logical in 3.0; known community issues (Dropdown Search, popups) and tooling.
- Theming: Theme Editor vs hand-written section precedence; CSS load order with caveats.
- Adapters (core rules, AGENTS.md, Cursor, Copilot) now carry the version rule.

### Fixed
- Classic heading sizes: desktop H1 is 32px (an earlier digest listed the phone sizes).
- Focus-ring guidance is now per platform and version, not Traditional Web only.

## [1.0.0] - 2026-11-22
### Added
- Initial skill:
  - `SKILL.md`;
  - references for tokens, theming, layout, responsive, accessibility, patterns, components and forms, UX writing/i18n, lessons learned, and a review checklist;
  - templates;
  - adapters;
  - `lint-ui-css.mjs` and `contrast.mjs`;
  - three eval cases.
