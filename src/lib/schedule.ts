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
} from "date-fns";
import type { Task, RoutinePeriod } from "./types";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "once";

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
 * Reset daily routine tasks to "todo" status if they're from a previous day
 * Used to auto-reset morning/afternoon/evening tasks each day
 *
 * @param tasks - Array of tasks to check
 * @returns Array of tasks with status reset if needed
 */
export function resetDailyTasks(tasks: Task[]): Task[] {
  const today = startOfDay(new Date()).toISOString();

  return tasks.map((task) => {
    // Only reset tasks with period (routine tasks) that aren't "skipped"
    if (!task.period) return task;
    if (task.status === "skipped") return task;

    // If task has a dueDate and it's not today, reset it
    if (task.dueDate && !isTaskDueToday(task)) {
      return {
        ...task,
        status: "todo",
        dueDate: today,
      };
    }

    // If task doesn't have a dueDate but has status "done" or "in-progress",
    // we assume it was completed yesterday and needs reset
    if (
      !task.dueDate &&
      (task.status === "done" || task.status === "in-progress")
    ) {
      return {
        ...task,
        status: "todo",
        dueDate: today,
      };
    }

    return task;
  });
}

/**
 * Group tasks by routine period
 */
export function groupTasksByPeriod(
  tasks: Task[]
): Record<RoutinePeriod, Task[]> {
  return {
    morning: tasks.filter((t) => t.period === "morning"),
    afternoon: tasks.filter((t) => t.period === "afternoon"),
    evening: tasks.filter((t) => t.period === "evening"),
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
 * Check if all tasks in a period are completed
 */
export function isPeriodComplete(
  tasks: Task[],
  period: RoutinePeriod
): boolean {
  const periodTasks = tasks.filter((t) => t.period === period);
  if (periodTasks.length === 0) return false;

  return periodTasks.every(
    (t) => t.status === "done" || t.status === "skipped"
  );
}

/**
 * Calculate completion percentage for a period
 */
export function getPeriodCompletionRate(
  tasks: Task[],
  period: RoutinePeriod
): number {
  const periodTasks = tasks.filter((t) => t.period === period);
  if (periodTasks.length === 0) return 0;

  const completed = periodTasks.filter(
    (t) => t.status === "done" || t.status === "skipped"
  ).length;

  return Math.round((completed / periodTasks.length) * 100);
}

/**
 * Get tasks that should be visible today
 * Filters out tasks that are not due today (unless they're routine tasks)
 */
export function getTodayTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => {
    // Routine tasks are always shown
    if (task.period) return true;

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
  const statusOrder = { todo: 0, "in-progress": 1, done: 2, skipped: 3 };

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

import type { RoutineItem, Frequency } from "./types";
import { differenceInDays } from "date-fns";

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
