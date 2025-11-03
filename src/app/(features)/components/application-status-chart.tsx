
'use client';

import { Pie, PieChart, Legend, Tooltip } from "recharts"
import { ComponentProps } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { JobApplication, ApplicationStatus } from "@/lib/types";

const chartConfig = {
  count: {
    label: "Applications",
  },
  Applied: {
    label: "Applied",
    color: "hsl(var(--chart-1))",
  },
  Interviewing: {
    label: "Interviewing",
    color: "hsl(var(--chart-2))",
  },
  Offer: {
    label: "Offer",
    color: "hsl(var(--chart-3))",
  },
  Rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-4))",
  },
  Wishlist: {
    label: "Wishlist",
    color: "hsl(var(--chart-5))",
  },
} satisfies ComponentProps<typeof ChartContainer>["config"];

type ApplicationStatusChartProps = {
    applications: JobApplication[];
}

export function ApplicationStatusChart({ applications }: ApplicationStatusChartProps) {
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<ApplicationStatus, number>);

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        fill: `var(--color-${status})`,
    }));

    const totalApplications = applications.length;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Application Funnel</CardTitle>
        <CardDescription>Your current application pipeline.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
             <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="status" />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total applications: {totalApplications}
        </div>
        <Legend content={({ payload }) => {
            return <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground flex-wrap">
                {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{backgroundColor: entry.color}} />
                        <span>{entry.value}</span>
                    </div>
                ))}
            </div>
        }} />
      </CardFooter>
    </Card>
  )
}
