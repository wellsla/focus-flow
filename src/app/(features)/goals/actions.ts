"use server";

import { generateGoalActionSteps } from "@/ai/flows/goal-action-steps";
import { GoalType, GoalTimeframe } from "@/lib/types";

export interface GenerateActionStepsInput {
  goalType: GoalType;
  title: string;
  description: string;
  timeframe: GoalTimeframe;
  userProfile?: {
    name?: string;
    currentSituation?: string;
    challenges?: string;
  };
}

export async function fetchGoalActionSteps(input: GenerateActionStepsInput) {
  try {
    const result = await generateGoalActionSteps(input);
    return {
      success: true,
      actionSteps: result.actionSteps,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error("Error generating goal action steps:", error);
    return {
      success: false,
      error: "Failed to generate action steps. AI might be taking a break.",
      actionSteps: [
        "Break down the goal into smaller, manageable tasks",
        "Set a specific daily or weekly schedule to work on it",
        "Track your progress in a visible way",
        "Share your goal with someone for accountability",
        "Celebrate small wins along the way",
      ],
    };
  }
}
