"use client";

import { Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRewardSystem } from "@/hooks/use-reward-system";

interface GemBalanceProps {
  className?: string;
}

export function GemBalance({ className }: GemBalanceProps) {
  const { gems, totalEarned, totalSpent } = useRewardSystem();

  return (
    <div className={className}>
      <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
        <Gem className="h-4 w-4 text-purple-600" />
        <span className="font-semibold">{gems}</span>
        <span className="text-xs text-muted-foreground">
          (+{totalEarned} / -{totalSpent})
        </span>
      </Badge>
    </div>
  );
}
