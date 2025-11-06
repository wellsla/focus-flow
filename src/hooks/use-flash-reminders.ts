"use client";

import { useState, useEffect, useCallback } from "react";
import { loadReminders } from "@/lib/storage";
import type { FlashReminder, FlashReminderTrigger } from "@/lib/types";
import { format } from "date-fns";

/**
 * Hook for managing flash reminders
 * Triggers reminders based on time, app open, or pomodoro start
 */
export function useFlashReminders() {
  const [activeReminder, setActiveReminder] = useState<FlashReminder | null>(
    null
  );
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());
  const [lastCheckTime, setLastCheckTime] = useState<string>(
    format(new Date(), "HH:mm")
  );

  // Load reminders
  const reminders = loadReminders();
  const enabledReminders = reminders.filter((r) => r.enabled);

  // Trigger a reminder manually
  const triggerReminder = useCallback(
    (trigger: FlashReminderTrigger, allowInFocus = false) => {
      // Find first matching reminder that hasn't been shown yet
      const reminder = enabledReminders.find(
        (r) =>
          r.trigger === trigger &&
          !shownReminders.has(r.id) &&
          (allowInFocus ? true : !r.allowInFocus)
      );

      if (reminder) {
        setActiveReminder(reminder);
        setShownReminders((prev) => new Set([...prev, reminder.id]));
      }
    },
    [enabledReminders, shownReminders]
  );

  // Dismiss active reminder
  const dismissReminder = useCallback(() => {
    setActiveReminder(null);
  }, []);

  // Reset shown reminders (called daily or on app restart)
  const resetShownReminders = useCallback(() => {
    setShownReminders(new Set());
  }, []);

  // Check time-based reminders every minute
  useEffect(() => {
    const checkTimeReminders = () => {
      const currentTime = format(new Date(), "HH:mm");

      // Only check if minute changed
      if (currentTime === lastCheckTime) return;
      setLastCheckTime(currentTime);

      // Find time-based reminders for this minute
      const timeReminders = enabledReminders.filter(
        (r) =>
          r.trigger === "time" &&
          r.timeOfDay === currentTime &&
          !shownReminders.has(r.id)
      );

      if (timeReminders.length > 0 && !activeReminder) {
        const reminder = timeReminders[0];
        setActiveReminder(reminder);
        setShownReminders((prev) => new Set([...prev, reminder.id]));
      }
    };

    checkTimeReminders();
    const interval = setInterval(checkTimeReminders, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [enabledReminders, shownReminders, activeReminder, lastCheckTime]);

  // Trigger app-open reminders on mount (once per session)
  useEffect(() => {
    const appOpenReminders = enabledReminders.filter(
      (r) => r.trigger === "app-open"
    );

    if (appOpenReminders.length > 0 && !activeReminder) {
      const reminder = appOpenReminders[0];
      setActiveReminder(reminder);
      setShownReminders((prev) => new Set([...prev, reminder.id]));
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset shown reminders daily at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetShownReminders();
      }
    };

    const interval = setInterval(checkMidnight, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [resetShownReminders]);

  return {
    activeReminder,
    dismissReminder,
    triggerReminder,
    resetShownReminders,
  };
}
