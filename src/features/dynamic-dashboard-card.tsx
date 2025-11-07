"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DashboardCard,
  JobApplication,
  Task,
  TimeTrackingEntry,
  FinancialAccount,
  IncomeSettings,
  Currency,
  Goal,
} from "@/lib/types";
import {
  AlertCircle,
  Briefcase,
  CalendarCheck,
  Clock,
  DollarSign,
  Euro,
  FileText,
  Flag,
  ShieldAlert,
  Target,
  TrendingUp,
  Wallet,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import React, { useState, ElementType, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  startOfWeek,
  endOfWeek,
  parseISO,
  differenceInSeconds,
} from "date-fns";

type DynamicDashboardCardProps = {
  card: DashboardCard;
  allData: {
    jobApplications: JobApplication[];
    tasks: Task[];
    timeTrackingEntries: TimeTrackingEntry[];
    financialAccounts: FinancialAccount[];
    incomeSettings: IncomeSettings;
    goals: Goal[];
  };
  onClick: () => void;
};

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

const getMonthlyIncome = (settings: IncomeSettings) => {
  const { amount, frequency } = settings;
  if (frequency === "monthly") return amount;
  if (frequency === "annually") return amount / 12;
  if (frequency === "hourly") return amount * 40 * 4; // Approximation
  if (frequency === "daily") return amount * 22; // Approximation
  return 0;
};

const calculateGoalCountdown = (targetDate: string) => {
  const now = new Date();
  const end = parseISO(targetDate);
  const totalSeconds = differenceInSeconds(end, now);

  if (totalSeconds <= 0) {
    return "Achieved!";
  }

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
};

const cardStyles = {
  default: {
    card: "border-border",
    title: "text-muted-foreground",
    icon: "text-muted-foreground",
    value: "text-foreground",
  },
  warning: {
    card: "border-amber-300 bg-amber-50 dark:bg-amber-900/30",
    title: "text-amber-700 dark:text-amber-400",
    icon: "text-amber-600 dark:text-amber-400",
    value: "text-amber-900 dark:text-amber-300",
  },
  critical: {
    card: "border-accent",
    title: "text-accent",
    icon: "text-accent",
    value: "text-accent",
  },
};

const iconComponents: { [key: string]: ElementType } = {
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Clock,
  CalendarCheck,
  XCircle,
  AlertCircle,
  Wallet,
  DollarSign,
  Euro,
  FileText,
  Target,
  Flag,
};

function getCardData(
  card: DashboardCard,
  allData: DynamicDashboardCardProps["allData"]
) {
  const { config } = card;
  const {
    jobApplications,
    tasks,
    timeTrackingEntries,
    financialAccounts,
    incomeSettings,
    goals,
  } = allData;

  let value: string = "N/A";
  let details: { title: string; label: string; rawValue?: string }[] = [];

  switch (config.feature) {
    case "applications":
      if (config.metric === "status" && config.applicationStatus) {
        const filteredApps = jobApplications.filter(
          (app) => app.status === config.applicationStatus
        );
        value = filteredApps.length.toString();
        details = filteredApps.map((app) => ({
          title: app.company,
          label: app.role,
        }));
      } else {
        // 'total'
        value = jobApplications.length.toString();
      }
      break;
    case "goals":
      let filteredGoals: Goal[] = [];
      if (config.metric === "status" && config.goalStatus) {
        filteredGoals = goals.filter((g) => g.status === config.goalStatus);
      } else if (config.metric === "timeframe" && config.goalTimeframe) {
        filteredGoals = goals.filter(
          (g) => g.timeframe === config.goalTimeframe
        );
      } else {
        // 'total'
        filteredGoals = goals;
      }
      value = filteredGoals.length.toString();
      details = filteredGoals.map((g) => ({
        title: g.title,
        label: g.targetDate ? calculateGoalCountdown(g.targetDate) : "No date",
        rawValue: g.targetDate,
      }));
      break;
    case "routine":
      // Routine cards now operate over the new Task model (no period/startTime).
      // Both metrics (total_incomplete / period_incomplete) collapse to the same aggregation
      // until a future version introduces RoutineItem-specific dashboards.
      const incompleteTasks = tasks.filter((task) => task.status !== "done");
      value = incompleteTasks.length.toString();
      details = incompleteTasks.map((t) => ({
        title: t.title,
        // Prefer dueDate if available, else show status as context.
        label: t.dueDate ? t.dueDate : t.status,
      }));
      break;
    case "finances":
      const monthlyIncome = getMonthlyIncome(incomeSettings);
      const expenses = financialAccounts.filter(
        (acc) => acc.type === "expense"
      );
      const totalExpenses = expenses.reduce(
        (sum, item) =>
          sum +
          convertCurrency(item.amount, item.currency, incomeSettings.currency),
        0
      );

      if (config.metric === "net_monthly") {
        const net = monthlyIncome + totalExpenses; // Note: expenses are negative
        value = `${incomeSettings.currency} ${net.toFixed(2)}`;
      }
      if (config.metric === "total_debt") {
        const totalDebtValue = financialAccounts
          .filter((acc) => acc.type === "debt")
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
        value = `${incomeSettings.currency} ${totalDebtValue.toFixed(2)}`;
      }
      if (config.metric === "total_expenses") {
        const totalExpensesValue = financialAccounts
          .filter((acc) => acc.type === "expense")
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
        value = `${incomeSettings.currency} ${totalExpensesValue.toFixed(2)}`;
      }
      break;
    case "time":
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
      const weeklyEntries = timeTrackingEntries.filter((e) => {
        const d = new Date(e.date);
        return d >= weekStart && d <= weekEnd;
      });
      if (config.metric === "total_gaming") {
        const totalHours = weeklyEntries
          .filter((e) => e.activityType === "game")
          .reduce((acc, e) => acc + e.hours, 0);
        value = `${totalHours.toFixed(1)} hours`;
      }
      if (config.metric === "total_apps") {
        const totalHours = weeklyEntries
          .filter((e) => e.activityType === "app")
          .reduce((acc, e) => acc + e.hours, 0);
        value = `${totalHours.toFixed(1)} hours`;
      }
      break;
    default:
      value = "N/A";
  }
  return { value, details };
}

export function DynamicDashboardCard({
  card,
  allData,
  onClick,
}: DynamicDashboardCardProps) {
  const { title, icon, visualization, subtext } = card;
  const IconComponent = iconComponents[icon] || AlertCircle;
  const [isOpen, setIsOpen] = useState(false);
  const [_tick, setTick] = useState(0);

  useEffect(() => {
    // This interval is just to force a re-render every minute for countdowns.
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const { value, details } = getCardData(card, allData);

  const styles = cardStyles[visualization] || cardStyles.default;
  const hasDetails = details && details.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-collapsible-trigger]")) {
      return;
    }
    onClick();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <Card
        className={cn(
          "cursor-pointer transition-shadow flex flex-col bg-card/50 hover:shadow-sm",
          styles.card
        )}
        onClick={handleCardClick}
      >
        <div className="flex-grow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1.5">
              <CardTitle className={cn("text-sm font-medium", styles.title)}>
                {title}
              </CardTitle>
              <div className={cn("text-2xl font-bold", styles.value)}>
                {value}
              </div>
            </div>
            <IconComponent className={cn("h-4 w-4", styles.icon)} />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground pr-2">{subtext}</p>
              {hasDetails && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground -mr-2"
                    data-collapsible-trigger
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle details</span>
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </CardContent>
        </div>

        {hasDetails && (
          <CollapsibleContent className="flex-grow px-6 pb-4 pt-0">
            <ul className="space-y-2 border-t pt-2 mt-2">
              {details.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-muted-foreground truncate pr-2">
                    {item.title}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  );
}
