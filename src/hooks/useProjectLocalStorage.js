import { useEffect, useRef, useState } from 'react';

function readValue(key, initialValue) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? initialValue : JSON.parse(raw);
  } catch {
    return initialValue;
  }
}

/**
 * Persists one project's data without changing the original project keys.
 * The first project continues to use the legacy keys for compatibility.
 */
export function useProjectLocalStorage(projectId, legacyKey, initialValue) {
  const storageKey = projectId === 'vibecoding' ? legacyKey : `vibetracker.project.${projectId}.${legacyKey.split('.').pop()}`;
  const [value, setValue] = useState(() => readValue(storageKey, initialValue));
  const activeKey = useRef(storageKey);

  useEffect(() => {
    if (activeKey.current !== storageKey) {
      activeKey.current = storageKey;
      setValue(readValue(storageKey, initialValue));
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Preserve the existing app behaviour in private mode or when storage is full.
    }
  }, [initialValue, storageKey, value]);

  return [value, setValue];
}
