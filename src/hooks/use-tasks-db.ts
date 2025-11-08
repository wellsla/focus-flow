/**
 * Tasks tRPC Hooks
 * Type-safe hooks for task operations
 * Replaces useLocalStorage for tasks
 */

import { trpc } from "@/lib/trpc";
import type { Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Get all tasks with real-time updates
 * @example
 *   const { data: tasks, isLoading } = useTasks();
 */
export function useTasks() {
  const { toast } = useToast();

  const query = trpc.task.getAll.useQuery(undefined, {
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao carregar tarefas",
        description: error.message,
      });
    },
  });

  return {
    tasks: (query.data ?? []).map((raw): Task => {
      const t = raw as {
        id: string;
        title: string;
        status: Task["status"];
        priority: Task["priority"];
        description: string | null;
        dueDate: Date | null;
        completedDate: Date | null;
        createdAt: Date;
        tags: string[] | null;
      };
      return {
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        description: t.description ?? undefined,
        dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : undefined,
        completedDate: t.completedDate
          ? t.completedDate.toISOString().split("T")[0]
          : undefined,
        createdAt: t.createdAt.toISOString(),
        tags: t.tags ?? [],
      };
    }),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Create a new task
 * @example
 *   const createTask = useCreateTask();
 *   await createTask.mutateAsync({ title: "New Task", ... });
 */
export function useCreateTask() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.task.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch tasks list
      utils.task.getAll.invalidate();
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar tarefa",
        description: error.message,
      });
    },
  });
}

/**
 * Update an existing task
 * @example
 *   const updateTask = useUpdateTask();
 *   await updateTask.mutateAsync({ id: "123", title: "Updated", ... });
 */
export function useUpdateTask() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.getAll.invalidate();
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar tarefa",
        description: error.message,
      });
    },
  });
}

/**
 * Delete a task
 * @example
 *   const deleteTask = useDeleteTask();
 *   await deleteTask.mutateAsync("task-id");
 */
export function useDeleteTask() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.task.delete.useMutation({
    onSuccess: () => {
      utils.task.getAll.invalidate();
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tarefa",
        description: error.message,
      });
    },
  });
}

/**
 * Bulk delete multiple tasks
 * @example
 *   const bulkDelete = useBulkDeleteTasks();
 *   await bulkDelete.mutateAsync(["id1", "id2", "id3"]);
 */
export function useBulkDeleteTasks() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.task.bulkDelete.useMutation({
    onSuccess: (data) => {
      utils.task.getAll.invalidate();
      toast({
        title: "Tarefas excluídas",
        description: `${data.count} tarefa(s) excluída(s) com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tarefas",
        description: error.message,
      });
    },
  });
}

/**
 * Bulk update task status
 * @example
 *   const bulkUpdate = useBulkUpdateTaskStatus();
 *   await bulkUpdate.mutateAsync({ ids: ["id1", "id2"], status: "completed" });
 */
export function useBulkUpdateTaskStatus() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.task.bulkUpdateStatus.useMutation({
    onSuccess: (data) => {
      utils.task.getAll.invalidate();
      toast({
        title: "Tarefas atualizadas",
        description: `${data.count} tarefa(s) atualizada(s) com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar tarefas",
        description: error.message,
      });
    },
  });
}
