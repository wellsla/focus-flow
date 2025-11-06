"use client";
import { useRef } from "react";
import {
  incomeSettings as initialIncomeSettings,
  dashboardCards as initialDashboardCards,
} from "@/lib/data";
import { Financials } from "../../../features/finances/financials";
import {
  FinancialAccount,
  IncomeSettings,
  DashboardCard,
  FinancialLog,
  Currency,
} from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
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

const FinancialHistoryDialog = ({ logs }: { logs: FinancialLog[] }) => {
  const sortedLogs = [...logs].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" /> View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Monthly Financial History</DialogTitle>
          <DialogDescription>
            A log of your financial snapshots over time.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Income</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead>Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log) => (
              <TableRow key={log.date}>
                <TableCell>{format(parseISO(log.date), "MMM yyyy")}</TableCell>
                <TableCell>
                  {log.currency} {log.totalIncome.toFixed(2)}
                </TableCell>
                <TableCell>
                  {log.currency} {log.totalExpenses.toFixed(2)}
                </TableCell>
                <TableCell
                  className={log.net >= 0 ? "text-green-600" : "text-red-600"}
                >
                  {log.currency} {log.net.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default function FinancesPage() {
  const [financialAccounts, setFinancialAccounts, loadingAccounts] =
    useLocalStorage<FinancialAccount[]>("financialAccounts", []);
  const [incomeSettings, setIncomeSettings, loadingIncome] =
    useLocalStorage<IncomeSettings>("incomeSettings", initialIncomeSettings);
  const [dashboardCards, setDashboardCards] = useLocalStorage<DashboardCard[]>(
    "dashboardCards",
    initialDashboardCards
  );
  const [financialLogs, setFinancialLogs, loadingLogs] = useLocalStorage<
    FinancialLog[]
  >("financialLogs", []);

  const isLoading = loadingAccounts || loadingIncome || loadingLogs;

  const debts = financialAccounts.filter((acc) => acc.type === "debt");
  const expenses = financialAccounts.filter((acc) => acc.type === "expense");
  const oneTimeIncomes = financialAccounts.filter(
    (acc) => acc.type === "income"
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
      (sum, item) =>
        sum +
        convertCurrency(item.amount, item.currency, incomeSettings.currency),
      0
    );

    const totalDebt = debts.reduce(
      (sum, item) =>
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

    setFinancialLogs((prevLogs) => {
      const idx = prevLogs.findIndex(
        (log) => format(parseISO(log.date), "yyyy-MM") === currentMonth
      );

      if (idx === -1) {
        // No log for this month, add it
        lastProcessedRef.current = logSnapshot;
        return [...prevLogs, newLog];
      }

      // Update existing log if data changed
      const existing = prevLogs[idx];
      const existingSnapshot = JSON.stringify(existing);

      if (existingSnapshot !== logSnapshot) {
        const copy = [...prevLogs];
        copy[idx] = newLog;
        lastProcessedRef.current = logSnapshot;
        return copy;
      }

      lastProcessedRef.current = logSnapshot;
      return prevLogs;
    });
  }, [
    isLoading,
    financialAccounts,
    incomeSettings,
    debts,
    expenses,
    oneTimeIncomes,
    setFinancialLogs,
  ]);

  const handleDataUpdate = (
    updatedAccounts: FinancialAccount[],
    newIncomeSettings?: IncomeSettings
  ) => {
    setFinancialAccounts(updatedAccounts);
    if (newIncomeSettings) {
      setIncomeSettings(newIncomeSettings);

      const benefitsCardId = "special-benefits-countdown";
      const existingCardIndex = dashboardCards.findIndex(
        (c) => c.id === benefitsCardId
      );

      if (
        newIncomeSettings.status === "Benefited" &&
        newIncomeSettings.benefitsEndDate
      ) {
        const newCard: DashboardCard = {
          id: benefitsCardId,
          title: "Benefits Countdown",
          subtext: "Days left until benefits end.",
          icon: "CalendarCheck",
          visualization: "default", // Will be determined dynamically on the dashboard
          config: {
            feature: "finances",
            metric: "special",
            specialCard: "benefits-countdown",
          },
          value: "", // Will be calculated on dashboard
        };

        if (existingCardIndex > -1) {
          const updatedCards = [...dashboardCards];
          updatedCards[existingCardIndex] = newCard;
          setDashboardCards(updatedCards);
        } else {
          setDashboardCards([...dashboardCards, newCard]);
        }
      } else {
        if (existingCardIndex > -1) {
          setDashboardCards(
            dashboardCards.filter((c) => c.id !== benefitsCardId)
          );
        }
      }
    }
  };

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
        <FinancialHistoryDialog logs={financialLogs} />
      </div>
      <Financials
        incomeSettings={incomeSettings}
        onDataUpdate={handleDataUpdate}
        financialAccounts={financialAccounts}
      />
    </div>
  );
}
