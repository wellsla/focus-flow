"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDisplay } from "./BadgeDisplay";
import { useRewards } from "@/hooks/use-rewards";
import { Trophy, Flame, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BADGES } from "@/lib/reward-engine";

interface RewardsSectionProps {
  variant?: "full" | "compact";
}

export function RewardsSection({ variant = "full" }: RewardsSectionProps) {
  const { rewards, newlyEarnedBadges, clearNewBadges } = useRewards();

  const badgeCount = rewards.badges.length;
  const totalBadges = Object.keys(BADGES).length;

  return (
    <div className="space-y-6">
      {/* New Badge Notification */}
      {newlyEarnedBadges.length > 0 && (
        <Alert className="border-primary bg-primary/10">
          <Trophy className="h-5 w-5" />
          <AlertDescription className="ml-2">
            <span className="font-semibold">Nova conquista desbloqueada!</span>
            {newlyEarnedBadges.map((badgeId) => {
              const badge = BADGES[badgeId];
              return (
                <div key={badgeId} className="mt-2">
                  <span className="text-2xl mr-2">{badge.emoji}</span>
                  <span className="font-medium">{badge.name}</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {badge.description}
                  </p>
                </div>
              );
            })}
            <button
              onClick={clearNewBadges}
              className="text-sm text-primary underline mt-2"
            >
              Entendi
            </button>
          </AlertDescription>
        </Alert>
      )}

      {variant === "full" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pontos Totais
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rewards.points}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Continue completando suas rotinas
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
                <div className="text-3xl font-bold">{rewards.streakDays}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rewards.streakDays === 0
                    ? "Complete 5+ rotinas hoje para começar"
                    : rewards.streakDays === 1
                    ? "Ótimo! Continue amanhã"
                    : `${rewards.streakDays} dias seguidos!`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conquistas
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {badgeCount}/{totalBadges}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {badgeCount === 0
                    ? "Complete ações para desbloquear"
                    : `${Math.round(
                        (badgeCount / totalBadges) * 100
                      )}% conquistado`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Badges Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Conquistas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Desbloqueie badges completando rotinas, sessões de foco e
                mantendo sua sequência
              </p>
            </CardHeader>
            <CardContent>
              <BadgeDisplay earnedBadges={rewards.badges} showAll />
            </CardContent>
          </Card>
        </>
      )}

      {variant === "compact" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progresso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="font-medium">{rewards.points} pontos</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-medium">
                  {rewards.streakDays} dias seguidos
                </span>
              </div>
            </div>
            <BadgeDisplay earnedBadges={rewards.badges} size="sm" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
