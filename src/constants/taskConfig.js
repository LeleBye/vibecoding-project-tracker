// ─────────────────────────────────────────────────────────────────────────────
// Task configuration constants — PRD §4-§12
// ─────────────────────────────────────────────────────────────────────────────

/** The four Kanban stages — do not change IDs or order. */
export const STAGES = [
  { id: 'todo',        label: 'To Do'       },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review'      },
  { id: 'done',        label: 'Done'        },
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
  none:    { bg: '#FFFFFF', label: null,       icon: null },
  safe:    { bg: '#B9F5C5', label: 'On track', icon: '✓'  },
  warning: { bg: '#FFD166', label: 'Due soon', icon: '⚡' },
  overdue: { bg: '#FF8A8A', label: 'Overdue',  icon: '!'  },
  neutral: { bg: '#D9D9D9', label: 'Done',     icon: '✓'  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Column accent colours (neubrutalist header fills)
// ─────────────────────────────────────────────────────────────────────────────

export const COL_ACCENTS = {
  'todo':        '#171717', // near-black
  'in-progress': '#FF5C7A', // brand-primary / coral
  'review':      '#FFD166', // due-warning yellow
  'done':        '#36D6D0', // brand-accent / teal
};

// ─────────────────────────────────────────────────────────────────────────────
// Anchor icon map
// ─────────────────────────────────────────────────────────────────────────────

export const ANCHOR_ICONS = {
  presentation: '▶',
  demo:         '◉',
  report:       '▣',
  documentation:'≡',
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty task form default
// ─────────────────────────────────────────────────────────────────────────────

export const EMPTY_FORM = {
  title:       '',
  description: '',
  type:        'feature',
  status:      'todo',
  assignee:    TEAM[0],
  dueDate:     '',
  context:     CONTEXT_TEMPLATE,
  contextTool: null,
};
