"use client";

import { useRewardSystem } from "@/hooks/use-reward-system";
import { ChartCard } from "./performance-chart";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

export function RecentAchievements() {
  const { achievements, gems } = useRewardSystem();
  const recent = achievements
    .filter((a) => a.isUnlocked && !a.isRevoked && a.unlockedAt)
    .sort(
      (a, b) =>
        parseISO(b.unlockedAt || new Date().toISOString()).getTime() -
        parseISO(a.unlockedAt || new Date().toISOString()).getTime()
    )
    .slice(0, 5);

  return (
    <ChartCard
      title="Recent Achievements"
      description="Last 5 unlocked achievements and current gem balance."
    >
      <div className="flex h-full flex-col gap-3 py-2">
        <div className="text-xs text-muted-foreground">Gem Balance: {gems}</div>
        {recent.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No achievements unlocked yet.
          </div>
        )}
        {recent.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-2 rounded border p-2 text-sm bg-card/50"
          >
            <Badge variant="outline" className="shrink-0">
              {a.icon}
            </Badge>
            <div className="space-y-0.5">
              <div className="font-medium leading-tight">{a.title}</div>
              <div className="text-xs text-muted-foreground">
                {format(
                  parseISO(a.unlockedAt || new Date().toISOString()),
                  "MMM d HH:mm"
                )}{" "}
                · +{a.gemReward} gems
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
