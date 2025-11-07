"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePerformanceMetrics } from "@/hooks/use-performance-metrics";

function label(level: string) {
  switch (level) {
    case "very-bad":
      return "Very Bad";
    case "bad":
      return "Bad";
    case "regular":
      return "Regular";
    case "good":
      return "Good";
    case "great":
      return "Great";
    case "excellent":
      return "Excellent";
    default:
      return level;
  }
}

export function MiniPerformanceSummary() {
  const snap = usePerformanceMetrics();
  const pct = Math.round(snap.scorePct);
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base">Overall Performance</CardTitle>
        <CardDescription>Unified excellence score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Level</div>
          <Badge variant="outline">{label(snap.level)}</Badge>
        </div>
        <Progress value={pct} />
        <div className="text-xs text-muted-foreground">{pct}% consistency</div>
      </CardContent>
    </Card>
  );
}
