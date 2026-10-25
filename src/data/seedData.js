import { CONTEXT_TEMPLATE } from '../constants/taskConfig.js';

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers (used only for constructing seed data)
// ─────────────────────────────────────────────────────────────────────────────

function relativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed tasks — realistic demo tasks for first-load experience (M4)
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_TASKS = [
  {
    id: 'seed-1',
    title: 'Scaffold Kanban board layout',
    description:
      'Build the four-column board with responsive column widths and neubrutalist card styling.',
    type: 'feature',
    status: 'done',
    assignee: 'Benjamin Rosser',
    dueDate: relativeDate(-3),
    createdDate: relativeDate(-5),
    context:
      `## Background\nWe need the base layout before any other milestones can land. The board should use the STAGES constant and Tailwind colour tokens from DESIGN.md.\n\n## Constraints\n- Tailwind only, no additional CSS files\n- Must use the locked STAGES array from App.jsx\n\n## Tried so far\nStarted with a simple flex layout but switched to CSS grid for better column alignment.\n\n## Pick up from here\nBoard is complete. Cards still need feature/bug colour coding (M6).`,
    contextTool: 'Cursor',
    contextUpdatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Add / edit / delete task modal',
    description:
      'Implement a single reusable modal that handles task creation, editing, and deletion with full form validation.',
    type: 'feature',
    status: 'done',
    assignee: 'Sarah Chen',
    dueDate: relativeDate(-1),
    createdDate: relativeDate(-4),
    context:
      `## Background\nThe modal is the core interaction surface. It must support both "create new" and "edit existing" modes from a single component.\n\n## Constraints\n- No external modal libraries\n- Must close on Escape key press\n- All task fields must be editable\n\n## Tried so far\nUsed a controlled form pattern with a single formState object. Escape-to-close implemented via useEffect on the window.\n\n## Pick up from here\nModal works end-to-end. Next: add the Context textarea and AI-tool dropdown for M9.`,
    contextTool: 'Claude',
    contextUpdatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Due-date urgency colour tinting',
    description:
      'Calculate urgency from dueDate and apply the correct DESIGN.md colour token to each task card.',
    type: 'feature',
    status: 'review',
    assignee: 'Alex Rivera',
    dueDate: relativeDate(0), // due today → warning
    createdDate: relativeDate(-2),
    context:
      `## Background\nCards should change background based on proximity to due date:\n- > 2 days out: due-safe (#B9F5C5)\n- < 24 hrs: due-warning (#FFD166)\n- Past due: due-overdue (#FF8A8A)\n- Done: due-neutral (#D9D9D9) regardless of date\n\n## Constraints\n- Done tasks always show neutral, even if overdue\n- Must pair colour with a text label — no colour-only signalling\n\n## Tried so far\ngetDueState() helper written. Tailwind inline styles used to avoid class-purging.\n\n## Pick up from here\nReview the contrast ratios for due-warning — yellow background needs #171717 text confirmed accessible.`,
    contextTool: 'ChatGPT',
    contextUpdatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-4',
    title: 'Fix: context textarea loses focus on every keystroke',
    description:
      'The context textarea re-renders on every keystroke because parent state update triggers a full re-render.',
    type: 'bug',
    status: 'in-progress',
    assignee: 'Benjamin Rosser',
    dueDate: relativeDate(1), // due tomorrow → safe
    createdDate: relativeDate(-1),
    context:
      `## Background\nWhen typing in the Context textarea inside the modal, focus is lost after every character. Root cause: formState lives in parent, triggering full modal re-render.\n\n## Constraints\n- Must not break the Save flow — context changes need to reach parent on submit\n- Cannot use uncontrolled inputs (breaks validation)\n\n## Tried so far\n- Tried moving formState into modal component — fixes focus but breaks save\n- Tried useCallback on the onChange handler — no improvement\n\n## Pick up from here\nConsider using local draft state inside modal and lifting to parent only on Save click.`,
    contextTool: 'Cursor',
    contextUpdatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-5',
    title: 'Implement "Copy as Prompt Context" button',
    description:
      'One-click copy of a formatted Markdown briefing to the clipboard so a user can paste it directly into an AI chat.',
    type: 'feature',
    status: 'todo',
    assignee: 'Sarah Chen',
    dueDate: relativeDate(-2), // overdue!
    createdDate: relativeDate(-3),
    context: CONTEXT_TEMPLATE,
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 'seed-6',
    title: 'Fix: anchor board URL validation broken for non-https links',
    description:
      'Pasting a URL without https:// prefix saves successfully but the generated anchor link is broken.',
    type: 'bug',
    status: 'todo',
    assignee: 'Alex Rivera',
    dueDate: relativeDate(4), // safe — more than 2 days
    createdDate: relativeDate(-1),
    context: CONTEXT_TEMPLATE,
    contextTool: null,
    contextUpdatedAt: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed anchors — deliverable anchor board initial state (M11)
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_ANCHORS = [
  { id: 'presentation', label: 'Presentation', url: 'https://docs.google.com/presentation/d/example-deck' },
  { id: 'demo',          label: 'Demo',          url: null },
  { id: 'report',        label: 'Report',        url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];
