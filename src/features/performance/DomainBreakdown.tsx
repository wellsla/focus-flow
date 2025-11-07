"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./performance-chart";
import { computeDomainScores, DomainScores } from "@/lib/performance-metrics";
import { useEffect, useState } from "react";

type Datum = { domain: string; value: number };

function toData(scores: DomainScores): Datum[] {
  return [
    { domain: "Tasks", value: Math.round(scores.tasks) },
    { domain: "Routines", value: Math.round(scores.routines) },
    { domain: "Applications", value: Math.round(scores.applications) },
    { domain: "Finances", value: Math.round(scores.finances) },
    { domain: "Time", value: Math.round(scores.time) },
  ];
}

export function DomainBreakdown() {
  const [data, setData] = useState<Datum[]>(() =>
    toData(computeDomainScores())
  );

  useEffect(() => {
    const handler = () => setData(toData(computeDomainScores()));
    window.addEventListener("local-storage", handler as EventListener);
    return () =>
      window.removeEventListener("local-storage", handler as EventListener);
  }, []);

  return (
    <ChartCard
      title="Domain Breakdown"
      description="Current score per domain (0–100)."
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
          formatter={(value: number) => [`${value}%`, "Score"]}
        />
        <Legend />
        <Bar dataKey="value" name="Score" fill="hsl(var(--primary))" />
      </BarChart>
    </ChartCard>
  );
}
