/**
 * PomodoroTimer.tsx
 *
 * Visual display of pomodoro timer
 * Large, readable, minimal distractions (ADHD-friendly)
 */

"use client";

import { cn } from "@/lib/utils";
import type { PomodoroState } from "@/hooks/use-pomodoro-timer";

interface PomodoroTimerProps {
  state: PomodoroState;
  remainingSeconds: number;
  totalSeconds: number;
  currentCycle: number;
  progress: number;
  className?: string;
}

/**
 * Format seconds as MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Get display label for current state
 */
function getStateLabel(state: PomodoroState): string {
  switch (state) {
    case "idle":
      return "Pronto para começar";
    case "work":
      return "Foco Profundo";
    case "break":
      return "Pausa Curta";
    case "long-break":
      return "Pausa Longa";
    case "paused":
      return "Pausado";
    default:
      return "";
  }
}

/**
 * Get color scheme for current state
 */
function getStateColors(state: PomodoroState): {
  bg: string;
  text: string;
  ring: string;
} {
  switch (state) {
    case "work":
      return {
        bg: "bg-primary/10",
        text: "text-primary",
        ring: "ring-primary",
      };
    case "break":
    case "long-break":
      return {
        bg: "bg-accent/10",
        text: "text-accent",
        ring: "ring-accent",
      };
    case "paused":
      return {
        bg: "bg-muted",
        text: "text-muted-foreground",
        ring: "ring-muted-foreground",
      };
    default:
      return {
        bg: "bg-background",
        text: "text-foreground",
        ring: "ring-border",
      };
  }
}

export function PomodoroTimer({
  state,
  remainingSeconds,
  totalSeconds,
  currentCycle,
  progress,
  className,
}: PomodoroTimerProps) {
  const colors = getStateColors(state);
  const isActive =
    state === "work" || state === "break" || state === "long-break";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        className
      )}
    >
      {/* State label */}
      <div className="text-center">
        <p className={cn("text-lg font-medium", colors.text)}>
          {getStateLabel(state)}
        </p>
        {state !== "idle" && (
          <p className="text-sm text-muted-foreground mt-1">
            Ciclo {currentCycle}
          </p>
        )}
      </div>

      {/* Timer display - Large and readable */}
      <div className="relative">
        {/* Progress ring */}
        <svg
          className="transform -rotate-90"
          width="280"
          height="280"
          viewBox="0 0 280 280"
        >
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-border"
          />
          {/* Progress circle */}
          {isActive && (
            <circle
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 130}`}
              strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
              className={cn("transition-all duration-1000", colors.text)}
            />
          )}
        </svg>

        {/* Time display - centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold tabular-nums tracking-tight">
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      {/* Progress percentage (optional, subtle) */}
      {isActive && (
        <div className="text-sm text-muted-foreground">
          {Math.round(progress)}% completo
        </div>
      )}
    </div>
  );
}
