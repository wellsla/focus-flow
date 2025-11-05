export type Priority = "low" | "medium" | "high";
export type RoutinePeriod = "morning" | "afternoon" | "evening";
export type TaskStatus = "todo" | "in-progress" | "done" | "skipped";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  priority?: Priority;
  period?: RoutinePeriod;
  startTime?: string;
  endTime?: string;
};

export type ApplicationStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Wishlist";
export type ApplicationPriority = "High" | "Common" | "Uninterested";

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  status: ApplicationStatus;
  url: string;
  priority: ApplicationPriority;
};

export type EmploymentStatus = "Unemployed" | "Benefited" | "Employed";
export type IncomeFrequency = "annually" | "monthly" | "hourly" | "daily";
export type Currency = "R$" | "$" | "€";

export type FinancialAccount = {
  id: string;
  name: string;
  type: "expense" | "debt" | "income";
  amount: number;
  currency: Currency;
  date?: string; // For one-time income
  lastPaid?: string; // For expenses/debts (YYYY-MM-DD)
};

export type FinancialLog = {
  date: string; // YYYY-MM format
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

export type Goal = {
  id: string;
  title: string;
  description: string;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  targetDate?: string;
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
  routinePeriod?: RoutinePeriod;
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
