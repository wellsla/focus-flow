"use client";

import { useFlashReminders } from "@/hooks/use-flash-reminders";
import { FlashBar } from "./FlashBar";

/**
 * ReminderManager: Global reminder system
 * Manages active flash reminder and displays FlashBar
 */
export function ReminderManager() {
  const { activeReminder, dismissReminder } = useFlashReminders();

  if (!activeReminder) return null;

  return <FlashBar reminder={activeReminder} onDismiss={dismissReminder} />;
}
