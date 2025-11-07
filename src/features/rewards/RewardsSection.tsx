"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Gem } from "lucide-react";
import { useRewardSystem } from "@/hooks/use-reward-system";
import { DEFAULT_ACHIEVEMENTS } from "@/lib/initial-achievements";

interface RewardsSectionProps {
  variant?: "full" | "compact";
}

export function RewardsSection({ variant = "full" }: RewardsSectionProps) {
  // New rewards system (gems + achievements)
  const { rewardState, gems, achievements } = useRewardSystem();
  const unlockedAchievements = achievements.filter(
    (a) => a.isUnlocked && !a.isRevoked
  );
  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = DEFAULT_ACHIEVEMENTS.length;

  return (
    <div className="space-y-6">
      {variant === "full" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gems</CardTitle>
                <Gem className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{gems}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Earn gems by completing routines, tasks and pomodoro sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sequência Atual
                </CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {rewardState.streakDays}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rewardState.streakDays === 0
                    ? "Complete 5+ rotinas hoje para começar"
                    : rewardState.streakDays === 1
                    ? "Great! Come back tomorrow"
                    : `${rewardState.streakDays} dias seguidos!`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Achievements
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {unlockedCount}/{totalAchievements}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {unlockedCount === 0
                    ? "Complete actions to unlock achievements"
                    : `${Math.round(
                        (unlockedCount / totalAchievements) * 100
                      )}% unlocked`}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {variant === "compact" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-purple-600" />
                <span className="font-medium">{gems} gems</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-medium">
                  {rewardState.streakDays} dias seguidos
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Achievements: {unlockedCount}/{totalAchievements}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
