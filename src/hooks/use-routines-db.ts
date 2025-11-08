/**
 * Database-backed hooks for Routines feature
 *
 * Replaces localStorage implementation with tRPC queries
 * Handles both RoutineItem (templates) and Checkmark (daily completions)
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type {
  RoutineItem,
  Checkmark,
  RoutineCategory,
  Frequency,
  RoutineReflection,
} from "@/lib/types";

interface RawCheckmark {
  id: string;
  routineId: string;
  dateISO: string;
  done: boolean;
  // From DB this may be JSON; keep broad here and narrow when mapping
  reflection?: unknown | null;
}

interface RawRoutine {
  id: string;
  category: RoutineCategory;
  title: string;
  frequency: Frequency;
  active: boolean;
  order?: number | null;
  routineType?: RoutineItem["routineType"];
  requiresReflection?: boolean | null;
  checkmarks?: RawCheckmark[] | null;
}

/**
 * Fetch all routine items for the user
 */
export function useRoutines() {
  const query = trpc.routine.getAll.useQuery();

  const asRoutineReflection = (val: unknown): RoutineReflection | undefined => {
    if (!val || typeof val !== "object") return undefined;
    const obj = val as Record<string, unknown>;
    const routineId =
      typeof obj.routineId === "string" ? obj.routineId : undefined;
    const completedAt =
      typeof obj.completedAt === "string" ? obj.completedAt : undefined;
    const questions = obj.questions;
    if (
      routineId &&
      completedAt &&
      questions &&
      typeof questions === "object" &&
      !Array.isArray(questions)
    ) {
      // Convert values to strings defensively
      const qEntries = Object.entries(questions as Record<string, unknown>).map(
        ([k, v]) => [k, v == null ? "" : String(v)] as const
      );
      return {
        routineId,
        completedAt,
        questions: Object.fromEntries(qEntries),
      };
    }
    return undefined;
  };

  return {
    routines: (query.data ?? []).map((r) => {
      const rr = r as RawRoutine & Record<string, unknown>;
      return {
        id: rr.id,
        category: rr.category,
        title: rr.title,
        frequency: rr.frequency,
        active: rr.active,
        order: rr.order ?? undefined,
        routineType: rr.routineType,
        requiresReflection: rr.requiresReflection ?? false,
        checkmarks: (rr.checkmarks ?? []).map((c) => ({
          id: c.id,
          routineId: c.routineId,
          dateISO: c.dateISO,
          done: c.done,
          reflection: asRoutineReflection(c.reflection) ?? undefined,
        })),
      } as RoutineItem & {
        checkmarks?: (Checkmark & { reflection?: RoutineReflection })[];
      };
    }),
    isLoading: query.isLoading,
  };
}
/**
 * Fetch today's checkmarks for all routines
 */
export function useTodayCheckmarks() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const query = trpc.routine.getCheckmarks.useQuery({ dateISO: today });

  const asRoutineReflection = (val: unknown): RoutineReflection | undefined => {
    if (!val || typeof val !== "object") return undefined;
    const obj = val as Record<string, unknown>;
    const routineId =
      typeof obj.routineId === "string" ? obj.routineId : undefined;
    const completedAt =
      typeof obj.completedAt === "string" ? obj.completedAt : undefined;
    const questions = obj.questions;
    if (
      routineId &&
      completedAt &&
      questions &&
      typeof questions === "object" &&
      !Array.isArray(questions)
    ) {
      const qEntries = Object.entries(questions as Record<string, unknown>).map(
        ([k, v]) => [k, v == null ? "" : String(v)] as const
      );
      return {
        routineId,
        completedAt,
        questions: Object.fromEntries(qEntries),
      };
    }
    return undefined;
  };

  return {
    checkmarks: (query.data ?? []).map((c) => ({
      id: (c as RawCheckmark).id,
      routineId: (c as RawCheckmark).routineId,
      dateISO: (c as RawCheckmark).dateISO,
      done: (c as RawCheckmark).done,
      reflection:
        asRoutineReflection((c as RawCheckmark).reflection) ?? undefined,
    })),
    isLoading: query.isLoading,
  };
}

/**
 * Create a new routine
 */
export function useCreateRoutine() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.routine.create.useMutation({
    onSuccess: (data) => {
      utils.routine.getAll.invalidate();
      toast({
        title: "Routine created",
        description: `"${data.title}" was added to your routines.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create routine",
        description: error.message,
      });
    },
  });
}

/**
 * Update an existing routine
 */
export function useUpdateRoutine() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.routine.update.useMutation({
    onSuccess: (data) => {
      utils.routine.getAll.invalidate();
      toast({
        title: "Routine updated",
        description: `"${data.title}" was successfully updated.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update routine",
        description: error.message,
      });
    },
  });
}

/**
 * Delete a routine
 */
export function useDeleteRoutine() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.routine.delete.useMutation({
    onSuccess: (_, variables) => {
      utils.routine.getAll.invalidate();
      // Note: We don't have the routine title in the response, so we use a generic message
      toast({
        title: "Routine deleted",
        description: "Routine was removed.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete routine",
        description: error.message,
      });
    },
  });
}

/**
 * Toggle a checkmark (mark/unmark routine completion)
 * Supports optional reflection data
 */
export function useToggleCheckmark() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.routine.toggleCheckmark.useMutation({
    onSuccess: (data) => {
      // Invalidate checkmarks for the date
      utils.routine.getCheckmarks.invalidate();

      if (data.done) {
        toast({
          title: "Routine completed! 🎉",
          description: "Great job staying consistent!",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update routine",
        description: error.message,
      });
    },
  });
}

/**
 * Combined hook that provides both routines and today's checkmarks
 * This is a convenience hook that mirrors the old localStorage pattern
 */
export function useRoutinesWithChecks() {
  const { routines, isLoading: routinesLoading } = useRoutines();
  const { checkmarks, isLoading: checkmarksLoading } = useTodayCheckmarks();
  const toggleCheckmark = useToggleCheckmark();
  const createRoutine = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();
  const deleteRoutine = useDeleteRoutine();

  /**
   * Toggle a checkmark with optional reflection
   */
  const toggleCheck = async (
    routineId: string,
    checked: boolean,
    reflection?: RoutineReflection
  ) => {
    const today = new Date().toISOString().split("T")[0];
    await toggleCheckmark.mutateAsync({
      routineId,
      dateISO: today,
      done: checked,
      reflection,
    });
  };

  /**
   * Create or update a routine (convenience method)
   */
  const setRoutines = async (
    updatedRoutines: RoutineItem[] | ((prev: RoutineItem[]) => RoutineItem[])
  ) => {
    // This method is for compatibility with the old API
    // In practice, components should use the individual mutation hooks
    const newRoutines =
      typeof updatedRoutines === "function"
        ? updatedRoutines(routines)
        : updatedRoutines;

    // Determine what changed
    const added = newRoutines.filter(
      (r) => !routines.find((old) => old.id === r.id)
    );
    const removed = routines.filter(
      (r) => !newRoutines.find((updated) => updated.id === r.id)
    );
    const updated = newRoutines.filter((r) => {
      const old = routines.find((old) => old.id === r.id);
      return old && JSON.stringify(old) !== JSON.stringify(r);
    });

    // Execute mutations
    for (const routine of added) {
      await createRoutine.mutateAsync({
        title: routine.title,
        category: routine.category,
        frequency: routine.frequency,
        routineType: routine.routineType,
        requiresReflection: routine.requiresReflection ?? false,
        active: routine.active ?? true,
        order: routine.order ?? 0,
      });
    }

    for (const routine of updated) {
      await updateRoutine.mutateAsync({
        id: routine.id,
        title: routine.title,
        category: routine.category,
        frequency: routine.frequency,
        routineType: routine.routineType,
        requiresReflection: routine.requiresReflection ?? false,
        active: routine.active ?? true,
        order: routine.order ?? 0,
      });
    }

    for (const routine of removed) {
      await deleteRoutine.mutateAsync({ id: routine.id });
    }
  };

  return {
    routines,
    checkmarks,
    isLoading: routinesLoading || checkmarksLoading,
    toggleCheck,
    setRoutines,
    // Expose individual mutations for more granular control
    createRoutine,
    updateRoutine,
    deleteRoutine,
    toggleCheckmark,
  };
}
