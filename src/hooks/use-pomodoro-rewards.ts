/**
 * use-pomodoro-rewards.ts
 *
 * Hook that integrates pomodoro completions with reward system
 * Awards points automatically when work sessions complete
 */

"use client";

import { useEffect, useRef } from "react";
import { loadRewards, saveRewards, loadPomodoroSessions } from "@/lib/storage";
import {
  pointsForPomodoro,
  getEncouragementMessage,
} from "@/lib/reward-engine";
import { useToast } from "./use-toast";

/**
 * Monitor pomodoro sessions and award points for completed work sessions
 */
export function usePomodoroRewards() {
  const { toast } = useToast();
  const lastProcessedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    // Check for new completed sessions every 5 seconds
    const checkInterval = setInterval(() => {
      const sessions = loadPomodoroSessions();

      // Find last completed work session
      const completedWorkSessions = sessions.filter(
        (s) => s.kind === "work" && s.completed
      );

      if (completedWorkSessions.length === 0) return;

      const lastSession =
        completedWorkSessions[completedWorkSessions.length - 1];

      // If we haven't processed this session yet, award points
      if (
        lastSession.id !== lastProcessedSessionRef.current &&
        lastSession.endedAt
      ) {
        const rewards = loadRewards();
        const points = pointsForPomodoro();

        // Award points
        const updatedRewards = {
          ...rewards,
          points: rewards.points + points,
        };

        saveRewards(updatedRewards);
        lastProcessedSessionRef.current = lastSession.id;

        // Show encouraging toast
        toast({
          title: `+${points} pontos! 🎯`,
          description: getEncouragementMessage("pomodoro"),
          duration: 4000,
        });
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [toast]);
}
