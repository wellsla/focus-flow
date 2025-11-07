import type { Achievement } from "./types";

/**
 * Default achievements that users can unlock
 * These are lifetime achievements that can be revoked if user breaks their habits
 */
export const DEFAULT_ACHIEVEMENTS: Omit<
  Achievement,
  "unlockedAt" | "revokedAt" | "isUnlocked" | "isRevoked"
>[] = [
  // Routine Achievements
  {
    id: "routine-streak-7",
    title: "Week Warrior",
    description: "Complete your daily routine for 7 consecutive days",
    category: "routines",
    icon: "Flame",
    gemReward: 50,
    condition: {
      type: "routine-streak",
      target: 7,
    },
  },
  {
    id: "routine-streak-30",
    title: "Monthly Master",
    description: "Complete your daily routine for 30 consecutive days",
    category: "routines",
    icon: "Trophy",
    gemReward: 200,
    condition: {
      type: "routine-streak",
      target: 30,
    },
  },
  {
    id: "routine-streak-100",
    title: "Century Champion",
    description: "Complete your daily routine for 100 consecutive days",
    category: "routines",
    icon: "Crown",
    gemReward: 1000,
    condition: {
      type: "routine-streak",
      target: 100,
    },
  },

  // Study Achievements
  {
    id: "pomodoro-10",
    title: "Focus Beginner",
    description: "Complete 10 productive pomodoro sessions",
    category: "study",
    icon: "Timer",
    gemReward: 30,
    condition: {
      type: "pomodoro-sessions",
      target: 10,
    },
  },
  {
    id: "pomodoro-50",
    title: "Focus Expert",
    description: "Complete 50 productive pomodoro sessions",
    category: "study",
    icon: "Brain",
    gemReward: 100,
    condition: {
      type: "pomodoro-sessions",
      target: 50,
    },
  },
  {
    id: "pomodoro-100",
    title: "Concentration Master",
    description: "Complete 100 productive pomodoro sessions",
    category: "study",
    icon: "Zap",
    gemReward: 250,
    condition: {
      type: "pomodoro-sessions",
      target: 100,
    },
  },

  // Career Achievements
  {
    id: "applications-10",
    title: "Job Hunter",
    description: "Apply to 10 quality job positions",
    category: "career",
    icon: "Briefcase",
    gemReward: 50,
    condition: {
      type: "applications-sent",
      target: 10,
    },
  },
  {
    id: "applications-50",
    title: "Application Machine",
    description: "Apply to 50 quality job positions",
    category: "career",
    icon: "Rocket",
    gemReward: 200,
    condition: {
      type: "applications-sent",
      target: 50,
    },
  },
  {
    id: "first-interview",
    title: "Interview Ready",
    description: "Get your first interview invitation",
    category: "career",
    icon: "Star",
    gemReward: 100,
    condition: {
      type: "custom",
      target: 1,
    },
  },

  // Task Achievements
  {
    id: "tasks-completed-25",
    title: "Task Tackler",
    description: "Complete 25 tasks",
    category: "consistency",
    icon: "CheckCircle2",
    gemReward: 40,
    condition: {
      type: "task-completed",
      target: 25,
    },
  },
  {
    id: "tasks-completed-100",
    title: "Task Master",
    description: "Complete 100 tasks",
    category: "consistency",
    icon: "Target",
    gemReward: 150,
    condition: {
      type: "task-completed",
      target: 100,
    },
  },

  // Finance Achievements
  {
    id: "budget-adherence-7",
    title: "Budget Beginner",
    description: "Stay within budget for 7 consecutive days",
    category: "finance",
    icon: "PiggyBank",
    gemReward: 60,
    condition: {
      type: "financial-goal",
      target: 7,
    },
  },
  {
    id: "budget-adherence-30",
    title: "Financial Discipline",
    description: "Stay within budget for 30 consecutive days",
    category: "finance",
    icon: "TrendingUp",
    gemReward: 250,
    condition: {
      type: "financial-goal",
      target: 30,
    },
  },

  // Milestone Achievements
  {
    id: "first-week",
    title: "Getting Started",
    description: "Complete your first week on FocusFlow",
    category: "milestone",
    icon: "Sparkles",
    gemReward: 20,
    condition: {
      type: "custom",
      target: 1,
    },
  },
  {
    id: "consistency-god",
    title: "Consistency God",
    description:
      "Maintain all good habits for 60 days straight (routines, tasks, study)",
    category: "milestone",
    icon: "Award",
    gemReward: 500,
    condition: {
      type: "custom",
      target: 60,
    },
  },
];
