/**
 * RoutineChecklist.tsx
 *
 * Display routine items with checkboxes
 * Shows today's due items, minimal and focused (ADHD-friendly)
 */

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { RoutineItem, Checkmark } from "@/lib/types";
import { isDue } from "@/lib/schedule";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface RoutineChecklistProps {
  routines: RoutineItem[];
  checkmarks: Checkmark[];
  onToggleCheck: (routineId: string, checked: boolean) => void;
  limit?: number;
  showCategory?: boolean;
  className?: string;
}

/**
 * Get today's checkmark for a routine
 */
function getTodayCheckmark(
  routineId: string,
  checkmarks: Checkmark[]
): Checkmark | undefined {
  const todayISO = format(startOfDay(new Date()), "yyyy-MM-dd");
  return checkmarks.find(
    (c) => c.routineId === routineId && c.dateISO === todayISO
  );
}

/**
 * Group routines by category
 */
function groupByCategory(
  routines: RoutineItem[]
): Record<string, RoutineItem[]> {
  return routines.reduce((acc, routine) => {
    if (!acc[routine.category]) {
      acc[routine.category] = [];
    }
    acc[routine.category].push(routine);
    return acc;
  }, {} as Record<string, RoutineItem[]>);
}

export function RoutineChecklist({
  routines,
  checkmarks,
  onToggleCheck,
  limit,
  showCategory = false,
  className,
}: RoutineChecklistProps) {
  const today = new Date();

  // Filter active routines due today
  const dueRoutines = routines
    .filter((r) => {
      if (!r.active) return false;

      // Find last completion for this routine
      const lastCheck = checkmarks
        .filter((c) => c.routineId === r.id && c.done)
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0];

      return isDue(r, today, lastCheck?.dateISO);
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const displayRoutines = limit ? dueRoutines.slice(0, limit) : dueRoutines;

  if (displayRoutines.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-sm text-muted-foreground">
          🎉 All today&apos;s routines completed!
        </p>
      </div>
    );
  }

  if (showCategory) {
    const grouped = groupByCategory(displayRoutines);
    const categories = Object.keys(grouped);

    return (
      <div className={cn("space-y-6", className)}>
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              {category}
            </h3>
            <ul className="space-y-2">
              {grouped[category].map((routine) => {
                const checkmark = getTodayCheckmark(routine.id, checkmarks);
                const isChecked = checkmark?.done ?? false;

                return (
                  <li key={routine.id}>
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                        isChecked && "bg-muted/50 opacity-75"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          onToggleCheck(routine.id, checked === true)
                        }
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-medium",
                            isChecked && "line-through text-muted-foreground"
                          )}
                        >
                          {routine.title}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {routine.frequency === "daily" && "Daily"}
                        {routine.frequency === "weekly" && "Weekly"}
                        {routine.frequency === "monthly" && "Monthly"}
                        {routine.frequency === "every3days" && "Every 3 days"}
                      </Badge>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  // Simple list without categories
  return (
    <ul className={cn("space-y-2", className)}>
      {displayRoutines.map((routine) => {
        const checkmark = getTodayCheckmark(routine.id, checkmarks);
        const isChecked = checkmark?.done ?? false;

        return (
          <li key={routine.id}>
            <label
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                isChecked && "bg-muted/50 opacity-75"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) =>
                  onToggleCheck(routine.id, checked === true)
                }
                className="h-5 w-5"
              />
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    isChecked && "line-through text-muted-foreground"
                  )}
                >
                  {routine.title}
                </p>
                {showCategory && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {routine.category}
                  </p>
                )}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
