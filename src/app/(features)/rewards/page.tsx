"use client";

import { useRewardSystem } from "@/hooks/use-reward-system";
import { RewardCard } from "@/features/rewards/RewardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function RewardsPage() {
  const { rewards, buyReward, updateProgress } = useRewardSystem();
  const conditionalRewards = rewards.filter((r) => r.type === "conditional");
  const purchasableRewards = rewards.filter((r) => r.type === "purchasable");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Rewards</h1>
        <p className="text-muted-foreground text-lg">
          Unlock daily/weekly treats or purchase luxury rewards with gems
        </p>
      </div>
      <Tabs defaultValue="conditional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conditional">Conditional</TabsTrigger>
          <TabsTrigger value="purchasable">Purchasable</TabsTrigger>
        </TabsList>
        <TabsContent value="conditional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conditional Rewards</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete required actions to unlock these for the day/week/month
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {conditionalRewards.map((r) => (
                  <RewardCard key={r.id} reward={r} />
                ))}
                {conditionalRewards.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    No conditional rewards defined.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="purchasable" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchasable Rewards</CardTitle>
              <p className="text-sm text-muted-foreground">
                Spend gems you&apos;ve earned on luxury items or experiences
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {purchasableRewards.map((r) => (
                  <RewardCard key={r.id} reward={r} onBuy={buyReward} />
                ))}
                {purchasableRewards.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    No purchasable rewards defined.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
