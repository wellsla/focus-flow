"use client";

import { useEffect, useState } from "react";
import {
  computeOverallPerformance,
  OverallPerformanceSnapshot,
  getPerformanceHistory,
  recordPerformanceSnapshot,
} from "@/lib/performance-metrics";
import { format } from "date-fns";

export function usePerformanceMetrics() {
  // Initialize synchronously to avoid extra render in effect
  const [snapshot, setSnapshot] = useState<OverallPerformanceSnapshot>(() =>
    computeOverallPerformance()
  );

  useEffect(() => {
    // Ensure today's snapshot exists and recompute on local storage changes
    const ensureToday = () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const history = getPerformanceHistory();
      const exists = history.some((h) => h.date === today);
      if (!exists) recordPerformanceSnapshot(today);
    };

    const handler = () => {
      ensureToday();
      setSnapshot(computeOverallPerformance());
    };

    // Initial ensure + compute
    ensureToday();
    // Listen to custom event fired by storage.ts
    window.addEventListener("local-storage", handler as EventListener);
    return () =>
      window.removeEventListener("local-storage", handler as EventListener);
  }, []);

  return snapshot;
}

export function usePerformanceHistory() {
  const [_, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("local-storage", handler as EventListener);
    return () =>
      window.removeEventListener("local-storage", handler as EventListener);
  }, []);

  return getPerformanceHistory();
}
