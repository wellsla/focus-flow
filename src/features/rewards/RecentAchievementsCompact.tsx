"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRewardSystem } from "@/hooks/use-reward-system";
import { parseISO, format } from "date-fns";

export function RecentAchievementsCompact() {
  const { achievements } = useRewardSystem();
  const recent = achievements
    .filter((a) => a.isUnlocked && !a.isRevoked && a.unlockedAt)
    .sort(
      (a, b) =>
        parseISO(b.unlockedAt || new Date().toISOString()).getTime() -
        parseISO(a.unlockedAt || new Date().toISOString()).getTime()
    )
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base">Recent Achievements</CardTitle>
        <CardDescription>Latest unlocks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {recent.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No recent achievements.
          </div>
        )}
        {recent.map((a) => (
          <div key={a.id} className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{a.icon}</Badge>
            <div className="truncate">
              <div className="font-medium leading-tight truncate">
                {a.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {a.unlockedAt ? format(parseISO(a.unlockedAt), "MMM d") : ""} ·
                +{a.gemReward}g
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
