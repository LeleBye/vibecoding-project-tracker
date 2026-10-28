# AI Agent Context — Vibecoding Project Tracker

**Last audited:** 28 October 2026  
**Repository state at audit:** `main` working tree with multi-teammate management, handoff system, project board creation/deletion with GitHub-style verification, responsive mobile/touch accessibility with horizontal 4-stage card mover below cards on mobile, touch swipe guards on buttons, unified Neubrutalist custom dropdown system (`NeuSelect`) across all modal and toolbar dropdown selections, and visually organized sort/filter options  
**Verification completed:** `npm run build` passed (Vite production build). Mobile horizontal card mover and responsive dropdown improvements verified.


Use this file as the working context for changes in this repository. It records the shipped application, the non-negotiable product boundaries, and the checks an agent must make before claiming work is complete.

## 1. Read this first: authority and working rules

Apply requirements in this order:

1. The current user's explicit request.
2. This file, for repository-wide guardrails and the audited current state.
3. `PRD.md`, for product scope, the locked task model, and required Kanban workflow.
4. `DESIGN.md`, for the completed visual system and interaction tone.
5. Existing source, for established implementation patterns and backwards compatibility.

The README, PRD, and DESIGN documents began as hackathon materials. Their remaining starter-status wording and TODO reminders are historical; do not interpret them as an instruction to rewrite completed work. In particular, do not modify `PRD.md` or `DESIGN.md`, create commits/tags, push, deploy, or change saved browser data unless the user explicitly asks.

If a request conflicts with a locked constraint below, explain the conflict and ask before widening scope. Preserve unrelated user changes in a dirty working tree.

## 2. Product in one paragraph

This is a desktop-first, single-page tracker for a small vibecoding team. Its purpose is to keep human ownership of priorities, assignments, deadlines, deliverables, and curated task context visible while allowing a person to deliberately copy a briefing into an external AI tool. It is **not** an AI agent, a shared collaboration system, or an integration hub.

The shipped UI also includes a small project switcher with three local project workspaces. This is an existing extension to the original single-project brief; preserve it unless the user requests a change.

## 3. Stack and commands

- React 18 + Vite 5, JavaScript/JSX with ESM modules.
- Tailwind CSS 3 and the shared utility classes in `src/index.css`.
- Browser `localStorage` only. There is no API, backend, authentication, database, routing library, state library, icon package, or test framework.
- Node package manager lockfile: `package-lock.json`.

Useful commands:

```bash
npm run dev
npm run build
npm run preview
```

Run `npm run build` after code changes. Do not add packages, replace the stack, or edit the lockfile unless the user has specifically authorized that scope.

## 4. Source map

```text
src/main.jsx                         React entry point; leave unchanged unless essential
src/App.jsx                          App-level state, project switching, persistence wiring, toasts, DnD mutation
src/constants/taskConfig.js          Locked stages, team, AI tools, form defaults, visual constants
src/constants/projects.js            The local workspaces and their initial data
src/data/seedData.js                 Vibecoding workspace demo tasks and deliverable anchors
src/hooks/useLocalStorage.js         Generic JSON localStorage hook
src/hooks/useProjectLocalStorage.js  Per-project persistence with legacy-key compatibility
src/utils/taskUtils.js               IDs, dates, due state, time display, Markdown copy payload, board filter/sort helpers
src/utils/clipboard.js               Clipboard API with legacy textarea fallback
src/utils/viewport.js                Viewport queries and desktop/mobile screen detection
src/components/layout/AppHeader.jsx  Product header and responsive bottom action bar
src/components/common/NeuSelect.jsx  Reusable Neubrutalist custom dropdown select (ARIA combobox, keyboard nav, grouped options)
src/components/projects/             Projects modal, project creation, and deletion with GitHub-style verification
src/components/team/                 Team roster modal with add, inline edit, and reassignment
src/components/anchors/              Deliverable anchor board with mobile collapsible toggle
src/components/board/                Kanban board (responsive tabs/grid), sort/filter toolbar, columns, cards, quick stage mover
src/components/tasks/                Modal and display badges/pills
src/components/feedback/Toast.jsx    Timed live-status toast
src/index.css                        Tailwind layers, .neu-* primitives, mobile sheet classes, touch form sizing
```

Keep components focused. Pass state-changing callbacks down from `App`; do not introduce a global store for ordinary task interactions.

## 5. Locked product contract

### Workflow

Keep exactly these stage IDs, labels, and order from `src/constants/taskConfig.js`:

| ID | UI label |
| --- | --- |
| `todo` | To Do |
| `in-progress` | In Progress |
| `review` | Review |
| `done` | Done |

Do not add, rename, reorder, or remove columns. The modal status select is the required accessible movement path. Existing drag-and-drop is optional progressive enhancement, not a substitute for that select.

### Task and anchor data

Preserve this task shape and field meanings. Existing saved data must remain readable.

```js
{
  id: string,
  title: string,
  description: string,
  type: 'feature' | 'bug',
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,             // use TEAM values only
  dueDate: string | null,       // YYYY-MM-DD
  createdDate: string,          // YYYY-MM-DD
  context: string,              // human-curated Markdown briefing
  contextTool: 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other' | null,
  contextUpdatedAt: string | null // ISO timestamp
}
```

Anchors are `{ id, label, url }` with the four fixed IDs: `presentation`, `demo`, `report`, and `documentation`. The current UI lets a person edit labels as well as URLs; keep the IDs stable.

Team roster is persisted under `vibetracker.team` with Name and Email per member; assignees reference roster member names. Initial roster provides Benjamin Rosser, Sarah Chen, and Alex Rivera for demonstration.

### Explicitly out of scope

Do not add authentication, accounts, a backend/database, shared or real-time state, GitHub/webhook integration, AI-tool integrations, multi-team support, extra workflow columns, or a separate task outcome field. Do not present the app as autonomously making task decisions.

## 6. Design system and accessibility baseline

The visual language is deliberate **Neubrutalism**, not generic AI-dashboard styling:

- Cream page background; white cards; near-black 3px borders; 2–6px corners; hard 2–6px offset shadows.
- Coral `#FF5C7A` is primary, teal `#36D6D0` is accent, and near-black `#171717` is body text/border.
- Feature is blue `#5B8CFF`; bug is red `#FF5C5C` and both must use a text/icon label as well as colour.
- Due states: safe `#B9F5C5`, warning `#FFD166`, overdue `#FF8A8A`, and done-neutral `#D9D9D9`. Done overrides any due-date urgency. Missing dates are neutral/unbadged.
- Fonts: Archivo Black for display, Space Grotesk for body, IBM Plex Mono for metadata. They are loaded in `index.html` and configured in Tailwind.

Use Tailwind utilities and the existing `.neu-*` primitives rather than creating one-off CSS files. Keep controls semantic, labelled, keyboard reachable, visibly focused, and high contrast. Do not use gradients, glass effects, soft shadows, excessive pill controls, or vague autonomous-AI language. On touch devices, Tailwind is configured with `hoverOnlyWhenSupported: true` to prevent sticky hover states. Mobile form inputs are locked to 16px to prevent automatic iOS Safari viewport zooming. Safe area insets (`env(safe-area-inset-*)`) ensure full compatibility with modern mobile hardware.

## 7. Current shipped behavior

- **Header/workspaces:** On tablet and desktop (`md:`), the header presents the product identity and three consolidated modal action buttons: "Project" (displays the active board name and opens the unified project management modal to switch, create, and delete boards), "Team" (displays member count and opens the team roster modal), and "Add task" (opens the task creation modal). On mobile viewports (< md), the header is a compact sticky brand bar, and primary actions ("Projects", "+ Add task", "Team") are anchored in a thumb-reachable fixed bottom navigation bar. Switching projects switches locally persisted tasks and anchors.
- **Project board management:** Allows creating new project boards with custom name, description, and auto-initialized 4-stage Kanban workflow and 4 anchor slots. Deleting project boards features thorough GitHub-style verification requiring the user to type the exact board name to enable the irreversible deletion action. When the active project is deleted, the app automatically transitions to another remaining board. Deletion is prevented when only one board remains.
- **Team management:** The team modal allows adding members with Name and Email, inline editing member details (automatically synchronizing assignees across existing tasks upon name change), and removing members with two-step double-click confirmation ("✕ Delete" → "! Confirm Delete"). Clicking anywhere outside the active confirmation button (or pressing Escape) functionally and visually resets the button back to its initial state. Removing a team member automatically reassigns their tasks across all projects to the "Unassigned" state.
- **Anchor Board:** Four cards sit above the board. Each shows an empty/linked state, supports inline label/URL editing, saves on Enter or Save, cancels on Escape, and opens saved links in a new tab. On mobile devices, anchors collapse by default behind an interactive summary toggle (`x/4 linked ▾`) to save vertical space, expanding into a 2-column grid when toggled.
- **Kanban:** The desktop workspace renders the four locked columns across the row; tablet viewports adapt to a 2×2 grid. On mobile phones, a sticky 4-stage switcher tab bar shows one column at a time with badge counters. The entire bottom-half of the page (from the top of the task board to the bottom of the page's height) is designated as a swipable area for navigating between stages (`touch-pan-y` ensures native vertical scrolling is never blocked, and swipe guards ignore swipes starting on buttons/inputs to avoid accidental stage switches). On mobile, outer column container borders and internal horizontal padding are removed so cards cleanly expand to fill the available screen width, and the column container stretches to fill available vertical space. Cards open the task modal by click or Enter/Space. Unassigned tasks display a dedicated Neubrutalist dashed-border avatar icon in place of member initials. HTML5 drag-and-drop moves and reorders cards on desktop; touch/mobile devices utilize an inline "Move" button on each card that expands a horizontal row of four accessible stage options directly below the card (eliminating overflow clipping) or the status select within the modal.
- **Board sort/filter:** `BoardToolbar` sits under the Task Board heading with two Neubrutalist custom dropdowns (`NeuSelect`). **Sort** (default "Date created · newest") organizes options into distinct, labelled categories (`Date & Due Time`, `Alphabetical`, `Workflow & Custom`) with clean typographic monospace indicators (`↓`, `↑`, `!`, `AZ`, `@`, `★`, `⠿`) and explanatory subtitles. **Filter** (default "All tasks") groups choices into structured Neubrutalist optgroup headers: Type (`★ Feature` blue badge, `✕ Bug` red badge), Due date (`! Overdue`, `! Due soon`, `✓ On track`, `— Undated`), and Assignee (`◌ Unassigned` and roster members with their circular initials avatar badges). Both are session-only view state in `KanbanBoard`, resetting on reload. When filtered, the heading displays "x of y tasks", the filter select turns teal (`bg-brand-accent`) showing the selected filter's badge and label, column/phone-tab counts reflect visible cards, and "↺ Reset view" appears.
- **Neubrutalist Custom Dropdowns (`NeuSelect`):** Replaces native `<select>` across toolbar and modal dropdown selection interfaces (`BoardToolbar`, `TaskModal`, `DeleteProjectModal`, and `ProjectSwitcher`). Follows the strict Neubrutalist design language: 3px near-black borders (`border-text-primary`), sharp offset shadows (`shadow-neu-sm`), Archivo/Space Grotesk/IBM Plex Mono typography, and high-contrast brutalist indicators. Implements the accessible ARIA combobox/listbox pattern (`role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-selected`), complete keyboard navigation (Enter/Space, ArrowUp/ArrowDown, Home/End, Escape, Tab), click-outside dismissal, responsive viewport-aware upward/downward flip positioning, touch targets >= 40px with touch-pan-y scrolling, and an underlying hidden native `<select>` for full form and test compatibility.
- **Modals & Sheet Pattern:** All modals (Task, Team, Projects, Delete Project) use a responsive sheet pattern (`.neu-sheet`, `.neu-sheet-header`, `.neu-sheet-body`, `.neu-sheet-footer`) that appears as a centered dialog on desktop/tablet and smoothly transitions to a full-screen sheet with pinned headers and footers on mobile. On mobile, autofocusing on edit modals is skipped to avoid popping the virtual keyboard over existing content.
- **Task modal:** One modal creates, edits, deletes (two-step confirmation with outside-click and Escape cancellation), changes status/type/due date, and manages assignment. New tasks provide an initial Assignee dropdown (defaulting to "Unassigned"); edit task mode displays the current assignee in a static Neubrutalist badge panel and delegates reassignment exclusively to the dedicated "Hand off / Assign to…" dropdown with live confirmation toast upon save. Title is the only required field. Modal closes by Cancel, close button, backdrop, or Escape.
- **Context:** New tasks start with the fixed Background / Constraints / Tried so far / Pick up from here Markdown template. Context timestamps update only when the context itself changes; the selected AI tool is stored separately. Context is human-written, never generated or sent by the app.
- **Copy:** A card and modal action copy a Markdown task briefing with task metadata, title, description, and full Context. Successful copy shows local button feedback and a toast; failed clipboard writes show an error toast.
- **Urgency:** `getDueState()` treats completed tasks as neutral first; undated tasks have no urgency badge; past dates are overdue; less than 24 hours is warning; remaining future dates are safe.
- **Demo content:** The vibecoding workspace seeds six varied tasks only when no saved data exists, covering both types, every useful urgency state, multiple workflow columns, contextual Markdown, and one filled anchor. The two supplemental workspaces each seed one task and four anchors.

## 8. Persistence compatibility

Never clear or rename these keys casually:

| Data | Key |
| --- | --- |
| Active project | `vibetracker.activeProject` |
| Project boards roster | `vibetracker.projects` |
| Team roster | `vibetracker.team` |
| Vibecoding tasks (legacy-compatible) | `vibetracker.tasks` |
| Vibecoding anchors (legacy-compatible) | `vibetracker.anchors` |
| Other project tasks | `vibetracker.project.<projectId>.tasks` |
| Other project anchors | `vibetracker.project.<projectId>.anchors` |

The hooks tolerate unreadable JSON by falling back to their supplied initial value. `App` also protects rendering from non-array task/anchor values. Preserve these safety characteristics when touching persistence.


## 9. Known limitations and follow-up candidates

These are observations from the audit, not authorization to expand scope. Fix one only when it is relevant to the user's request.

1. There are no automated tests, linter, CI configuration, or deployment configuration in this repository. Build success is the available baseline verification.
2. Clipboard fallback success depends on browser support for `document.execCommand('copy')`; unsupported or denied writes show an error toast.
3. Anchor URLs are normalized to absolute URLs on save. The app does not validate whether the destination is reachable.
5. `COL_ACCENTS` and `getDueCfg`/`DUE_STATE_CFG` exist as configuration helpers but are currently not consumed by the rendered column/card components. Do not assume changing them updates the UI without tracing the callers.
6. The PRD's deployment URL remains `<TODO>`, and the local clone has no Git tags even though the commit history contains a `pitch-done` commit. Do not create tags, deploy, or infer a public URL without explicit instruction. The historical milestone wording also differs: README says `project-deliverables`; the PRD ownership table says `anchors`.

## 10. Agent change checklist

Before editing:

1. Read the relevant component plus its caller, constants, utility, and persistence hook.
2. Confirm whether saved local data and the locked task/anchor schemas are affected.
3. Keep the change narrowly scoped; preserve the existing multi-project behavior unless asked otherwise.

Before reporting completion:

1. Run `npm run build`.
2. Exercise every changed user path, including a reload/persistence check when tasks, anchors, projects, or forms changed.
3. Check keyboard access, focus, labels, feedback, and non-colour indicators for any changed UI.
4. Confirm no backend, integration, package, schema, or milestone/Git action slipped in unintentionally.
5. Update this file's audit date and affected “Current shipped behavior” or “Known limitations” entry whenever architecture, requirements, persistence, or verified project state changes. Keep claims factual and verification-backed.
