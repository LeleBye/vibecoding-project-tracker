/**
 * Viewport helpers shared by components that behave differently on phones.
 * The breakpoint matches Tailwind's `md` screen (768px).
 */
export const DESKTOP_QUERY = '(min-width: 768px)';

/** True when the viewport is at least Tailwind's `md` width. */
export function isDesktopViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia(DESKTOP_QUERY).matches;
}
