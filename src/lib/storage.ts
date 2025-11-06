/**
 * storage.ts
 *
 * Centralized localStorage wrapper with namespace and version management.
 * Provides type-safe storage helpers with optional schema validation.
 *
 * Strategy: All data stored locally (browser localStorage) by default to preserve privacy.
 * Future: opt-in cloud sync can be added without breaking local-first approach.
 */

const APP_NAMESPACE = "focus-flow";
const STORAGE_VERSION = "1";

/**
 * Build a namespaced key for localStorage
 * Format: focus-flow:v1:<key>
 */
function buildKey(key: string): string {
  return `${APP_NAMESPACE}:v${STORAGE_VERSION}:${key}`;
}

/**
 * Get item from localStorage with namespace
 * Returns null if key doesn't exist or parsing fails
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const namespacedKey = buildKey(key);
    const raw = window.localStorage.getItem(namespacedKey);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[storage] Failed to read key "${key}":`, error);
    return null;
  }
}

/**
 * Set item in localStorage with namespace
 * Returns true on success, false on failure
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    console.warn(
      `[storage] Cannot write to localStorage during SSR (key: "${key}")`
    );
    return false;
  }

  try {
    const namespacedKey = buildKey(key);
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(namespacedKey, serialized);

    // Dispatch custom event for same-tab reactivity (compatible with useLocalStorage hook)
    window.dispatchEvent(
      new CustomEvent("local-storage", { detail: { key: namespacedKey } })
    );

    return true;
  } catch (error) {
    console.error(`[storage] Failed to write key "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from localStorage with namespace
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const namespacedKey = buildKey(key);
    window.localStorage.removeItem(namespacedKey);

    window.dispatchEvent(
      new CustomEvent("local-storage", { detail: { key: namespacedKey } })
    );

    return true;
  } catch (error) {
    console.error(`[storage] Failed to remove key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all app-namespaced items from localStorage
 * Useful for reset/logout scenarios
 */
export function clearAppStorage(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    const prefix = `${APP_NAMESPACE}:v${STORAGE_VERSION}:`;

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => window.localStorage.removeItem(key));

    window.dispatchEvent(new CustomEvent("local-storage"));

    console.info(`[storage] Cleared ${keysToRemove.length} app storage items`);
  } catch (error) {
    console.error("[storage] Failed to clear app storage:", error);
  }
}

/**
 * Get all keys stored under this app's namespace
 * Useful for debugging or data export
 */
export function listAppKeys(): string[] {
  if (typeof window === "undefined") return [];

  const prefix = `${APP_NAMESPACE}:v${STORAGE_VERSION}:`;
  const appKeys: string[] = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      // Return the key without namespace prefix for readability
      appKeys.push(key.replace(prefix, ""));
    }
  }

  return appKeys;
}

/**
 * Migrate storage from old version to new version
 * Called on app init if version mismatch detected
 *
 * Example usage:
 * if (needsMigration()) {
 *   migrateStorage((oldData) => transformToNewSchema(oldData));
 * }
 */
export function migrateStorage(
  migrationFn: (oldValue: unknown) => unknown
): void {
  // Implementation depends on migration strategy
  // For now, this is a placeholder for future use
  console.warn("[storage] Storage migration not yet implemented");
}

/**
 * Check storage quota and usage (if supported by browser)
 */
export async function getStorageInfo(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> {
  if (typeof window === "undefined" || !navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentage };
  } catch (error) {
    console.error("[storage] Failed to estimate storage:", error);
    return null;
  }
}

// ============================================================================
// High-level storage functions for Focus Flow features
// ============================================================================

import type {
  RoutineItem,
  Checkmark,
  PomodoroSettings,
  PomodoroSession,
  JournalEntry,
  RewardState,
  FlashReminder,
  FocusBlock,
} from "./types";

// Routines
export function loadRoutines(): RoutineItem[] {
  return getStorageItem<RoutineItem[]>("routines") || [];
}

export function saveRoutines(routines: RoutineItem[]): boolean {
  return setStorageItem("routines", routines);
}

// Checkmarks (daily checks) - stored by date for efficiency
export function loadChecks(dateISO: string): Checkmark[] {
  return getStorageItem<Checkmark[]>(`checks:${dateISO}`) || [];
}

export function saveChecks(dateISO: string, checks: Checkmark[]): boolean {
  return setStorageItem(`checks:${dateISO}`, checks);
}

// Pomodoro settings
export function loadPomodoroSettings(): PomodoroSettings {
  return (
    getStorageItem<PomodoroSettings>("pomodoro-settings") || {
      workMin: 25,
      breakMin: 5,
      longBreakMin: 15,
      cyclesUntilLong: 4,
      sound: false,
      desktopNotifications: false,
      vibration: false,
    }
  );
}

export function savePomodoroSettings(settings: PomodoroSettings): boolean {
  return setStorageItem("pomodoro-settings", settings);
}

// Pomodoro sessions (history)
export function loadPomodoroSessions(): PomodoroSession[] {
  return getStorageItem<PomodoroSession[]>("pomodoro-sessions") || [];
}

export function savePomodoroSessions(sessions: PomodoroSession[]): boolean {
  return setStorageItem("pomodoro-sessions", sessions);
}

export function appendPomodoroSession(session: PomodoroSession): boolean {
  const sessions = loadPomodoroSessions();
  sessions.push(session);
  return savePomodoroSessions(sessions);
}

// Journal entries
export function loadJournalEntries(): JournalEntry[] {
  return getStorageItem<JournalEntry[]>("journal-entries") || [];
}

export function saveJournalEntries(entries: JournalEntry[]): boolean {
  return setStorageItem("journal-entries", entries);
}

export function appendJournal(entry: JournalEntry): boolean {
  const entries = loadJournalEntries();
  // Replace if exists for same date, otherwise append
  const existingIndex = entries.findIndex((e) => e.dateISO === entry.dateISO);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  return saveJournalEntries(entries);
}

export function listJournal(
  startDate?: string,
  endDate?: string
): JournalEntry[] {
  const entries = loadJournalEntries();
  if (!startDate && !endDate) return entries;

  return entries.filter((entry) => {
    if (startDate && entry.dateISO < startDate) return false;
    if (endDate && entry.dateISO > endDate) return false;
    return true;
  });
}

// Rewards state
export function loadRewards(): RewardState {
  return (
    getStorageItem<RewardState>("rewards") || {
      points: 0,
      streakDays: 0,
      badges: [],
    }
  );
}

export function saveRewards(rewards: RewardState): boolean {
  return setStorageItem("rewards", rewards);
}

// Flash reminders
export function loadReminders(): FlashReminder[] {
  return getStorageItem<FlashReminder[]>("reminders") || [];
}

export function saveReminders(reminders: FlashReminder[]): boolean {
  return setStorageItem("reminders", reminders);
}

// Focus blocks (history)
export function loadFocusBlocks(): FocusBlock[] {
  return getStorageItem<FocusBlock[]>("focus-blocks") || [];
}

export function saveFocusBlocks(blocks: FocusBlock[]): boolean {
  return setStorageItem("focus-blocks", blocks);
}

export function appendFocusBlock(block: FocusBlock): boolean {
  const blocks = loadFocusBlocks();
  blocks.push(block);
  return saveFocusBlocks(blocks);
}
