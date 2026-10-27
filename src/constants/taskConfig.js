// ─────────────────────────────────────────────────────────────────────────────
// Task configuration constants — PRD §4-§12
// ─────────────────────────────────────────────────────────────────────────────

/** The four Kanban stages — do not change IDs or order. */
export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

/** Default team members with Name and Email (FR07, FR08). */
export const DEFAULT_TEAM = [
  { id: 'tm-1', name: 'Benjamin Rosser', email: 'benjamin.rosser@example.com' },
  { id: 'tm-2', name: 'Sarah Chen', email: 'sarah.chen@example.com' },
  { id: 'tm-3', name: 'Alex Rivera', email: 'alex.rivera@example.com' },
];

/** Allowed assignee values — derived from DEFAULT_TEAM for backwards compatibility. */
export const TEAM = DEFAULT_TEAM.map((m) => m.name);

/** Allowed AI tools for the Context dropdown. */
export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

/** Default Markdown template pre-filled for new tasks. */
export const CONTEXT_TEMPLATE = `## Background\n\n## Constraints\n\n## Tried so far\n\n## Pick up from here\n`;

// ─────────────────────────────────────────────────────────────────────────────
// Due-state configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Due-date urgency state identifiers.
 * @typedef {'none'|'safe'|'warning'|'overdue'|'neutral'} DueState
 */

/**
 * Visual configuration for each due state.
 * bg values match the Tailwind design tokens from tailwind.config.js but are used
 * as inline values for dynamic background colouring of task cards.
 */
export const DUE_STATE_CFG = {
  none: { bg: '#FFFFFF', label: null, icon: null },
  safe: { bg: '#B9F5C5', label: 'On track', icon: '✓' },
  warning: { bg: '#FFD166', label: 'Due soon', icon: '!' },
  overdue: { bg: '#FF8A8A', label: 'Overdue', icon: '!' },
  neutral: { bg: '#D9D9D9', label: 'Done', icon: '✓' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Column accent colours (neubrutalist header fills)
// ─────────────────────────────────────────────────────────────────────────────

export const COL_ACCENTS = {
  'todo': '#171717', // near-black
  'in-progress': '#FF5C7A', // brand-primary / coral
  'review': '#FFD166', // due-warning yellow
  'done': '#36D6D0', // brand-accent / teal
};

// ─────────────────────────────────────────────────────────────────────────────
// Anchor icon map
// ─────────────────────────────────────────────────────────────────────────────

export const ANCHOR_ICONS = {
  presentation: '▶',
  demo: '◉',
  report: '▣',
  documentation: '≡',
};

// ─────────────────────────────────────────────────────────────────────────────
// Task Board sort / filter options (display-only — never mutate stored order)
// ─────────────────────────────────────────────────────────────────────────────

/** Sort options for cards within each column. `manual` keeps the drag order. */
export const SORT_OPTIONS = [
  { id: 'created-desc', label: 'Date created · newest' },
  { id: 'created-asc', label: 'Date created · oldest' },
  { id: 'due-asc', label: 'Due date · soonest' },
  { id: 'title-asc', label: 'Title · A–Z' },
  { id: 'assignee-asc', label: 'Assignee · A–Z' },
  { id: 'type', label: 'Type · features first' },
  { id: 'manual', label: 'Manual (drag order)' },
];

export const DEFAULT_SORT = 'created-desc';
export const DEFAULT_FILTER = 'all';

/**
 * Static filter groups. Values use a `kind:value` format.
 * The assignee group is built at runtime from the team roster.
 */
export const FILTER_GROUPS = [
  {
    label: 'Type',
    options: [
      { id: 'type:feature', label: 'Features' },
      { id: 'type:bug', label: 'Bugs' },
    ],
  },
  {
    label: 'Due date',
    options: [
      { id: 'due:overdue', label: 'Overdue' },
      { id: 'due:warning', label: 'Due soon (< 24h)' },
      { id: 'due:safe', label: 'On track' },
      { id: 'due:none', label: 'No due date' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Empty task form default
// ─────────────────────────────────────────────────────────────────────────────

export const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: 'Unassigned',
  dueDate: '',
  context: CONTEXT_TEMPLATE,
  contextTool: null,
};
