/**
 * initial-data.ts
 *
 * Consolidated initial/seed data for Focus Flow
 * Contains default values, sample data, and initialization helpers
 */

import type {
  JobApplication,
  FinancialAccount,
  Task,
  UserProfile,
  AppSettings,
  DashboardCard,
  IncomeSettings,
  TimeTrackingEntry,
  Goal,
  RoadmapNode,
  DailyLog,
  RoutineItem,
  FlashReminder,
} from "./types";

// ============================================================================
// USER PROFILE & APP SETTINGS
// ============================================================================

export const defaultUserProfile: UserProfile = {
  name: "John Doe",
  title: "Aspiring Full Stack Developer",
  experience: [
    "Software Engineer at TechCorp (2020-2022)",
    "Intern at Web Solutions (2019)",
  ],
  education: "B.S. in Computer Science - State University",
};

export const defaultAppSettings: AppSettings = {
  timeTracking: {
    gameHours: 0,
  },
};

export const defaultIncomeSettings: IncomeSettings = {
  status: "Unemployed",
  amount: 0,
  frequency: "monthly",
  currency: "R$",
  benefitsEndDate: undefined,
};

// ============================================================================
// ROUTINES (Recurring Habits)
// ============================================================================

export const defaultRoutines: RoutineItem[] = [
  // Morning
  {
    id: "routine-morning-1",
    category: "Morning",
    title: "Make the bed",
    frequency: "daily",
    active: true,
    order: 1,
  },
  {
    id: "routine-morning-2",
    category: "Morning",
    title: "Hydration (water upon waking)",
    frequency: "daily",
    active: true,
    order: 2,
  },
  {
    id: "routine-morning-3",
    category: "Morning",
    title: "Meditation or breathing (5 min)",
    frequency: "daily",
    active: true,
    order: 3,
  },
  {
    id: "routine-morning-4",
    category: "Morning",
    title: "Review today's goals",
    frequency: "daily",
    active: true,
    order: 4,
  },

  // During the Day
  {
    id: "routine-day-1",
    category: "During the Day",
    title: "Work on priority task (pomodoro)",
    frequency: "daily",
    active: true,
    order: 5,
  },
  {
    id: "routine-day-2",
    category: "During the Day",
    title: "Active breaks every 2h",
    frequency: "daily",
    active: true,
    order: 6,
  },
  {
    id: "routine-day-3",
    category: "During the Day",
    title: "Screen-free meal",
    frequency: "daily",
    active: true,
    order: 7,
  },
  {
    id: "routine-day-4",
    category: "During the Day",
    title: "Review job applications",
    frequency: "daily",
    active: true,
    order: 8,
  },

  // Evening
  {
    id: "routine-evening-1",
    category: "Evening",
    title: "Organize environment for tomorrow",
    frequency: "daily",
    active: true,
    order: 9,
  },
  {
    id: "routine-evening-2",
    category: "Evening",
    title: "Journal (3 lines)",
    frequency: "daily",
    active: true,
    order: 10,
  },
  {
    id: "routine-evening-3",
    category: "Evening",
    title: "Turn off screens 1h before bed",
    frequency: "daily",
    active: true,
    order: 11,
  },
  {
    id: "routine-evening-4",
    category: "Evening",
    title: "Consistent sleep routine",
    frequency: "daily",
    active: true,
    order: 12,
  },

  // Weekly Routine
  {
    id: "routine-weekly-1",
    category: "Weekly Routine",
    title: "Review weekly progress",
    frequency: "weekly",
    active: true,
    order: 13,
  },
  {
    id: "routine-weekly-2",
    category: "Weekly Routine",
    title: "Plan next week",
    frequency: "weekly",
    active: true,
    order: 14,
  },
  {
    id: "routine-weekly-3",
    category: "Weekly Routine",
    title: "Clean and organize workspace",
    frequency: "weekly",
    active: true,
    order: 15,
  },

  // Purpose and Direction
  {
    id: "routine-purpose-1",
    category: "Purpose and Direction",
    title: "Review long-term goals",
    frequency: "monthly",
    active: true,
    order: 16,
  },
  {
    id: "routine-purpose-2",
    category: "Purpose and Direction",
    title: "Update learning roadmap",
    frequency: "monthly",
    active: true,
    order: 17,
  },

  // Maintenance
  {
    id: "routine-maintenance-1",
    category: "Maintenance",
    title: "Backup important data",
    frequency: "monthly",
    active: true,
    order: 18,
  },
  {
    id: "routine-maintenance-2",
    category: "Maintenance",
    title: "Review and update finances",
    frequency: "weekly",
    active: true,
    order: 19,
  },
  {
    id: "routine-maintenance-3",
    category: "Maintenance",
    title: "Physical exercise (30 min)",
    frequency: "every3days",
    active: true,
    order: 20,
  },
];

// ============================================================================
// FLASH REMINDERS
// ============================================================================

export const defaultReminders: FlashReminder[] = [
  {
    id: "reminder-app-open",
    text: "Be kind to yourself. Today is another day of 1% progress.",
    trigger: "app-open",
    enabled: true,
  },
  {
    id: "reminder-pomodoro-start",
    text: "Focus on the next 25 minutes. You've got this.",
    trigger: "pomodoro-start",
    enabled: true,
    allowInFocus: false,
  },
  {
    id: "reminder-morning",
    text: "Good morning! Review your 3 main priorities for today.",
    trigger: "time",
    timeOfDay: "09:00",
    enabled: true,
  },
  {
    id: "reminder-lunch",
    text: "Time for a meal break. Turn off screens for 30 minutes.",
    trigger: "time",
    timeOfDay: "12:30",
    enabled: true,
  },
  {
    id: "reminder-afternoon",
    text: "Take an active break. Stretch and breathe.",
    trigger: "time",
    timeOfDay: "15:00",
    enabled: true,
  },
  {
    id: "reminder-evening",
    text: "How about journaling your day? 3 lines is enough.",
    trigger: "time",
    timeOfDay: "20:00",
    enabled: true,
  },
];

// ============================================================================
// TASKS (One-time todos, not recurring like routines)
// ============================================================================

export const defaultTasks: Task[] = [];

// ============================================================================
// JOB APPLICATION & CAREER DATA
// ============================================================================

export const defaultJobApplications: JobApplication[] = [];

export const defaultGoals: Goal[] = [];

export const defaultRoadmap: RoadmapNode = {
  id: "root",
  name: "First Trial",
  status: "in_progress",
  children: [
    {
      id: "backend",
      name: "Backend",
      status: "todo",
      children: [
        { id: "nodejs", name: "Node.js", status: "todo", children: [] },
        { id: "python", name: "Python", status: "todo", children: [] },
      ],
    },
    {
      id: "frontend",
      name: "Frontend",
      status: "in_progress",
      children: [
        {
          id: "react",
          name: "React.js",
          status: "in_progress",
          children: [
            { id: "router", name: "Router", status: "todo", children: [] },
            { id: "hooks", name: "Hooks", status: "done", children: [] },
          ],
        },
        {
          id: "architecture",
          name: "Architecture",
          status: "todo",
          children: [
            {
              id: "clean-code",
              name: "Clean Code",
              status: "todo",
              children: [],
            },
            { id: "solid", name: "SOLID", status: "todo", children: [] },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// DASHBOARD CARDS
// ============================================================================

export const defaultDashboardCards: DashboardCard[] = [
  {
    id: "1",
    title: "Applications Sent",
    subtext: "Total applications you have sent.",
    icon: "Briefcase",
    visualization: "default",
    config: {
      feature: "applications",
      metric: "total",
    },
    value: "0",
  },
  {
    id: "2",
    title: "Interviews",
    subtext: "Get those offers!",
    icon: "TrendingUp",
    visualization: "default",
    config: {
      feature: "applications",
      metric: "status",
      applicationStatus: "Interviewing",
    },
    value: "0",
  },
  {
    id: "3",
    title: "Time Sink (Gaming)",
    subtext: "Weekly gaming time.",
    icon: "ShieldAlert",
    visualization: "warning",
    config: {
      feature: "time",
      metric: "total_gaming",
    },
    value: "0 hours",
  },
  {
    id: "4",
    title: "Incomplete Routines",
    subtext: "Routines remaining for today.",
    icon: "XCircle",
    visualization: "critical",
    config: {
      feature: "routine",
      metric: "total_incomplete",
    },
    value: "0",
  },
];

// ============================================================================
// FINANCIAL & TIME TRACKING
// ============================================================================

export const defaultFinancialAccounts: FinancialAccount[] = [];
export const defaultTimeTrackingEntries: TimeTrackingEntry[] = [];
export const defaultDailyLogs: DailyLog[] = [];

// ============================================================================
// INITIALIZATION HELPERS
// ============================================================================

/**
 * Initialize default routines if none exist
 */
export function initializeRoutines(
  existingRoutines: RoutineItem[]
): RoutineItem[] {
  if (existingRoutines.length > 0) {
    return existingRoutines;
  }

  console.info("[initial-data] Initializing default routines");
  return defaultRoutines;
}

/**
 * Initialize default reminders if none exist
 */
export function initializeReminders(
  existingReminders: FlashReminder[]
): FlashReminder[] {
  if (existingReminders.length > 0) {
    return existingReminders;
  }

  console.info("[initial-data] Initializing default reminders");
  return defaultReminders;
}

/**
 * Initialize default tasks if none exist
 */
export function initializeTasks(existingTasks: Task[]): Task[] {
  if (existingTasks.length > 0) {
    return existingTasks;
  }

  console.info("[initial-data] Initializing default tasks");
  return defaultTasks;
}
