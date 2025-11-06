/**
 * schedule.ts
 *
 * Simple recurrence utilities for task scheduling and daily routine management.
 * Supports daily, weekly, and monthly patterns.
 */

import {
  startOfDay,
  isToday,
  addDays,
  addWeeks,
  addMonths,
  parseISO,
  differenceInDays,
} from "date-fns";
import type { Task } from "./types";
import type { RoutineItem } from "./types";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "once";
export type RoutinePeriod = "morning" | "afternoon" | "evening";

/**
 * Check if a task is due today based on its dueDate
 */
export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false;

  try {
    const dueDate = parseISO(task.dueDate);
    return isToday(dueDate);
  } catch {
    return false;
  }
}

/**
 * Check if a date string is today
 */
export function isDateToday(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return isToday(date);
  } catch {
    return false;
  }
}

/**
 * Get the next occurrence date for a recurring task
 * @param lastCompletedDate - ISO date string of last completion
 * @param pattern - Recurrence pattern
 * @returns ISO date string of next occurrence
 */
export function getNextOccurrence(
  lastCompletedDate: string,
  pattern: RecurrencePattern
): string {
  try {
    const lastDate = parseISO(lastCompletedDate);
    let nextDate: Date;

    switch (pattern) {
      case "daily":
        nextDate = addDays(lastDate, 1);
        break;
      case "weekly":
        nextDate = addWeeks(lastDate, 1);
        break;
      case "monthly":
        nextDate = addMonths(lastDate, 1);
        break;
      case "once":
      default:
        nextDate = lastDate;
        break;
    }

    return startOfDay(nextDate).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * @deprecated Task no longer has period property. Use RoutineItem for recurring habits.
 * Reset daily routine tasks to "todo" status if they're from a previous day
 */
export function resetDailyTasks(tasks: Task[]): Task[] {
  // Tasks are now one-time items with dueDate, not recurring period-based items
  // This function is deprecated for Tasks. Use RoutineItem for recurring habits.
  return tasks;
}

/**
 * @deprecated Task no longer has period property. Use RoutineItem for recurring habits.
 * Group tasks by routine period
 */
export function groupTasksByPeriod(
  tasks: Task[]
): Record<RoutinePeriod, Task[]> {
  // Tasks no longer have period property
  return {
    morning: [],
    afternoon: [],
    evening: [],
  };
}

/**
 * Get current period of day based on local time
 * Morning: 5am - 11:59am
 * Afternoon: 12pm - 5:59pm
 * Evening: 6pm - 4:59am
 */
export function getCurrentPeriod(): RoutinePeriod {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

/**
 * @deprecated Task no longer has period property. Use RoutineItem for recurring habits.
 */
export function isPeriodComplete(
  tasks: Task[],
  period: RoutinePeriod
): boolean {
  return false;
}

/**
 * @deprecated Task no longer has period property. Use RoutineItem for recurring habits.
 */
export function getPeriodCompletionRate(
  tasks: Task[],
  period: RoutinePeriod
): number {
  return 0;
}

/**
 * Get tasks that should be visible today
 * Filters out tasks that are not due today
 */
export function getTodayTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => {
    // Tasks with no due date are shown
    if (!task.dueDate) return true;

    // Tasks due today are shown
    return isTaskDueToday(task);
  });
}

/**
 * Sort tasks by priority and status
 * Order: high priority incomplete → medium → low → completed
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const statusOrder = { todo: 0, "in-progress": 1, done: 2, cancelled: 3 };

  return [...tasks].sort((a, b) => {
    // Sort by status first (incomplete tasks on top)
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Then by priority
    const aPriority = priorityOrder[a.priority || "medium"];
    const bPriority = priorityOrder[b.priority || "medium"];
    return aPriority - bPriority;
  });
}

// ============================================================================
// Routine Item Scheduling (for RoutineItem with Frequency)
// ============================================================================

/**
 * Check if a routine item is due on a given date
 * @param item - Routine item to check
 * @param date - Date to check against
 * @param lastCompletedDate - ISO string of last completion (optional)
 * @returns true if item is due on that date
 */
export function isDue(
  item: RoutineItem,
  date: Date,
  lastCompletedDate?: string
): boolean {
  if (!item.active) return false;

  const targetDay = startOfDay(date);

  switch (item.frequency) {
    case "daily":
      return true; // Always due for daily items

    case "weekly": {
      // Due on the same day of week as last completion, or if never completed
      if (!lastCompletedDate) return true;
      const lastCompleted = startOfDay(parseISO(lastCompletedDate));
      const daysDiff = differenceInDays(targetDay, lastCompleted);
      return daysDiff >= 7;
    }

    case "monthly": {
      // Due once per month (rough: 30 days)
      if (!lastCompletedDate) return true;
      const lastCompleted = startOfDay(parseISO(lastCompletedDate));
      const daysDiff = differenceInDays(targetDay, lastCompleted);
      return daysDiff >= 30;
    }

    case "every3days": {
      if (!lastCompletedDate) return true;
      const lastCompleted = startOfDay(parseISO(lastCompletedDate));
      const daysDiff = differenceInDays(targetDay, lastCompleted);
      return daysDiff >= 3;
    }

    default:
      return false;
  }
}

/**
 * Calculate the next due date for a routine item
 * @param item - Routine item
 * @param fromDate - Starting date (usually last completed date)
 * @returns ISO string of next due date
 */
export function nextDue(item: RoutineItem, fromDate: Date): string {
  const from = startOfDay(fromDate);

  switch (item.frequency) {
    case "daily":
      return addDays(from, 1).toISOString();
    case "weekly":
      return addWeeks(from, 1).toISOString();
    case "monthly":
      return addMonths(from, 1).toISOString();
    case "every3days":
      return addDays(from, 3).toISOString();
    default:
      return from.toISOString();
  }
}
