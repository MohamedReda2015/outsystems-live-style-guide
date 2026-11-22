# OutSystems Live Style Guide

[![CI](https://github.com/MohamedReda2015/outsystems-live-style-guide/actions/workflows/ci.yml/badge.svg)](https://github.com/MohamedReda2015/outsystems-live-style-guide/actions/workflows/ci.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![OutSystems UI](https://img.shields.io/badge/OutSystems%20UI-Classic%202.x%20%7C%203.0-0f54da)
![WCAG](https://img.shields.io/badge/WCAG-2.2%20AA-2b7a3b)
![Node](https://img.shields.io/badge/node-%3E%3D18-555)

**An agent-independent skill that teaches AI coding agents (and people) to design, build, review and migrate OutSystems user interfaces consistently.** It's grounded in the OutSystems UI framework: design tokens, themes, patterns, responsive design, WCAG 2.2 AA accessibility and style-guide governance.

It works with **Claude Code, Claude.ai, Cursor, GitHub Copilot, Codex, Gemini CLI, Aider** and any custom LLM agent. It's plain Markdown plus two dependency-free Node.js tools: a **CSS token linter** and a **WCAG contrast checker**.

> Not affiliated with or endorsed by OutSystems. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
>
> The name follows the OutSystems *Live Style Guide* practice: one shared, living reference for a brand's themes, patterns and rules. This repository is the **agent-readable** version of that practice. It isn't the OutSystems Forge "Live Style Guide" component, and it works alongside one (see [`references/style-guide-governance.md`](references/style-guide-governance.md)).

---

## Why

OutSystems factories share themes and blocks across many teams and apps. The typical failures are:
- **Hard-coded values** (`#1068eb`, `margin: 13px`): rebranding becomes a hunt, and apps drift apart.
- **Overridden framework classes** from blocks and screens: they break in other apps' themes.
- **OutSystems UI 3.0** (2026) retired `--font-size-*`, `--shadow-*`, `--border-size-*` and palette shades. CSS that still uses them is **silently dropped**.
- **Accessibility gaps**: the layout's accessibility features are off by default, and several default colors fail WCAG contrast.
- **Missing states**: no empty, error or loading state; no phone layout; RTL glitches.

This skill gives an agent the rules, the reasoning, verified values for **both OutSystems UI Classic (2.x) and 3.0**, and tools to check its own output.

## What's inside

| Area | Highlights |
|---|---|
| **Versions and migration** | how to detect Classic vs 3.0; the 3.0 four-tier model (`--osui-*` knob → role → `--token-*`); roles and token scales; a retired → replacement map; migration gotchas |
| **Design tokens** | color, type, spacing, radius, elevation, layers and layout variables for both versions, with contrast data |
| **Theming** | the theme chain, Theme Editor vs hand-written sections, CSS load order, prefixes, component knobs, dark mode, runtime multi-brand themes, fonts, icons |
| **Governance** | style-guide scenarios, the Live Style Guide, ownership, prefix registry, the promotion workflow, versioning, upgrades |
| **Layout and responsive** | page anatomy and placeholders, menus, screen types, verified breakpoints (`SetDeviceBreakpoints`), Columns breaks, responsive tables, safe areas |
| **Accessibility** | `EnableAccessibilityFeatures`, WCAG 2.2 AA (including the six new criteria), focus, forms, ARIA, an audit procedure |
| **Patterns and components** | the full Reactive/ODC and Web pattern catalogs with a chooser; blocks with their own CSS API; forms, tables, dashboards, feedback states |
| **UX writing and i18n** | microcopy, formats, multilingual apps, RTL/Arabic (version differences, known issues) |
| **Review** | 110+ rule IDs with severities, 24 lessons learned, templates for screen specs and review reports |
| **Tools** | `lint-ui-css.mjs` (Classic or `--osui 3`, `--theme`, `--rtl`, `--json`, CI exit codes) · `contrast.mjs` (`--suggest`, `--audit`) |

## Quick start

### Claude Code
```bash
git clone https://github.com/MohamedReda2015/outsystems-live-style-guide.git ~/.claude/skills/outsystems-live-style-guide       # all projects
# or, for one project:
git clone https://github.com/MohamedReda2015/outsystems-live-style-guide.git .claude/skills/outsystems-live-style-guide
```
The skill triggers automatically on OutSystems UI work (screens, themes, CSS, accessibility, migrations).

### Claude.ai / Claude Desktop
Download `outsystems-live-style-guide.zip` from the [latest release](https://github.com/MohamedReda2015/outsystems-live-style-guide/releases/latest) and upload it under **Settings → Capabilities → Skills**.

### Other agents
| Agent | Setup |
|---|---|
| Codex, Gemini CLI, Aider, Jules, other `AGENTS.md` readers | Put this folder in your repository and copy [`adapters/AGENTS.md`](adapters/AGENTS.md) to the repository root. **Fill in the project decisions**, above all the OutSystems UI version. |
| Cursor | Copy [`adapters/cursor/outsystems-live-style-guide.mdc`](adapters/cursor/outsystems-live-style-guide.mdc) to `.cursor/rules/` |
| GitHub Copilot | Copy [`adapters/copilot-instructions.md`](adapters/copilot-instructions.md) to `.github/copilot-instructions.md` |
| Claude API / Agent SDK / custom agents | Put [`adapters/core-rules.md`](adapters/core-rules.md) in the system prompt, and give the agent read access to `references/` and a tool to run `node scripts/*.mjs` |

**Suggested multi-agent split:**
- UX designer: patterns, layout and writing references; produces a screen spec.
- UI builder: tokens, theming and responsive references; lints everything it touches.
- Accessibility reviewer: the checklist and both tools; blocks on any Blocker.
- Style-guide steward: the governance reference; reviews theme changes.

## Example prompts
- "Build the requests list screen for our Arabic/English portal: phone and desktop."
- "Review this block's CSS. QA says it has accessibility issues."
- "We switched to the OutSystems UI 3.0 theme and the cards lost their shadows. Fix the CSS."
- "Our brand book says warning text is #F59F00 on white. Write the banner CSS."
- "Set up dark mode and a tenant-specific primary color."

## Tools

Requires Node.js 18+. There's nothing to install.

```bash
node scripts/lint-ui-css.mjs <css|html|folder> [--osui 3] [--theme] [--rtl] [--json] [--min-severity major]
node scripts/contrast.mjs [--osui 3] <foreground> <background>      # hex or token names
node scripts/contrast.mjs [--osui 3] --suggest <background>         # which tokens can be text on it
node scripts/contrast.mjs [--osui 3] --audit                        # the whole palette
```

```text
$ node scripts/lint-ui-css.mjs scripts/examples/classic-to-osui3.css --osui 3 --rtl
MAJOR   TOK-08  scripts/examples/classic-to-osui3.css:5  .app-request-card
        --shadow-s is retired in OutSystems UI 3.0: the declaration is silently dropped
        fix: use --token-elevation-1
MAJOR   TOK-09  scripts/examples/classic-to-osui3.css:18  .app-request-card__status
        var(--token-text-danger) has no fallback: … resolves only in dark mode (or never)
        fix: write var(--token-text-danger, <value>) or use the --color-*/--border-radius-* role instead
...
1 file(s) · 0 blocker · 6 major · 4 minor · OutSystems UI 3.0 rules · RTL checks

$ node scripts/contrast.mjs --osui 3 success white
success (#4aae83) on white (#ffffff) → 2.74:1
  normal text AA (4.5) FAIL · large text AA (3) FAIL · UI/non-text AA (3) FAIL
```

- Exit code `1` means Blocker or Major findings, or a failing contrast pair, so the tools can gate CI.
- Suppress a justified finding with `/* lint-ignore THM-02: reason */` on that line.
- If you install the repository with npm, they're also available as `osui-lint-css` and `osui-contrast`.
- For your brand, edit the values (not the names) in `scripts/tokens.json` (Classic) or `scripts/tokens-osui3.json` (3.0).

## Compatibility
| | Supported |
|---|---|
| Platforms | OutSystems 11 (Reactive Web, Mobile, Traditional Web), OutSystems Developer Cloud (ODC) |
| OutSystems UI | Classic 2.x (Web style guide and Reactive 2.x) and 3.0 (design-token theme; values from `outsystems-ui@3.0.0`, `outsystems-design-tokens@2.6.0`) |
| Accessibility target | WCAG 2.2 AA |
| Tools | Node.js 18+ (tested in CI on 22 and 24, the current LTS lines); no dependencies |

## Repository layout
```
SKILL.md                     entry point loaded by agents (Step 0 version check, principles, cheat sheets, workflows, reference map)
references/                  detailed guidance, loaded on demand (12 files)
templates/                   screen spec, UI review report, Classic and 3.0 theme starters
scripts/                     lint-ui-css.mjs, contrast.mjs, token sets, examples
adapters/                    core rules + AGENTS.md, Cursor and Copilot adapters
evals/                       realistic test prompts with graders (claude plugin eval format)
tests/                       node:test suite (tools, structure, rule IDs, links, privacy)
docs/assessment-2026-11.md   research sources and the gap assessment behind v2.0
```

## Companion skill
This skill covers what users see. For architecture (Architecture Canvas, the Front_End → CW → BL → CS module pattern, data, logic, integrations, security and deployment), use the companion skill **[outsystems-architecture](https://github.com/MohamedReda2015/outsystems-architecture)**. The two skills are designed to load together: this one decides how screens and blocks look and behave, and the architecture skill decides where they live.

## Contributing
Corrections, lessons learned, new rules and adapters for more agents are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md). Facts must come from a primary source, state which OutSystems UI version they apply to, and contain no client data. Run `npm test` before opening a PR.

## License
[MIT](LICENSE). The OutSystems UI token values are derived from BSD-3-Clause packages by OutSystems; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Version history: [CHANGELOG.md](CHANGELOG.md).
