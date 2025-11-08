"use client";
import { useRef } from "react";
import {
  incomeSettings as initialIncomeSettings,
  dashboardCards as initialDashboardCards,
} from "@/lib/data";
import { Financials } from "../../../features/finances/financials";
import { FinancialAlerts } from "../../../features/finances/financial-alerts";
import {
  FinancialAccount,
  IncomeSettings,
  DashboardCard,
  FinancialLog,
  Currency,
} from "@/lib/types";
import {
  useFinancialAccounts,
  useIncomeSettings,
  useFinancialLogs,
  useCreateFinancialLog,
} from "@/hooks/use-finances-db";
import { useDashboardCards } from "@/hooks/use-dashboard-db";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Dummy conversion rates. In a real app, you'd fetch these from an API.
const conversionRates: Record<Currency, Record<Currency, number>> = {
  R$: { R$: 1, $: 0.18, "€": 0.17 },
  $: { R$: 5.4, $: 1, "€": 0.92 },
  "€": { R$: 5.85, $: 1.08, "€": 1 },
};

const convertCurrency = (amount: number, from: Currency, to: Currency) => {
  if (from === to) return amount;
  return amount * conversionRates[from][to];
};

const getMonthlyIncome = (
  settings: IncomeSettings,
  oneTimeIncomes: FinancialAccount[]
) => {
  const { amount, frequency, currency } = settings;
  let recurringIncome = 0;
  if (frequency === "monthly") recurringIncome = amount;
  if (frequency === "annually") recurringIncome = amount / 12;
  if (frequency === "hourly") recurringIncome = amount * 40 * 4; // Approximation
  if (frequency === "daily") recurringIncome = amount * 22; // Approximation

  const currentMonthStart = startOfMonth(new Date());
  const oneTimeThisMonth = oneTimeIncomes
    .filter(
      (income) => income.date && new Date(income.date) >= currentMonthStart
    )
    .reduce(
      (sum, item) =>
        sum + convertCurrency(item.amount, item.currency, currency),
      0
    );

  return recurringIncome + oneTimeThisMonth;
};

export default function FinancesPage() {
  const { accounts: financialAccounts, isLoading: loadingAccounts } =
    useFinancialAccounts();
  const { settings: incomeSettings, isLoading: loadingIncome } =
    useIncomeSettings();
  const { cards: dashboardCards, isLoading: loadingCards } =
    useDashboardCards();
  const { logs: financialLogs, isLoading: loadingLogs } = useFinancialLogs();
  const createLog = useCreateFinancialLog();

  const isLoading =
    loadingAccounts || loadingIncome || loadingLogs || loadingCards;

  const debts = financialAccounts.filter(
    (acc: FinancialAccount) => acc.type === "debt"
  );
  const expenses = financialAccounts.filter(
    (acc: FinancialAccount) => acc.type === "expense"
  );
  const oneTimeIncomes = financialAccounts.filter(
    (acc: FinancialAccount) => acc.type === "income"
  );

  // CRITICAL FIX: Monthly log creation and update must be idempotent
  const lastProcessedRef = useRef<string>("");

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentMonth = format(new Date(), "yyyy-MM");

    const totalIncome = getMonthlyIncome(incomeSettings, oneTimeIncomes);

    const totalExpenses = expenses.reduce(
      (sum: number, item: FinancialAccount) =>
        sum +
        convertCurrency(item.amount, item.currency, incomeSettings.currency),
      0
    );

    const totalDebt = debts.reduce(
      (sum: number, item: FinancialAccount) =>
        sum +
        convertCurrency(item.amount, item.currency, incomeSettings.currency),
      0
    );

    const net = totalIncome + totalExpenses; // expenses are negative

    const newLog: FinancialLog = {
      date: format(new Date(), "yyyy-MM-dd"),
      totalIncome,
      totalExpenses: Math.abs(totalExpenses),
      totalDebt: Math.abs(totalDebt),
      net,
      currency: incomeSettings.currency,
    };

    const logSnapshot = JSON.stringify(newLog);

    // Skip if data hasn't changed
    if (lastProcessedRef.current === logSnapshot) {
      return;
    }

    // Check if log exists for current month
    const existingLog = financialLogs.find(
      (log: FinancialLog) =>
        format(parseISO(log.date), "yyyy-MM") === currentMonth
    );

    if (!existingLog) {
      // No log for this month, create it
      lastProcessedRef.current = logSnapshot;
      createLog.mutate(newLog);
    } else {
      // Update existing log if data changed
      const existingSnapshot = JSON.stringify(existingLog);
      if (existingSnapshot !== logSnapshot) {
        lastProcessedRef.current = logSnapshot;
        createLog.mutate(newLog);
      } else {
        lastProcessedRef.current = logSnapshot;
      }
    }
  }, [
    isLoading,
    financialAccounts,
    incomeSettings,
    debts,
    expenses,
    oneTimeIncomes,
    financialLogs,
    createLog,
  ]);

  // Note: Financials component uses database hooks directly now
  // No need for handleDataUpdate callback

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-10 w-48" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            Financial Overview
          </h1>
          <p className="text-muted-foreground">
            A brutally honest look at your finances. Manage debts, expenses, and
            get AI-powered reality checks.
          </p>
        </div>
        {/* History view removed in favor of centralized /feedback */}
      </div>
      <FinancialAlerts
        incomeSettings={incomeSettings}
        financialAccounts={financialAccounts}
      />
      <Financials
        incomeSettings={incomeSettings}
        financialAccounts={financialAccounts}
      />
    </div>
  );
}
