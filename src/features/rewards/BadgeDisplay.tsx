"use client";

import { BADGES, type BadgeId } from "@/lib/reward-engine";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  earnedBadges: string[];
  size?: "sm" | "md" | "lg";
  showAll?: boolean; // Show all badges with locked state
}

export function BadgeDisplay({
  earnedBadges,
  size = "md",
  showAll = false,
}: BadgeDisplayProps) {
  const allBadges = Object.values(BADGES);
  const displayBadges = showAll
    ? allBadges
    : allBadges.filter((badge) => earnedBadges.includes(badge.id));

  const sizeClasses = {
    sm: "text-3xl w-14 h-14",
    md: "text-5xl w-20 h-20",
    lg: "text-7xl w-28 h-28",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (displayBadges.length === 0 && !showAll) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg">Nenhuma conquista ainda</p>
        <p className="text-sm mt-2">
          Complete suas rotinas e sessões de foco para desbloquear badges!
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayBadges.map((badge) => {
          const isEarned = earnedBadges.includes(badge.id);
          const isLocked = showAll && !isEarned;

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card
                  className={`
                    transition-all duration-300 hover:scale-105
                    ${isLocked ? "opacity-30 saturate-0" : ""}
                    ${isEarned ? "ring-2 ring-primary" : ""}
                  `}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                    <div
                      className={`
                        ${sizeClasses[size]}
                        flex items-center justify-center
                      `}
                    >
                      {isLocked ? (
                        <span className="text-muted-foreground">🔒</span>
                      ) : (
                        <span>{badge.emoji}</span>
                      )}
                    </div>
                    <p
                      className={`
                        ${textSizeClasses[size]}
                        font-medium text-center
                        ${isLocked ? "text-muted-foreground" : ""}
                      `}
                    >
                      {badge.name}
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {badge.description}
                  </p>
                  {isLocked && (
                    <p className="text-xs text-amber-500 mt-2">
                      🔒 Bloqueado - continue progredindo!
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
