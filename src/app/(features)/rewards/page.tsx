"use client";

import { RewardsSection } from "@/features/rewards/RewardsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BADGES } from "@/lib/reward-engine";

export default function RewardsPage() {
  const allBadges = Object.values(BADGES);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Recompensas</h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe seu progresso e conquistas
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="badges">Todas as Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <RewardsSection variant="full" />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Conquistas Disponíveis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete ações específicas para desbloquear cada badge
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {allBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="text-5xl">{badge.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{badge.name}</h3>
                      <p className="text-muted-foreground mt-1">
                        {badge.description}
                      </p>
                      <div className="mt-3 text-sm">
                        {badge.id === "first-step" && (
                          <p className="text-primary">
                            ✓ Desbloqueado ao completar sua primeira rotina do
                            dia
                          </p>
                        )}
                        {badge.id === "deep-focus" && (
                          <p className="text-primary">
                            ✓ Desbloqueado com 3 pomodoros completos seguidos
                            (dentro de 30 min entre eles)
                          </p>
                        )}
                        {badge.id === "writer" && (
                          <p className="text-primary">
                            ✓ Desbloqueado com 7 dias seguidos de diário
                          </p>
                        )}
                        {badge.id === "resilient" && (
                          <p className="text-primary">
                            ✓ Desbloqueado com streak de 14 dias (5+ rotinas por
                            dia)
                          </p>
                        )}
                        {badge.id === "week-warrior" && (
                          <p className="text-primary">
                            ✓ Desbloqueado com streak de 7 dias (5+ rotinas por
                            dia)
                          </p>
                        )}
                        {badge.id === "focus-master" && (
                          <p className="text-primary">
                            ✓ Desbloqueado com 25 sessões de pomodoro completas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
