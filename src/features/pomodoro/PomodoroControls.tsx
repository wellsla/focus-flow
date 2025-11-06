/**
 * PomodoroControls.tsx
 *
 * Control buttons for pomodoro timer
 * Large, single CTA principle (ADHD-friendly)
 */

"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import type { PomodoroState } from "@/hooks/use-pomodoro-timer";
import { cn } from "@/lib/utils";

interface PomodoroControlsProps {
  state: PomodoroState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
  className?: string;
}

export function PomodoroControls({
  state,
  onStart,
  onPause,
  onResume,
  onSkip,
  onReset,
  className,
}: PomodoroControlsProps) {
  // Primary action button (single CTA)
  const renderPrimaryButton = () => {
    if (state === "idle") {
      return (
        <Button
          size="lg"
          onClick={onStart}
          className="h-16 px-12 text-lg font-semibold"
        >
          <Play className="mr-2 h-6 w-6" />
          Iniciar Foco
        </Button>
      );
    }

    if (state === "paused") {
      return (
        <Button
          size="lg"
          onClick={onResume}
          className="h-16 px-12 text-lg font-semibold"
        >
          <Play className="mr-2 h-6 w-6" />
          Retomar
        </Button>
      );
    }

    // work, break, or long-break
    return (
      <Button
        size="lg"
        variant="outline"
        onClick={onPause}
        className="h-16 px-12 text-lg font-semibold"
      >
        <Pause className="mr-2 h-6 w-6" />
        Pausar
      </Button>
    );
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Primary action - large and prominent */}
      <div>{renderPrimaryButton()}</div>

      {/* Secondary actions - smaller, less prominent */}
      {state !== "idle" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground"
          >
            <SkipForward className="mr-1 h-4 w-4" />
            Pular
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            className="text-muted-foreground"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      )}
    </div>
  );
}
