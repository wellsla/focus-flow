/**
 * use-pomodoro-timer.ts
 *
 * Robust pomodoro timer hook with accurate time tracking
 * Uses startedAt + duration calculation to handle tab switching
 * Synchronized across components via localStorage
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNow } from "./use-now";
import { useNotifications } from "./use-notifications";
import { useSound } from "./use-sound";
import { useRewardSystem } from "./use-reward-system";
import type {
  PomodoroSettings,
  PomodoroSession,
  PomodoroCategory,
} from "@/lib/types";
import {
  loadPomodoroSettings,
  appendPomodoroSession,
  loadPomodoroSessions,
} from "@/lib/storage";
import {
  getPomodoroState,
  setPomodoroState,
  type PomodoroState,
  type PomodoroTimerState,
} from "@/lib/pomodoro-store";

interface UsePomodoroTimerReturn {
  state: PomodoroState;
  remainingSeconds: number;
  totalSeconds: number;
  currentCycle: number;
  progress: number; // 0-100
  category?: PomodoroCategory;
  start: () => void;
  startWithCategory: (category: PomodoroCategory) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  settings: PomodoroSettings;
  validateProductivity: (wasTrulyProductive: boolean) => void;
}

/**
 * Custom hook for pomodoro timer with cycle management
 */
export function usePomodoroTimer(): UsePomodoroTimerReturn {
  const [settings] = useState<PomodoroSettings>(loadPomodoroSettings);
  const [timerState, setTimerState] = useState<PomodoroTimerState>(() =>
    getPomodoroState(settings)
  );

  const { notify } = useNotifications();
  const { play } = useSound();
  const { grantPomodoroGems } = useRewardSystem();
  const now = useNow(1000); // Update every second
  const completionHandledRef = useRef<string | null>(null);

  // Store timer state in ref for completion handler
  const timerStateRef = useRef(timerState);
  const settingsRef = useRef(settings);

  useEffect(() => {
    timerStateRef.current = timerState;
    settingsRef.current = settings;
  });

  // Sync with localStorage changes from other components
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      const newState = e.detail as PomodoroTimerState | undefined;
      if (newState) {
        setTimerState(newState);
      } else {
        setTimerState(getPomodoroState(settings));
      }
    };

    window.addEventListener(
      "pomodoro-state-change" as keyof WindowEventMap,
      handleStorageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "pomodoro-state-change" as keyof WindowEventMap,
        handleStorageChange as EventListener
      );
    };
  }, [settings]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    setPomodoroState(timerState);
  }, [timerState]);

  /**
   * Handle timer completion (work/break finished)
   */
  const handleCompletion = useCallback(() => {
    const state = timerStateRef.current;
    const sett = settingsRef.current;
    const { state: currentState, currentCycle, sessionId } = state;

    // Save completed session
    if (sessionId) {
      const session: PomodoroSession = {
        id: sessionId,
        startedAt: state.startedAt!,
        endedAt: new Date().toISOString(),
        kind: currentState as "work" | "break" | "long-break",
        completed: true,
      };
      appendPomodoroSession(session);
    }

    // Alert user
    if (sett.desktopNotifications) {
      if (currentState === "work") {
        notify("Pomodoro Complete! 🎯", "Time to take a break.");
      } else {
        notify("Break Over", "Ready to get back to focus?");
      }
    }

    if (sett.sound) {
      play("/sounds/complete.mp3", 0.5);
    }

    if (sett.vibration && "vibrate" in navigator) {
      navigator.vibrate(200);
    }

    // Reward gems for productive work session
    if (currentState === "work") {
      // Grant gems for finishing a work session
      try {
        grantPomodoroGems();
      } catch (e) {
        // no-op
      }

      // Transition to break state
      const isLongBreak = currentCycle % sett.cyclesUntilLong === 0;
      const nextState = isLongBreak ? "long-break" : "break";
      const nextDuration = isLongBreak
        ? sett.longBreakMin * 60
        : sett.breakMin * 60;

      setTimerState({
        state: nextState,
        remainingSeconds: nextDuration,
        totalSeconds: nextDuration,
        currentCycle: currentCycle,
        startedAt: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
      });
    } else {
      const nextDuration = sett.workMin * 60;
      setTimerState({
        state: "idle",
        remainingSeconds: nextDuration,
        totalSeconds: nextDuration,
        currentCycle: currentCycle + 1,
        startedAt: null,
        sessionId: null,
      });
    }
  }, [notify, play, grantPomodoroGems]);

  // Calculate remaining time dynamically (no setState needed)
  const actualRemainingSeconds = (() => {
    if (timerState.state === "paused" || timerState.state === "idle") {
      return timerState.remainingSeconds;
    }

    if (!timerState.startedAt) return timerState.remainingSeconds;

    const startedTime = new Date(timerState.startedAt).getTime();
    const elapsed = Math.floor((now.getTime() - startedTime) / 1000);
    return Math.max(0, timerState.totalSeconds - elapsed);
  })();

  // Handle completion
  useEffect(() => {
    if (timerState.state === "paused" || timerState.state === "idle") {
      return;
    }

    if (!timerState.startedAt) return;

    if (
      actualRemainingSeconds === 0 &&
      completionHandledRef.current !== timerState.sessionId
    ) {
      completionHandledRef.current = timerState.sessionId;
      handleCompletion();
    }
  }, [
    actualRemainingSeconds,
    timerState.state,
    timerState.startedAt,
    timerState.sessionId,
    handleCompletion,
  ]);

  const start = useCallback(() => {
    const duration = settings.workMin * 60;
    setTimerState({
      state: "work",
      remainingSeconds: duration,
      totalSeconds: duration,
      currentCycle: timerState.state === "idle" ? timerState.currentCycle : 1,
      startedAt: new Date().toISOString(),
      sessionId: crypto.randomUUID(),
      category: undefined, // Category will be set by startWithCategory
    });
    completionHandledRef.current = null;
  }, [settings.workMin, timerState.state, timerState.currentCycle]);

  const startWithCategory = useCallback(
    (category: PomodoroCategory) => {
      const duration = settings.workMin * 60;
      setTimerState({
        state: "work",
        remainingSeconds: duration,
        totalSeconds: duration,
        currentCycle: timerState.state === "idle" ? timerState.currentCycle : 1,
        startedAt: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
        category,
      });
      completionHandledRef.current = null;
    },
    [settings.workMin, timerState.state, timerState.currentCycle]
  );

  const pause = useCallback(() => {
    if (timerState.state === "idle" || timerState.state === "paused") return;

    if (timerState.sessionId) {
      const session: PomodoroSession = {
        id: timerState.sessionId,
        startedAt: timerState.startedAt!,
        endedAt: new Date().toISOString(),
        kind: timerState.state as "work" | "break" | "long-break",
        completed: false,
      };
      appendPomodoroSession(session);
    }

    setTimerState((prev) => ({
      ...prev,
      state: "paused",
    }));
  }, [timerState]);

  const resume = useCallback(() => {
    if (timerState.state !== "paused") return;

    const newStartedAt = new Date(
      Date.now() -
        (timerState.totalSeconds - timerState.remainingSeconds) * 1000
    ).toISOString();

    setTimerState((prev) => ({
      ...prev,
      state: "work",
      startedAt: newStartedAt,
      sessionId: crypto.randomUUID(),
    }));
    completionHandledRef.current = null;
  }, [timerState]);

  const skip = useCallback(() => {
    handleCompletion();
  }, [handleCompletion]);

  const reset = useCallback(() => {
    setTimerState({
      state: "idle",
      remainingSeconds: settings.workMin * 60,
      totalSeconds: settings.workMin * 60,
      currentCycle: 1,
      startedAt: null,
      sessionId: null,
      category: undefined,
    });
    completionHandledRef.current = null;
  }, [settings.workMin]);

  const validateProductivity = useCallback(
    (wasTrulyProductive: boolean) => {
      // Find the most recent work session and update it
      if (timerState.sessionId) {
        const sessions = loadPomodoroSessions();
        const sessionIndex = sessions.findIndex(
          (s) => s.id === timerState.sessionId
        );

        if (sessionIndex !== -1) {
          sessions[sessionIndex] = {
            ...sessions[sessionIndex],
            wasTrulyProductive,
          };

          // Save updated sessions
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "focus-flow:v1:pomodoro-sessions",
              JSON.stringify(sessions)
            );
          }
        }
      }
    },
    [timerState.sessionId]
  );

  const progress =
    timerState.totalSeconds > 0
      ? ((timerState.totalSeconds - actualRemainingSeconds) /
          timerState.totalSeconds) *
        100
      : 0;

  return {
    state: timerState.state,
    remainingSeconds: actualRemainingSeconds,
    totalSeconds: timerState.totalSeconds,
    currentCycle: timerState.currentCycle,
    progress,
    category: timerState.category,
    start,
    startWithCategory,
    pause,
    resume,
    skip,
    reset,
    settings,
    validateProductivity,
  };
}
