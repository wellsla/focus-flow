import { useCallback } from "react";
import { useLocalStorageState } from "./use-local-storage-state";
import type { RewardState } from "@/lib/types";
import {
  initializeRewardState,
  grantGems,
  spendGems,
  unlockAchievement,
  revokeAchievement,
  checkAchievementConditions,
  purchaseReward,
  resetRewards,
  updateRewardProgress,
  getAchievementProgress,
} from "@/lib/reward-utils";

export function useRewardSystem() {
  const [rewardState, setRewardState] = useLocalStorageState<RewardState>(
    "rewards",
    initializeRewardState()
  );

  // Auto-reset rewards on load
  const checkAndResetRewards = useCallback(() => {
    setRewardState((prev) => resetRewards(prev));
  }, [setRewardState]);

  // Grant gems
  const addGems = useCallback(
    (amount: number, reason: string) => {
      setRewardState((prev) => grantGems(prev, amount, reason));
    },
    [setRewardState]
  );

  // Purchase reward with gems
  const buyReward = useCallback(
    (rewardId: string) => {
      setRewardState((prev) => {
        const result = purchaseReward(prev, rewardId);
        return result ?? prev;
      });
    },
    [setRewardState]
  );

  // Unlock achievement
  const unlock = useCallback(
    (achievementId: string) => {
      setRewardState((prev) => unlockAchievement(prev, achievementId));
    },
    [setRewardState]
  );

  // Revoke achievement (penalty)
  const revoke = useCallback(
    (achievementId: string, reason: string) => {
      setRewardState((prev) => revokeAchievement(prev, achievementId, reason));
    },
    [setRewardState]
  );

  // Check all achievement conditions
  const checkAchievements = useCallback(
    (context: {
      routineStreak?: number;
      pomodoroSessions?: number;
      applicationsSent?: number;
      tasksCompleted?: number;
      financialGoalDays?: number;
      firstWeek?: boolean;
      consistentDays?: number;
    }) => {
      setRewardState((prev) => checkAchievementConditions(prev, context));
    },
    [setRewardState]
  );

  // Update reward progress and check if unlocked
  const updateProgress = useCallback(
    (
      rewardId: string,
      context: {
        routineCompletions?: number;
        taskCompletions?: number;
        pomodoroSessions?: number;
        studyConcepts?: number;
      }
    ) => {
      setRewardState((prev) => ({
        ...prev,
        rewards: prev.rewards.map((r) =>
          r.id === rewardId ? updateRewardProgress(r, context) : r
        ),
      }));
    },
    [setRewardState]
  );

  // Get achievement progress percentage
  const getProgress = useCallback(
    (
      achievementId: string,
      context: {
        routineStreak?: number;
        pomodoroSessions?: number;
        applicationsSent?: number;
        tasksCompleted?: number;
        financialGoalDays?: number;
        consistentDays?: number;
      }
    ) => {
      const achievement = rewardState.achievements.find(
        (a) => a.id === achievementId
      );
      if (!achievement) return 0;
      return getAchievementProgress(achievement, context);
    },
    [rewardState.achievements]
  );

  // Helper: Grant gems on routine completion
  const grantRoutineGems = useCallback(
    (withReflection = false) => {
      const amount = withReflection ? 10 : 5;
      addGems(
        amount,
        `Completed routine${withReflection ? " with reflection" : ""}`
      );
    },
    [addGems]
  );

  // Helper: Grant gems on task completion
  const grantTaskGems = useCallback(
    (priority: "low" | "medium" | "high" = "medium") => {
      const amounts = { low: 2, medium: 5, high: 10 };
      addGems(amounts[priority], `Completed ${priority} priority task`);
    },
    [addGems]
  );

  // Helper: Grant gems on pomodoro completion
  const grantPomodoroGems = useCallback(() => {
    addGems(3, "Completed pomodoro session");
  }, [addGems]);

  return {
    // State
    rewardState,
    gems: rewardState.gems,
    totalEarned: rewardState.totalGemsEarned,
    totalSpent: rewardState.totalGemsSpent,
    achievements: rewardState.achievements,
    rewards: rewardState.rewards,

    // Actions
    addGems,
    buyReward,
    unlockAchievement: unlock,
    revokeAchievement: revoke,
    checkAchievements,
    updateProgress,
    getProgress,
    checkAndResetRewards,

    // Helpers
    grantRoutineGems,
    grantTaskGems,
    grantPomodoroGems,
  };
}
