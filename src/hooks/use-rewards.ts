"use client";

import { useEffect, useState } from "react";
import {
  loadRewards,
  saveRewards,
  loadChecks,
  loadPomodoroSessions,
  loadJournalEntries,
} from "@/lib/storage";
import {
  checkNewBadges,
  awardPoints,
  updateStreak,
  calculateStreak,
  type BadgeId,
} from "@/lib/reward-engine";
import type { RewardState, Checkmark } from "@/lib/types";
import { useConfetti } from "./use-confetti";
import { format, subDays } from "date-fns";

/**
 * Load all checkmarks from the last 30 days
 */
function loadAllRecentCheckmarks(): Record<string, Checkmark[]> {
  const checksByDay: Record<string, Checkmark[]> = {};
  const today = new Date();

  // Load last 30 days of checks
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    const dateISO = format(date, "yyyy-MM-dd");
    const checks = loadChecks(dateISO);
    if (checks.length > 0) {
      checksByDay[dateISO] = checks;
    }
  }

  return checksByDay;
}

/**
 * Hook for managing reward state and badge detection
 */
export function useRewards() {
  const [rewards, setRewards] = useState<RewardState>(() => loadRewards());
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<BadgeId[]>([]);
  const { triggerConfetti } = useConfetti();

  // Check for new badges on mount and when data changes
  useEffect(() => {
    const checkForNewBadges = () => {
      const checksByDay = loadAllRecentCheckmarks();
      const pomodoroSessions = loadPomodoroSessions();
      const journalEntries = loadJournalEntries();

      // Calculate current streak
      const streakDays = calculateStreak(checksByDay);

      // Check for new badges
      const newBadges = checkNewBadges(rewards.badges, {
        checksByDay,
        pomodoroSessions,
        journalEntries,
        streakDays,
      });

      if (newBadges.length > 0) {
        // Award new badges
        const updatedRewards = awardPoints(rewards, 0, newBadges);
        const finalRewards = updateStreak(
          updatedRewards,
          streakDays,
          rewards.lastCheckDate || format(new Date(), "yyyy-MM-dd")
        );

        setRewards(finalRewards);
        saveRewards(finalRewards);
        setNewlyEarnedBadges(newBadges);

        // Trigger confetti for each new badge
        newBadges.forEach((badgeId) => {
          setTimeout(() => triggerConfetti(badgeId), 300);
        });
      } else {
        // Just update streak if needed
        if (streakDays !== rewards.streakDays) {
          const updatedRewards = updateStreak(
            rewards,
            streakDays,
            rewards.lastCheckDate || format(new Date(), "yyyy-MM-dd")
          );
          setRewards(updatedRewards);
          saveRewards(updatedRewards);
        }
      }
    };

    checkForNewBadges();

    // Re-check every 30 seconds (subtle background check)
    const interval = setInterval(checkForNewBadges, 30000);
    return () => clearInterval(interval);
  }, [rewards, triggerConfetti]);

  const manualAddPoints = (points: number) => {
    const updatedRewards = awardPoints(rewards, points);
    setRewards(updatedRewards);
    saveRewards(updatedRewards);
  };

  const clearNewBadges = () => {
    setNewlyEarnedBadges([]);
  };

  return {
    rewards,
    newlyEarnedBadges,
    clearNewBadges,
    manualAddPoints,
  };
}
