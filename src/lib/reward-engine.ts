/**
 * reward-engine.ts
 *
 * Pure functions for calculating points, streaks, and badges
 * Follows "ritual > gamification" principle: subtle, non-addictive rewards
 */

import type {
  RewardState,
  Checkmark,
  PomodoroSession,
  JournalEntry,
} from "./types";
import { parseISO, startOfDay, differenceInDays } from "date-fns";

// ============================================================================
// Point Calculation
// ============================================================================

/**
 * Calculate points awarded for completing a routine check
 */
export function pointsForCheck(): number {
  return 1; // +1 per routine completed
}

/**
 * Calculate points awarded for completing a pomodoro work session
 */
export function pointsForPomodoro(): number {
  return 5; // +5 per work session completed
}

/**
 * Calculate points awarded for journal entry
 */
export function pointsForJournal(): number {
  return 2; // +2 per day with journal entry
}

// ============================================================================
// Streak Calculation
// ============================================================================

/**
 * Calculate current streak based on checkmarks
 * A day counts if it has at least minChecksPerDay completed checks
 *
 * @param checksByDay - Map of dateISO -> Checkmark[]
 * @param minChecksPerDay - Minimum checks required (default 5)
 * @returns Current streak in days
 */
export function calculateStreak(
  checksByDay: Record<string, Checkmark[]>,
  minChecksPerDay = 5
): number {
  const dates = Object.keys(checksByDay).sort();

  if (dates.length === 0) return 0;

  // Filter days that meet minimum checks threshold
  const validDates = dates.filter((dateISO) => {
    const checks = checksByDay[dateISO] || [];
    const completedCount = checks.filter((c) => c.done).length;
    return completedCount >= minChecksPerDay;
  });

  if (validDates.length === 0) return 0;

  const today = startOfDay(new Date());
  const lastValidDate = parseISO(validDates[validDates.length - 1]);

  // Streak must include today or yesterday
  const daysSinceLastValid = differenceInDays(today, lastValidDate);
  if (daysSinceLastValid > 1) return 0;

  // Count backwards from most recent
  let streak = 0;
  for (let i = validDates.length - 1; i >= 0; i--) {
    if (i === validDates.length - 1) {
      streak = 1;
    } else {
      const current = parseISO(validDates[i]);
      const next = parseISO(validDates[i + 1]);
      const gap = differenceInDays(next, current);

      if (gap === 1) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
  }

  return streak;
}

// ============================================================================
// Badge System
// ============================================================================

export type BadgeId =
  | "first-step"
  | "deep-focus"
  | "writer"
  | "resilient"
  | "week-warrior"
  | "focus-master";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
}

export const BADGES: Record<BadgeId, Badge> = {
  "first-step": {
    id: "first-step",
    name: "First Step",
    description: "Completed the first routine of the day",
    emoji: "👣",
  },
  "deep-focus": {
    id: "deep-focus",
    name: "Deep Focus",
    description: "3 consecutive complete pomodoros",
    emoji: "🎯",
  },
  writer: {
    id: "writer",
    name: "Writer",
    description: "7 consecutive days of journaling",
    emoji: "✍️",
  },
  resilient: {
    id: "resilient",
    name: "Resilient",
    description: "14-day streak",
    emoji: "💪",
  },
  "week-warrior": {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Completed routines for 7 consecutive days",
    emoji: "⚔️",
  },
  "focus-master": {
    id: "focus-master",
    name: "Focus Master",
    description: "25 complete pomodoro sessions",
    emoji: "🧘",
  },
};

/**
 * Check which new badges should be awarded
 * Returns array of newly earned badge IDs
 */
export function checkNewBadges(
  currentBadges: string[],
  data: {
    checksByDay: Record<string, Checkmark[]>;
    pomodoroSessions: PomodoroSession[];
    journalEntries: JournalEntry[];
    streakDays: number;
  }
): BadgeId[] {
  const newBadges: BadgeId[] = [];

  // first-step: completed first routine of any day
  if (
    !currentBadges.includes("first-step") &&
    Object.values(data.checksByDay).some((checks) => checks.some((c) => c.done))
  ) {
    newBadges.push("first-step");
  }

  // deep-focus: 3 consecutive work pomodoros
  if (!currentBadges.includes("deep-focus")) {
    const workSessions = data.pomodoroSessions
      .filter((s) => s.kind === "work" && s.completed)
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

    let consecutive = 0;
    let maxConsecutive = 0;

    for (let i = 0; i < workSessions.length; i++) {
      if (i === 0) {
        consecutive = 1;
      } else {
        const prev = new Date(
          workSessions[i - 1].endedAt || workSessions[i - 1].startedAt
        );
        const curr = new Date(workSessions[i].startedAt);
        const gap = (curr.getTime() - prev.getTime()) / 1000 / 60; // minutes

        // Consider consecutive if within 30 minutes (break time)
        if (gap <= 30) {
          consecutive++;
        } else {
          consecutive = 1;
        }
      }
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    }

    if (maxConsecutive >= 3) {
      newBadges.push("deep-focus");
    }
  }

  // writer: 7 consecutive days with journal entries
  if (!currentBadges.includes("writer")) {
    const journalDates = data.journalEntries.map((e) => e.dateISO).sort();

    let journalStreak = 0;
    for (let i = journalDates.length - 1; i >= 0; i--) {
      if (i === journalDates.length - 1) {
        journalStreak = 1;
      } else {
        const current = parseISO(journalDates[i]);
        const next = parseISO(journalDates[i + 1]);
        const gap = differenceInDays(next, current);

        if (gap === 1) {
          journalStreak++;
        } else {
          break;
        }
      }
    }

    if (journalStreak >= 7) {
      newBadges.push("writer");
    }
  }

  // resilient: streak of 14 days
  if (!currentBadges.includes("resilient") && data.streakDays >= 14) {
    newBadges.push("resilient");
  }

  // week-warrior: streak of 7 days
  if (!currentBadges.includes("week-warrior") && data.streakDays >= 7) {
    newBadges.push("week-warrior");
  }

  // focus-master: 25 completed work pomodoros
  if (!currentBadges.includes("focus-master")) {
    const completedWork = data.pomodoroSessions.filter(
      (s) => s.kind === "work" && s.completed
    ).length;

    if (completedWork >= 25) {
      newBadges.push("focus-master");
    }
  }

  return newBadges;
}

/**
 * Award points and update reward state
 */
export function awardPoints(
  currentState: RewardState,
  points: number,
  newBadges: BadgeId[] = []
): RewardState {
  return {
    ...currentState,
    points: currentState.points + points,
    badges: [...new Set([...currentState.badges, ...newBadges])],
  };
}

/**
 * Update streak in reward state
 */
export function updateStreak(
  currentState: RewardState,
  streakDays: number,
  lastCheckDate: string
): RewardState {
  return {
    ...currentState,
    streakDays,
    lastCheckDate,
  };
}

/**
 * Get encouraging message based on action
 */
export function getEncouragementMessage(
  action: "check" | "pomodoro" | "journal" | "streak"
): string {
  const messages: Record<typeof action, string[]> = {
    check: [
      "Boa! Você honrou 1% hoje.",
      "Pequeno passo, grande vitória.",
      "Você está construindo o caminho.",
    ],
    pomodoro: [
      "Foco profundo alcançado! 🎯",
      "Você está treinando sua atenção.",
      "Mais uma sessão, mais clareza.",
    ],
    journal: [
      "Reflexão registrada. ✍️",
      "Sua história importa.",
      "Gratidão pelo autoconhecimento.",
    ],
    streak: [
      "Consistência é seu superpoder! 💪",
      "Você está provando para si mesmo.",
      "Cada dia conta.",
    ],
  };

  const options = messages[action];
  return options[Math.floor(Math.random() * options.length)];
}
