# Screen / block spec: <ScreenOrBlockName>

App: <App> · Module: <App>_Front_End | <App>_CW · Theme: <App>_Th (base: <Corporate/Global theme>) · Layout: Top Menu | Side Menu | Blank | Login
Author: <name/agent> · Date: <yyyy-mm-dd> · Status: draft | approved

## 1. Purpose
- User / role: <who>
- Goal: <what the user wants to get done here, in one sentence>
- Primary action: <the ONE main action>
- Entry points: <menu item, link from X, deep link with Id>

## 2. Anatomy
| Area | Content | Pattern / widget | Block (reuse or new) |
|---|---|---|---|
| Breadcrumbs | <Home › …> or none (top-level) | Breadcrumbs | layout |
| Title (H1) | <text> + status Tag? | Heading + Tag | — |
| Actions | primary: <…>; secondary: <…> | Buttons / overflow menu | — |
| Filters | <fields> | Search, Dropdown, Date Picker | <Concept>Filters (CW) |
| Content | <sections, cards, table…> | <Columns2 / Table / Gallery / Tabs…> | <Concept>Table (CW) |
| Footer actions | Cancel / Save | Buttons | — |

Custom components (no fitting pattern) and why: <none / …>

## 3. States
| Area | Loading | Empty (no data) | Empty (no results) | Error | No permission |
|---|---|---|---|---|---|
| <area> | skeleton rows | Blank Slate: "<text>" + <action> | "No results" + Clear filters | Alert + Retry | <message> |

Action feedback: <action> → Button Loading → success "<message>" / failure "<message>"

## 4. Responsive
| | Desktop | Tablet | Phone |
|---|---|---|---|
| Layout | <e.g. Columns3> | <Columns3 tablet-break-none> | <stacked> |
| Table mode | full | full / expandable | cards / expandable / scrollable; key columns: <…> |
| Hidden / moved | — | — | <Display/Move On Device …> |

## 5. Accessibility
- Heading outline: H1 <…> › H2 <…> › …
- Labels and helper texts: <all inputs labelled; helpers for …>
- Keyboard: <custom interactions and how they're operated>
- Focus management: <modal / sidebar open/close, after save>
- Color pairs not in the token guide (checked with contrast.mjs): <fg on bg = ratio>
- Announcements: <toasts / status regions>

## 6. Content and i18n
| Key | EN | AR | Notes |
|---|---|---|---|
| Title | | | |
| Empty state | | | |
| Errors | | | |
Formats: date <…>, number <…>, currency <…>. RTL notes: <icons to mirror, LTR fragments>

## 7. Data and blocks (hand-off to architecture)
- Blocks consumed and their inputs and events: <…>
- BL Service Actions behind each block (companion skill outsystems-architecture): <…>
- Roles: <…>

## 8. Acceptance
- [ ] Lint clean (no Blocker/Major) · [ ] contrast checked · [ ] phone/tablet/desktop verified (reload) · [ ] keyboard-only task done · [ ] empty/error/loading seen · [ ] both languages and directions checked


## Evidence and acceptance

- Platform/app type, installed versions/theme where relevant, target environment:
- Existing project decisions and authorized delivery scope:
- Requirement → element/contract → source of data → verification evidence:
- Concurrency, retry/unknown outcome, authorization and failure cases relevant to this change:
- Delivery status: prepared / model validated / merged / published / runtime verified (record only observed stages):
- Not tested, missing dependency or blocked evidence, and the exact next step:
