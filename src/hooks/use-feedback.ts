import { trpc } from "@/lib/trpc";

export type FeedbackFilters = {
  startDate?: string;
  endDate?: string;
  types?: (
    | "application"
    | "goal"
    | "task"
    | "pomodoro"
    | "timeTracking"
    | "finance"
    | "journal"
  )[];
};

export function useFeedbackRecords(filters: FeedbackFilters) {
  return trpc.feedback.getRecords.useQuery(filters, { keepPreviousData: true });
}

export function useGenerateFeedback() {
  return trpc.feedback.generate.useMutation();
}
