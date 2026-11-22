# Style guide architecture and governance

A design system only stays consistent if someone owns it and there's a path for change. This file covers how OutSystems factories structure, own and evolve a style guide. Sources: the OutSystems webinar "Building a Live Style Guide", the OutSystems blog "How to Manage Multiple Themes for Applications", community standards (e.g. Synobsys), the ITNEXT article "Style guides architecture in OutSystems 11", and our own projects.

## 1. What a style guide is in OutSystems
A **style guide** is the reusable implementation of a brand:
- **theme(s)**: tokens, fonts and global CSS;
- **layouts and templates**: screen and app templates;
- **patterns and blocks**: OutSystems UI patterns plus the brand's own reusable blocks;
- **resources**: logos, images and icons.

The **Live Style Guide** is an end-user app that *shows* all of it running (tokens, typography, components in every state, templates), so designers, developers and testers share one reference. OutSystems provides Live Style Guide starter components on Forge (O11 and ODC versions).

## 2. Choose a scenario
| Scenario | When | Cost |
|---|---|---|
| **Built-in** (OutSystems UI as is, Theme Editor for brand colors) | internal tools, prototypes, one app | lowest; upgrades are free |
| **Customize from built-in** (corporate theme inheriting OutSystems UI, overriding tokens and a few components) | **the default for most factories** | low; upgrades mostly free |
| **Clone a built-in style guide** (copy it and change it freely) | heavy brand divergence | high: you own every upgrade by hand. Avoid unless necessary |
| **From scratch** (own framework) | very specific product UI | highest; you lose pattern updates and accessibility fixes |

Prefer *customize*. Every clone or rewrite trades future OutSystems UI fixes (including accessibility fixes) for one-time freedom.

## 3. Reference architecture
```
Foundation:  OutSystems UI ─► <Org>_Th (corporate theme + layouts + resources) ─► <Org>_Pat (shared brand patterns/blocks, optional)
               └─► <SubBrand>_Th (optional, deltas only)
End-user:    <Org>_LiveStyleGuide (showcase + docs)        <App>_Th ─► <App> front-end modules
Templates:   <Org> app template + screen templates (start every new app from them)
```
- Shared **brand blocks** (a KPI card, a status chip, a page header) live in a Foundation patterns module or the corporate theme's library, **not** in one app's CW. A block takes the consumer's CSS, so it must rely only on tokens.
- A **custom application template** (O11: a custom app template; ODC: an app template or Theme Library) makes every new app start on the right theme, layout, login and menu.
- 3.0 projects can share the **Figma kit (OutSystems UI 3.0)** with designers. Designers prototype with the same tokens and components developers use.

## 4. Ownership and the change process
- **One style-guide team** (front-end and UX leads) owns the corporate theme, the brand patterns, the Live Style Guide and the token registry. App teams consume it.
- **Prefix registry**: the team publishes each module's acronym (e.g. `sfl` for SoccerFields, `sfb` for SoccerFields back office). Local classes use it (`.sfl-btn-tertiary`).
- **Promotion workflow** for a missing style:
  1. The app team builds it locally with its prefix, from tokens only, in its own module CSS (never inline).
  2. It requests promotion from the style-guide team, with the use case and screenshots.
  3. The team decides: reject (use an existing pattern), adapt, or add it to the theme or patterns (e.g. `.btn-tertiary`).
  4. When the new class ships, the app team replaces its local class with the shared one and deletes the local CSS.
- **Versioning**: give the corporate theme a version and changelog. Breaking visual changes (token renames, layout changes) get announced and a migration note. Run the linter and a visual regression check (screenshots of the Live Style Guide, light and dark, at three device sizes) before publishing a new theme version.
- **Quality gates** for theme and shared-block changes:
  - `lint-ui-css.mjs` clean (no Blocker or Major);
  - contrast checked for every new color pair;
  - keyboard and screen-reader smoke test;
  - the Live Style Guide updated.

## 5. Documenting the system
- The Live Style Guide (or a Storybook) shows, for each component: when to use it, its variants, its states (default, hover, focus, active, disabled, loading, error, empty), its accessibility notes, and the Style Classes or knobs it accepts.
- Keep a short **design-decision log** (brand overrides that deviate from OutSystems UI and why). It's the project-level precedence layer in this skill.
- Record the project's choices in its `AGENTS.md` so every AI agent applies them:
  - theme and version (Classic or 3.0);
  - layout;
  - prefix;
  - languages and directions;
  - dark-mode support.

## 6. Upgrades
- Keep OutSystems UI current: patterns, accessibility and RTL fixes arrive through it. Read the release notes, and test the Live Style Guide first.
- Major versions (Classic → 3.0): migrate app by app (it's optional, and both are supported). Follow osui-versions-and-migration.md, and accept the new defaults unless they conflict with the brand.
