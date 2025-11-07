"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
import type { Achievement } from "@/lib/types";

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = (Lucide as any)[achievement.icon] || Lucide.Award;
  const unlocked = achievement.isUnlocked && !achievement.isRevoked;
  const revoked = achievement.isRevoked;

  return (
    <Card
      className={`relative overflow-hidden transition-opacity ${
        unlocked ? "" : "opacity-60"
      } ${revoked ? "ring-2 ring-destructive" : ""}`}
    >
      <CardContent className="p-4 flex items-start gap-4">
        <div
          className={`p-2 rounded-md border flex items-center justify-center ${
            unlocked ? "bg-primary/10 border-primary/30" : "bg-muted"
          }`}
        >
          <Icon className={`h-6 w-6 ${unlocked ? "text-primary" : ""}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm leading-tight">
              {achievement.title}
            </h3>
            {unlocked && !revoked && (
              <Badge variant="default" className="text-[10px] py-0 px-1">
                +{achievement.gemReward} gems
              </Badge>
            )}
            {revoked && (
              <Badge variant="destructive" className="text-[10px] py-0 px-1">
                Revoked
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {achievement.description}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-[10px]">
              {achievement.category}
            </Badge>
            {achievement.unlockedAt && (
              <span className="text-green-600 dark:text-green-400">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            )}
            {achievement.revokedAt && (
              <span className="text-destructive">
                Revoked {new Date(achievement.revokedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
