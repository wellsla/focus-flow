"use client";

import {
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
} from "recharts";
import { ChartCard } from "./performance-chart";
import { usePerformanceHistory } from "@/hooks/use-performance-metrics";
import { format, parseISO } from "date-fns";

// Displays relationship between overall score and gem balance snapshots.
export function GemCorrelation() {
  const history = usePerformanceHistory();

  const data = history
    .filter((h) => typeof h.totalGems === "number")
    .map((h) => ({
      x: Math.round(h.scorePct),
      y: h.totalGems as number,
      label: format(parseISO(h.date), "MMM d"),
    }));

  return (
    <ChartCard
      title="Score vs Gem Balance"
      description="Scatter plot of daily overall performance and gem balance (higher may correlate with consistent progress)."
    >
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name="Score"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis type="number" dataKey="y" name="Gems" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value: number, name: string, props: any) => [value, name]}
          labelFormatter={() => ""}
        />
        <Scatter data={data} fill="hsl(var(--primary))" />
      </ScatterChart>
    </ChartCard>
  );
}
