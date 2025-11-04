"use client";

import { useEffect, useSyncExternalStore } from "react";

// Throttle map to avoid rapid same-tab local-storage event cascades
const __lsEventThrottle: Record<string, number> = {};

function parseJSON<T>(value: string | null, fallback: T): T {
  if (value === null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Syncs state with browser localStorage.
 * Returns [value, setter, isLoading].
 *
 * Example:
 *   const [tasks, setTasks, loading] = useLocalStorage('tasks', []);
 */

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const isBrowser = typeof window !== "undefined";

  // Subscribe to storage changes (cross-tab) and a custom event (same-tab)
  const subscribe = (callback: () => void) => {
    if (!isBrowser) return () => {};
    const handler = () => {
      const now = Date.now();
      const last = __lsEventThrottle[key] ?? 0;
      if (now - last < 30) return; // ignore bursts within 30ms
      __lsEventThrottle[key] = now;
      callback();
    };
    window.addEventListener("storage", handler);
    window.addEventListener("local-storage", handler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("local-storage", handler as EventListener);
    };
  };

  const getSnapshot = () => {
    if (!isBrowser) return initialValue as T;
    const raw = window.localStorage.getItem(key);
    return raw === null ? (initialValue as T) : parseJSON<T>(raw, initialValue);
  };

  // For SSR, return the initial value
  const getServerSnapshot = () => initialValue as T;

  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Ensure the key exists in localStorage; avoid state writes in effects
  useEffect(() => {
    if (!isBrowser) return;
    if (window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      window.dispatchEvent(new Event("local-storage"));
    }
  }, [isBrowser, key, initialValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    if (!isBrowser) {
      console.warn(`Cannot write to localStorage during SSR (key: "${key}")`);
      return;
    }
    const current = getSnapshot();
    const valueToStore =
      value instanceof Function ? (value as (val: T) => T)(current) : value;
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
    // Notify subscribers in this tab
    window.dispatchEvent(new Event("local-storage"));
  };

  // Loading is true only during SSR; on the client, value is ready during render
  const loading = !isBrowser;

  return [storedValue, setValue, loading];
}

export default useLocalStorage;
