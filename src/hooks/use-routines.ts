/**
 * use-routines.ts
 *
 * Hook for managing routine items and checkmarks
 * Handles check/uncheck, persistence, and streak calculation
 */

"use client";

import { useCallback, useState } from "react";
import { useLocalStorageState } from "./use-local-storage-state";
import { loadChecks, saveChecks } from "@/lib/storage";
import type { RoutineItem, Checkmark, RoutineReflection } from "@/lib/types";
import { format, startOfDay } from "date-fns";
import { initializeRoutines } from "@/lib/initial-data";

/**
 * Main hook for routine management
 */
export function useRoutines() {
  const [routines, setRoutines] = useLocalStorageState<RoutineItem[]>(
    "routines",
    []
  );

  // Initialize with defaults if empty
  const initializedRoutines = initializeRoutines(routines);
  if (initializedRoutines.length !== routines.length) {
    setRoutines(initializedRoutines);
  }

  return {
    routines: initializedRoutines,
    setRoutines,
  };
}

/**
 * Hook for managing today's checkmarks
 * Uses date-specific storage for efficiency
 */
export function useTodayCheckmarks() {
  const todayISO = format(startOfDay(new Date()), "yyyy-MM-dd");
  const [checkmarks, setCheckmarks] = useState<Checkmark[]>(() => {
    if (typeof window === "undefined") return [];
    return loadChecks(todayISO);
  });

  /**
   * Toggle checkmark for a routine on today's date
   * Optionally attach reflection data when completing
   */
  const toggleCheck = useCallback(
    (routineId: string, checked: boolean, reflection?: RoutineReflection) => {
      const existing = checkmarks.find((c) => c.routineId === routineId);

      let updated: Checkmark[];
      if (existing) {
        // Update existing checkmark
        updated = checkmarks.map((c) =>
          c.id === existing.id
            ? { ...c, done: checked, reflection: reflection || c.reflection }
            : c
        );
      } else {
        // Create new checkmark
        const newCheck: Checkmark = {
          id: `check-${Date.now()}-${routineId}`,
          routineId,
          dateISO: todayISO,
          done: checked,
          reflection,
        };
        updated = [...checkmarks, newCheck];
      }

      setCheckmarks(updated);
      saveChecks(todayISO, updated);
    },
    [checkmarks, todayISO]
  );

  return {
    checkmarks,
    toggleCheck,
  };
}

/**
 * Combined hook for routines + checkmarks
 */
export function useRoutinesWithChecks() {
  const { routines, setRoutines } = useRoutines();
  const { checkmarks, toggleCheck } = useTodayCheckmarks();

  return {
    routines,
    setRoutines,
    checkmarks,
    toggleCheck,
  };
}
