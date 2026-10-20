import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Vibecoding Project Tracker — Full Implementation
 * LeleBye · UXD Vibecoding Hackathon 2026
 *
 * Milestones implemented:
 *   M4  data-model            Four-column Kanban + seed tasks
 *   M5  crud-modal            Add / edit / delete modal, persisted
 *   M6  tag-style             Feature vs bug visual distinction
 *   M7  task-owner            Assignee badge + Hand off dropdown
 *   M8  due-tint              Due-date urgency states
 *   M9  context               Curated Context field on modal
 *   M10 copy-prompt           Copy as Prompt Context button
 *   M11 project-deliverables  Anchor Board above Kanban
 *   M12 secret-sauce          Context-freshness indicator + AI-tool tag
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** The four Kanban columns — do not change IDs or order. */
export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

/** Allowed assignee values — PRD §8. Only one teammate in this solo run. */
export const TEAM = ['Benjamin Rosser'];

/** Allowed AI tools for the Context dropdown. */
const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

/** Default Markdown template pre-filled for new tasks. */
const CONTEXT_TEMPLATE = `## Background

## Constraints

## Tried so far

## Pick up from here
`;

// ─────────────────────────────────────────────────────────────────────────────
// useLocalStorage hook (supplied by starter scaffold — do not remove)
// ─────────────────────────────────────────────────────────────────────────────

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed data — realistic demo tasks for first-load experience
// ─────────────────────────────────────────────────────────────────────────────

function relativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const SEED_TASKS = [
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
      `## Background
We need the base layout before any other milestones can land. The board should use the STAGES constant and Tailwind colour tokens from DESIGN.md.

## Constraints
- Tailwind only, no additional CSS files
- Must use the locked STAGES array from App.jsx

## Tried so far
Started with a simple flex layout but switched to CSS grid for better column alignment.

## Pick up from here
Board is complete. Cards still need feature/bug colour coding (M6).`,
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
    assignee: 'Benjamin Rosser',
    dueDate: relativeDate(-1),
    createdDate: relativeDate(-4),
    context:
      `## Background
The modal is the core interaction surface. It must support both "create new" and "edit existing" modes from a single component.

## Constraints
- No external modal libraries
- Must close on Escape key press
- All task fields must be editable

## Tried so far
Used a controlled form pattern with a single formState object. Escape-to-close implemented via useEffect on the window.

## Pick up from here
Modal works end-to-end. Next: add the Context textarea and AI-tool dropdown for M9.`,
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
    assignee: 'Benjamin Rosser',
    dueDate: relativeDate(0), // due today -> warning
    createdDate: relativeDate(-2),
    context:
      `## Background
Cards should change background based on proximity to due date:
- > 2 days out: due-safe (#B9F5C5)
- < 24 hrs: due-warning (#FFD166)
- Past due: due-overdue (#FF8A8A)
- Done: due-neutral (#D9D9D9) regardless of date

## Constraints
- Done tasks always show neutral, even if overdue
- Must pair colour with a text label — no colour-only signalling

## Tried so far
getDueState() helper written. Tailwind inline styles used to avoid class-purging.

## Pick up from here
Review the contrast ratios for due-warning — yellow background needs #171717 text confirmed accessible.`,
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
    dueDate: relativeDate(1), // due tomorrow -> safe
    createdDate: relativeDate(-1),
    context:
      `## Background
When typing in the Context textarea inside the modal, focus is lost after every character. Root cause: formState lives in parent, triggering full modal re-render.

## Constraints
- Must not break the Save flow — context changes need to reach parent on submit
- Cannot use uncontrolled inputs (breaks validation)

## Tried so far
- Tried moving formState into modal component — fixes focus but breaks save
- Tried useCallback on the onChange handler — no improvement

## Pick up from here
Consider using local draft state inside modal and lifting to parent only on Save click.`,
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
    assignee: 'Benjamin Rosser',
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
    assignee: 'Benjamin Rosser',
    dueDate: relativeDate(4), // safe - more than 2 days
    createdDate: relativeDate(-1),
    context: CONTEXT_TEMPLATE,
    contextTool: null,
    contextUpdatedAt: null,
  },
];

const SEED_ANCHORS = [
  {
    id: 'presentation',
    label: 'Presentation',
    url: 'https://docs.google.com/presentation/d/example-deck',
  },
  { id: 'demo', label: 'Demo', url: null },
  { id: 'report', label: 'Report', url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

function uid() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Compute due-date urgency state.
 * @returns {'none'|'safe'|'warning'|'overdue'|'neutral'}
 */
function getDueState(dueDate, status) {
  if (status === 'done') return 'neutral';
  if (!dueDate) return 'none';
  const due = new Date(dueDate + 'T23:59:59').getTime();
  const diffMs = due - Date.now();
  const diffHours = diffMs / 3_600_000;
  if (diffMs < 0) return 'overdue';
  if (diffHours < 24) return 'warning';
  return 'safe';
}

/** Inline-style tokens for each due state (Tailwind class purging avoidance). */
const DUE_STATE_CFG = {
  none: { bg: '#FFFFFF', label: null, icon: null },
  safe: { bg: '#B9F5C5', label: 'On track', icon: '✓' },
  warning: { bg: '#FFD166', label: 'Due soon', icon: '⚡' },
  overdue: { bg: '#FF8A8A', label: 'Overdue', icon: '!' },
  neutral: { bg: '#D9D9D9', label: 'Done', icon: '✓' },
};

function timeAgo(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function fmtDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function buildPromptContext(task) {
  return `# Task: ${task.title}

## Description
${task.description || '(no description)'}

## Context
${task.context || '(no context provided)'}`;
}

async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared style constants
// ─────────────────────────────────────────────────────────────────────────────

const FONT_HEADING = '"Archivo Black", system-ui, sans-serif';
const FONT_BODY = '"Space Grotesk", system-ui, sans-serif';
const FONT_MONO = '"IBM Plex Mono", ui-monospace, monospace';
const BLACK = '#171717';
const CREAM = '#FFF8E8';
const CORAL = '#FF5C7A';
const TEAL = '#36D6D0';
const MUTED = '#625D66';

const neuShadow = '4px 4px 0 0 ' + BLACK;
const neuShadowS = '2px 2px 0 0 ' + BLACK;
const neuShadowL = '6px 6px 0 0 ' + BLACK;

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2800);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const bgMap = { default: BLACK, success: TEAL, handoff: CORAL };
  const txMap = { default: CREAM, success: BLACK, handoff: '#fff' };
  const bg = bgMap[type] || BLACK;
  const tx = txMap[type] || CREAM;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        backgroundColor: bg,
        color: tx,
        border: `3px solid ${BLACK}`,
        boxShadow: neuShadow,
        padding: '12px 20px',
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 14,
        maxWidth: 320,
        borderRadius: 4,
        animation: 'toastIn 150ms ease-out',
      }}
    >
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small atom components
// ─────────────────────────────────────────────────────────────────────────────

function AssigneeBadge({ name, size = 'sm' }) {
  const dim = size === 'sm' ? 26 : 32;
  const fs = size === 'sm' ? 11 : 13;
  return (
    <span
      title={name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 4,
        border: `2px solid ${BLACK}`,
        backgroundColor: CORAL,
        color: '#fff',
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: fs,
        flexShrink: 0,
        letterSpacing: '-0.5px',
      }}
    >
      {initials(name)}
    </span>
  );
}

function TypeBadge({ type }) {
  const cfg = {
    feature: { bg: '#5B8CFF', icon: '★', label: 'Feature' },
    bug: { bg: '#FF5C5C', icon: '✕', label: 'Bug' },
  };
  const c = cfg[type] || cfg.feature;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        backgroundColor: c.bg,
        color: '#fff',
        border: `2px solid ${BLACK}`,
        borderRadius: 3,
        padding: '1px 7px',
        fontFamily: FONT_MONO,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        flexShrink: 0,
      }}
    >
      <span aria-hidden="true">{c.icon}</span>
      {c.label}
    </span>
  );
}

function ToolBadge({ tool }) {
  if (!tool) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        backgroundColor: CREAM,
        color: MUTED,
        border: `2px solid ${MUTED}`,
        borderRadius: 3,
        padding: '1px 6px',
        fontFamily: FONT_MONO,
        fontSize: 10,
        fontWeight: 500,
      }}
    >
      ◈ {tool}
    </span>
  );
}

function DuePill({ dueDate, status }) {
  const state = getDueState(dueDate, status);
  if (state === 'none' || state === 'neutral') return null;
  const cfg = DUE_STATE_CFG[state];
  return (
    <span
      aria-label={`Due ${fmtDate(dueDate)} — ${cfg.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        backgroundColor: cfg.bg,
        color: BLACK,
        border: `2px solid ${BLACK}`,
        borderRadius: 3,
        padding: '1px 6px',
        fontFamily: FONT_MONO,
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {fmtDate(dueDate)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Card
// ─────────────────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick, onCopy }) {
  const dueState = getDueState(task.dueDate, task.status);
  const dueCfg = DUE_STATE_CFG[dueState];
  const [copied, setCopied] = useState(false);
  const stripe = task.type === 'feature' ? '#5B8CFF' : '#FF5C5C';

  const handleCopy = useCallback(
    (e) => {
      e.stopPropagation();
      copyToClipboard(buildPromptContext(task)).then(() => {
        onCopy(task);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    },
    [task, onCopy]
  );

  return (
    <article
      tabIndex={0}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      aria-label={`${task.title}. ${task.type}. Assigned to ${task.assignee}.`}
      style={{
        backgroundColor: dueCfg.bg,
        border: `3px solid ${BLACK}`,
        boxShadow: neuShadow,
        borderRadius: 4,
        padding: 14,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 80ms, box-shadow 80ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-1px,-1px)';
        e.currentTarget.style.boxShadow = neuShadowL;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = neuShadow;
      }}
    >
      {/* type stripe */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: 5,
          height: '100%',
          backgroundColor: stripe,
        }}
      />

      {/* title + assignee */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, paddingLeft: 10 }}>
        <h3 style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, color: BLACK, lineHeight: 1.3, flex: 1, margin: 0 }}>
          {task.title}
        </h3>
        <AssigneeBadge name={task.assignee} size="sm" />
      </div>

      {/* badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingLeft: 10 }}>
        <TypeBadge type={task.type} />
        <DuePill dueDate={task.dueDate} status={task.status} />
        {task.contextTool && <ToolBadge tool={task.contextTool} />}
        {task.status === 'done' && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: MUTED }}>✓ Completed</span>
        )}
      </div>

      {/* copy button */}
      <div style={{ paddingLeft: 10 }}>
        <button
          onClick={handleCopy}
          aria-label="Copy as Prompt Context"
          style={{
            backgroundColor: copied ? TEAL : BLACK,
            color: copied ? BLACK : CREAM,
            border: `2px solid ${BLACK}`,
            boxShadow: copied ? 'none' : neuShadowS,
            borderRadius: 3,
            padding: '4px 10px',
            fontFamily: FONT_MONO,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 150ms',
          }}
        >
          {copied ? '✓ Copied!' : '⇥ Copy Context'}
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Column
// ─────────────────────────────────────────────────────────────────────────────

const COL_ACCENTS = {
  'todo': BLACK,
  'in-progress': CORAL,
  'review': '#FFD166',
  'done': TEAL,
};

function KanbanColumn({ stage, tasks, onCardClick, onCopy }) {
  const accent = COL_ACCENTS[stage.id];
  const isDark = accent !== '#FFD166';
  const textClr = isDark ? CREAM : BLACK;

  return (
    <section aria-label={`${stage.label} column, ${tasks.length} tasks`} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div
        style={{
          backgroundColor: accent,
          color: textClr,
          border: `3px solid ${BLACK}`,
          borderBottom: 'none',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontFamily: FONT_HEADING, fontSize: 13, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {stage.label}
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            fontWeight: 700,
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: `2px solid ${isDark ? 'rgba(255,255,255,0.5)' : BLACK}`,
            borderRadius: 3,
            padding: '1px 8px',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* body */}
      <div
        style={{
          border: `3px solid ${BLACK}`,
          backgroundColor: CREAM,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minHeight: 220,
          flex: 1,
        }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              border: `2px dashed ${BLACK}`,
              borderRadius: 4,
              padding: '24px 16px',
              textAlign: 'center',
              fontFamily: FONT_BODY,
              fontSize: 13,
              color: MUTED,
              fontWeight: 500,
            }}
          >
            Nothing here! …yet
          </div>
        ) : (
          tasks.map((t) => (
            <TaskCard key={t.id} task={t} onClick={onCardClick} onCopy={onCopy} />
          ))
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Anchor Board — M11
// ─────────────────────────────────────────────────────────────────────────────

const ANCHOR_ICONS = {
  presentation: '▶',
  demo: '◉',
  report: '▣',
  documentation: '≡',
};

function AnchorCard({ anchor, onChange }) {
  const filled = Boolean(anchor.url && anchor.url.trim());
  const icon = ANCHOR_ICONS[anchor.id] || '□';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(anchor.url || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  // Keep draft in sync if parent url changes (e.g. on reload)
  useEffect(() => { setDraft(anchor.url || ''); }, [anchor.url]);

  const save = () => { onChange(draft.trim() || null); setEditing(false); };
  const cancel = () => { setDraft(anchor.url || ''); setEditing(false); };

  return (
    <div
      style={{
        backgroundColor: filled ? TEAL : '#fff',
        border: `3px solid ${BLACK}`,
        boxShadow: neuShadow,
        borderRadius: 4,
        padding: 14,
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span aria-hidden="true" style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 13, color: BLACK }}>{anchor.label}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: FONT_MONO,
            fontSize: 10,
            fontWeight: 700,
            color: filled ? BLACK : MUTED,
            backgroundColor: filled ? 'rgba(0,0,0,0.1)' : '#F0EDE5',
            border: `2px solid ${BLACK}`,
            borderRadius: 3,
            padding: '1px 5px',
          }}
        >
          {filled ? '✓ LINKED' : '○ EMPTY'}
        </span>
      </div>

      {/* url area */}
      {editing ? (
        <div style={{ display: 'flex', gap: 5 }}>
          <input
            ref={inputRef}
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            placeholder="https://..."
            aria-label={`URL for ${anchor.label}`}
            style={{
              flex: 1,
              border: `2px solid ${BLACK}`,
              borderRadius: 3,
              padding: '5px 8px',
              fontFamily: FONT_MONO,
              fontSize: 11,
              backgroundColor: '#fff',
              outline: 'none',
            }}
          />
          <button
            onClick={save}
            style={{
              backgroundColor: BLACK, color: CREAM,
              border: `2px solid ${BLACK}`, borderRadius: 3,
              padding: '4px 10px', fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {filled ? (
            <a
              href={anchor.url}
              target="_blank"
              rel="noopener noreferrer"
              title={anchor.url}
              style={{
                flex: 1, fontFamily: FONT_MONO, fontSize: 11, color: BLACK,
                textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {anchor.url}
            </a>
          ) : (
            <span style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 12, color: MUTED }}>
              No link yet
            </span>
          )}
          <button
            onClick={() => { setDraft(anchor.url || ''); setEditing(true); }}
            aria-label={`${filled ? 'Edit' : 'Add'} URL for ${anchor.label}`}
            style={{
              backgroundColor: BLACK, color: CREAM,
              border: `2px solid ${BLACK}`, borderRadius: 3,
              padding: '3px 8px', fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {filled ? 'Edit' : '+ Add'}
          </button>
        </div>
      )}
    </div>
  );
}

function AnchorBoard({ anchors, onAnchorChange }) {
  const safeAnchors = Array.isArray(anchors) ? anchors : SEED_ANCHORS;
  return (
    <section aria-label="Deliverable Anchor Board" style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h2 style={{ fontFamily: FONT_HEADING, fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase', color: BLACK, margin: 0 }}>
          Deliverable Anchors
        </h2>
        <div style={{ flex: 1, height: 3, backgroundColor: BLACK }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {safeAnchors.map((a) => (
          <AnchorCard key={a.id} anchor={a} onChange={(url) => onAnchorChange(a.id, url)} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Modal
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: TEAM[0],
  dueDate: '',
  context: CONTEXT_TEMPLATE,
  contextTool: null,
};

function TaskModal({ task, onSave, onDelete, onClose, onToast }) {
  const isNew = !task?.id;

  const [form, setForm] = useState(() =>
    isNew
      ? { ...EMPTY_FORM }
      : {
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'feature',
        status: task.status || 'todo',
        assignee: task.assignee || TEAM[0],
        dueDate: task.dueDate || '',
        context: task.context || CONTEXT_TEMPLATE,
        contextTool: task.contextTool || null,
      }
  );
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const titleRef = useRef(null);

  // Auto-focus title on open
  useEffect(() => { if (titleRef.current) titleRef.current.focus(); }, []);

  // Escape to close
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const field = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value === '' && name === 'contextTool' ? null : e.target.value }));
    setErrors((er) => ({ ...er, [name]: null }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      setErrors({ title: 'Title is required.' });
      return;
    }
    const contextChanged = !isNew && form.context !== task.context;
    const saved = {
      id: isNew ? uid() : task.id,
      createdDate: isNew ? todayStr() : task.createdDate,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      status: form.status,
      assignee: form.assignee,
      dueDate: form.dueDate || null,
      context: form.context,
      contextTool: form.contextTool,
      contextUpdatedAt: isNew || contextChanged
        ? new Date().toISOString()
        : (task.contextUpdatedAt || null),
    };
    const wasHandoff = !isNew && saved.assignee !== task.assignee;
    onSave(saved);
    if (wasHandoff) onToast(`Task handed off to ${saved.assignee}.`, 'handoff');
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(task.id);
    onClose();
  };

  const handleCopy = () => {
    const md = buildPromptContext({ ...task, ...form });
    copyToClipboard(md).then(() => {
      onToast('Context copied. Hand it off to your AI tool.', 'success');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // shared styles
  const labelSty = {
    display: 'block',
    fontFamily: FONT_BODY,
    fontWeight: 700,
    fontSize: 13,
    color: BLACK,
    marginBottom: 5,
  };
  const inputSty = {
    width: '100%',
    border: `3px solid ${BLACK}`,
    borderRadius: 4,
    padding: '8px 10px',
    fontFamily: FONT_BODY,
    fontSize: 14,
    color: BLACK,
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(23,23,23,0.65)', zIndex: 1000 }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add task' : `Edit task: ${task.title}`}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          width: '90%',
          maxWidth: 660,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: CREAM,
          border: `3px solid ${BLACK}`,
          boxShadow: neuShadowL,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal header */}
        <div
          style={{
            backgroundColor: BLACK,
            color: CREAM,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: FONT_HEADING, fontSize: 16, letterSpacing: '0.5px' }}>
            {isNew ? '+ NEW TASK' : 'EDIT TASK'}
          </span>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: `2px solid ${CREAM}`,
              borderRadius: 3,
              color: CREAM,
              cursor: 'pointer',
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, flex: 1 }}>

          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="m-title" style={labelSty}>
              Title <span aria-hidden="true" style={{ color: CORAL }}>*</span>
            </label>
            <input
              id="m-title"
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={field('title')}
              placeholder="What needs to be done?"
              aria-required="true"
              aria-describedby={errors.title ? 'm-title-err' : undefined}
              style={{ ...inputSty, borderColor: errors.title ? '#FF5C5C' : BLACK }}
            />
            {errors.title && (
              <p id="m-title-err" role="alert" style={{ color: '#FF5C5C', fontSize: 12, marginTop: 4, fontFamily: FONT_BODY }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="m-desc" style={labelSty}>Description</label>
            <textarea
              id="m-desc"
              value={form.description}
              onChange={field('description')}
              placeholder="Briefly describe what this task covers."
              rows={3}
              style={{ ...inputSty, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Type + Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label htmlFor="m-type" style={labelSty}>Type</label>
              <select id="m-type" value={form.type} onChange={field('type')} style={inputSty}>
                <option value="feature">★ Feature</option>
                <option value="bug">✕ Bug</option>
              </select>
            </div>
            <div>
              <label htmlFor="m-status" style={labelSty}>Status</label>
              <select id="m-status" value={form.status} onChange={field('status')} style={inputSty}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Due date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label htmlFor="m-assignee" style={labelSty}>Assignee</label>
              <select id="m-assignee" value={form.assignee} onChange={field('assignee')} style={inputSty}>
                {TEAM.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="m-due" style={labelSty}>Due date</label>
              <input id="m-due" type="date" value={form.dueDate} onChange={field('dueDate')} style={inputSty} />
            </div>
          </div>

          {/* Hand off panel (edit mode only) */}
          {!isNew && (
            <div
              style={{
                backgroundColor: '#fff',
                border: `3px solid ${BLACK}`,
                boxShadow: `3px 3px 0 0 ${CORAL}`,
                borderRadius: 4,
                padding: '12px 14px',
                marginBottom: 14,
              }}
            >
              <p style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, marginBottom: 8, color: BLACK }}>
                ⇥ Hand off to…
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AssigneeBadge name={form.assignee} size="md" />
                <select
                  id="m-handoff"
                  value={form.assignee}
                  onChange={field('assignee')}
                  aria-label="Reassign task to a teammate"
                  style={{ ...inputSty, flex: 1 }}
                >
                  {TEAM.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── Context section ── */}
          <div>
            <h3
              style={{
                fontFamily: FONT_HEADING,
                fontSize: 12,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: BLACK,
                borderBottom: `3px solid ${BLACK}`,
                paddingBottom: 4,
                marginBottom: 12,
                marginTop: 20,
              }}
            >
              Context
            </h3>

            {/* AI tool */}
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="m-tool" style={labelSty}>AI Tool used</label>
              <select
                id="m-tool"
                value={form.contextTool || ''}
                onChange={(e) => setForm((f) => ({ ...f, contextTool: e.target.value || null }))}
                style={inputSty}
              >
                <option value="">— None —</option>
                {AI_TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* freshness indicator — M12 secret sauce */}
            {!isNew && task.contextUpdatedAt && (
              <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: MUTED, marginBottom: 8 }}>
                ◈ Context last updated {timeAgo(task.contextUpdatedAt)}
              </p>
            )}

            {/* Markdown context */}
            <label htmlFor="m-ctx" style={labelSty}>
              Prompt Context
              <span style={{ fontWeight: 400, marginLeft: 6, fontSize: 12, color: MUTED }}>
                (Markdown · paste into AI chat)
              </span>
            </label>
            <textarea
              id="m-ctx"
              value={form.context}
              onChange={field('context')}
              rows={10}
              style={{ ...inputSty, resize: 'vertical', lineHeight: 1.6, fontFamily: FONT_MONO, fontSize: 13 }}
            />

            {/* Copy from modal */}
            <div style={{ marginTop: 10 }}>
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: copied ? TEAL : BLACK,
                  color: copied ? BLACK : CREAM,
                  border: `3px solid ${BLACK}`,
                  boxShadow: copied ? 'none' : `3px 3px 0 0 ${MUTED}`,
                  borderRadius: 4,
                  padding: '8px 18px',
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background-color 150ms',
                }}
              >
                {copied ? '✓ Copied to clipboard' : '⇥ Copy as Prompt Context'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: `3px solid ${BLACK}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
            backgroundColor: CREAM,
          }}
        >
          <div>
            {!isNew && (
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: confirmDelete ? '#FF5C5C' : '#fff',
                  color: BLACK,
                  border: `3px solid ${BLACK}`,
                  boxShadow: neuShadowS,
                  borderRadius: 4,
                  padding: '8px 14px',
                  fontFamily: FONT_BODY,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background-color 150ms',
                }}
              >
                {confirmDelete ? '⚠ Confirm Delete' : '✕ Delete task'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#fff', color: BLACK,
                border: `3px solid ${BLACK}`, boxShadow: neuShadowS,
                borderRadius: 4, padding: '8px 18px',
                fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: CORAL, color: '#fff',
                border: `3px solid ${BLACK}`, boxShadow: neuShadow,
                borderRadius: 4, padding: '8px 22px',
                fontFamily: FONT_HEADING, fontSize: 13, letterSpacing: '0.5px', cursor: 'pointer',
                transition: 'transform 80ms, box-shadow 80ms',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = neuShadowS; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = neuShadow; }}
            >
              {isNew ? 'CREATE' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', null);
  const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', SEED_ANCHORS);

  // Seed on first visit (null means no prior data)
  useEffect(() => {
    if (tasks === null) setTasks(SEED_TASKS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeAnchors = Array.isArray(anchors) ? anchors : SEED_ANCHORS;

  // modal state: undefined = closed, null = new task, task object = edit
  const [modalTask, setModalTask] = useState(undefined);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'default') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const handleSave = useCallback((saved) => {
    setTasks((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const idx = arr.findIndex((t) => t.id === saved.id);
      if (idx >= 0) { const n = [...arr]; n[idx] = saved; return n; }
      return [...arr, saved];
    });
  }, [setTasks]);

  const handleDelete = useCallback((id) => {
    setTasks((prev) => Array.isArray(prev) ? prev.filter((t) => t.id !== id) : []);
  }, [setTasks]);

  const handleCopy = useCallback((task) => {
    showToast('Context copied. Hand it off to your AI tool.', 'success');
  }, [showToast]);

  const handleAnchorChange = useCallback((id, url) => {
    setAnchors((prev) =>
      (Array.isArray(prev) ? prev : SEED_ANCHORS).map((a) =>
        a.id === id ? { ...a, url } : a
      )
    );
  }, [setAnchors]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: FONT_BODY, color: BLACK }}>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        *:focus-visible { outline: 3px solid ${CORAL}; outline-offset: 2px; }
        ::selection { background: ${CORAL}; color: #fff; }
        select { appearance: auto; }
      `}</style>

      {/* ── Header ── */}
      <header
        style={{
          backgroundColor: BLACK,
          borderBottom: `4px solid ${BLACK}`,
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <span style={{ fontFamily: FONT_HEADING, fontSize: 28, letterSpacing: '3px', color: CREAM, textTransform: 'uppercase' }}>
            LELE<span style={{ backgroundColor: CORAL, color: '#fff', padding: '0 8px' }}>BYE</span>
          </span>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: TEAL, marginTop: 3, fontWeight: 500 }}>
            Vibecoding Project Tracker · The task tracker for vibecoders.
          </p>
        </div>

        <button
          id="add-task-btn"
          onClick={() => setModalTask(null)}
          aria-label="Add a new task"
          style={{
            backgroundColor: CORAL, color: '#fff',
            border: `3px solid ${CREAM}`, boxShadow: `4px 4px 0 0 ${CREAM}`,
            borderRadius: 4, padding: '11px 22px',
            fontFamily: FONT_HEADING, fontSize: 15, letterSpacing: '1px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            transition: 'transform 80ms, box-shadow 80ms',
            flexShrink: 0,
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = `2px 2px 0 0 ${CREAM}`; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `4px 4px 0 0 ${CREAM}`; }}
        >
          <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>+</span>
          Add task
        </button>
      </header>

      {/* ── Main ── */}
      <main style={{ padding: '28px 32px', maxWidth: 1600, margin: '0 auto' }}>

        <AnchorBoard anchors={safeAnchors} onAnchorChange={handleAnchorChange} />

        {/* Board label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontFamily: FONT_HEADING, fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase', color: BLACK, margin: 0 }}>
            Task Board
          </h2>
          <div style={{ flex: 1, height: 3, backgroundColor: BLACK }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: MUTED }}>
            {safeTasks.length} task{safeTasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Kanban grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              style={{
                border: `3px solid ${BLACK}`,
                boxShadow: neuShadow,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <KanbanColumn
                stage={stage}
                tasks={safeTasks.filter((t) => t.status === stage.id)}
                onCardClick={(task) => setModalTask(task)}
                onCopy={handleCopy}
              />
            </div>
          ))}
        </div>
      </main>

      {/* ── Modal ── */}
      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalTask(undefined)}
          onToast={showToast}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
