import type {
  Achievement,
  Reward,
  RewardCondition,
  RewardState,
} from "./types";
import { DEFAULT_ACHIEVEMENTS } from "./initial-achievements";
import {
  DEFAULT_CONDITIONAL_REWARDS,
  DEFAULT_PURCHASABLE_REWARDS,
} from "./initial-rewards";

/**
 * Initialize a new reward state with default data
 */
export function initializeRewardState(): RewardState {
  const now = new Date().toISOString();

  return {
    // Gem economy
    gems: 0,
    totalGemsEarned: 0,
    totalGemsSpent: 0,

    // Achievements (lifetime, revocable)
    achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({
      ...a,
      isUnlocked: false,
      isRevoked: false,
    })),
    unlockedAchievementIds: [],

    // Rewards (conditional & purchasable)
    rewards: [
      ...DEFAULT_CONDITIONAL_REWARDS.map((r) => ({
        ...r,
        isUnlocked: false,
        isPurchased: false,
        timesUsed: 0,
        createdAt: now,
      })),
      ...DEFAULT_PURCHASABLE_REWARDS.map((r) => ({
        ...r,
        isUnlocked: true, // Purchasable rewards are always visible
        isPurchased: false,
        timesUsed: 0,
        createdAt: now,
        conditions: undefined,
        resetFrequency: undefined,
      })),
    ],
    purchasedRewardIds: [],

    // Legacy fields (backward compatibility)
    points: 0,
    streakDays: 0,
    lastCheckDate: "",
  };
}

/**
 * Grant gems to the user and track earnings
 */
export function grantGems(
  state: RewardState,
  amount: number,
  reason: string
): RewardState {
  console.log(`[Gems] +${amount} gems: ${reason}`);

  return {
    ...state,
    gems: state.gems + amount,
    totalGemsEarned: state.totalGemsEarned + amount,
  };
}

/**
 * Spend gems (returns null if insufficient gems)
 */
export function spendGems(
  state: RewardState,
  amount: number,
  reason: string
): RewardState | null {
  if (state.gems < amount) {
    console.warn(
      `[Gems] Insufficient gems: need ${amount}, have ${state.gems}`
    );
    return null;
  }

  console.log(`[Gems] -${amount} gems: ${reason}`);

  return {
    ...state,
    gems: state.gems - amount,
    totalGemsSpent: state.totalGemsSpent + amount,
  };
}

/**
 * Check if a reward condition is met
 */
export function checkCondition(
  condition: RewardCondition,
  context: {
    routineCompletions?: number;
    taskCompletions?: number;
    pomodoroSessions?: number;
    studyConcepts?: number;
    routineId?: string;
    taskTag?: string;
  }
): boolean {
  switch (condition.type) {
    case "routine-completion":
      return (context.routineCompletions ?? 0) >= condition.target;

    case "task-completion":
      // If routineId specified, check specific routine
      if (condition.routineId) {
        return (
          context.routineId === condition.routineId &&
          (context.taskCompletions ?? 0) >= condition.target
        );
      }
      return (context.taskCompletions ?? 0) >= condition.target;

    case "pomodoro-sessions":
      return (context.pomodoroSessions ?? 0) >= condition.target;

    case "study-concepts":
      return (context.studyConcepts ?? 0) >= condition.target;

    case "custom":
      // Custom conditions need manual checking
      return condition.isMet;

    default:
      return false;
  }
}

/**
 * Check if all conditions for a reward are met
 */
export function checkRewardConditions(
  reward: Reward,
  context: {
    routineCompletions?: number;
    taskCompletions?: number;
    pomodoroSessions?: number;
    studyConcepts?: number;
    routineId?: string;
    taskTag?: string;
  }
): boolean {
  if (!reward.conditions || reward.conditions.length === 0) {
    return true; // No conditions = always unlocked (e.g., purchasable rewards)
  }

  return reward.conditions.every((condition) =>
    checkCondition(condition, context)
  );
}

/**
 * Update reward condition progress
 */
export function updateRewardProgress(
  reward: Reward,
  context: {
    routineCompletions?: number;
    taskCompletions?: number;
    pomodoroSessions?: number;
    studyConcepts?: number;
  }
): Reward {
  if (!reward.conditions) return reward;

  const updatedConditions = reward.conditions.map((condition) => {
    let progress = 0;

    switch (condition.type) {
      case "routine-completion":
        progress = context.routineCompletions ?? 0;
        break;
      case "task-completion":
        progress = context.taskCompletions ?? 0;
        break;
      case "pomodoro-sessions":
        progress = context.pomodoroSessions ?? 0;
        break;
      case "study-concepts":
        progress = context.studyConcepts ?? 0;
        break;
      default:
        progress = condition.progress ?? 0;
    }

    return {
      ...condition,
      progress,
      isMet: progress >= condition.target,
    };
  });

  const isUnlocked = updatedConditions.every((c) => c.isMet);

  return {
    ...reward,
    conditions: updatedConditions,
    isUnlocked,
  };
}

/**
 * Unlock an achievement and grant gem reward
 */
export function unlockAchievement(
  state: RewardState,
  achievementId: string
): RewardState {
  const achievement = state.achievements.find((a) => a.id === achievementId);
  if (!achievement) {
    console.warn(`[Achievement] Not found: ${achievementId}`);
    return state;
  }

  if (achievement.isUnlocked && !achievement.isRevoked) {
    console.log(`[Achievement] Already unlocked: ${achievementId}`);
    return state;
  }

  const now = new Date().toISOString();

  // Unlock achievement
  const updatedAchievements = state.achievements.map((a) =>
    a.id === achievementId
      ? {
          ...a,
          isUnlocked: true,
          isRevoked: false,
          unlockedAt: now,
          revokedAt: undefined,
        }
      : a
  );

  // Grant gems
  const withGems = grantGems(
    state,
    achievement.gemReward,
    `Achievement unlocked: ${achievement.title}`
  );

  console.log(
    `[Achievement] Unlocked: ${achievement.title} (+${achievement.gemReward} gems)`
  );

  return {
    ...withGems,
    achievements: updatedAchievements,
    unlockedAchievementIds: [
      ...state.unlockedAchievementIds.filter((id) => id !== achievementId),
      achievementId,
    ],
  };
}

/**
 * Revoke an achievement (penalty for bad behavior)
 */
export function revokeAchievement(
  state: RewardState,
  achievementId: string,
  reason: string
): RewardState {
  const achievement = state.achievements.find((a) => a.id === achievementId);
  if (!achievement || !achievement.isUnlocked || achievement.isRevoked) {
    return state;
  }

  const now = new Date().toISOString();

  const updatedAchievements = state.achievements.map((a) =>
    a.id === achievementId
      ? {
          ...a,
          isRevoked: true,
          revokedAt: now,
        }
      : a
  );

  console.log(`[Achievement] Revoked: ${achievement.title} - ${reason}`);

  return {
    ...state,
    achievements: updatedAchievements,
    unlockedAchievementIds: state.unlockedAchievementIds.filter(
      (id) => id !== achievementId
    ),
  };
}

/**
 * Check achievement conditions and unlock if met
 */
export function checkAchievementConditions(
  state: RewardState,
  context: {
    routineStreak?: number;
    pomodoroSessions?: number;
    applicationsSent?: number;
    tasksCompleted?: number;
    financialGoalDays?: number;
    firstWeek?: boolean;
    consistentDays?: number;
  }
): RewardState {
  let updatedState = { ...state };

  for (const achievement of state.achievements) {
    if (achievement.isUnlocked && !achievement.isRevoked) {
      continue; // Already unlocked
    }

    const condition = achievement.condition;
    let shouldUnlock = false;

    switch (condition.type) {
      case "routine-streak":
        shouldUnlock = (context.routineStreak ?? 0) >= condition.target;
        break;
      case "pomodoro-sessions":
        shouldUnlock = (context.pomodoroSessions ?? 0) >= condition.target;
        break;
      case "applications-sent":
        shouldUnlock = (context.applicationsSent ?? 0) >= condition.target;
        break;
      case "task-completed":
        shouldUnlock = (context.tasksCompleted ?? 0) >= condition.target;
        break;
      case "financial-goal":
        shouldUnlock = (context.financialGoalDays ?? 0) >= condition.target;
        break;
      case "custom":
        if (achievement.id === "milestone-first-week" && context.firstWeek) {
          shouldUnlock = true;
        } else if (achievement.id === "milestone-consistency-60") {
          shouldUnlock = (context.consistentDays ?? 0) >= 60;
        }
        break;
    }

    if (shouldUnlock) {
      updatedState = unlockAchievement(updatedState, achievement.id);
    }
  }

  return updatedState;
}

/**
 * Purchase a reward with gems
 */
export function purchaseReward(
  state: RewardState,
  rewardId: string
): RewardState | null {
  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!reward) {
    console.warn(`[Reward] Not found: ${rewardId}`);
    return null;
  }

  if (reward.type !== "purchasable" || !reward.gemCost) {
    console.warn(`[Reward] Not purchasable: ${rewardId}`);
    return null;
  }

  // Spend gems
  const afterSpending = spendGems(
    state,
    reward.gemCost,
    `Purchased: ${reward.title}`
  );
  if (!afterSpending) {
    return null; // Insufficient gems
  }

  const now = new Date().toISOString();

  // Mark as purchased
  const updatedRewards = state.rewards.map((r) =>
    r.id === rewardId
      ? {
          ...r,
          isPurchased: true,
          purchasedAt: now,
          timesUsed: (r.timesUsed ?? 0) + 1,
        }
      : r
  );

  console.log(`[Reward] Purchased: ${reward.title} (-${reward.gemCost} gems)`);

  return {
    ...afterSpending,
    rewards: updatedRewards,
    purchasedRewardIds: [...state.purchasedRewardIds, rewardId],
  };
}

/**
 * Reset rewards based on their frequency
 */
export function resetRewards(state: RewardState): RewardState {
  const now = new Date();
  const updatedRewards = state.rewards.map((reward) => {
    if (!reward.resetFrequency || reward.type === "purchasable") {
      return reward;
    }

    const lastReset = reward.lastResetAt
      ? new Date(reward.lastResetAt)
      : new Date(0);

    let shouldReset = false;

    switch (reward.resetFrequency) {
      case "daily":
        // Reset if last reset was yesterday or earlier
        shouldReset = now.toDateString() !== lastReset.toDateString();
        break;

      case "weekly":
        // Reset if different week
        const daysDiff = Math.floor(
          (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
        );
        shouldReset = daysDiff >= 7;
        break;

      case "monthly":
        // Reset if different month
        shouldReset =
          now.getMonth() !== lastReset.getMonth() ||
          now.getFullYear() !== lastReset.getFullYear();
        break;

      case "one-time":
        shouldReset = false; // Never reset
        break;
    }

    if (shouldReset && reward.conditions) {
      return {
        ...reward,
        isUnlocked: false,
        isPurchased: false,
        lastResetAt: now.toISOString(),
        conditions: reward.conditions.map((c) => ({
          ...c,
          isMet: false,
          progress: 0,
        })),
      };
    }

    return reward;
  });

  return {
    ...state,
    rewards: updatedRewards,
  };
}

/**
 * Get progress percentage for an achievement
 */
export function getAchievementProgress(
  achievement: Achievement,
  context: {
    routineStreak?: number;
    pomodoroSessions?: number;
    applicationsSent?: number;
    tasksCompleted?: number;
    financialGoalDays?: number;
    consistentDays?: number;
  }
): number {
  if (achievement.isUnlocked && !achievement.isRevoked) {
    return 100;
  }

  const condition = achievement.condition;
  let current = 0;

  switch (condition.type) {
    case "routine-streak":
      current = context.routineStreak ?? 0;
      break;
    case "pomodoro-sessions":
      current = context.pomodoroSessions ?? 0;
      break;
    case "applications-sent":
      current = context.applicationsSent ?? 0;
      break;
    case "task-completed":
      current = context.tasksCompleted ?? 0;
      break;
    case "financial-goal":
      current = context.financialGoalDays ?? 0;
      break;
    case "custom":
      if (achievement.id === "milestone-consistency-60") {
        current = context.consistentDays ?? 0;
      }
      break;
  }

  return Math.min(100, Math.round((current / condition.target) * 100));
}
