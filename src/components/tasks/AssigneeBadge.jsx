import { initials } from '../../utils/taskUtils.js';

const BADGE_COLORS = [
  'bg-brand-primary text-white',
  'bg-brand-accent text-text-primary',
  'bg-due-warning text-text-primary',
  'bg-type-feature text-white',
  'bg-[#B9F5C5] text-text-primary',
  'bg-[#D8B4FE] text-text-primary',
];

function getBadgeColor(name) {
  if (!name) return BADGE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BADGE_COLORS.length;
  return BADGE_COLORS[index];
}

/**
 * Displays a user's initials in a small coloured badge,
 * or a dedicated unassigned icon if unassigned.
 * size: 'sm' (26px) | 'md' (32px)
 */
export default function AssigneeBadge({ name, size = 'sm' }) {
  const isUnassigned = !name || name === 'Unassigned';

  const sizeClass = size === 'sm'
    ? 'w-[26px] h-[26px] text-[11px]'
    : 'w-[32px] h-[32px] text-[13px]';

  if (isUnassigned) {
    const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]';
    return (
      <span
        title="Unassigned"
        aria-label="Unassigned"
        className={`inline-flex items-center justify-center shrink-0 rounded border-2 border-dashed border-text-primary bg-[#F0EDE5] text-text-primary font-mono ${sizeClass}`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconSizeClass}
          aria-hidden="true"
        >
          <path d="M16 17v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 15.5V17" />
          <circle cx="10" cy="6.5" r="3.5" />
        </svg>
      </span>
    );
  }

  const colorClass = getBadgeColor(name);

  return (
    <span
      title={name}
      aria-label={`Assigned to ${name}`}
      className={`inline-flex items-center justify-center shrink-0 rounded border-2 border-text-primary ${colorClass} font-mono font-bold tracking-tight ${sizeClass}`}
    >
      {initials(name)}
    </span>
  );
}
