"use client";
"use no memo";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-db";
import type { PomodoroSession, PomodoroCategory } from "@/lib/types";
import {
  Brain,
  Code,
  Briefcase,
  BookOpen,
  Smartphone,
  Tv,
  TrendingUp,
} from "lucide-react";

const CATEGORY_INFO: Record<
  PomodoroCategory,
  {
    label: string;
    icon: typeof Brain;
    type: "productive" | "semi-productive" | "wasted";
  }
> = {
  "deep-learning": { label: "Deep Learning", icon: Brain, type: "productive" },
  "active-coding": { label: "Active Coding", icon: Code, type: "productive" },
  "job-search": { label: "Job Search", icon: Briefcase, type: "productive" },
  "tutorial-following": {
    label: "Tutorial Following",
    icon: BookOpen,
    type: "semi-productive",
  },
  "social-media": { label: "Social Media", icon: Smartphone, type: "wasted" },
  streaming: { label: "Streaming", icon: Tv, type: "wasted" },
  other: { label: "Other", icon: TrendingUp, type: "productive" },
};

interface CategoryStats {
  category: PomodoroCategory;
  sessions: number;
  minutes: number;
  percentage: number;
}

export function PomodoroTimeDistribution() {
  const { sessions, isLoading } = usePomodoroSessions();

  // Filter completed work sessions with category
  const workSessions = sessions.filter(
    (s) => s.kind === "work" && s.completed && s.category
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Time Distribution</CardTitle>
          <CardDescription>Track where your focus time goes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Loading sessions...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (workSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Time Distribution</CardTitle>
          <CardDescription>Track where your focus time goes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete categorized Pomodoro sessions to see your time
            distribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by category
  const categoryMap = new Map<PomodoroCategory, number>();
  let totalMinutes = 0;
  let wastedMinutes = 0;

  workSessions.forEach((session) => {
    const category = session.category!;
    const minutes = 25; // Assuming 25min pomodoros

    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    totalMinutes += minutes;

    // Count wasted time (either by category or by user validation)
    const categoryInfo = CATEGORY_INFO[category];
    const isWasted =
      categoryInfo.type === "wasted" || session.wasTrulyProductive === false;

    if (isWasted) {
      wastedMinutes += minutes;
    }
  });

  // Calculate stats
  const stats: CategoryStats[] = Array.from(categoryMap.entries()).map(
    ([category, count]) => ({
      category,
      sessions: count,
      minutes: count * 25,
      percentage: ((count * 25) / totalMinutes) * 100,
    })
  );

  // Sort by minutes descending
  stats.sort((a, b) => b.minutes - a.minutes);

  // Calculate efficiency: 100 - (wasted% × 2)
  const wastedPercentage = (wastedMinutes / totalMinutes) * 100;
  const efficiency = Math.max(0, Math.round(100 - wastedPercentage * 2));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Time Distribution</span>
          <Badge
            variant={
              efficiency >= 70
                ? "default"
                : efficiency >= 50
                ? "secondary"
                : "outline"
            }
          >
            {efficiency}% Efficiency
          </Badge>
        </CardTitle>
        <CardDescription>
          Where your {stats.reduce((sum, s) => sum + s.minutes, 0)} minutes went
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => {
          const info = CATEGORY_INFO[stat.category];
          const Icon = info.icon;

          return (
            <div key={stat.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{info.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{stat.minutes}m</span>
                  <span className="font-semibold">
                    {Math.round(stat.percentage)}%
                  </span>
                </div>
              </div>
              <Progress value={stat.percentage} className="h-2" />
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Efficiency Formula:</strong> 100 - (wasted time % × 2)
            {efficiency < 70 && (
              <span className="block mt-1 text-yellow-600 dark:text-yellow-500">
                💡 Reduce distractions to boost your efficiency score!
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
