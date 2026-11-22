# OutSystems UI pattern catalog

Source: the OutSystems UI Web live style guide (outsystemsui.outsystems.com/WebStyleGuidePreview), read November 2026. Reactive and ODC OutSystems UI 2.x have the same concepts, sometimes with renamed or extra patterns, e.g.:
- Dropdown Search and Dropdown Tags (instead of Dropdown Select);
- Date Picker Range;
- Notification;
- Overflow Menu, Bottom Sheet, Rating, Stacked Cards, Popover, Submenu.

Check the Toolbox in Service Studio for your version. The **CSS** column lists the classes the pattern renders. Use them to style a pattern from the theme, and never reuse them for custom components.

**Reactive and ODC catalog (official, OutSystems UI 2.x/3.0)**: the Toolbox groups patterns in six categories, which differ from the Web style guide's groups below. Patterns marked ★ have no Traditional Web equivalent in sections 1–7.
- **Adaptive**: Columns · Display on Device · Gallery · ★Master Detail
- **Content**: Accordion · Alert · Blank Slate · Card · Card Background · ★Card Item · Card Sectioned · Chat Message · Flip Content · ★Floating Content · ★List Item Content · Section · ★Section Group · Tag · Tooltip · User Avatar
- **Interaction**: ★Action Sheet · Animate · Animated Label · ★Bottom Sheet · Carousel · Date Picker · ★Date Picker Range · ★Dropdown Search · ★Dropdown Tags · Floating Actions · Input with Icon · Lightbox Image · ★Month Picker · ★Notification · Range Slider (+ Interval) · ★Scrollable Area · Search · Sidebar · ★Stacked Cards · Time Picker · Video
- **Navigation**: ★Bottom Bar Item · Breadcrumbs · ★Pagination · Section Index · ★Submenu · Tabs · Timeline Item · Wizard (and ★Overflow Menu)
- **Numbers**: Badge · Counter · Icon Badge · Progress Bar · Progress Circle · ★Rating
- **Utilities**: Align Center · Button Loading · ★Center Content · ★Inline SVG · ★Margin Container · ★Mouse Events · Separator · ★Swipe Events · ★Touch Events

The exact props, events, CSS classes and (3.0) `--osui-*` knobs of every pattern are in the OutSystems UI Storybook and in `docs-ai/llms-components.txt` / `llms-patterns.txt` of the `OutSystems/outsystems-ui` repository. Read the card for a pattern before configuring it from memory. Per-pattern ARIA behavior is in the official *UI patterns accessibility reference*.

Reactive-only patterns, when to use them:
| Pattern | Use it when |
|---|---|
| Master Detail | list + detail side by side on desktop, stacked on phone (inbox, records). Manage focus with `MasterDetailSetContentFocus` |
| Notification | transient, non-blocking message anchored to a screen edge (replaces custom toasts) |
| Bottom Sheet / Action Sheet | mobile-first contextual actions or content from the bottom (instead of a desktop-style modal on phone) |
| Overflow Menu | "more actions" (⋯) for secondary or row actions |
| Dropdown Search / Tags | single searchable / multi-select with chips (replaces Dropdown Select) |
| Date Picker Range / Month Picker | a period selection (reports, filters) |
| Pagination | page navigation for lists and tables (with page size) |
| Submenu | second-level menu entries in the header or side menu |
| Rating | read-only or interactive star rating (needs a text equivalent for screen readers) |
| Stacked Cards | a stack of cards on mobile (check the Storybook for its interaction before using) |
| Scrollable Area | a fixed-height region that scrolls (keep it keyboard-focusable) |
| Section Group | groups related Sections (pairs with Section Index) |

## Contents
1. Content · 2. Controls · 3. Navigation · 4. Numbers · 5. Structure · 6. Responsive · 7. Utilities · 8. Layout and Emails · 9. Chooser

---

## 1. Content
| Pattern | Use it when | Options | CSS anatomy |
|---|---|---|---|
| **Accordion** | show a summary first, expand the details (FAQs, grouped settings) | Multiple Items; per item Is Open, Is Disabled | `.accordion` › `.accordion-item(.is--open|.is--closed|.is--disabled)` › `.accordion-item-header` (`-title`, `-icon`) + `.accordion-item-content` |
| **Alert** | important inline message: Info (system event), Success, Warning (destructive or unexpected), Error (what failed + how to fix). ARIA: `role="alert"` for Error/Warning, `role="status"` for Success/Info. In 3.0 the default style is **Light** (subtle background + colored text, which passes AA); a bold utility gives the solid style | type, Show Close Button | `.alert.background-{info|success|warning|error}` › `.alert-icon` + `.alert-message` + `.alert-close` |
| **Balloon** | rich content anchored to an element, without losing context | Position, Trigger | — |
| **Blank Slate** | empty state for first use, no data, no results or task done. **Always offer the next action** | content position (9) | `.blank-slate.{position}` › `.blank-slate-content` |
| **Bullets** | split long text into scannable points | — | `.bullets` › `.bullets-item` |
| **Card** | group short information as a unit. The base container | — | `.card` |
| **Card Background** | card over a background image (hero, promo) | content position, color overlay | `.card-background` › `-content`, `-image`, `-color.background-{c}` |
| **Card Sectioned** | card with image, title, content and footer areas | Orientation, Image Padding, Is Right | `.card-sectioned` › `.card-image`, `.card-sectioned-top` › `.card-title`, `.card-content`, `.card-footer` |
| **Carousel** | browse a few items cyclically when space is short | Margin, Padding, Pagination, Navigation, Auto Play (needs a pause, see a11y), Items per device | `.carousel` › `.carousel-container`, `.carousel-navigation` |
| **Chat Message** | conversation or comment posts | Is Right (own messages), Is Inline | `.chat(.is-right|.is-inline)` › `.chat-photo`, `.chat-message` |
| **Lightbox Image** | thumbnail → full-screen image, grouped as a gallery | Group | `.lightbox` › `.lightbox-item` |
| **Modal** | interrupt and demand a decision or critical input. Keep it short | Has Overlay, Position (9), enter/leave animation | `.modal` › `.modal-overlay` + `.modal-wrapper` › `.modal-top` (`.modal-title`, `.modal-close`), `.modal-content`, `.modal-footer` |
| **Panel** | card with a fixed structure: header (title + actions), content, footer | — | `.card.panel` › `.panel-header`, `.panel-content`, `.panel-footer` |
| **Section** | titled, accessible content groups; pairs with Section Index | — | `.section` › `.section-header` (`-title`, `-actions`), `.section-content` |
| **Tag** | status, label or category chip | Is Light, Size (small/default/medium), Shape (sharp/soft/rounded), Color | `.tag.border-radius-rounded.background-{c}` › `.tag-content` |
| **Tooltip** | short **plain-text** hint on hover or focus (never essential info) | Position, Trigger, Is Visible | `.tooltip-container` › `.tooltip-widget`; popup `.tooltip.tooltip-{pos}` |

## 2. Controls
| Pattern | Use it when | Options | CSS anatomy |
|---|---|---|---|
| **Animated Label** | label floats up on focus so the context stays visible | Is Inline | `.animated-label` › `-text`, `-input` |
| **Button Group** | 2–4 mutually exclusive options, all visible | Is Justified | `.button-group(.justified)` |
| **Date Picker** | pick a date (or a range in Reactive 2.x) | Disabled Dates, Events List; format, min/max | Pikaday `.pika-*` (Web) / Flatpickr (Reactive 2.x) |
| **Dropdown** | 5 or more options in a short list | — | `.dropdown` › `-header`, `-content` |
| **Dropdown Select / Search / Tags** | long or searchable lists; Tags for multi-select | single/multiple, search | Choices.js / VirtualSelect `.choices*` |
| **File Upload** | upload with drag and drop. State the allowed types and size | — | `.file-upload` › `-icon`, `-message`, `-widget` |
| **Floating Actions** | the main **positive** action on mobile-style screens (create, share). Never delete or archive | Trigger (hover/click) | `.floating-actions` › `-button`, `-items` |
| **Input With Icon** | icon hint for the expected input (search, email, date) | Align Icon Right | `.input-with-icon(.input-with-icon-right)` |
| **Range Slider (Interval)** | value or from–to inside a modest range (not 1–1000, not 1–3) | Step, Show Pips, Is Vertical, Is Disabled | `.range-slider(.interval)` |
| **Search** | free-text find; often the main way to find content | — | `.search` › `.input-with-icon` + `.search-actions` |
| **Search Balloon** | search with suggestions or results in a balloon | — | `.search-balloon` |
| **Time Picker** | pick a time | Start Time, Interval (minutes), Is 24h Format | `.time-picker` |
| **Toggle Button / Switch** | on/off with an immediate effect. Always has a default | states: normal, checked, disabled | `.toggle-button(.toggle-button-checked|-disabled)` |
| **Video** | native video. Repeat the essential info as text, and caption speech | Auto Play, Loop, Controls | `.video` |

## 3. Navigation
| Pattern | Use it when | Options | CSS anatomy |
|---|---|---|---|
| **Breadcrumbs** | hierarchy depth ≥ 2: where am I, jump up one level | — | `.breadcrumbs` › `.breadcrumbs-item` |
| **Navigation Bar** | vertical section links with subitems | Is Fixed, Multiple Items | `.navigation-bar` › `-item(.is--open|.is--active)` › `-item-subitem` |
| **Section Index** | jump between Sections on a long page | — | `.section-index` › `.section-index-item(.is--active)` |
| **Sidebar** | details, filters or a profile beside the main content | Has Overlay, direction | `.sidebar` › `.sidebar-container.animate.enter-right` › `-header`, `-content`; `.sidebar-overlay` |
| **Tabs** | related areas of one object, one click apart. **6 or fewer** | Active Tab, Is Justified, orientation, header position | `.tabs.tabs-horizontal|-vertical` › `.tabs-header-item(.active)`, `.tabs-content-item` |
| **Timeline** | chronological events (history, approvals) | empty items (dots), color | `.timeline` › `.timeline-item` › `-left` (icon, separator) + `-right` (date, container) |
| **Wizard** | split a long task into 3–7 numbered steps with Back/Next | With Icons, Empty, Use Top Label, Orientation | `.wizard(.wizard-vertical)` › `.wizard-item.{past|active|next}` |

## 4. Numbers
| Pattern | Use it when | Options | CSS anatomy |
|---|---|---|---|
| **Badge** | numeric notification (new items) | Is Light, Size, Shape, Color | `.badge.background-{c}` (`.badge-small|-medium`) |
| **Icon Badge** | badge attached to an icon (a bell with 9) | Is Light, Color | `.badge-icon` › icon + `.badge` |
| **Counter** | large total for one topic (KPI) | Orientation | `.counter.card` › value `.font-size-display` + label |
| **Progress Bar** | linear completion. **The same type for the same action everywhere** | Is Inline, Size, Shape, Color | `.progress-container` › `.progress-content` + `.progress` › `.progress-bar` |
| **Progress Circle** | circular or semicircular completion | Is Semi Circle, Thickness, Color | `.progress-circle-outer` › `.progress-circle` |
| **User Initials** | avatar from initials or a photo | Is Light, Size, Shape, Color | `.user-avatar(.user-avatar-small|-medium)` |

"Is Light" variants are always `background-{c}-lightest` + `text-{c}-darker`. Check yellow and lime (see accessibility.md).

## 5. Structure
- **Columns 2–6** (`.columns.columns{N}`), **Medium Left/Right** (one side somewhat smaller), **Small Left/Right** (one side clearly smaller, e.g. a sidebar or preview). Children are `.columns-item`.
  - Gutter `.gutter-{none…xxl}`.
  - Breaks `.tablet-break-{all|first|last|middle|none}`, `.phone-break-{…}`. The default is no break on tablet, all on phone.
- **Gallery**: N items per row, set per device. `.gallery` › `.gallery-item`.
- **Align Center**: center content (`.center-align` + `.flex-direction-row|column`).

## 6. Responsive
- **Display On Device**: render only on the chosen devices. It isn't rendered elsewhere, so no data is loaded there.
- **Load On Visible**: lazy-load content when it scrolls into view.
- **Move On Device**: move one element to a different container per device, with no duplication.
- **Responsive Table Records**: stacked cards on phone (default), **Expandable Rows** (hide some columns, expand to see them) or **Scrollable Rows** (keep the table and scroll sideways). Tables should also support sorting.

## 7. Utilities
| Pattern | Purpose | Notes |
|---|---|---|
| **Animate** | enter animation for its content | Bottom/Fade/Left/Right/Scale/Top, Speed, Delay. Respect reduced motion |
| **Button Loading** | spinner + disabled while an action runs | Show Loading and Label. `.btn-loading.is--loading` |
| **Character Count** | characters left in a text area | Limit, Is Descending |
| **Fieldset** | a legend plus a group of related fields | `.fieldset` › `.fieldset-legend` + `.fieldset-content` |
| **Flip Content** | front and back card | Trigger: hover / click / icon. Hover-only is not keyboard accessible, so prefer click |
| **Iframe** | small embedded preview from another app | Give it a `title` attribute |
| **Separator** | divide content | Is Vertical, Color, Space |
| **Stacked Icon** | two icons stacked into one | decorative unless labelled |

## 8. Layout and Emails
- Layouts: **Login**, **Login Split**, **Popup** (Traditional Web), plus the app layouts Top Menu, Side Menu and Blank (see layout-and-navigation.md).
- Emails: **Layout Email** (title, actions, content, address, footer), **Email 3 Rows**, **Email Section**. Email clients ignore external CSS, so keep the styles simple and inline in email screens only.

## 9. Chooser
| Need | Use | Not |
|---|---|---|
| choose 1 of 2–4 | Button Group or Radio | Dropdown |
| choose 1 of 5–15 | Dropdown | radios |
| choose 1 of many / search | Dropdown Select / Search | Dropdown |
| choose several | Dropdown Tags or checkboxes (≤ 7) | Ctrl-click lists |
| on/off with immediate effect | Toggle / Switch | a checkbox that needs Save |
| agree / opt-in on submit | Checkbox | Toggle |
| list + detail on one screen | Master Detail (Reactive) | two screens on desktop |
| transient confirmation | Notification / Feedback Message | a blocking Modal |
| row or secondary actions | Overflow Menu | a row of 5 icon buttons |
| actions on phone | Bottom Sheet / Action Sheet | a desktop-style modal |
| short hint | Tooltip | Balloon |
| rich anchored content | Balloon / Popover | Modal |
| confirm a destructive action | Modal (title states the action, red primary) | browser `confirm()` |
| side details or filters | Sidebar | new screen |
| steps in order | Wizard | Tabs |
| parallel views of one object | Tabs | Wizard |
| expandable groups | Accordion | Tabs on phone |
| no data | Blank Slate + next action | an empty table |
| status | Tag | colored text only |
| count | Badge / Icon Badge | Tag |
| KPI | Counter / KPI card | Badge |
| completion | Progress Bar / Circle (one style per action) | mixing both |
| main create action on mobile | Floating Actions | a top-right icon only |
| slow action | Button Loading | a disabled button without feedback |
