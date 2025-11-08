/**
 * Database-backed hooks for Rewards and Reward State
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type {
  Reward,
  RewardState,
  RewardCondition,
  RewardConditionType,
  RewardResetFrequency,
  RewardType,
} from "@/lib/types";

type JsonLike =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

/**
 * Rewards: query all
 */
export function useRewards() {
  const query = trpc.reward.getAll.useQuery();
  const toISO = (v: unknown): string | undefined => {
    if (!v) return undefined;
    if (v instanceof Date) return v.toISOString();
    const s = String(v);
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const asRewardType = (v: unknown): RewardType =>
    v === "conditional" || v === "purchasable" ? v : "conditional";
  const asReset = (v: unknown): RewardResetFrequency | undefined => {
    return v === "daily" ||
      v === "weekly" ||
      v === "monthly" ||
      v === "one-time"
      ? v
      : undefined;
  };
  const asConditionType = (v: unknown): RewardConditionType | undefined => {
    const allowed: RewardConditionType[] = [
      "routine-completion",
      "task-completion",
      "pomodoro-sessions",
      "study-concepts",
      "custom",
    ];
    return typeof v === "string" && (allowed as string[]).includes(v)
      ? (v as RewardConditionType)
      : undefined;
  };
  const normalizeConditions = (val: unknown): RewardCondition[] => {
    if (!Array.isArray(val)) return [];
    const arr = val as unknown[];
    return arr
      .map((item) => {
        if (!item || typeof item !== "object") return undefined;
        const obj = item as Record<string, unknown>;
        const type = asConditionType(obj.type);
        if (!type) return undefined;
        const description =
          typeof obj.description === "string" ? obj.description : "";
        const target = typeof obj.target === "number" ? obj.target : 0;
        const routineId =
          typeof obj.routineId === "string" ? obj.routineId : undefined;
        const taskTag =
          typeof obj.taskTag === "string" ? obj.taskTag : undefined;
        const isMet = Boolean(obj.isMet);
        const progress = typeof obj.progress === "number" ? obj.progress : 0;
        return {
          type,
          description,
          target,
          routineId,
          taskTag,
          isMet,
          progress,
        } satisfies RewardCondition;
      })
      .filter(Boolean) as RewardCondition[];
  };

  const rewards: Reward[] = (query.data ?? []).map((raw) => {
    const r = raw as Record<string, unknown>;
    return {
      id: String(r.id),
      title: typeof r.title === "string" ? r.title : "",
      description: typeof r.description === "string" ? r.description : "",
      type: asRewardType(r.type),
      icon: typeof r.icon === "string" ? r.icon : "gift",
      category: (typeof r.category === "string"
        ? r.category
        : "custom") as Reward["category"],
      conditions: normalizeConditions(r.conditions as JsonLike),
      isUnlocked: Boolean(r.isUnlocked),
      resetFrequency: asReset(r.resetFrequency),
      gemCost: typeof r.gemCost === "number" ? r.gemCost : undefined,
      isPurchased:
        typeof r.isPurchased === "boolean" ? r.isPurchased : undefined,
      purchasedAt: toISO(r.purchasedAt),
      isOneTime: typeof r.isOneTime === "boolean" ? r.isOneTime : undefined,
      lastResetAt: toISO(r.lastResetAt),
      timesUsed: typeof r.timesUsed === "number" ? r.timesUsed : 0,
      createdAt: toISO(r.createdAt) ?? new Date().toISOString(),
    } satisfies Reward;
  });
  return { rewards, isLoading: query.isLoading, refetch: query.refetch };
}

export function useCreateReward() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  return trpc.reward.create.useMutation({
    onSuccess: (data) => {
      utils.reward.getAll.invalidate();
      toast({ title: "Reward created", description: `"${data.title}" added.` });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create reward",
        description: error.message,
      });
    },
  });
}

export function useUpdateReward() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  return trpc.reward.update.useMutation({
    onSuccess: () => {
      utils.reward.getAll.invalidate();
      toast({ title: "Reward updated" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update reward",
        description: error.message,
      });
    },
  });
}

export function useDeleteReward() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  return trpc.reward.delete.useMutation({
    onSuccess: () => {
      utils.reward.getAll.invalidate();
      toast({ title: "Reward deleted", variant: "destructive" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete reward",
        description: error.message,
      });
    },
  });
}

/**
 * Reward State: get + upsert
 */
export function useRewardState() {
  const query = trpc.rewardState.get.useQuery();
  const state: RewardState | null = query.data
    ? {
        gems: query.data.gems,
        totalGemsEarned: query.data.totalGemsEarned,
        totalGemsSpent: query.data.totalGemsSpent,
        points: query.data.points,
        streakDays: query.data.streakDays,
        lastCheckDate: query.data.lastCheckDate
          ? query.data.lastCheckDate.toISOString()
          : undefined,
        badges: [], // DB doesn't manage lightweight badges yet
        achievements: [], // not stored here; fetched via achievements hook
        unlockedAchievementIds: query.data.unlockedAchievementIds,
        rewards: [], // rewards fetched via rewards hook
        purchasedRewardIds: query.data.purchasedRewardIds,
      }
    : null;
  return { state, isLoading: query.isLoading, refetch: query.refetch };
}

export function useUpsertRewardState() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  return trpc.rewardState.upsert.useMutation({
    onSuccess: () => {
      utils.rewardState.get.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update reward state",
        description: error.message,
      });
    },
  });
}

/**
 * Purchase a reward: client-side sequence updating reward + reward state
 */
export function usePurchaseReward() {
  const updateReward = useUpdateReward();
  const upsertState = useUpsertRewardState();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  return {
    async mutateAsync(params: { id: string; gemCost?: number }) {
      const current = utils.rewardState.get.getData();
      const cost = params.gemCost ?? 0;

      if (!current) {
        throw new Error("Reward state not initialized");
      }
      if (cost && current.gems < cost) {
        toast({ variant: "destructive", title: "Not enough gems" });
        return;
      }

      // 1) Mark reward purchased
      await updateReward.mutateAsync({
        id: params.id,
        isPurchased: true,
        purchasedAt: new Date().toISOString(),
      });

      // 2) Deduct gems + add purchased id
      await upsertState.mutateAsync({
        gems: cost ? current.gems - cost : current.gems,
        totalGemsSpent: cost
          ? current.totalGemsSpent + cost
          : current.totalGemsSpent,
        purchasedRewardIds: Array.from(
          new Set([...(current.purchasedRewardIds ?? []), params.id])
        ),
      });

      // 3) Invalidate queries
      await Promise.all([
        utils.reward.getAll.invalidate(),
        utils.rewardState.get.invalidate(),
      ]);

      toast({ title: "Reward purchased" });
    },
  };
}
