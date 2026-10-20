import { getDueState, fmtDate } from '../../utils/taskUtils.js';

/**
 * Pill showing due-date urgency — hidden for 'none' and 'neutral' states.
 * Background colours are applied inline to avoid Tailwind purging dynamic values.
 */
export default function DuePill({ dueDate, status }) {
  const state = getDueState(dueDate, status);
  if (state === 'none' || state === 'neutral') return null;
  const cfg = {
    safe: { label: 'On track', icon: '✓', bg: 'bg-due-safe' },
    warning: { label: 'Due soon', icon: '⚡', bg: 'bg-due-warning' },
    overdue: { label: 'Overdue', icon: '!', bg: 'bg-due-overdue' },
  }[state];

  return (
    <span
      aria-label={`Due ${fmtDate(dueDate)} — ${cfg.label}`}
      className={`inline-flex shrink-0 items-center gap-[3px] rounded-sm border-2 border-text-primary px-[6px] py-[1px] font-mono text-[11px] font-bold text-text-primary ${cfg.bg}`}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {fmtDate(dueDate)}
    </span>
  );
}
