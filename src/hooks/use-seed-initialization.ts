"use client";

import { useEffect } from "react";
import {
  loadRoutines,
  saveRoutines,
  loadReminders,
  saveReminders,
} from "@/lib/storage";
import { defaultRoutines, defaultReminders } from "@/lib/initial-data";

const INITIALIZED_KEY = "focus-flow:v1:initialized";

/**
 * Hook to initialize default data on first app run
 * Checks for initialization flag and loads seed data if needed
 */
export function useSeedInitialization() {
  useEffect(() => {
    // Check if already initialized
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);

    if (!isInitialized) {
      console.info(
        "[seed] First app run detected. Initializing default data..."
      );

      // Initialize routines if empty
      const existingRoutines = loadRoutines();
      if (existingRoutines.length === 0) {
        console.info(
          `[seed] Loading ${defaultRoutines.length} default routines`
        );
        saveRoutines(defaultRoutines);
      } else {
        console.info(
          `[seed] Skipping routines: ${existingRoutines.length} already exist`
        );
      }

      // Initialize reminders if empty
      const existingReminders = loadReminders();
      if (existingReminders.length === 0) {
        console.info(
          `[seed] Loading ${defaultReminders.length} default reminders`
        );
        saveReminders(defaultReminders);
      } else {
        console.info(
          `[seed] Skipping reminders: ${existingReminders.length} already exist`
        );
      }

      // Mark as initialized
      localStorage.setItem(INITIALIZED_KEY, "true");
      console.info("[seed] Initialization complete");
    }
  }, []);
}
