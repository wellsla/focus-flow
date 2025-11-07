export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done" | "cancelled";

/**
 * Task - One-time todos with optional deadlines
 * Unlike RoutineItem (recurring habits), Tasks are discrete items to complete
 */
export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  completedDate?: string; // YYYY-MM-DD
  tags?: string[];
  createdAt: string; // ISO timestamp
};

export type ApplicationStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Wishlist";
export type ApplicationPriority = "High" | "Common" | "Uninterested";

export type ApplicationComment = {
  id: string;
  text: string;
  createdAt: string; // ISO timestamp
};

// Deep Application Workflow - 6-step process
export type DeepApplicationWorkflow = {
  step1_found: {
    jobUrl: string;
    foundDate: string;
    source: string; // LinkedIn, Indeed, etc
  };
  step2_readDescription: {
    completed: boolean;
    keyRequirements: string;
    dealbreakers?: string;
    notes: string;
  };
  step3_companyResearch: {
    completed: boolean;
    whatTheyDo: string;
    whyThisRole: string;
  };
  step4_writeInformation: {
    completed: boolean;
    whyGoodFit: string;
  };
  step5_apply: {
    completed: boolean;
    appliedDate?: string;
  };
  step6_contact: {
    completed: boolean;
    contactedPerson?: string;
    contactMethod?: "LinkedIn" | "Email" | "Phone" | "Other";
    followUpPlan?: string;
  };
};

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  status: ApplicationStatus;
  url: string;
  priority: ApplicationPriority;
  description?: string;
  comments?: ApplicationComment[];
  deepWorkflow?: DeepApplicationWorkflow;
  applicationDepthScore?: number; // 0-100 based on completed steps
};

export type EmploymentStatus = "Unemployed" | "Benefited" | "Employed";
export type IncomeFrequency = "annually" | "monthly" | "hourly" | "daily";
export type Currency = "R$" | "$" | "€";

export type ExpenseCategory =
  | "Food & Groceries"
  | "Streaming & Entertainment"
  | "Clothing & Accessories"
  | "Transportation"
  | "Healthcare"
  | "Housing & Utilities"
  | "Education"
  | "Shopping & Leisure"
  | "Other";

export type ExpensePriority =
  | "Essential"
  | "Necessary"
  | "Common"
  | "Unnecessary";

export type FinancialAccount = {
  id: string;
  name: string;
  type: "expense" | "debt" | "income";
  amount: number;
  currency: Currency;
  date?: string; // For one-time income
  lastPaid?: string; // For expenses/debts (YYYY-MM-DD)
  category?: ExpenseCategory; // For expenses and debts
  priority?: ExpensePriority; // For expenses and debts
};

export type FinancialLog = {
  date: string; // YYYY-MM-DD (stored as full date for monthly snapshot)
  totalIncome: number;
  totalExpenses: number;
  totalDebt: number;
  net: number;
  currency: Currency;
};

export type UserProfile = {
  name: string;
  title: string;
  experience: string[];
  education: string;
};

export type TimeTrackingEntry = {
  id: string;
  activityType: "game" | "app";
  name: string;
  date: string;
  hours: number;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
};

export type AppSettings = {
  timeTracking: {
    gameHours: number;
  };
};

export type IncomeSettings = {
  status: EmploymentStatus;
  amount: number;
  frequency: IncomeFrequency;
  currency: Currency;
  benefitsEndDate?: string;
};

export type GoalTimeframe = "Short-Term" | "Mid-Term" | "Long-Term";
export type GoalStatus = "Not Started" | "In Progress" | "Achieved";
export type GoalType = "Goal" | "Anti-Goal";

export type Goal = {
  id: string;
  title: string;
  description: string;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  targetDate?: string;
  goalType: GoalType; // Goal (achieve something) or Anti-Goal (stop doing something)
  actionSteps?: string[]; // AI-generated micro-actions to achieve the goal
};

export type RoadmapNodeStatus =
  | "done"
  | "in_progress"
  | "todo"
  | "skipped"
  | "parallel";

export type RoadmapNode = {
  id: string;
  name: string;
  status: RoadmapNodeStatus;
  children: RoadmapNode[];
};

export type DashboardCardFeature =
  | "applications"
  | "routine"
  | "finances"
  | "time"
  | "goals";

export type ApplicationsMetric = "total" | "status";
export type RoutineMetric = "total_incomplete" | "period_incomplete";
export type FinancesMetric = "net_monthly" | "total_debt" | "total_expenses";
export type TimeMetric = "total_gaming" | "total_apps";
export type GoalsMetric = "total" | "status" | "timeframe";

export type DashboardCardConfig = {
  feature: DashboardCardFeature;
  metric: string;
  // Feature-specific filters
  applicationStatus?: ApplicationStatus;
  goalStatus?: GoalStatus;
  goalTimeframe?: GoalTimeframe;
  specialCard?: "benefits-countdown";
};

export type DashboardCardVisualStyle = "default" | "warning" | "critical";

export type DashboardCard = {
  id: string;
  title: string;
  subtext: string;
  icon: string;
  visualization: DashboardCardVisualStyle;
  config: DashboardCardConfig;
  value: string; // This will be calculated dynamically
  details?: { title: string; label: string; rawValue?: string }[];
};

// Log types for historical data
export type DailyApplicationLog = {
  status: ApplicationStatus;
  count: number;
};

export type DailyGoalLog = {
  status: GoalStatus;
  count: number;
};

export type DailyTaskLog = {
  status: TaskStatus;
  count: number;
};

export type DailyLog = {
  date: string; // YYYY-MM-DD
  applications: DailyApplicationLog[];
  goals: DailyGoalLog[];
  tasks: DailyTaskLog[];
};

// ============================================================================
// New Types for Focus Flow System (Routines, Pomodoro, Journal, Rewards)
// ============================================================================

export type Frequency = "daily" | "weekly" | "monthly" | "every3days";

export type RoutineCategory =
  | "Morning"
  | "During the Day"
  | "Evening"
  | "Weekly Routine"
  | "Purpose and Direction"
  | "Maintenance";

export interface RoutineItem {
  id: string;
  category: RoutineCategory;
  title: string; // ex.: "Arrumar a cama"
  frequency: Frequency;
  active: boolean; // permitir ocultar temporariamente
  order?: number;
  routineType?: "study" | "code" | "job-search" | "finances" | "general"; // For reflection questions
  requiresReflection?: boolean; // If true, shows reflection dialog before completing
}

// Routine Reflection - Questions answered when completing routine
export type RoutineReflection = {
  routineId: string;
  completedAt: string; // ISO timestamp
  questions: {
    [key: string]: string; // question key -> answer
  };
};

export interface Checkmark {
  id: string;
  routineId: string;
  dateISO: string; // yyyy-mm-dd
  done: boolean;
  reflection?: RoutineReflection; // Added reflection data
}

// Pomodoro Activity Categories
export type PomodoroCategory =
  | "deep-learning" // Study focused
  | "active-coding" // Intentional coding
  | "job-search" // Job hunting
  | "tutorial-following" // Semi-productive
  | "social-media" // Time wasted
  | "streaming" // Time wasted
  | "other";

export type PomodoroCategoryType = "productive" | "semi-productive" | "wasted";

export interface PomodoroSettings {
  workMin: number; // default 25
  breakMin: number; // default 5
  longBreakMin: number; // default 15
  cyclesUntilLong: number; // default 4
  sound: boolean;
  desktopNotifications: boolean;
  vibration: boolean; // mobile
}

export interface PomodoroSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  kind: "work" | "break" | "long-break";
  completed: boolean;
  category?: PomodoroCategory; // Activity category
  wasTrulyProductive?: boolean; // User validation after session
}

export interface JournalEntry {
  id: string;
  dateISO: string;
  mood?: "low" | "ok" | "high";
  lines: [string, string, string]; // "como estou / o que quero sentir / frase-âncora"
  tags?: string[];
}

export interface FocusBlock {
  id: string;
  startedAt: string;
  endedAt?: string;
  plannedMin: number;
  whitelistRoutes?: string[]; // rotas permitidas
  strict: boolean; // trava de saída
  completed: boolean;
}

// ============================================================================
// Achievement System (formerly Rewards) - Lifetime achievements that can be revoked
// ============================================================================

export type AchievementCategory =
  | "routines"
  | "study"
  | "career"
  | "finance"
  | "consistency"
  | "milestone";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string; // Lucide icon name
  gemReward: number; // Gems earned when unlocked
  unlockedAt?: string; // ISO timestamp when first unlocked
  revokedAt?: string; // ISO timestamp if revoked due to bad behavior
  isUnlocked: boolean;
  isRevoked: boolean;
  // Conditions to unlock (evaluated dynamically)
  condition: {
    type:
      | "routine-streak"
      | "task-completed"
      | "pomodoro-sessions"
      | "applications-sent"
      | "financial-goal"
      | "custom";
    target: number; // e.g., 7 days streak, 50 pomodoros
    current?: number; // Current progress
  };
}

// ============================================================================
// Reward System - Real rewards with conditions and reset schedules
// ============================================================================

export type RewardType = "conditional" | "purchasable";
export type RewardResetFrequency = "daily" | "weekly" | "monthly" | "one-time";
export type RewardConditionType =
  | "routine-completion"
  | "task-completion"
  | "pomodoro-sessions"
  | "study-concepts"
  | "custom";

export interface RewardCondition {
  type: RewardConditionType;
  description: string; // e.g., "Complete morning routine"
  target: number; // e.g., 2 concepts studied
  routineId?: string; // If type is routine-completion
  taskTag?: string; // If type is task-completion
  isMet: boolean; // Calculated dynamically
  progress: number; // Current progress towards target
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: RewardType;
  icon: string; // Lucide icon name
  category: "food" | "entertainment" | "break" | "luxury" | "custom";

  // For conditional rewards (e.g., coffee after studying)
  conditions?: RewardCondition[];
  isUnlocked: boolean; // If all conditions are met
  resetFrequency?: RewardResetFrequency; // When conditions reset

  // For purchasable rewards (bought with gems)
  gemCost?: number; // Cost in gems
  isPurchased?: boolean; // If already purchased
  purchasedAt?: string; // ISO timestamp
  isOneTime?: boolean; // If true, can only be purchased once

  // Tracking
  lastResetAt?: string; // ISO timestamp of last reset
  timesUsed: number; // How many times claimed
  createdAt: string; // ISO timestamp
}

export interface RewardState {
  gems: number; // Currency earned from completing actions and achievements
  totalGemsEarned: number; // Lifetime total
  totalGemsSpent: number; // Lifetime total

  // Point tracking (legacy, can be used for additional gamification)
  points: number; // +1 micro-tarefa/cheque; +5 sessão pomodoro completa; streaks
  streakDays: number; // dias seguidos com pelo menos N checks
  lastCheckDate?: string; // para calcular streak

  // Achievement tracking
  achievements: Achievement[];
  unlockedAchievementIds: string[]; // Quick lookup

  // Reward tracking
  rewards: Reward[];
  purchasedRewardIds: string[]; // Quick lookup
}

export type FlashReminderTrigger = "app-open" | "pomodoro-start" | "time";

export interface FlashReminder {
  id: string;
  text: string; // lembrete curto / "porquê"
  trigger: FlashReminderTrigger;
  timeOfDay?: string; // '09:00'
  enabled: boolean;
  allowInFocus?: boolean; // exibir durante modo foco
}
