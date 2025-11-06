/**
 * legacy-data.ts
 *
 * Legacy data structure for the old /routine page
 * Uses old Task structure with period, startTime, endTime
 *
 * @deprecated This file is for backwards compatibility with /routine page only.
 * New features should use initial-data.ts
 */

import { Priority, RoadmapNode } from "./types";
import { RoutinePeriod } from "./schedule";

export type LegacyTaskStatus = "todo" | "in-progress" | "done" | "skipped";

export interface LegacyTask {
  id: string;
  title: string;
  status: LegacyTaskStatus;
  period?: RoutinePeriod;
  startTime?: string;
  endTime?: string;
  priority?: Priority;
  dueDate?: Date;
  isGeneral?: boolean;
  isRoadmapTask?: boolean;
}

export const legacyTasks: LegacyTask[] = [
  {
    id: "task-1",
    title: "Wake up",
    status: "todo",
    period: "morning",
    startTime: "07:00",
    endTime: "07:05",
    priority: "medium",
  },
  {
    id: "task-2",
    title: "Take coffee",
    status: "todo",
    period: "morning",
    startTime: "07:05",
    endTime: "07:20",
    priority: "low",
  },
  {
    id: "task-3",
    title: "Prepare for studying",
    status: "todo",
    period: "morning",
    startTime: "07:20",
    endTime: "08:00",
    priority: "medium",
  },
  {
    id: "task-4",
    title: "Study programming concepts/coding",
    status: "todo",
    period: "morning",
    startTime: "08:00",
    endTime: "12:00",
    priority: "high",
  },
  {
    id: "task-5",
    title: "Take lunch",
    status: "todo",
    period: "afternoon",
    startTime: "12:00",
    endTime: "13:00",
    priority: "medium",
  },
  {
    id: "task-6",
    title: "Give a car ride for my girlfriend",
    status: "todo",
    period: "afternoon",
    startTime: "13:00",
    endTime: "13:24",
    priority: "high",
  },
  {
    id: "task-7",
    title: "Coding",
    status: "todo",
    period: "afternoon",
    startTime: "13:24",
    endTime: "16:30",
    priority: "high",
  },
  {
    id: "task-8",
    title: "Manage job applications and networking",
    status: "todo",
    period: "afternoon",
    startTime: "16:30",
    endTime: "18:20",
    priority: "high",
  },
  {
    id: "task-9",
    title: "1-hour walk",
    status: "todo",
    period: "evening",
    startTime: "18:20",
    endTime: "19:20",
    priority: "medium",
  },
  {
    id: "task-10",
    title: "Manage finances and study investments",
    status: "todo",
    period: "evening",
    startTime: "19:20",
    endTime: "21:00",
    priority: "medium",
  },
  {
    id: "task-11",
    title: "Free time",
    status: "todo",
    period: "evening",
    startTime: "21:00",
    endTime: "22:10",
    priority: "low",
  },
  {
    id: "task-12",
    title: "Read at least 10 book pages",
    status: "todo",
    period: "evening",
    startTime: "22:10",
    endTime: "22:40",
    priority: "medium",
  },
  {
    id: "task-13",
    title: "Sleep",
    status: "todo",
    period: "evening",
    startTime: "22:40",
    endTime: "07:00",
    priority: "high",
  },
];

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
