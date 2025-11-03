
import { JobApplication, FinancialAccount, Task, UserProfile, AppSettings, DashboardCard, IncomeSettings, TimeTrackingEntry, Goal, RoadmapNode, DailyLog } from './types';

export const userProfile: UserProfile = {
  name: 'John Doe',
  title: 'Aspiring Full Stack Developer',
  experience: [
    "Software Engineer at TechCorp (2020-2022)",
    "Intern at Web Solutions (2019)"
  ],
  education: 'B.S. in Computer Science - State University',
};

export const appSettings: AppSettings = {
  timeTracking: {
    gameHours: 0,
  },
};

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Wake up',
    status: 'todo',
    period: 'morning',
    startTime: '07:00',
    endTime: '07:05',
    priority: 'medium',
  },
  {
    id: 'task-2',
    title: 'Take coffee',
    status: 'todo',
    period: 'morning',
    startTime: '07:05',
    endTime: '07:20',
    priority: 'low',
  },
   {
    id: 'task-3',
    title: 'Prepare for studying',
    status: 'todo',
    period: 'morning',
    startTime: '07:20',
    endTime: '08:00',
    priority: 'medium',
  },
  {
    id: 'task-4',
    title: 'Study programming concepts/coding',
    status: 'todo',
    period: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    priority: 'high',
  },
  {
    id: 'task-5',
    title: 'Take lunch',
    status: 'todo',
    period: 'afternoon',
    startTime: '12:00',
    endTime: '13:00',
    priority: 'medium',
  },
  {
    id: 'task-6',
    title: 'Give a car ride for my girlfriend',
    status: 'todo',
    period: 'afternoon',
    startTime: '13:00',
    endTime: '13:24',
    priority: 'high',
  },
  {
    id: 'task-7',
    title: 'Coding',
    status: 'todo',
    period: 'afternoon',
    startTime: '13:24',
    endTime: '16:30',
    priority: 'high',
  },
   {
    id: 'task-8',
    title: 'Manage job applications and networking',
    status: 'todo',
    period: 'afternoon',
    startTime: '16:30',
    endTime: '18:20',
    priority: 'high',
  },
   {
    id: 'task-9',
    title: '1-hour walk',
    status: 'todo',
    period: 'evening',
    startTime: '18:20',
    endTime: '19:20',
    priority: 'medium',
  },
  {
    id: 'task-10',
    title: 'Manage finances and study investments',
    status: 'todo',
    period: 'evening',
    startTime: '19:20',
    endTime: '21:00',
    priority: 'medium',
  },
  {
    id: 'task-11',
    title: 'Free time',
    status: 'todo',
    period: 'evening',
    startTime: '21:00',
    endTime: '22:10',
    priority: 'low',
  },
  {
    id: 'task-12',
    title: 'Read at least 10 book pages',
    status: 'todo',
    period: 'evening',
    startTime: '22:10',
    endTime: '22:40',
    priority: 'medium',
  },
  {
    id: 'task-13',
    title: 'Sleep',
    status: 'todo',
    period: 'evening',
    startTime: '22:40',
    endTime: '07:00',
    priority: 'high',
  }
];

export const goals: Goal[] = [];
export const dailyLogs: DailyLog[] = [];
export const jobApplications: JobApplication[] = [];


export const roadmap: RoadmapNode = {
    id: 'root',
    name: 'First Trial',
    status: 'in_progress',
    children: [
      {
        id: 'backend',
        name: 'Backend',
        status: 'todo',
        children: [
          { id: 'nodejs', name: 'Node.js', status: 'todo', children: [] },
          { id: 'python', name: 'Python', status: 'todo', children: [] },
        ]
      },
      {
        id: 'frontend',
        name: 'Frontend',
        status: 'in_progress',
        children: [
          {
            id: 'react',
            name: 'React.js',
            status: 'in_progress',
            children: [
              { id: 'router', name: 'Router', status: 'todo', children: [] },
              { id: 'hooks', name: 'Hooks', status: 'done', children: [] },
            ]
          },
          {
            id: 'architecture',
            name: 'Architecture',
            status: 'todo',
            children: [
              { id: 'clean-code', name: 'Clean Code', status: 'todo', children: [] },
              { id: 'solid', name: 'SOLID', status: 'todo', children: [] },
            ]
          }
        ]
      }
    ]
};

export const dashboardCards: DashboardCard[] = [
  {
    id: '1',
    title: 'Applications Sent',
    subtext: 'Total applications you have sent.',
    icon: 'Briefcase',
    visualization: 'default',
    config: {
      feature: 'applications',
      metric: 'total',
    },
    value: '0',
  },
  {
    id: '2',
    title: 'Interviews',
    subtext: 'Get those offers!',
    icon: 'TrendingUp',
    visualization: 'default',
    config: {
      feature: 'applications',
      metric: 'status',
      applicationStatus: 'Interviewing',
    },
    value: '0',
  },
  {
    id: '3',
    title: 'Time Sink (Gaming)',
    subtext: 'Weekly gaming time.',
    icon: 'ShieldAlert',
    visualization: 'warning',
    config: {
      feature: 'time',
      metric: 'total_gaming',
    },
    value: '0 hours',
  },
    {
      id: '4',
      title: 'Incomplete Tasks',
      subtext: 'Tasks remaining for today.',
      icon: 'XCircle',
      visualization: 'critical',
      config: {
        feature: 'routine',
        metric: 'total_incomplete',
      },
      value: '0',
  }
];

export const incomeSettings: IncomeSettings = {
  status: 'Unemployed',
  amount: 0,
  frequency: 'monthly',
  currency: 'R$',
  benefitsEndDate: undefined,
}

export const timeTrackingEntries: TimeTrackingEntry[] = [];
