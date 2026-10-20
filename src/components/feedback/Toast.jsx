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
  }[type] || 'bg-text-primary text-surface-page';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[9999] ${bgClass} border-[3px] border-text-primary shadow-neu rounded px-5 py-3 font-body font-semibold text-sm max-w-xs animate-toast`}
    >
      {message}
    </div>
  );
}
