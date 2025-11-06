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
