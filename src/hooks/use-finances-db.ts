/**
 * Database-backed Finance Hooks
 *
 * Provides React Query hooks for financial accounts, logs, and income settings
 * using tRPC for type-safe API communication.
 */

"use client";

import { trpc } from "@/lib/trpc";
import { useToast } from "./use-toast";
import type {
  FinancialAccount,
  IncomeSettings,
  FinancialLog,
} from "@/lib/types";

/**
 * Fetch all financial accounts for the current user
 */
export function useFinancialAccounts() {
  const query = trpc.finance.accounts.getAll.useQuery();

  return {
    accounts: (query.data ?? []).map((account) => ({
      ...account,
      date: account.date?.toISOString(),
      lastPaid: account.lastPaid?.toISOString(),
    })) as FinancialAccount[],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Create a new financial account
 */
export function useCreateFinancialAccount() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.finance.accounts.create.useMutation({
    onSuccess: () => {
      utils.finance.accounts.getAll.invalidate();
      toast({
        title: "Account created",
        description: "Financial account added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create account",
        description: error.message,
      });
    },
  });
}

/**
 * Update an existing financial account
 */
export function useUpdateFinancialAccount() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.finance.accounts.update.useMutation({
    onSuccess: () => {
      utils.finance.accounts.getAll.invalidate();
      toast({
        title: "Account updated",
        description: "Financial account updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update account",
        description: error.message,
      });
    },
  });
}

/**
 * Delete a financial account
 */
export function useDeleteFinancialAccount() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.finance.accounts.delete.useMutation({
    onSuccess: () => {
      utils.finance.accounts.getAll.invalidate();
      toast({
        title: "Account deleted",
        description: "Financial account removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete account",
        description: error.message,
      });
    },
  });
}

/**
 * Fetch all financial logs for the current user
 */
export function useFinancialLogs() {
  const query = trpc.finance.logs.getAll.useQuery();

  return {
    logs: (query.data ?? []).map((log) => ({
      ...log,
      date: log.date.toISOString(),
    })) as FinancialLog[],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Create a new financial log entry
 */
export function useCreateFinancialLog() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.finance.logs.create.useMutation({
    onSuccess: () => {
      utils.finance.logs.getAll.invalidate();
      toast({
        title: "Log saved",
        description: "Financial snapshot saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to save log",
        description: error.message,
      });
    },
  });
}

/**
 * Fetch income settings for the current user
 */
export function useIncomeSettings() {
  const query = trpc.finance.incomeSettings.get.useQuery();

  // Default settings if none exist
  const defaultSettings: IncomeSettings = {
    status: "Unemployed",
    amount: 0,
    frequency: "monthly",
    currency: "R$",
  };

  return {
    settings: query.data
      ? ({
          ...query.data,
          benefitsEndDate: query.data.benefitsEndDate?.toISOString(),
        } as IncomeSettings)
      : defaultSettings,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Upsert income settings (create or update)
 */
export function useUpsertIncomeSettings() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  return trpc.finance.incomeSettings.upsert.useMutation({
    onSuccess: () => {
      utils.finance.incomeSettings.get.invalidate();
      toast({
        title: "Settings saved",
        description: "Income settings updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: error.message,
      });
    },
  });
}
