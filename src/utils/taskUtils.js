import { DUE_STATE_CFG } from '../constants/taskConfig.js';

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
  if (mins < 2)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Extract initials from a full name (up to 2). */
export function initials(name) {
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
// Prompt-context Markdown builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the Markdown prompt-context string copied to clipboard (M10).
 * @param {object} task
 * @returns {string}
 */
export function buildPromptContext(task) {
  return `# Task: ${task.title}\n\n## Description\n${task.description || '(no description)'}\n\n## Context\n${task.context || '(no context provided)'}`;
}
