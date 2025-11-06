"use client";

import { FinancialAccount, IncomeSettings, ExpenseCategory } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { startOfMonth } from "date-fns";

type FinancialAlertsProps = {
  incomeSettings: IncomeSettings;
  financialAccounts: FinancialAccount[];
};

const conversionRates: Record<string, Record<string, number>> = {
  R$: { R$: 1, $: 0.18, "€": 0.17 },
  $: { R$: 5.4, $: 1, "€": 0.92 },
  "€": { R$: 5.85, $: 1.08, "€": 1 },
};

const convertCurrency = (amount: number, from: string, to: string): number => {
  if (from === to) return amount;
  return amount * conversionRates[from][to];
};

const getMonthlyIncome = (
  settings: IncomeSettings,
  oneTimeIncomes: FinancialAccount[]
): number => {
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

export function FinancialAlerts({
  incomeSettings,
  financialAccounts,
}: FinancialAlertsProps) {
  const debts = financialAccounts.filter((acc) => acc.type === "debt");
  const expenses = financialAccounts.filter((acc) => acc.type === "expense");
  const oneTimeIncomes = financialAccounts.filter(
    (acc) => acc.type === "income"
  );

  const monthlyIncome = getMonthlyIncome(incomeSettings, oneTimeIncomes);

  const totalDebt = debts.reduce(
    (sum, item) =>
      sum +
      convertCurrency(
        Math.abs(item.amount),
        item.currency,
        incomeSettings.currency
      ),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, item) =>
      sum +
      convertCurrency(
        Math.abs(item.amount),
        item.currency,
        incomeSettings.currency
      ),
    0
  );

  const unnecessaryExpenses = expenses
    .filter((exp) => exp.priority === "Unnecessary")
    .reduce(
      (sum, item) =>
        sum +
        convertCurrency(
          Math.abs(item.amount),
          item.currency,
          incomeSettings.currency
        ),
      0
    );

  const entertainmentExpenses = expenses
    .filter((exp) => exp.category === "Streaming & Entertainment")
    .reduce(
      (sum, item) =>
        sum +
        convertCurrency(
          Math.abs(item.amount),
          item.currency,
          incomeSettings.currency
        ),
      0
    );

  const alerts = [];

  // Debt risk alert (debt > 30% of income)
  if (totalDebt > monthlyIncome * 0.3) {
    alerts.push({
      type: "error" as const,
      title: "High Debt Risk",
      description: `Your total debt (${
        incomeSettings.currency
      } ${totalDebt.toFixed(2)}) exceeds 30% of your monthly income (${
        incomeSettings.currency
      } ${monthlyIncome.toFixed(
        2
      )}). This is a significant financial risk. Consider consolidating debts or increasing income.`,
    });
  }

  // Overspending alert (expenses > income)
  if (totalExpenses > monthlyIncome) {
    alerts.push({
      type: "error" as const,
      title: "Overspending Detected",
      description: `Your monthly expenses (${
        incomeSettings.currency
      } ${totalExpenses.toFixed(2)}) exceed your income (${
        incomeSettings.currency
      } ${monthlyIncome.toFixed(
        2
      )}). You are spending more than you earn. Review and cut unnecessary expenses immediately.`,
    });
  }

  // Unnecessary expenses warning
  if (unnecessaryExpenses > monthlyIncome * 0.1) {
    alerts.push({
      type: "warning" as const,
      title: "High Unnecessary Spending",
      description: `You're spending ${
        incomeSettings.currency
      } ${unnecessaryExpenses.toFixed(2)} on unnecessary items (${(
        (unnecessaryExpenses / monthlyIncome) *
        100
      ).toFixed(
        1
      )}% of income). These expenses could be reduced or eliminated to improve your financial health.`,
    });
  }

  // Entertainment spending info
  if (entertainmentExpenses > monthlyIncome * 0.05) {
    alerts.push({
      type: "info" as const,
      title: "Streaming & Entertainment Costs",
      description: `You're spending ${
        incomeSettings.currency
      } ${entertainmentExpenses.toFixed(
        2
      )} on streaming and entertainment. Consider consolidating subscriptions or sharing family plans to reduce costs.`,
    });
  }

  // Positive alert when finances are healthy
  if (
    alerts.length === 0 &&
    totalExpenses < monthlyIncome * 0.7 &&
    totalDebt < monthlyIncome * 0.2
  ) {
    alerts.push({
      type: "info" as const,
      title: "Healthy Finances",
      description: `You're managing your finances well! Your expenses are under control, and your debt is manageable. Keep up the good work and consider building an emergency fund.`,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.type === "error" ? "destructive" : "default"}
          className={
            alert.type === "warning"
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
              : ""
          }
        >
          {alert.type === "error" && <AlertCircle className="h-4 w-4" />}
          {alert.type === "warning" && (
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          )}
          {alert.type === "info" && <Info className="h-4 w-4" />}
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
