# Layouts, page anatomy and navigation

## Choose the app layout once
| Layout | Use when | Notes |
|---|---|---|
| **Top Menu** (`.layout-top`) | up to ~7 top-level sections, wide content (dashboards, lists) | menu collapses to a hamburger on tablet and phone |
| **Side Menu** (`.layout-side`) | many sections, deep hierarchy, back-office tools | width `--side-menu-size` (300px); behavior can be overlay, visible or expandable (set in the theme or layout) |
| **Blank** | full-screen experiences (kiosk, embedded, print view) | still keep a skip link and a title |
| **Login / Login Split** (`.layout-login`) | login, registration, password reset | split = brand image + form; the form column must work alone on phone |
| **Popup layout** | content shown inside a popup or modal | Traditional Web: the RichWidgets Popup Editor |
| **Email layouts** | email templates | inline styles are acceptable *only* here (email clients ignore theme CSS) |

A new empty screen uses **LayoutTopMenu**, with the placeholders **Header** (sign-in logic), **Breadcrumbs**, **Title**, **Actions**, **MainContent** and **Footer**. A placeholder renders only when it holds content. Set the layout's **`EnableAccessibilityFeatures = True`** (see accessibility.md §0), and set it in the app template, so no screen ships without focus states and skip-to-content.

Set the layout in the **theme**, so every screen uses it. In Reactive OSUI the layouts are blocks (e.g. LayoutTopMenu, LayoutSideMenu, LayoutBlank). Screens created from templates already use the theme's layout, so keep it that way. Don't build headers or menus per screen.

## Page anatomy (layout placeholders → CSS classes verified in OutSystems UI)
```
.layout
 ├─ .header (.header-top / .header-content / .header-left / .header-center / .header-right)   height: --header-size
 │    logo · application title · menu · user info / language switch
 └─ .main-content
     ├─ .content-breadcrumbs     Breadcrumbs: only from depth 2 (Home › Requests › REQ-1042)
     ├─ .content-top
     │    ├─ .content-top-title  one H1 (screen name, matches the menu entry or record title)
     │    └─ .content-top-actions  page actions: max ONE primary (right-most / end side), secondaries to its start
     ├─ .content-middle          the screen content (blocks)
     └─ .content-bottom          footer (version, legal)
```
Rules:
- One H1 per screen, then H2 for sections and H3+ inside. Never skip levels for visual size. Use classes for size and keep the semantic level.
- The title says *what* the screen is ("Requests", "Request REQ-1042"). Put status next to the title as a Tag, not inside it.
- Page actions go in the Actions placeholder. Record-level actions go next to the record (row menu or card footer). Form submit actions go at the end of the form, mirrored at the top only if the form scrolls a lot.
- Inside content, use a consistent rhythm: `--space-m` (24px) between cards and sections, `--space-base` (16px) inside cards on desktop, `--space-base` between form fields.
- Max content width: dashboards and lists use full width. Reading and form screens limit their line length: forms at about 640–800px, or two columns on desktop. Text blocks at about 70–80 characters per line.

## Menus and navigation
- 7±2 top-level entries. Group the rest into submenus (OSUI Submenu / Navigation Bar). Order them by frequency of use, not by org chart.
- Highlight the active entry through the layout's active state (`ActiveItem`/`ActiveSubItem` parameters on the Menu), and never with custom CSS per screen.
- Show menu entries per role. **Hiding an entry is not security**: the screen must also check the role on the server (companion skill).
- Use Breadcrumbs for hierarchies of depth 2 or more. Don't add them to top-level screens.
- Tabs switch views of *one* object or list (≤6). Don't use them for app-level navigation.
- Section Index + Section works for long single pages (profiles, settings, long read-only details).
- Wizard handles sequential processes with 3–7 steps. Show the step names, allow Back, and don't lose data when going back.
- Deep links: every screen that shows a record takes its id as an input parameter. Lists keep their filter state in parameters or client variables, so Back returns the user to where they were.
- Navigation happens at screen level, in response to block **Events**. A block never navigates by itself (companion skill).

## Standard screen types
| Type | Skeleton |
|---|---|
| **List** | title + primary "New" → filter/search row (Search, Dropdowns, date range, "Clear filters") → Table or Card list with sort and pagination (or Load more on mobile) → Blank Slate when empty, with a different message for "no data yet" and "no results for filters" |
| **Detail** | title (record name) + status Tag + actions (Edit primary, others in an overflow menu) → summary card (key fields, 2–4 columns on desktop) → Tabs or Sections for related data → Timeline for history |
| **Form (create/edit)** | title ("New request" / "Edit request") → Fieldsets or Sections in order → footer actions: Cancel (secondary), Save (primary); Wizard if over ~12 fields across distinct topics |
| **Dashboard** | title + period filter → KPI row (Counter / cards, 2–4 per row, `.font-size-display` for the values) → charts (2 per row on desktop, 1 on phone) → recent items list. Every widget has its own loading, empty and error state |
| **Login** | Login or Login Split layout → app logo + name → inputs (username/email, password with show/hide) → primary "Log in" → secondary links (forgot password, SSO / national ID). Error message in a non-specific Alert ("Invalid credentials") |

Service Studio's Screen Templates (Dashboard, List, Detail, Form, Login…) already follow this anatomy. Start from a template, then replace the sample data with your blocks.

## Grids
- Use OutSystems UI **Columns** (2–6, Medium/Small Left/Right) for every multi-column layout. Don't hand-write flex or grid for page structure.
- Choose a gutter from the spacing scale (`.gutter-base` for forms, `.gutter-m` or `.gutter-l` for cards). Breaks are defined per device (see responsive.md).
- Use **Gallery** for N cards per row with per-device counts (e.g. 4/2/1).
- Use **Align Center** to center content in a container (empty states, login forms).
