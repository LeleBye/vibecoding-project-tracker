import { useState, useEffect } from 'react';

/**
 * Persist state to localStorage. Supplied by starter scaffold — do not change behaviour.
 * Keys used by this app:
 *   - 'vibetracker.tasks'
 *   - 'vibetracker.anchors'
 */
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
