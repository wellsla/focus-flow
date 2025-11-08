/**
 * Database-backed hooks for Applications feature
 *
 * Handles job applications with full CRUD operations
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type {
  JobApplication,
  ApplicationStatus,
  ApplicationComment,
  DeepApplicationWorkflow,
} from "@/lib/types";

/**
 * Fetch all job applications for the user
 */
export function useApplications() {
  const query = trpc.application.getAll.useQuery();

  return {
    applications: (query.data ?? []).map((raw): JobApplication => {
      const app = raw as {
        id: string;
        company: string;
        role: string;
        dateApplied: Date | string | null | undefined;
        status: ApplicationStatus;
        url: string;
        priority: JobApplication["priority"];
        description?: string | null;
        comments?: unknown;
        deepWorkflow?: unknown;
        applicationDepthScore?: number | null;
      };

      const comments: ApplicationComment[] = Array.isArray(app.comments)
        ? (app.comments as ApplicationComment[])
        : [];

      const deepWorkflow = app.deepWorkflow as
        | DeepApplicationWorkflow
        | undefined;

      return {
        id: app.id,
        company: app.company,
        role: app.role,
        dateApplied: app.dateApplied
          ? typeof app.dateApplied === "string"
            ? app.dateApplied
            : app.dateApplied.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: app.status,
        url: app.url,
        priority: app.priority,
        description: app.description ?? undefined,
        comments,
        deepWorkflow,
        applicationDepthScore: app.applicationDepthScore ?? undefined,
      };
    }),
    isLoading: query.isLoading,
  };
}

/**
 * Create a new job application
 */
export function useCreateApplication() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.application.create.useMutation({
    onSuccess: (data) => {
      utils.application.getAll.invalidate();
      toast({
        title: "Application created",
        description: `Application to ${data.company} was added.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create application",
        description: error.message,
      });
    },
  });
}

/**
 * Update an existing job application
 */
export function useUpdateApplication() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.application.update.useMutation({
    onSuccess: (data) => {
      utils.application.getAll.invalidate();
      toast({
        title: "Application updated",
        description: `Application to ${data.company} was updated.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update application",
        description: error.message,
      });
    },
  });
}

/**
 * Delete a job application
 */
export function useDeleteApplication() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.application.delete.useMutation({
    onSuccess: () => {
      utils.application.getAll.invalidate();
      toast({
        title: "Application deleted",
        description: "Application was removed.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete application",
        description: error.message,
      });
    },
  });
}
