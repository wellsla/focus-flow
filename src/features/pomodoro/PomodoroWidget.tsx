/**
 * PomodoroWidget.tsx
 *
 * Compact Pomodoro widget for dashboard
 * Synchronized with main Pomodoro page via shared state
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { usePomodoroTimer } from "@/hooks/use-pomodoro-timer";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function PomodoroWidget() {
  const timer = usePomodoroTimer();

  const getStateLabel = () => {
    switch (timer.state) {
      case "work":
        return "Focus Time";
      case "break":
        return "Short Break";
      case "long-break":
        return "Long Break";
      case "paused":
        return "Paused";
      default:
        return "Ready";
    }
  };

  const getStateColor = () => {
    switch (timer.state) {
      case "work":
        return "text-green-600 dark:text-green-400";
      case "break":
      case "long-break":
        return "text-blue-600 dark:text-blue-400";
      case "paused":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-muted-foreground";
    }
  };

  const isRunning =
    timer.state === "work" ||
    timer.state === "break" ||
    timer.state === "long-break";
  const isPaused = timer.state === "paused";
  const isIdle = timer.state === "idle";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <CardTitle className="text-lg">Pomodoro</CardTitle>
          </div>
          <Link href="/pomodoro">
            <Button variant="ghost" size="sm">
              View Details
            </Button>
          </Link>
        </div>
        <CardDescription>Deep focus in 25-minute blocks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <Badge variant="outline" className={getStateColor()}>
            {getStateLabel()}
          </Badge>
          <div className="text-4xl font-bold font-mono tabular-nums">
            {formatTime(timer.remainingSeconds)}
          </div>
          <div className="text-sm text-muted-foreground">
            Cycle {timer.currentCycle}
          </div>
        </div>

        {isRunning && <Progress value={timer.progress} className="h-2" />}

        <div className="flex gap-2 justify-center">
          {isIdle && (
            <Button onClick={timer.start} size="sm" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}

          {isRunning && (
            <>
              <Button
                onClick={timer.pause}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={timer.skip} size="sm" variant="outline">
                <SkipForward className="h-4 w-4" />
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button onClick={timer.resume} size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button onClick={timer.reset} size="sm" variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}

          {!isIdle && (
            <Button onClick={timer.reset} size="sm" variant="ghost">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
