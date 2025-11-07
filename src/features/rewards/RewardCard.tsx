"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
import type { Reward } from "@/lib/types";

interface RewardCardProps {
  reward: Reward;
  onBuy?: (id: string) => void;
}

export function RewardCard({ reward, onBuy }: RewardCardProps) {
  const Icon = (Lucide as any)[reward.icon] || Lucide.Gift;

  const isConditional = reward.type === "conditional";
  const isUnlocked = reward.isUnlocked;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md border bg-muted">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{reward.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {reward.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize text-[10px]">
            {reward.category}
          </Badge>
          {isConditional && reward.resetFrequency && (
            <Badge variant="secondary" className="text-[10px]">
              {reward.resetFrequency}
            </Badge>
          )}
          {reward.gemCost != null && (
            <Badge variant="default" className="text-[10px]">
              {reward.gemCost} gems
            </Badge>
          )}
          {isConditional && (
            <Badge
              variant={isUnlocked ? "default" : "outline"}
              className="text-[10px]"
            >
              {isUnlocked ? "Unlocked" : "Locked"}
            </Badge>
          )}
        </div>
        {isConditional && reward.conditions && (
          <ul className="list-disc pl-5 space-y-1">
            {reward.conditions.map((c, idx) => (
              <li key={idx} className="text-xs">
                {c.description} ({c.progress ?? 0}/{c.target})
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        {reward.type === "purchasable" ? (
          <Button
            disabled={!reward.gemCost}
            onClick={() => onBuy?.(reward.id)}
            className="w-full"
          >
            Buy{reward.gemCost ? ` for ${reward.gemCost} gems` : ""}
          </Button>
        ) : (
          <Button
            disabled={!isUnlocked}
            variant={isUnlocked ? "default" : "secondary"}
            className="w-full"
          >
            Claim
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
