/**
 * use-now.ts
 *
 * Hook that provides current time and updates at specified interval
 * Useful for timers and clocks
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Get current Date object that updates every tickMs milliseconds
 * @param tickMs - Update interval in milliseconds (default 1000)
 * @returns Current Date object
 */
export function useNow(tickMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, tickMs);

    return () => clearInterval(interval);
  }, [tickMs]);

  return now;
}
