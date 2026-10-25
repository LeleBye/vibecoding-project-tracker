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
 * Displays a user's initials in a small coloured badge.
 * size: 'sm' (26px) | 'md' (32px)
 */
export default function AssigneeBadge({ name, size = 'sm' }) {
  const sizeClass = size === 'sm'
    ? 'w-[26px] h-[26px] text-[11px]'
    : 'w-[32px] h-[32px] text-[13px]';
  const colorClass = getBadgeColor(name);

  return (
    <span
      title={name}
      className={`inline-flex items-center justify-center shrink-0 rounded border-2 border-text-primary ${colorClass} font-mono font-bold tracking-tight ${sizeClass}`}
    >
      {initials(name)}
    </span>
  );
}
