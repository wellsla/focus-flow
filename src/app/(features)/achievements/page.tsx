"use client";

import { AchievementGallery } from "@/features/achievements/AchievementGallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AchievementsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground text-lg">
          Lifetime achievements you can unlock (and keep — unless revoked)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementGallery />
        </CardContent>
      </Card>
    </div>
  );
}
