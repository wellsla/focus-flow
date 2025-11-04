"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

const __lsEventThrottle: Record<string, number> = {};

function parseJSON<T>(value: string | null, fallback: T): T {
  if (value === null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const isBrowser = typeof window !== "undefined";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialFallback = useMemo(() => initialValue, []);

  const rawCacheRef = useRef<string | null>(
    isBrowser ? window.localStorage.getItem(key) : null
  );

  const subscribe = useCallback(
    (notify: () => void) => {
      if (!isBrowser) return () => {};

      const handler = () => {
        const now = Date.now();
        const last = __lsEventThrottle[key] ?? 0;
        if (now - last < 30) return;
        __lsEventThrottle[key] = now;

        const next = window.localStorage.getItem(key);
        if (next !== rawCacheRef.current) {
          rawCacheRef.current = next;
          notify();
        }
      };

      const onStorage = (ev: StorageEvent) => {
        if (ev.storageArea === window.localStorage && ev.key === key) {
          handler();
        }
      };

      window.addEventListener("storage", onStorage);
      window.addEventListener("local-storage", handler as EventListener);

      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("local-storage", handler as EventListener);
      };
    },
    [isBrowser, key]
  );

  const getSnapshot = useCallback(() => rawCacheRef.current, []);
  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<T>(() => {
    return raw === null
      ? (initialFallback as T)
      : parseJSON<T>(raw, initialFallback as T);
  }, [raw, initialFallback]);

  useEffect(() => {
    if (!isBrowser) return;
    if (window.localStorage.getItem(key) === null) {
      const serialized = JSON.stringify(initialFallback);
      rawCacheRef.current = serialized;
      window.localStorage.setItem(key, serialized);
      window.dispatchEvent(new Event("local-storage"));
    }
  }, [isBrowser, key, initialFallback]);

  const setValue = (updater: T | ((val: T) => T)) => {
    if (!isBrowser) {
      console.warn(`Cannot write to localStorage during SSR (key: "${key}")`);
      return;
    }

    const prev = value;
    const next =
      updater instanceof Function ? (updater as (v: T) => T)(prev) : updater;
    const nextRaw = JSON.stringify(next);

    if (nextRaw === rawCacheRef.current) return;

    rawCacheRef.current = nextRaw;
    window.localStorage.setItem(key, nextRaw);
    window.dispatchEvent(new Event("local-storage"));
  };

  const loading = !isBrowser;

  return [value, setValue, loading];
}

export default useLocalStorage;
