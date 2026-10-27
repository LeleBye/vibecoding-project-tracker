import { DUE_STATE_CFG, STAGES } from '../constants/taskConfig.js';

// ─────────────────────────────────────────────────────────────────────────────
// ID & date helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a unique task ID. */
export function uid() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Return today's date as a YYYY-MM-DD string. */
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Due-state calculation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the due-date urgency state for a task.
 * @param {string|null} dueDate  YYYY-MM-DD string
 * @param {string}      status   Task status
 * @returns {'none'|'safe'|'warning'|'overdue'|'neutral'}
 */
export function getDueState(dueDate, status) {
  if (status === 'done') return 'neutral';
  if (!dueDate) return 'none';
  const due = new Date(dueDate + 'T23:59:59').getTime();
  const diffMs = due - Date.now();
  const diffHours = diffMs / 3_600_000;
  if (diffMs < 0) return 'overdue';
  if (diffHours < 24) return 'warning';
  return 'safe';
}

/** Convenience: returns the DUE_STATE_CFG entry for a task. */
export function getDueCfg(dueDate, status) {
  return DUE_STATE_CFG[getDueState(dueDate, status)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Return a human-readable relative time string, e.g. "3h ago". */
export function timeAgo(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Extract initials from a full name (up to 2). */
export function initials(name) {
  if (!name || name === 'Unassigned') return '';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Format a YYYY-MM-DD date string for display, e.g. "20 Oct". */
export function fmtDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Board view helpers (display-only filter + sort)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the tasks matching a `kind:value` filter id (see FILTER_GROUPS).
 * Unknown ids and 'all' return the input unchanged.
 */
export function filterTasks(tasks, filterId) {
  if (!filterId || filterId === 'all') return tasks;
  const separator = filterId.indexOf(':');
  if (separator < 0) return tasks;
  const kind = filterId.slice(0, separator);
  const value = filterId.slice(separator + 1);

  switch (kind) {
    case 'type':
      return tasks.filter((t) => t.type === value);
    case 'due':
      if (value === 'none') return tasks.filter((t) => !t.dueDate);
      return tasks.filter((t) => getDueState(t.dueDate, t.status) === value);
    case 'assignee':
      return tasks.filter((t) => (t.assignee || 'Unassigned') === value);
    default:
      return tasks;
  }
}

const compareText = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

/** Creation timestamp encoded in uid()-style IDs (`task-<ms>-xxxxx`), else null. */
function idTimestamp(id) {
  const match = /^task-(\d+)-/.exec(id || '');
  return match ? Number(match[1]) : null;
}

const isUnassigned = (task) => !task.assignee || task.assignee === 'Unassigned';

/** Primary comparators; missing values always sort last. */
const SORT_COMPARATORS = {
  'created-desc': (a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''),
  'created-asc': (a, b) => {
    if (!a.createdDate !== !b.createdDate) return a.createdDate ? -1 : 1;
    return (a.createdDate || '').localeCompare(b.createdDate || '');
  },
  'due-asc': (a, b) => {
    if (!a.dueDate !== !b.dueDate) return a.dueDate ? -1 : 1;
    return (a.dueDate || '').localeCompare(b.dueDate || '');
  },
  'title-asc': (a, b) => compareText(a.title || '', b.title || ''),
  'assignee-asc': (a, b) => {
    if (isUnassigned(a) !== isUnassigned(b)) return isUnassigned(a) ? 1 : -1;
    return compareText(a.assignee || '', b.assignee || '');
  },
  type: (a, b) => (a.type === 'bug' ? 1 : 0) - (b.type === 'bug' ? 1 : 0),
};

/**
 * Return a new, stably sorted copy of tasks. 'manual' (or an unknown id)
 * returns the stored drag order unchanged.
 */
export function sortTasks(tasks, sortId) {
  const compare = SORT_COMPARATORS[sortId];
  if (!compare) return tasks;
  const newestFirst = sortId === 'created-desc';

  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const primary = compare(a.task, b.task);
      if (primary !== 0) return primary;
      // Same-day creation ties: use the uid() timestamp when both tasks have one.
      if (sortId === 'created-desc' || sortId === 'created-asc') {
        const ta = idTimestamp(a.task.id);
        const tb = idTimestamp(b.task.id);
        if (ta !== null && tb !== null && ta !== tb) return newestFirst ? tb - ta : ta - tb;
      }
      return newestFirst ? b.index - a.index : a.index - b.index;
    })
    .map(({ task }) => task);
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt-context Markdown builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the Markdown prompt-context string copied to clipboard (M10).
 * @param {object} task
 * @returns {string}
 */
export function buildPromptContext(task) {
  const statusLabel = STAGES.find((stage) => stage.id === task.status)?.label || task.status || 'Not set';
  const dueDate = task.dueDate || 'Not set';
  const contextTool = task.contextTool || 'Not specified';
  const createdDate = task.createdDate || 'Not set';

  return `# Task: ${task.title}

## Details
- Type: ${task.type || 'Not set'}
- Status: ${statusLabel}
- Assignee: ${task.assignee || 'Unassigned'}
- Due date: ${dueDate}
- Created: ${createdDate}
- AI tool: ${contextTool}

## Description
${task.description || '(no description)'}

## Context
${task.context || '(no context provided)'}`;
}
