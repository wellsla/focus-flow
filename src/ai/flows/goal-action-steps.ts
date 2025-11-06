/**
 * Genkit Flow: Generate Action Steps for Goals/Anti-Goals
 * Generates personalized micro-actions to help achieve goals or stop bad habits
 */

import { z } from "zod";
import { ai } from "../genkit";

const GoalActionStepsInputSchema = z.object({
  goalType: z.enum(["Goal", "Anti-Goal"]),
  title: z.string(),
  description: z.string(),
  timeframe: z.enum(["Short-Term", "Mid-Term", "Long-Term"]),
  userProfile: z
    .object({
      name: z.string().optional(),
      currentSituation: z.string().optional(),
      challenges: z.string().optional(),
    })
    .optional(),
});

const GoalActionStepsOutputSchema = z.object({
  actionSteps: z
    .array(z.string())
    .describe("List of 4-6 specific, actionable micro-steps"),
  reasoning: z
    .string()
    .describe("Brief explanation of the strategy behind these steps"),
});

export const generateGoalActionSteps = ai.defineFlow(
  {
    name: "generateGoalActionSteps",
    inputSchema: GoalActionStepsInputSchema,
    outputSchema: GoalActionStepsOutputSchema,
  },
  async (input) => {
    const { goalType, title, description, timeframe, userProfile } = input;

    const isAntiGoal = goalType === "Anti-Goal";
    const timeframeContext = {
      "Short-Term": "within the next 1-3 months",
      "Mid-Term": "within the next 3-12 months",
      "Long-Term": "within the next 1-3 years",
    }[timeframe];

    const userContext = userProfile
      ? `
User Context:
- Name: ${userProfile.name || "Not provided"}
- Current Situation: ${
          userProfile.currentSituation || "Job seeker transitioning careers"
        }
- Challenges: ${
          userProfile.challenges || "ADHD, maintaining focus and consistency"
        }
`
      : "";

    const prompt = isAntiGoal
      ? `You are a behavioral change expert helping someone with ADHD stop a negative behavior or habit.

${userContext}

**Anti-Goal**: ${title}
**Description**: ${description}
**Timeframe**: ${timeframeContext}

Generate 4-6 specific, ADHD-friendly micro-steps to help them STOP this behavior. Focus on:
1. **Replacement strategies** - What to do INSTEAD
2. **Friction creation** - Making the bad habit harder to do
3. **Awareness triggers** - Recognizing when they're about to do it
4. **Support systems** - Accountability and reminders
5. **Small wins** - Incremental reduction, not cold turkey

Make each step:
- Concrete and specific (not vague)
- Easy to start (low barrier to entry)
- Measurable (can track progress)
- ADHD-friendly (simple, clear, immediate)

Provide reasoning for your strategy.`
      : `You are a goal achievement expert helping someone with ADHD reach a positive goal.

${userContext}

**Goal**: ${title}
**Description**: ${description}
**Timeframe**: ${timeframeContext}

Generate 4-6 specific, ADHD-friendly micro-steps to help them ACHIEVE this goal. Focus on:
1. **Breaking it down** - Smallest possible first steps
2. **Building momentum** - Quick wins that build confidence
3. **Consistency** - Habits that can be sustained
4. **Accountability** - Ways to track and celebrate progress
5. **Removing friction** - Making it easy to take action

Make each step:
- Concrete and specific (not vague)
- Easy to start (low barrier to entry)
- Measurable (can track progress)
- ADHD-friendly (simple, clear, immediate)

Provide reasoning for your strategy.`;

    const result = await ai.generate({
      model: "googleai/gemini-2.0-flash-exp",
      prompt,
      output: {
        schema: GoalActionStepsOutputSchema,
      },
    });

    if (!result.output) {
      // Fallback if AI fails
      return {
        actionSteps: [
          "Break down the goal into smaller, manageable tasks",
          "Set a specific daily or weekly schedule to work on it",
          "Track your progress in a visible way (journal, app, calendar)",
          "Share your goal with someone for accountability",
          "Celebrate small wins along the way",
        ],
        reasoning:
          "These are general best practices for achieving goals with ADHD-friendly strategies.",
      };
    }

    return result.output;
  }
);
