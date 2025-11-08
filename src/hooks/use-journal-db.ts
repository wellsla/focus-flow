/**
 * use-journal-db.ts
 *
 * Database hooks for Journal entries
 * Manages daily reflections with mood tracking
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type { JournalEntry } from "@/lib/types";

/**
 * Query hook: Fetch all journal entries for current user
 */
export function useJournalEntries() {
  const { data, isLoading, error } = trpc.journal.getAll.useQuery();

  // Convert database entries to JournalEntry type
  const entries: JournalEntry[] =
    data?.map((entry) => ({
      id: entry.id,
      dateISO: entry.dateISO,
      mood: entry.mood as "low" | "ok" | "high" | undefined,
      lines: entry.lines as [string, string, string],
      tags: (entry.tags as string[]) || undefined,
    })) || [];

  return { entries, isLoading, error };
}

/**
 * Mutation hook: Upsert journal entry (create or update)
 * Journal uses upsert since there is only one entry per day
 */
export function useUpsertJournalEntry() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.journal.upsert.useMutation({
    onSuccess: () => {
      utils.journal.getAll.invalidate();
    },
    onError: (error) => {
      console.error("Failed to save journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Mutation hook: Delete journal entry
 */
export function useDeleteJournalEntry() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.journal.delete.useMutation({
    onSuccess: () => {
      utils.journal.getAll.invalidate();
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      console.error("Failed to delete journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });
}
