/**
 * Database-backed hooks for Dashboard feature
 *
 * Handles dashboard cards with full CRUD operations
 */

import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import type { DashboardCard } from "@/lib/types";

// We relax the raw type to what the API returns; value is computed client-side

/**
 * Fetch all dashboard cards for the user
 */
export function useDashboardCards() {
  const query = trpc.dashboard.cards.getAll.useQuery();

  return {
    cards: (query.data ?? []).map((c): DashboardCard => {
      const card = c as Record<string, unknown>;
      const viz = card.visualization;
      const visualization =
        viz === "warning" || viz === "critical" || viz === "default"
          ? (viz as import("@/lib/types").DashboardCardVisualStyle)
          : "default";
      return {
        id: String(card.id),
        title: typeof card.title === "string" ? card.title : "",
        subtext: typeof card.subtext === "string" ? card.subtext : "",
        icon: typeof card.icon === "string" ? card.icon : "layout",
        visualization,
        config: card.config as import("@/lib/types").DashboardCardConfig,
        // Value is not persisted (or may differ); set empty and let UI compute later
        value: typeof card.value === "string" ? card.value : "",
        details: Array.isArray(card.details)
          ? ((card.details as unknown[])
              .map((d) => {
                if (!d || typeof d !== "object") return undefined;
                const obj = d as Record<string, unknown>;
                return {
                  title: typeof obj.title === "string" ? obj.title : "",
                  label: typeof obj.label === "string" ? obj.label : "",
                  rawValue: obj.rawValue ? String(obj.rawValue) : undefined,
                };
              })
              .filter(Boolean) as {
              title: string;
              label: string;
              rawValue?: string;
            }[])
          : undefined,
      };
    }),
    isLoading: query.isLoading,
  };
}

/**
 * Create a new dashboard card
 */
export function useCreateDashboardCard() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.dashboard.cards.create.useMutation({
    onSuccess: () => {
      utils.dashboard.cards.getAll.invalidate();
      toast({
        title: "Card created",
        description: "Dashboard card was added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create card",
        description: error.message,
      });
    },
  });
}

/**
 * Update an existing dashboard card
 */
export function useUpdateDashboardCard() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.dashboard.cards.update.useMutation({
    onSuccess: () => {
      utils.dashboard.cards.getAll.invalidate();
      toast({
        title: "Card updated",
        description: "Dashboard card was updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update card",
        description: error.message,
      });
    },
  });
}

/**
 * Delete a dashboard card
 */
export function useDeleteDashboardCard() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.dashboard.cards.delete.useMutation({
    onSuccess: () => {
      utils.dashboard.cards.getAll.invalidate();
      toast({
        title: "Card deleted",
        description: "Dashboard card was removed.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete card",
        description: error.message,
      });
    },
  });
}

/**
 * Reorder dashboard cards
 */
export function useReorderDashboardCards() {
  const utils = trpc.useUtils();

  return trpc.dashboard.cards.reorder.useMutation({
    onSuccess: () => {
      utils.dashboard.cards.getAll.invalidate();
    },
    onError: (error) => {
      console.error("Failed to reorder cards:", error);
    },
  });
}
