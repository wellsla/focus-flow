/**
 * Database-backed hooks for Goals feature
 *
 * Handles personal goals with full CRUD operations
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type { Goal, GoalStatus, GoalTimeframe, GoalType } from "@/lib/types";

// We will not constrain DB shape here; we will narrow safely in mapping

/**
 * Fetch all goals for the user
 */
export function useGoals() {
  const query = trpc.goal.getAll.useQuery();

  const asStatus = (v: unknown): GoalStatus => {
    const allowed: GoalStatus[] = ["Not Started", "In Progress", "Achieved"];
    return typeof v === "string" && (allowed as string[]).includes(v)
      ? (v as GoalStatus)
      : "Not Started";
  };
  const asTimeframe = (v: unknown): GoalTimeframe => {
    const allowed: GoalTimeframe[] = ["Short-Term", "Mid-Term", "Long-Term"];
    return typeof v === "string" && (allowed as string[]).includes(v)
      ? (v as GoalTimeframe)
      : "Short-Term";
  };
  const asGoalType = (v: unknown): GoalType =>
    v === "Goal" || v === "Anti-Goal" ? v : "Goal";
  const dateToYMD = (v: unknown): string | undefined => {
    if (!v) return undefined;
    const d = v instanceof Date ? v : new Date(String(v));
    return isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
  };

  return {
    goals: (query.data ?? []).map((g): Goal => {
      const goal = g as Record<string, unknown>;
      return {
        id: String(goal.id),
        title: typeof goal.title === "string" ? goal.title : "",
        description:
          typeof goal.description === "string" ? goal.description : "",
        status: asStatus(goal.status),
        timeframe: asTimeframe(goal.timeframe),
        goalType: asGoalType(goal.goalType),
        targetDate: dateToYMD(goal.deadline),
        actionSteps: Array.isArray(goal.milestones)
          ? (goal.milestones as unknown[]).map((s) => String(s))
          : [],
      };
    }),
    isLoading: query.isLoading,
  };
}

/**
 * Create a new goal
 */
export function useCreateGoal() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.goal.create.useMutation({
    onSuccess: (data) => {
      utils.goal.getAll.invalidate();
      toast({
        title: "Goal created",
        description: `"${data.title}" was added to your goals.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create goal",
        description: error.message,
      });
    },
  });
}

/**
 * Update an existing goal
 */
export function useUpdateGoal() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.goal.update.useMutation({
    onSuccess: (data) => {
      utils.goal.getAll.invalidate();
      toast({
        title: "Goal updated",
        description: `"${data.title}" was updated.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update goal",
        description: error.message,
      });
    },
  });
}

/**
 * Delete a goal
 */
export function useDeleteGoal() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.goal.delete.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate();
      toast({
        title: "Goal deleted",
        description: "Goal was removed.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete goal",
        description: error.message,
      });
    },
  });
}
