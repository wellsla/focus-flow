"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { computeDomainScores } from "@/lib/performance-metrics";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useRewardSystem } from "@/hooks/use-reward-system";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Gem, Target, Briefcase, CalendarCheck } from "lucide-react";

interface DomainDatum {
  label: string;
  key: keyof ReturnType<typeof computeDomainScores>;
  icon: React.ElementType;
  href: string;
}

const DOMAINS: DomainDatum[] = [
  { label: "Tasks", key: "tasks", icon: Target, href: "/tasks" },
  {
    label: "Routines",
    key: "routines",
    icon: CalendarCheck,
    href: "/routines",
  },
  {
    label: "Applications",
    key: "applications",
    icon: Briefcase,
    href: "/applications",
  },
  { label: "Finances", key: "finances", icon: Gem, href: "/finances" },
  { label: "Time", key: "time", icon: Trophy, href: "/time-management" },
];

export function FeatureProgressOverview() {
  const [scores, setScores] = useState(() => computeDomainScores());
  const { achievements, gems } = useRewardSystem();
  const unlocked = achievements.filter(
    (a) => a.isUnlocked && !a.isRevoked
  ).length;

  useEffect(() => {
    const handler = () => setScores(computeDomainScores());
    window.addEventListener("local-storage", handler as EventListener);
    return () =>
      window.removeEventListener("local-storage", handler as EventListener);
  }, []);

  // Determine weakest domain for focus suggestion
  const entries = DOMAINS.map((d) => ({ ...d, value: scores[d.key] }));
  const weakest = entries.sort((a, b) => a.value - b.value)[0];

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Feature Progress Overview</CardTitle>
        <CardDescription>
          Current consistency across major areas. Focus suggestion below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {entries.map(({ label, icon: Icon, value, href }) => {
            const pct = Math.round(value);
            return (
              <Link
                key={label}
                href={href}
                className="block hover:no-underline"
              >
                <div className="rounded border p-3 bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <div className="rounded border px-3 py-2 bg-card/50">
            Achievements: {unlocked}
          </div>
          <div className="rounded border px-3 py-2 bg-card/50">
            Gem Balance: {gems}
          </div>
          <div className="text-muted-foreground">
            Focus Suggestion: Improve{" "}
            <span className="font-medium">{weakest.label}</span> today.
          </div>
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link href="/performance">View Detailed Performance</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
