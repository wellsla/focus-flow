"use client";

import { useEffect, useState } from "react";
import {
  computeOverallPerformance,
  OverallPerformanceSnapshot,
} from "@/lib/performance-metrics";

export function usePerformanceMetrics() {
  // Initialize synchronously to avoid extra render in effect
  const [snapshot, setSnapshot] = useState<OverallPerformanceSnapshot>(() =>
    computeOverallPerformance()
  );

  useEffect(() => {
    // Recompute whenever localStorage updates (our storage.ts dispatches 'storage-update')
    const handler = () => setSnapshot(computeOverallPerformance());
    window.addEventListener("storage-update", handler as EventListener);
    return () =>
      window.removeEventListener("storage-update", handler as EventListener);
  }, []);

  return snapshot;
}
