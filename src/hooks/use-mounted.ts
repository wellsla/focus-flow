"use client";

import { useSyncExternalStore } from "react";

/**
 * useMounted returns true only after the component has hydrated on the client.
 * Useful to avoid SSR/client markup divergence for time/random/window-derived values.
 */
export function useMounted(): boolean {
  // Distinguish SSR (false) vs client (true) without setState side effects.
  return useSyncExternalStore(
    // No-op subscribe (no external updates required)
    () => () => {},
    // Client snapshot
    () => true,
    // Server snapshot
    () => false
  );
}
