"use client";

import useLocalStorage from "@/hooks/use-local-storage";
import {
  JobApplication,
  Task,
  TimeTrackingEntry,
  FinancialLog,
} from "@/lib/types";
import { subDays, format, eachDayOfInterval, parse } from "date-fns";
import { ChartCard } from "./components/performance-chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const processChartData = (
  days: Date[],
  entries: any[],
  dateKey: string,
  valueKey?: string,
  valueAggregator?: (items: any[]) => number
) => {
  return days.map((day) => {
    const dayString = format(day, "yyyy-MM-dd");
    const entriesForDay = entries.filter(
      (entry) => entry[dateKey] === dayString
    );

    let value = 0;
    if (valueAggregator) {
      value = valueAggregator(entriesForDay);
    } else if (valueKey) {
      value = entriesForDay.reduce(
        (sum, item) => sum + (item[valueKey] || 0),
        0
      );
    } else {
      value = entriesForDay.length;
    }

    return {
      date: format(day, "MMM d"),
      value: value,
    };
  });
};

export default function PerformancePage() {
  const [jobApplications, _setJobApps, loadingApps] = useLocalStorage<
    JobApplication[]
  >("jobApplications", []);
  const [tasks, _setTasks, loadingTasks] = useLocalStorage<Task[]>("tasks", []);
  const [timeEntries, _setTimeEntries, loadingTime] = useLocalStorage<
    TimeTrackingEntry[]
  >("timeTrackingEntries", []);
  const [financialLogs, _setFinancialLogs, loadingLogs] = useLocalStorage<
    FinancialLog[]
  >("financialLogs", []);

  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  const applicationData = processChartData(
    dateRange,
    jobApplications,
    "dateApplied"
  );

  const taskCompletionData = processChartData(
    dateRange,
    tasks,
    "dueDate",
    undefined,
    (dailyTasks) => {
      const routineTasks = dailyTasks.filter((t) => t.period); // Only count routine tasks for completion rate
      if (routineTasks.length === 0) return 0;
      const completedTasks = routineTasks.filter(
        (t) => t.status === "done"
      ).length;
      return (completedTasks / routineTasks.length) * 100;
    }
  );

  const timeTrackingData = processChartData(
    dateRange,
    timeEntries,
    "date",
    "hours"
  );

  const financialHistoryData = financialLogs
    .map((log) => ({
      date: format(parse(log.date, "yyyy-MM-dd", new Date()), "MMM yyyy"),
      Net: log.net,
      Income: log.totalIncome,
      Expenses: log.totalExpenses,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const isLoading = loadingApps || loadingTasks || loadingTime || loadingLogs;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Skeleton className="h-[380px] w-full" />
          <Skeleton className="h-[380px] w-full" />
          <Skeleton className="h-[380px] w-full" />
          <Skeleton className="h-[380px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your progress over the last 30 days. Consistency is key.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ChartCard
          title="Financial History"
          description="Monthly net income overview."
        >
          <LineChart data={financialHistoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Net"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="Income"
              stroke="hsl(var(--chart-3))"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="Expenses"
              stroke="hsl(var(--chart-2))"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ChartCard>
        <ChartCard
          title="Applications Sent"
          description="Daily count of job applications submitted."
        >
          <AreaChart data={applicationData}>
            <defs>
              <linearGradient
                id="colorApplications"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Applications"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorApplications)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard
          title="Routine Completion Rate"
          description="Percentage of daily routine tasks completed."
        >
          <LineChart data={taskCompletionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Completion %"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard
          title="Time Logged (Time Sinks)"
          description="Total hours logged in games and apps per day."
        >
          <BarChart data={timeTrackingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Legend />
            <Bar dataKey="value" name="Hours" fill="hsl(var(--chart-2))" />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
