import { useEffect } from 'react';

/**
 * Toast notification — auto-dismisses after 2.8 s.
 * Rendered by App, keyed on `toast.key` so re-mounting resets the timer.
 */
export default function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2800);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const bgClass = {
    default: 'bg-text-primary text-surface-page',
    success: 'bg-brand-accent text-text-primary',
    handoff: 'bg-brand-primary text-white',
    error: 'bg-type-bug text-white',
  }[type] || 'bg-text-primary text-surface-page';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[9999] ${bgClass} border-[3px] border-text-primary shadow-neu rounded px-5 py-3 font-body font-semibold text-sm animate-toast md:inset-x-auto md:bottom-6 md:right-6 md:max-w-xs`}
    >
      {message}
    </div>
  );
}
