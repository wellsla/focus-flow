/**
 * Database-backed hooks for Pomodoro feature
 * Manages sessions and settings via tRPC
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type { PomodoroSession, PomodoroSettings } from "@/lib/types";

/**
 * Fetch all pomodoro sessions for the current user
 */
export function usePomodoroSessions() {
  const query = trpc.pomodoro.sessions.getAll.useQuery();

  const asKind = (v: unknown): PomodoroSession["kind"] =>
    v === "work" || v === "break" || v === "long-break" ? v : "work";

  const asCategory = (v: unknown): PomodoroSession["category"] | undefined => {
    const allowed = new Set([
      "deep-learning",
      "active-coding",
      "job-search",
      "tutorial-following",
      "social-media",
      "streaming",
      "other",
    ]);
    return typeof v === "string" && allowed.has(v)
      ? (v as PomodoroSession["category"])
      : undefined;
  };

  const toISO = (v: unknown): string | undefined => {
    if (!v) return undefined;
    if (v instanceof Date) return v.toISOString();
    const s = String(v);
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  return {
    sessions: (query.data ?? []).map(
      (s): PomodoroSession => ({
        id: (s as Record<string, unknown>).id as string,
        kind: asKind((s as Record<string, unknown>).kind),
        category: asCategory((s as Record<string, unknown>).category),
        completed: Boolean((s as Record<string, unknown>).completed),
        wasTrulyProductive: Boolean(
          (s as Record<string, unknown>).wasTrulyProductive
        ),
        startedAt: toISO((s as Record<string, unknown>).startedAt)!,
        endedAt: toISO((s as Record<string, unknown>).endedAt),
      })
    ),
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Create a new pomodoro session
 */
export function useCreatePomodoroSession() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.pomodoro.sessions.create.useMutation({
    onSuccess: () => {
      utils.pomodoro.sessions.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to save session",
        description: error.message,
      });
    },
  });
}

/**
 * Update an existing pomodoro session
 */
export function useUpdatePomodoroSession() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.pomodoro.sessions.update.useMutation({
    onSuccess: () => {
      utils.pomodoro.sessions.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update session",
        description: error.message,
      });
    },
  });
}

/**
 * Fetch pomodoro settings for the current user
 */
export function usePomodoroSettings() {
  const query = trpc.pomodoro.settings.get.useQuery();

  // Return default settings if none exist
  const defaultSettings: PomodoroSettings = {
    workMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    cyclesUntilLong: 4,
    sound: false,
    desktopNotifications: false,
    vibration: false,
  };

  return {
    settings: (query.data as PomodoroSettings | null) ?? defaultSettings,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Upsert pomodoro settings (create or update)
 */
export function useUpsertPomodoroSettings() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.pomodoro.settings.upsert.useMutation({
    onSuccess: () => {
      utils.pomodoro.settings.get.invalidate();
      toast({
        title: "Settings saved",
        description: "Pomodoro settings updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: error.message,
      });
    },
  });
}
