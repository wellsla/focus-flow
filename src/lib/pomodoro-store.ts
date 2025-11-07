/**
 * pomodoro-store.ts
 *
 * Global state store for Pomodoro timer using localStorage
 * Ensures dashboard and pomodoro page are synchronized
 */

"use client";

import type { PomodoroSettings, PomodoroCategory } from "./types";

export type PomodoroState = "idle" | "work" | "break" | "long-break" | "paused";

export interface PomodoroTimerState {
  state: PomodoroState;
  remainingSeconds: number;
  totalSeconds: number;
  currentCycle: number;
  startedAt: string | null;
  sessionId: string | null;
  category?: PomodoroCategory; // Current session category
}

const POMODORO_STATE_KEY = "focus-flow:v1:pomodoro-state";

export function getPomodoroState(
  settings: PomodoroSettings
): PomodoroTimerState {
  if (typeof window === "undefined") {
    return {
      state: "idle",
      remainingSeconds: settings.workMin * 60,
      totalSeconds: settings.workMin * 60,
      currentCycle: 1,
      startedAt: null,
      sessionId: null,
    };
  }

  try {
    const stored = localStorage.getItem(POMODORO_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load pomodoro state:", error);
  }

  return {
    state: "idle",
    remainingSeconds: settings.workMin * 60,
    totalSeconds: settings.workMin * 60,
    currentCycle: 1,
    startedAt: null,
    sessionId: null,
    category: undefined,
  };
}

export function setPomodoroState(state: PomodoroTimerState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(POMODORO_STATE_KEY, JSON.stringify(state));

    // Dispatch custom event for cross-component sync
    window.dispatchEvent(
      new CustomEvent("pomodoro-state-change", { detail: state })
    );
  } catch (error) {
    console.error("Failed to save pomodoro state:", error);
  }
}

export function clearPomodoroState(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(POMODORO_STATE_KEY);
    window.dispatchEvent(new CustomEvent("pomodoro-state-change"));
  } catch (error) {
    console.error("Failed to clear pomodoro state:", error);
  }
}
