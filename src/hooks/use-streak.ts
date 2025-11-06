/**
 * use-streak.ts
 *
 * Hook for calculating and tracking streaks based on daily checkmarks
 * A day counts toward the streak if minimum checks threshold is met
 */

"use client";

import { useMemo } from "react";
import { parseISO, startOfDay, differenceInDays, format } from "date-fns";
import type { Checkmark } from "@/lib/types";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckDate: string | null;
  streakDates: string[]; // ISO dates that count toward current streak
}

/**
 * Calculate streak from checkmarks
 * @param checksByDay - Map of dateISO -> Checkmark[] (all checks for each day)
 * @param minChecksPerDay - Minimum checks required for a day to count (default 5)
 * @returns Streak statistics
 */
export function useStreak(
  checksByDay: Record<string, Checkmark[]>,
  minChecksPerDay = 5
): StreakData {
  return useMemo(() => {
    const dates = Object.keys(checksByDay).sort();

    if (dates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckDate: null,
        streakDates: [],
      };
    }

    // Filter days that meet minimum checks threshold
    const validDates = dates.filter((dateISO) => {
      const checks = checksByDay[dateISO] || [];
      const completedCount = checks.filter((c) => c.done).length;
      return completedCount >= minChecksPerDay;
    });

    if (validDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckDate: dates[dates.length - 1],
        streakDates: [],
      };
    }

    const today = startOfDay(new Date());
    const lastValidDate = parseISO(validDates[validDates.length - 1]);

    // Calculate current streak (must include today or yesterday)
    const daysSinceLastValid = differenceInDays(today, lastValidDate);
    let currentStreak = 0;
    const streakDates: string[] = [];

    if (daysSinceLastValid <= 1) {
      // Start from most recent and count backwards
      for (let i = validDates.length - 1; i >= 0; i--) {
        if (i === validDates.length - 1) {
          currentStreak = 1;
          streakDates.push(validDates[i]);
        } else {
          const current = parseISO(validDates[i]);
          const next = parseISO(validDates[i + 1]);
          const gap = differenceInDays(next, current);

          if (gap === 1) {
            currentStreak++;
            streakDates.unshift(validDates[i]);
          } else {
            break; // Streak broken
          }
        }
      }
    }

    // Calculate longest streak ever
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < validDates.length; i++) {
      const prev = parseISO(validDates[i - 1]);
      const current = parseISO(validDates[i]);
      const gap = differenceInDays(current, prev);

      if (gap === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastCheckDate: validDates[validDates.length - 1],
      streakDates,
    };
  }, [checksByDay, minChecksPerDay]);
}
