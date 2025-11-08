/**
 * use-reward-economy.ts
 *
 * Database-backed gem economy helpers replacing legacy localStorage reward system
 * Provides simple mutation wrappers to grant gems for routine/task/pomodoro events.
 */

"use client";

import { useCallback } from "react";
import { useRewardState, useUpsertRewardState } from "@/hooks/use-rewards-db";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export function useRewardEconomy() {
  const { state } = useRewardState();
  const upsert = useUpsertRewardState();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  // Internal helper to apply gem delta
  const applyGemDelta = useCallback(
    async (amount: number, reason?: string) => {
      const current = utils.rewardState.get.getData() || state;
      if (!current) {
        toast({
          variant: "destructive",
          title: "Reward state not initialized",
        });
        return;
      }
      await upsert.mutateAsync({
        gems: current.gems + amount,
        totalGemsEarned: current.totalGemsEarned + amount,
      });
      await utils.rewardState.get.invalidate();
      toast({ title: `+${amount} gems earned`, description: reason });
    },
    [state, upsert, utils, toast]
  );

  const grantRoutineGems = useCallback(
    async (withReflection: boolean) => {
      const amount = withReflection ? 10 : 5;
      await applyGemDelta(
        amount,
        `Routine completed${withReflection ? " with reflection" : ""}`
      );
    },
    [applyGemDelta]
  );

  const grantTaskGems = useCallback(
    async (priority: "low" | "medium" | "high" = "medium") => {
      const amounts = { low: 2, medium: 5, high: 10 } as const;
      await applyGemDelta(
        amounts[priority],
        `Completed ${priority} priority task`
      );
    },
    [applyGemDelta]
  );

  const grantPomodoroGems = useCallback(async () => {
    await applyGemDelta(3, "Completed pomodoro session");
  }, [applyGemDelta]);

  return {
    grantRoutineGems,
    grantTaskGems,
    grantPomodoroGems,
  };
}
