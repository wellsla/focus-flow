"use client";

import { KanbanBoard } from "./components/kanban-board";
import { Skeleton } from "@/components/ui/skeleton";
import useLocalStorage from "@/hooks/use-local-storage";
import { DailyLog, JobApplication } from "@/lib/types";

export default function ApplicationsPage() {
  const [applications, __, loadingApps] = useLocalStorage<JobApplication[]>(
    "jobApplications",
    []
  );
  const [dailyLogs, setDailyLogs, loadingLogs] = useLocalStorage<DailyLog[]>(
    "dailyLogs",
    []
  );

  const loading = loadingApps || loadingLogs;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <KanbanBoard
      dailyLogs={dailyLogs}
      applications={applications}
      setApplications={__}
    />
  );
}
