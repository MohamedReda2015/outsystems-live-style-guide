# AGENTS.md: OutSystems Live Style Guide

<!-- Drop this file (or append it) at the root of any repository or workspace with OutSystems UI work.
     Read by Codex, Jules, Aider, Claude Code, Gemini CLI and other agents that honour AGENTS.md.
     Pairs with outsystems-architecture/adapters/AGENTS.md (architecture). -->

## OutSystems UI/UX standards
This workspace follows the **outsystems-live-style-guide** skill. If the folder isn't in this repository, change the path to where it's installed.

- Entry point: `outsystems-live-style-guide/SKILL.md`. Read it before any screen, block, theme, CSS, UX or OutSystems UI upgrade task.
- Always-on rules: `outsystems-live-style-guide/adapters/core-rules.md`.
- Details on demand: `outsystems-live-style-guide/references/`:
  - versions and migration;
  - tokens, theming, governance;
  - layout, responsive, accessibility;
  - patterns, components and forms;
  - UX writing and i18n;
  - lessons learned.
- Reviews: `outsystems-live-style-guide/references/review-checklist.md`. Cite rule IDs.
- CSS lint: `node outsystems-live-style-guide/scripts/lint-ui-css.mjs <files> [--osui 3] [--theme] [--rtl]` (Node 16+, no install).
- Contrast: `node outsystems-live-style-guide/scripts/contrast.mjs [--osui 3] <fg> <bg>`.
- Deliverables: `outsystems-live-style-guide/templates/` (screen spec, UI review report, Classic and 3.0 theme starters).

Project design decisions (precedence level 1; they override house defaults):
- **OutSystems UI version**: <Classic 2.x | 3.0>   ← agents must read this before giving any CSS or token advice
- Brand theme: <name>, base theme: <corporate theme>
- Layout: <Top Menu | Side Menu>, EnableAccessibilityFeatures: True
- Dark mode: <no | yes (SetDarkTheme), default = OS preference>
- Languages / directions: <en LTR, ar RTL>
- Custom-class prefix (module acronym): <sfl->
- Breakpoints: <OutSystems UI defaults | SetDeviceBreakpoints(…)>
