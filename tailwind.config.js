/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Only apply hover: styles on devices that can truly hover, so taps on
  // touchscreens don't leave cards/buttons stuck in their lifted state.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // ── Brand (DESIGN.md §2) ──────────────────────────────────────────────
        'brand-primary':  '#FF5C7A',  // Header, "+" button, focus rings
        'brand-accent':   '#36D6D0',  // Highlights, hover states, links
        'surface-page':   '#FFF8E8',  // Page background
        'surface-card':   '#FFFFFF',  // Card background
        'text-primary':   '#171717',  // Body text
        'text-muted':     '#625D66',  // Captions, dates, counts

        // ── Task type (M6 tag-style) ─────────────────────────────────────────
        'type-feature':   '#5B8CFF',  // Cards tagged `feature`
        'type-bug':       '#FF5C5C',  // Cards tagged `bug`

        // ── Due-date states (M8 due-tint) ────────────────────────────────────
        'due-safe':       '#B9F5C5',  // More than 2 days out
        'due-warning':    '#FFD166',  // Less than 24 hours
        'due-overdue':    '#FF8A8A',  // Past due
        'due-neutral':    '#D9D9D9',  // Done (overrides date)
      },
      fontFamily: {
        heading: ['"Archivo Black"', 'system-ui', 'sans-serif'],
        body:    ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'neu':    '4px 4px 0 0 #171717',
        'neu-sm': '2px 2px 0 0 #171717',
        'neu-lg': '6px 6px 0 0 #171717',
        'neu-brand': '4px 4px 0 0 #FF5C7A',
      },
    },
  },
  plugins: [],
};
