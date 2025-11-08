/**
 * Main tRPC App Router
 * Combines all feature routers
 */

import { router } from "../trpc";
import { taskRouter } from "./task";
import { routineRouter } from "./routine";
import { applicationRouter } from "./application";
import { financeRouter } from "./finance";
import { goalRouter } from "./goal";
import { pomodoroRouter, timeTrackingRouter, journalRouter } from "./activity";
import {
  achievementRouter,
  rewardRouter,
  rewardStateRouter,
  roadmapRouter,
} from "./gamification";
import { dashboardRouter, settingsRouter } from "./dashboard";
import { feedbackRouter } from "./feedback";

export const appRouter = router({
  task: taskRouter,
  routine: routineRouter,
  application: applicationRouter,
  finance: financeRouter,
  goal: goalRouter,
  pomodoro: pomodoroRouter,
  timeTracking: timeTrackingRouter,
  journal: journalRouter,
  achievement: achievementRouter,
  reward: rewardRouter,
  rewardState: rewardStateRouter,
  roadmap: roadmapRouter,
  dashboard: dashboardRouter,
  settings: settingsRouter,
  feedback: feedbackRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
