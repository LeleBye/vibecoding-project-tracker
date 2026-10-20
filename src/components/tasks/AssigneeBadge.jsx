import { initials } from '../../utils/taskUtils.js';

/**
 * Displays a user's initials in a small coloured badge.
 * size: 'sm' (26px) | 'md' (32px)
 */
export default function AssigneeBadge({ name, size = 'sm' }) {
  const sizeClass = size === 'sm'
    ? 'w-[26px] h-[26px] text-[11px]'
    : 'w-[32px] h-[32px] text-[13px]';

  return (
    <span
      title={name}
      className={`inline-flex items-center justify-center shrink-0 rounded border-2 border-text-primary bg-brand-primary text-white font-mono font-bold tracking-tight ${sizeClass}`}
    >
      {initials(name)}
    </span>
  );
}
