/**
 * Database-backed hooks for Achievements feature
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type { Achievement, AchievementCategory } from "@/lib/types";

/**
 * Fetch all achievements for the current user
 */
export function useAchievements() {
  const query = trpc.achievement.getAll.useQuery();

  const toISO = (v: unknown): string | undefined => {
    if (!v) return undefined;
    if (v instanceof Date) return v.toISOString();
    const s = String(v);
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };
  const asCategory = (v: unknown): AchievementCategory => {
    const allowed: AchievementCategory[] = [
      "routines",
      "study",
      "career",
      "finance",
      "consistency",
      "milestone",
    ];
    return typeof v === "string" && (allowed as string[]).includes(v)
      ? (v as AchievementCategory)
      : "milestone";
  };
  const achievements: Achievement[] = (query.data ?? []).map((raw) => {
    const a = raw as Record<string, unknown>;
    const conditionRaw = a.condition;
    let condition: Achievement["condition"] = {
      type: "custom",
      target: 0,
    };
    if (
      conditionRaw &&
      typeof conditionRaw === "object" &&
      !Array.isArray(conditionRaw)
    ) {
      const c = conditionRaw as Record<string, unknown>;
      const typeAllowed = [
        "routine-streak",
        "task-completed",
        "pomodoro-sessions",
        "applications-sent",
        "financial-goal",
        "custom",
      ];
      const typeVal =
        typeof c.type === "string" && typeAllowed.includes(c.type)
          ? (c.type as Achievement["condition"]["type"])
          : "custom";
      const targetVal = typeof c.target === "number" ? c.target : 0;
      const currentVal = typeof c.current === "number" ? c.current : undefined;
      condition = { type: typeVal, target: targetVal, current: currentVal };
    }
    return {
      id: String(a.id),
      title: typeof a.title === "string" ? a.title : "",
      description: typeof a.description === "string" ? a.description : "",
      category: asCategory(a.category),
      icon: typeof a.icon === "string" ? a.icon : "star",
      gemReward: typeof a.gemReward === "number" ? a.gemReward : 0,
      unlockedAt: toISO(a.unlockedAt),
      revokedAt: toISO(a.revokedAt),
      isUnlocked: Boolean(a.isUnlocked),
      isRevoked: Boolean(a.isRevoked),
      condition,
    } satisfies Achievement;
  });
  return { achievements, isLoading: query.isLoading, refetch: query.refetch };
}

export function useCreateAchievement() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  return trpc.achievement.create.useMutation({
    onSuccess: (data) => {
      utils.achievement.getAll.invalidate();
      toast({
        title: "Achievement created",
        description: `"${data.title}" added.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create achievement",
        description: error.message,
      });
    },
  });
}

export function useUpdateAchievement() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  return trpc.achievement.update.useMutation({
    onSuccess: (data) => {
      utils.achievement.getAll.invalidate();
      toast({
        title: "Achievement updated",
        description: `"${data.title}" updated.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update achievement",
        description: error.message,
      });
    },
  });
}

export function useDeleteAchievement() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  return trpc.achievement.delete.useMutation({
    onSuccess: () => {
      utils.achievement.getAll.invalidate();
      toast({
        title: "Achievement deleted",
        description: "Achievement removed.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete achievement",
        description: error.message,
      });
    },
  });
}
