/**
 * use-local-storage-state.ts
 *
 * Simplified hook for state that persists to localStorage
 * Combines useState with automatic persistence
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { getStorageItem, setStorageItem } from "@/lib/storage";

/**
 * Like useState but persists to localStorage automatically
 * Uses the centralized storage layer with namespace
 *
 * @param key - Storage key (will be namespaced automatically)
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple like useState
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = getStorageItem<T>(key);
    return stored !== null ? stored : initialValue;
  });

  // Persist to storage whenever state changes
  useEffect(() => {
    setStorageItem(key, state);
  }, [key, state]);

  // Listen for changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ("detail" in e) {
        // CustomEvent from same tab
        const targetKey = `focus-flow:v1:${key}`;
        if (!e.detail || e.detail.key === targetKey) {
          const updated = getStorageItem<T>(key);
          if (updated !== null) {
            setState(updated);
          }
        }
      } else if (e.key === `focus-flow:v1:${key}`) {
        // StorageEvent from other tabs
        const updated = getStorageItem<T>(key);
        if (updated !== null) {
          setState(updated);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange as EventListener);
    window.addEventListener(
      "local-storage",
      handleStorageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange as EventListener
      );
      window.removeEventListener(
        "local-storage",
        handleStorageChange as EventListener
      );
    };
  }, [key]);

  return [state, setState];
}
