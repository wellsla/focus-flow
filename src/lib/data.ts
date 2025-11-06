import {
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
} from "./types";

export const userProfile: UserProfile = {
  name: "John Doe",
  title: "Aspiring Full Stack Developer",
  experience: [
    "Software Engineer at TechCorp (2020-2022)",
    "Intern at Web Solutions (2019)",
  ],
  education: "B.S. in Computer Science - State University",
};

export const appSettings: AppSettings = {
  timeTracking: {
    gameHours: 0,
  },
};

/**
 * @deprecated tasks array moved to legacy-data.ts
 * This export is kept for backwards compatibility only
 * New code should use initial-data.ts for Tasks
 */
export const tasks: Task[] = [];

export const goals: Goal[] = [];
export const dailyLogs: DailyLog[] = [];
export const jobApplications: JobApplication[] = [];

export const roadmap: RoadmapNode = {
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

export const dashboardCards: DashboardCard[] = [
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
    title: "Incomplete Tasks",
    subtext: "Tasks remaining for today.",
    icon: "XCircle",
    visualization: "critical",
    config: {
      feature: "routine",
      metric: "total_incomplete",
    },
    value: "0",
  },
];

export const incomeSettings: IncomeSettings = {
  status: "Unemployed",
  amount: 0,
  frequency: "monthly",
  currency: "R$",
  benefitsEndDate: undefined,
};

export const timeTrackingEntries: TimeTrackingEntry[] = [];
