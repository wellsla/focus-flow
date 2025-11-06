/**
 * /pomodoro page
 *
 * Dedicated pomodoro timer page with:
 * - Large timer display
 * - Controls
 * - Session history
 * - Quick settings
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePomodoroTimer } from "@/hooks/use-pomodoro-timer";
import { usePomodoroRewards } from "@/hooks/use-pomodoro-rewards";
import { PomodoroTimer } from "@/features/pomodoro/PomodoroTimer";
import { PomodoroControls } from "@/features/pomodoro/PomodoroControls";
import { loadPomodoroSessions } from "@/lib/storage";
import { useState, useEffect } from "react";
import type { PomodoroSession } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, TrendingUp, Flame } from "lucide-react";

export default function PomodoroPage() {
  const timer = usePomodoroTimer();

  // Integrate with rewards system
  usePomodoroRewards();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);

  // Load sessions on mount and when timer completes
  useEffect(() => {
    const loadSessions = () => {
      const allSessions = loadPomodoroSessions();
      // Get last 10 sessions
      setSessions(allSessions.slice(-10).reverse());
    };

    loadSessions();

    // Reload when timer state changes (after completion)
    if (
      timer.state === "idle" ||
      timer.state === "break" ||
      timer.state === "long-break"
    ) {
      loadSessions();
    }
  }, [timer.state]);

  // Calculate stats
  const todaySessions = sessions.filter((s) => {
    const sessionDate = format(parseISO(s.startedAt), "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");
    return sessionDate === today && s.kind === "work" && s.completed;
  });

  const totalWorkSessions = sessions.filter(
    (s) => s.kind === "work" && s.completed
  ).length;

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pomodoro</h1>
        <p className="text-muted-foreground mt-2">
          Deep focus technique in 25-minute blocks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main timer - takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-12 pb-12">
              <PomodoroTimer
                state={timer.state}
                remainingSeconds={timer.remainingSeconds}
                totalSeconds={timer.totalSeconds}
                currentCycle={timer.currentCycle}
                progress={timer.progress}
              />
              <div className="mt-8">
                <PomodoroControls
                  state={timer.state}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onResume={timer.resume}
                  onSkip={timer.skip}
                  onReset={timer.reset}
                />
              </div>
            </CardContent>
          </Card>

          {/* Session history */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent History</CardTitle>
              <CardDescription>Your last 10 sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sessions recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={session.completed ? "default" : "secondary"}
                        >
                          {session.kind === "work"
                            ? "Focus"
                            : session.kind === "long-break"
                            ? "Long Break"
                            : "Break"}
                        </Badge>
                        <span className="text-sm">
                          {format(
                            parseISO(session.startedAt),
                            "MM/dd · HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      {session.completed && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-6">
          {/* Today's stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">{todaySessions.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Completed sessions
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-2xl font-semibold">
                    {todaySessions.length * 25}min
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Deep focus time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All-time stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-3xl font-bold">{totalWorkSessions}</p>
                <p className="text-sm text-muted-foreground">
                  Completed focus sessions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Settings quick view */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Work</span>
                <span className="font-medium">
                  {timer.settings.workMin} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Short break</span>
                <span className="font-medium">
                  {timer.settings.breakMin} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Long break</span>
                <span className="font-medium">
                  {timer.settings.longBreakMin} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cycles until long</span>
                <span className="font-medium">
                  {timer.settings.cyclesUntilLong}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
