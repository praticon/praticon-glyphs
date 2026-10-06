import { useEffect, useRef, useState } from "react";

const PREFIX = "praticon:";

function read<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private windows, blocked site data); preferences just won't persist.
  }
}

/**
 * State that is remembered between visits. It starts at `initial` so the first
 * render matches the pre-rendered HTML, then loads the saved value after mount.
 * `isValid` guards against stale or hand-edited values.
 */
export function usePersistentState<T>(key: string, initial: T, isValid: (value: unknown) => value is T) {
  const [value, setValue] = useState(initial);
  const loaded = useRef(false);

  useEffect(() => {
    const saved = read<unknown>(key);
    if (saved !== undefined && isValid(saved)) setValue(saved);
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (loaded.current) write(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
