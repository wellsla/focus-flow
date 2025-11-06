/**
 * use-pomodoro-timer.ts
 *
 * Robust pomodoro timer hook with accurate time tracking
 * Uses startedAt + duration calculation to handle tab switching
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNow } from "./use-now";
import { useNotifications } from "./use-notifications";
import { useSound } from "./use-sound";
import type { PomodoroSettings, PomodoroSession } from "@/lib/types";
import { loadPomodoroSettings, appendPomodoroSession } from "@/lib/storage";

export type PomodoroState = "idle" | "work" | "break" | "long-break" | "paused";

interface PomodoroTimerState {
  state: PomodoroState;
  remainingSeconds: number;
  totalSeconds: number;
  currentCycle: number; // Current work cycle (1-indexed)
  startedAt: string | null; // ISO string when timer started
  sessionId: string | null;
}

interface UsePomodoroTimerReturn {
  state: PomodoroState;
  remainingSeconds: number;
  totalSeconds: number;
  currentCycle: number;
  progress: number; // 0-100
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  settings: PomodoroSettings;
}

/**
 * Custom hook for pomodoro timer with cycle management
 */
export function usePomodoroTimer(): UsePomodoroTimerReturn {
  const [settings] = useState<PomodoroSettings>(loadPomodoroSettings);
  const [timerState, setTimerState] = useState<PomodoroTimerState>({
    state: "idle",
    remainingSeconds: settings.workMin * 60,
    totalSeconds: settings.workMin * 60,
    currentCycle: 1,
    startedAt: null,
    sessionId: null,
  });

  const { notify } = useNotifications();
  const { play } = useSound();
  const now = useNow(1000); // Update every second
  const completionHandledRef = useRef<string | null>(null);

  // Store timer state in ref for completion handler
  const timerStateRef = useRef(timerState);
  const settingsRef = useRef(settings);

  useEffect(() => {
    timerStateRef.current = timerState;
    settingsRef.current = settings;
  });

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
        notify("Pomodoro Completo! 🎯", "Hora de fazer uma pausa.");
      } else {
        notify("Pausa Terminada", "Pronto para voltar ao foco?");
      }
    }

    if (sett.sound) {
      play("/sounds/complete.mp3", 0.5);
    }

    if (sett.vibration && "vibrate" in navigator) {
      navigator.vibrate(200);
    }

    // Transition to next state
    if (currentState === "work") {
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
  }, [notify, play]);

  // Calculate remaining time and handle completion
  useEffect(() => {
    if (timerState.state === "paused" || timerState.state === "idle") {
      return;
    }

    if (!timerState.startedAt) return;

    const startedTime = new Date(timerState.startedAt).getTime();
    const elapsed = Math.floor((now.getTime() - startedTime) / 1000);
    const remaining = Math.max(0, timerState.totalSeconds - elapsed);

    setTimerState((prev) => ({
      ...prev,
      remainingSeconds: remaining,
    }));

    // Handle completion
    if (
      remaining === 0 &&
      completionHandledRef.current !== timerState.sessionId
    ) {
      completionHandledRef.current = timerState.sessionId;
      handleCompletion();
    }
  }, [
    now,
    timerState.state,
    timerState.startedAt,
    timerState.totalSeconds,
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
    });
    completionHandledRef.current = null;
  }, [settings.workMin, timerState.state, timerState.currentCycle]);

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
    });
    completionHandledRef.current = null;
  }, [settings.workMin]);

  const progress =
    timerState.totalSeconds > 0
      ? ((timerState.totalSeconds - timerState.remainingSeconds) /
          timerState.totalSeconds) *
        100
      : 0;

  return {
    state: timerState.state,
    remainingSeconds: timerState.remainingSeconds,
    totalSeconds: timerState.totalSeconds,
    currentCycle: timerState.currentCycle,
    progress,
    start,
    pause,
    resume,
    skip,
    reset,
    settings,
  };
}
