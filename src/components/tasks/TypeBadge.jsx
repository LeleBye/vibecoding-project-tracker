/**
 * Coloured badge showing task type: Feature (blue) or Bug (red).
 */
export default function TypeBadge({ type }) {
  const cfg = {
    feature: { bg: 'bg-type-feature', icon: '★', label: 'Feature' },
    bug:     { bg: 'bg-type-bug',     icon: '✕', label: 'Bug'     },
  };
  const c = cfg[type] || cfg.feature;

  return (
    <span
      className={`inline-flex items-center gap-1 ${c.bg} text-white border-2 border-text-primary rounded-sm px-[7px] py-[1px] font-mono text-[11px] font-bold uppercase tracking-[0.3px] shrink-0`}
    >
      <span aria-hidden="true">{c.icon}</span>
      {c.label}
    </span>
  );
}
