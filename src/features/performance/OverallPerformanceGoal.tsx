"use client";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeOverallPerformance } from "@/lib/performance-metrics";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function levelLabel(level: string) {
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

function levelColor(level: string) {
  switch (level) {
    case "very-bad":
      return "destructive";
    case "bad":
      return "secondary";
    case "regular":
      return "outline";
    case "good":
      return "default";
    case "great":
      return "default";
    case "excellent":
      return "default";
    default:
      return "outline";
  }
}

export function OverallPerformanceGoal() {
  const [score, setScore] = useState(() => computeOverallPerformance());

  useEffect(() => {
    const handler = () => setScore(computeOverallPerformance());
    window.addEventListener("storage-update", handler as EventListener);
    return () =>
      window.removeEventListener("storage-update", handler as EventListener);
  }, []);

  const pct = Math.round(score.scorePct);
  const nextChallenge =
    pct > 95
      ? "Increase load (add routines, harder tasks)"
      : pct > 90
      ? "Add one more meaningful routine"
      : pct > 80
      ? "Finish more medium tasks"
      : pct > 70
      ? "Reduce time sinks"
      : pct > 50
      ? "Create 3 quick wins today"
      : "Start micro-habits";

  return (
    <Card className="border-primary/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Overall Performance Meta
        </CardTitle>
        <CardDescription>
          Unified excellence score based on tasks, routines, applications,
          finances and time discipline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Excellence Level</div>
          <Badge variant={levelColor(score.level)}>
            {levelLabel(score.level)}
          </Badge>
        </div>
        <Progress value={pct} />
        <div className="text-xs text-muted-foreground">
          {pct}% overall consistency
        </div>
        <div className="space-y-1 text-sm">
          {score.suggestions.map((s, i) => (
            <p key={i} className="leading-snug">
              • {s}
            </p>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Data coverage: {score.sampleSizes.tasks} tasks,{" "}
          {score.sampleSizes.routinesDays} routine days,{" "}
          {score.sampleSizes.applications} applications,{" "}
          {score.sampleSizes.financesMonths} finance months.
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          {nextChallenge}
        </Button>
      </CardFooter>
    </Card>
  );
}
