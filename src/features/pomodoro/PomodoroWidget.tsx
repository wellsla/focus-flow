/**
 * PomodoroWidget.tsx
 *
 * Compact pomodoro widget for dashboard
 * Shows timer and quick start button
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play } from "lucide-react";
import { usePomodoroTimer } from "@/hooks/use-pomodoro-timer";
import Link from "next/link";

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

export function PomodoroWidget() {
  const { state, remainingSeconds, currentCycle, start } = usePomodoroTimer();

  const isActive =
    state === "work" || state === "break" || state === "long-break";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pomodoro</CardTitle>
        <Timer className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isActive ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold tabular-nums">
              {formatTime(remainingSeconds)}
            </div>
            <p className="text-xs text-muted-foreground">
              {state === "work" ? "Foco" : "Pausa"} · Ciclo {currentCycle}
            </p>
            <Link href="/pomodoro">
              <Button variant="outline" size="sm" className="w-full">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Pronto para uma sessão de foco?
            </p>
            <Button onClick={start} size="sm" className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
