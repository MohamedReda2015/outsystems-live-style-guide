# Reusable blocks, buttons, forms, lists, tables, dashboards and feedback

## 1. Reusable UI blocks (CW / MCW)
- **One block, one job**, named by purpose with a `<Concept><Thing>` name (`RequestStatusTag`, `RequestSummaryCard`, `KpiCard`, `ConfirmDeleteModal`). Group blocks in folders by concept (companion skill).
- **Inputs configure, Events communicate.**
  - Parameters carry data and options (`Title`, `Value`, `IsCompact`, `ExtendedClass`).
  - Events report what happened (`OnSelect`, `OnSave`, `OnClose`).
  - A block never navigates and never depends on screen state.
- **Placeholders** are for slots (actions, custom content). That way consumers extend the block without forking it.
- Add an **`ExtendedClass`** text input appended to the root's Style Classes, so consumers can add spacing or layout without editing the block.
- Refresh data when inputs change (`OnParametersChanged`).
- The block **owns its states**: loading (skeleton or spinner), empty (Blank Slate), error (inline Alert + Retry) and populated. Consumers shouldn't have to build those around it.
- **CSS**: in the block's stylesheet only, with a prefixed root class (`.app-kpi-card`), tokens only. It must look right in *any* consuming app's theme, because the block takes the consumer's CSS. Test it in at least one other theme or app if it's shared.
- **Give shared blocks their own CSS API**, the same way OutSystems UI 3.0 does. Declare knobs on the block root that default to roles or tokens, and make every property read its knob. Consumers then restyle with variables, not by overriding your rules:
  ```css
  .app-kpi-card {
    --app-kpi-card-background: var(--color-background-surface, var(--color-neutral-0));
    --app-kpi-card-padding: var(--space-m);
    --app-kpi-card-value-color: var(--color-primary);
    background: var(--app-kpi-card-background);
    padding: var(--app-kpi-card-padding);
  }
  .app-kpi-card__value { color: var(--app-kpi-card-value-color); }
  /* consumer: .sales-kpis .app-kpi-card { --app-kpi-card-padding: var(--space-base); } */
  ```
  Document the knobs in the block Description and in the Live Style Guide.
- **Accessibility built in**: labels, roles, focus handling and `aria-*` via Extended Properties. Consumers can't fix these from outside.
- To rebuild a block, keep the block element (its key) and replace its contents. Deleting and recreating it breaks every consumer reference.
- Document each public block in its Description: purpose, inputs, events and an example.

## 2. Buttons and actions
| Kind | Look | Use |
|---|---|---|
| **Primary** | filled primary (`Is_Default` / `.btn-primary`) | the one main action of the view (Save, Submit, Create) |
| **Secondary** | outline (`.btn`: neutral-0 background, primary border and text) | alternatives (Cancel, Back, Export) |
| **Destructive** | error color (`.btn-error` in Reactive OSUI) | Delete or Revoke, always with confirmation |
| **Tertiary / link** | Link widget | low-emphasis navigation ("View all") |
| **Icon-only** | `.btn` + icon | only where well understood (close, edit, more), and **always** with an accessible name (`aria-label`) and a Tooltip |

In **OutSystems UI 3.0**, buttons expose knobs: `--osui-btn-background`, `--osui-btn-color`, `--osui-btn-border-color`, `--osui-btn-hover-background`, `--osui-btn-min-height` (40px), `--osui-btn-primary-color` (`--color-text-light`), `--osui-btn-error-background`… Restyle buttons through them in the theme, **on the button class**, not on `:root`, because `.btn` re-declares them. Check primary button labels in dark mode: if your dark `--color-primary` becomes light, the white label disappears.

Rules:
- **One primary per view** (screen, modal, card). Put it at the end side (right in LTR, left in RTL). In a footer, Cancel goes to its start side.
- Button text is a verb plus an object: "Save request", "Approve", "Export to Excel". Never "OK" or "Submit" when a precise verb exists.
- Sizes: default height 40px. Use `.btn-small` only in dense tables, and `.btn-large` for hero CTAs and touch-first screens.
- Show feedback for slow actions with **Button Loading**, and disable re-submission while the action runs.
- **Destructive actions**:
  - confirm them in a Modal whose title states the consequence ("Delete request REQ-1042?");
  - the body says what will be lost;
  - the buttons are Cancel (secondary) and "Delete" (destructive);
  - offer Undo instead, if the action can be reversed cheaply.
- Disabled buttons explain why, through a Tooltip or helper text ("Complete all required fields to submit"). Better still, keep the button enabled and validate on click.

## 3. Forms
**Layout**
- Labels go **above** inputs (they scan better, translate better and work on phone). Use the Form widget, so the built-in validation works.
- Use one column by default. Use two columns (Columns2, `.gutter-base`) only on desktop for short, related fields (first and last name, city and postal code). Stack them on phone.
- Order fields as the user thinks of them, and group them with Fieldset or Section headers. Put long forms over 12–15 fields in a Wizard or Sections with a Section Index.
- Size inputs to the expected content: a postal code input isn't full width.
- Use **helper text** (`.font-size-xs text-neutral-7`, under the input) for format hints. Never rely on placeholders for instructions.

**Inputs**
- Use the right widget and type: Email, Phone, Number, Password (with a show/hide toggle), Date Picker, Text Area (with Character Count when there's a limit).
- In 3.0, form controls default to the **Soft** shape (8px). Change shape app-wide with `.shape-soft` / `.shape-round` / `.shape-rectangular` or `--border-radius-default`, never control by control.
- Mark mandatory fields with the Mandatory property (a red `*`). If most fields are required, mark the optional ones instead ("(optional)"), and say so at the top.
- Default values only when most users keep them. Never preselect consent.
- Read-only values in a form show as text (label + value), not as disabled inputs. Disabled inputs have poor contrast and look broken.

**Validation**
- Validate on submit with the built-in Form validation (`Form.Valid`, per-input `Valid` + `ValidationMessage`). Then validate on blur, for fields the user has already touched.
- Repeat every validation on the server in BL. Client validation is only UX (companion skill).
- Messages say what's wrong and how to fix it, next to the field (12px, error color, `.ValidationMessage`). With several errors, show a summary Alert at the top and move focus to the first invalid field.
- Keep the user's input after an error. Never clear the form.

**Submit**
- Use Button Loading while saving, and prevent double submission.
- On success, show a Feedback Message ("Request REQ-1042 submitted") and navigate to the record or list.
- On failure, show an Alert with the reason and the next step, and keep the data.

## 4. Lists and tables
- Use the **Table** widget for comparable records, and **List** + Cards for visual or heterogeneous items.
- Always include:
  - **pagination** (or Load more / infinite scroll on mobile), with the Max Records of the aggregate or data action matching the page size;
  - **sorting** on the meaningful columns;
  - a **search/filter** row above when there are more than about 20 items;
  - a **count** ("124 requests").
- **Empty states**, each different:
  - *No data yet* → Blank Slate + a primary action ("Create your first request").
  - *No results for the current filters* → a message + "Clear filters".
  - *Error loading* → an Alert + "Retry".
- Loading: show skeleton rows or a spinner inside the table area, and keep the header visible. Use `IsDataFetched` / the `.isDataFetched` checks in Reactive, so "empty" never flashes before the data arrives.
- Columns:
  - left-align text, right-align numbers and amounts (with tabular figures if available);
  - dates use one format app-wide;
  - status shows as a Tag;
  - row actions go at the end (one icon or an overflow menu).
- Row click opens the detail, and is also reachable by keyboard (a link on the main column).
- Show selected rows with `--color-primary-selected`. Use zebra striping (`.table-records-stripping` in Web) only on wide dense tables.
- On phone, choose a responsive mode (see responsive.md), and decide which 2–3 fields show.
- **Reactive List with a flex or grid layout**: add `.list > script { display:none }`, because the List renders an inner script element that otherwise becomes a grid cell.

## 5. Cards and dashboards
- A card is a `.card` (neutral-0 surface, `--border-radius-soft`, `--shadow-xs`/`s`) with `--space-m` padding (`--space-base` on phone). It has a title (H5/H6 semi-bold), content, and optional footer actions.
- KPI cards contain:
  - a label (`.font-size-s text-neutral-8`);
  - a value (`.font-size-display` or `.heading2`, `font-semi-bold`);
  - an optional trend (an icon **and** text, e.g. "▲ 12% vs last month", in the success or error color);
  - an optional link to the detail.
  Use 2–4 per row on desktop, 2 on tablet and 1–2 on phone (Gallery).
- **Charts** (OutSystems Charts / Highcharts):
  - pick the type by the question being asked (trend → line, comparison → bar, part-to-whole with 5 or fewer parts → donut/pie);
  - use the extended palette in a fixed order for categories, with the same category always in the same color;
  - label the axes and units;
  - show values on hover and focus;
  - don't use more than 6 colors per chart; group the rest into "Other";
  - provide a text summary or data table for accessibility;
  - give every chart its own loading, empty and error state.
- **Third-party widgets** (OutSystems Charts/Highcharts, maps, rich-text editors, date libraries) apply their own fonts and colors inline. Configure them through their own options (series colors, font family) from the same tokens, e.g. read the CSS variable value with `getComputedStyle` in a client action. Don't fight their inline styles with `!important`. Check them separately in dark mode.
- Dashboards answer "what needs my attention?" first: alerts and overdue items go at the top-left (top-right in RTL), then KPIs, then trends.

## 6. Feedback and system states
| Situation | Pattern | Rules |
|---|---|---|
| action succeeded | Feedback Message / Message node (Success) | short, specific ("Saved"), auto-dismiss in ~5s, announced to screen readers |
| action failed | Message (Error) or inline Alert (Error) | what failed + what to do; persistent until dismissed |
| warning before risk | Alert (Warning) inline, or a confirm Modal | dark text on warning colors |
| informational banner | Alert (Info) | dismissible if not critical |
| page or section loading | skeleton / spinner in the section; Button Loading for actions | no full-page blocking spinners for partial loads |
| empty | Blank Slate | illustration optional, next action mandatory |
| no permission | Blank Slate or a dedicated screen: "You don't have access to X. Contact Y." | never a raw error or a blank page |
| unexpected error | the app's global exception handler screen with a friendly message and a reference id | log the details on the server, and never show stack traces |
| offline (mobile) | an inline banner + disabled online-only actions | show the last sync time |

Rules:
- Every async action has visible feedback within about 100ms (a pressed state, a spinner or a skeleton).
- Don't stack more than one toast. Replace the old one.
- Errors never blame the user ("You entered…"). They state the problem and the fix.
