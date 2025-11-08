import { z } from "zod";

// Achievement Condition Schema
export const AchievementConditionSchema = z.object({
  type: z.enum([
    "routine-streak",
    "task-completed",
    "pomodoro-sessions",
    "applications-sent",
    "financial-goal",
    "custom",
  ]),
  target: z.number().nonnegative(),
  current: z.number().nonnegative().optional(),
});

// Reward Condition Schema
export const RewardConditionSchema = z.object({
  type: z.enum([
    "routine-completion",
    "task-completion",
    "pomodoro-sessions",
    "study-concepts",
    "custom",
  ]),
  description: z.string(),
  target: z.number().nonnegative(),
  routineId: z.string().optional(),
  taskTag: z.string().optional(),
  isMet: z.boolean(),
  progress: z.number().min(0),
});

// Dashboard Card Config Schema
export const DashboardCardConfigSchema = z.object({
  feature: z.enum(["applications", "routine", "finances", "time", "goals"]),
  metric: z.string(),
  applicationStatus: z
    .enum(["Applied", "Interviewing", "Offer", "Rejected", "Wishlist"])
    .optional(),
  goalStatus: z.enum(["Not Started", "In Progress", "Achieved"]).optional(),
  goalTimeframe: z.enum(["Short-Term", "Mid-Term", "Long-Term"]).optional(),
  specialCard: z.enum(["benefits-countdown"]).optional(),
});

// Daily Logs Schemas
export const DailyApplicationLogSchema = z.object({
  status: z.enum(["Applied", "Interviewing", "Offer", "Rejected", "Wishlist"]),
  count: z.number().nonnegative(),
});

export const DailyGoalLogSchema = z.object({
  status: z.enum(["Not Started", "In Progress", "Achieved"]),
  count: z.number().nonnegative(),
});

export const DailyTaskLogSchema = z.object({
  status: z.enum(["todo", "in-progress", "done", "cancelled"]),
  count: z.number().nonnegative(),
});

export const DailyLogSchema = z.object({
  date: z.string(),
  applications: z.array(DailyApplicationLogSchema),
  goals: z.array(DailyGoalLogSchema),
  tasks: z.array(DailyTaskLogSchema),
});

// App Settings Schema
export const AppTimeTrackingSettingsSchema = z.object({
  gameHours: z.number().min(0),
});

// Routine Reflection Schema
export const RoutineReflectionSchema = z.object({
  routineId: z.string(),
  completedAt: z.string(), // ISO timestamp
  questions: z.record(z.string()),
});

// Roadmap Node Schema (recursive JSON tree stored in DB)
export type RoadmapNodeJson = {
  id?: string;
  name: string;
  status: "done" | "in_progress" | "todo" | "skipped" | "parallel";
  children?: RoadmapNodeJson[];
};
export const RoadmapNodeJsonSchema: z.ZodType<RoadmapNodeJson> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    name: z.string(),
    status: z.enum(["done", "in_progress", "todo", "skipped", "parallel"]),
    children: z.array(RoadmapNodeJsonSchema).optional(),
  })
);
