"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { ChartCard } from "./performance-chart";
import { usePerformanceHistory } from "@/hooks/use-performance-metrics";
import { format, parseISO, subDays } from "date-fns";

export function PerformanceTrend() {
  const history = usePerformanceHistory();

  // Show last 30 days; if missing days, we still only include existing snapshots.
  const cutoff = subDays(new Date(), 29);
  const data = history
    .filter((h) => parseISO(h.date) >= cutoff)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .map((h) => ({
      date: format(parseISO(h.date), "MMM d"),
      Overall: Math.round(h.scorePct),
    }));

  return (
    <ChartCard
      title="Overall Score Trend"
      description="History of your unified performance score (last 30 days)."
    >
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
          formatter={(value: number) => [`${value}%`, "Overall"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Overall"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartCard>
  );
}
