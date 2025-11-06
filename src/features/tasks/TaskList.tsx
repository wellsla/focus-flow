/**
 * TaskList.tsx
 *
 * List display for tasks with status toggle and edit actions
 * Clean, scannable interface for ADHD-friendly task viewing
 */

"use client";

import type { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-700 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  high: "bg-red-500/10 text-red-700 border-red-200",
};

const statusIcons = {
  todo: Circle,
  "in-progress": Clock,
  done: CheckCircle2,
  cancelled: Circle,
};

export function TaskList({ tasks, onToggle, onEdit }: TaskListProps) {
  // Sort: overdue first, then by due date, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    // Overdue tasks first
    if (a.dueDate && b.dueDate) {
      const aOverdue = isPast(new Date(a.dueDate)) && a.status !== "done";
      const bOverdue = isPast(new Date(b.dueDate)) && b.status !== "done";
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Then by due date
      if (a.dueDate < b.dueDate) return -1;
      if (a.dueDate > b.dueDate) return 1;
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Then by priority (high > medium > low)
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => {
        const StatusIcon = statusIcons[task.status];
        const isOverdue =
          task.dueDate &&
          isPast(new Date(task.dueDate)) &&
          task.status !== "done" &&
          task.status !== "cancelled";
        const isDueToday =
          task.dueDate &&
          isToday(new Date(task.dueDate)) &&
          task.status !== "done";

        return (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
              task.status === "done"
                ? "bg-muted/50 opacity-75"
                : "hover:bg-accent/50"
            } ${isOverdue ? "border-red-300 bg-red-50/50" : ""}`}
          >
            {/* Status Toggle */}
            <button
              onClick={() => onToggle(task)}
              className="flex-shrink-0 hover:scale-110 transition-transform"
            >
              <StatusIcon
                className={`h-5 w-5 ${
                  task.status === "done"
                    ? "text-green-600"
                    : task.status === "in-progress"
                    ? "text-blue-600"
                    : "text-muted-foreground"
                }`}
              />
            </button>

            {/* Task Content */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onEdit(task)}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className={`font-medium ${
                    task.status === "done"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {task.title}
                </p>

                {/* Priority Badge */}
                <Badge
                  variant="outline"
                  className={priorityColors[task.priority]}
                >
                  {task.priority}
                </Badge>

                {/* Due Date Warning */}
                {isOverdue && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}

                {isDueToday && (
                  <Badge
                    variant="outline"
                    className="gap-1 bg-orange-500/10 text-orange-700 border-orange-200"
                  >
                    <Clock className="h-3 w-3" />
                    Due Today
                  </Badge>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {task.description}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </span>
                )}

                {task.tags && task.tags.length > 0 && (
                  <span className="flex items-center gap-1">
                    #{task.tags.join(", #")}
                  </span>
                )}

                {task.completedDate && (
                  <span className="text-green-600">
                    ✓ Completed {format(new Date(task.completedDate), "MMM d")}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="flex-shrink-0"
            >
              Edit
            </Button>
          </div>
        );
      })}
    </div>
  );
}
