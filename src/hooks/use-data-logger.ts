"use client";

import { useEffect, useRef } from "react";
import useLocalStorage from "./use-local-storage";
import { DailyLog, JobApplication, Goal, Task } from "@/lib/types";
import { format, isBefore, parseISO } from "date-fns";

function countByStatus<T extends { status: string }>(items: T[]) {
  return items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function toStatusArray<S extends string>(counts: Record<string, number>) {
  return Object.entries(counts).map(([status, count]) => ({
    status: status as S,
    count,
  }));
}

const useDataLogger = () => {
  const [logs, setLogs] = useLocalStorage<DailyLog[]>("dailyLogs", []);
  const [jobApplications] = useLocalStorage<JobApplication[]>(
    "jobApplications",
    []
  );
  const [goals] = useLocalStorage<Goal[]>("goals", []);
  const [tasks] = useLocalStorage<Task[]>("tasks", []);
  const lastLoggedForDayRef = useRef<string | null>(null);

  useEffect(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const computed: DailyLog = {
      date: todayStr,
      applications: toStatusArray(countByStatus(jobApplications)),
      goals: toStatusArray(countByStatus(goals)),
      tasks: toStatusArray(countByStatus(tasks)),
    };

    const idx = logs.findIndex((l) => l.date === todayStr);

    if (idx === -1) {
      setLogs((prev) => [...prev, computed]);
      lastLoggedForDayRef.current = todayStr;
      return;
    }

    const existing = logs[idx];
    const same = JSON.stringify(existing) === JSON.stringify(computed);
    if (!same) {
      setLogs((prev) => {
        const copy = prev.slice();
        const j = copy.findIndex((l) => l.date === todayStr);
        if (j !== -1) copy[j] = computed;
        return copy;
      });
      lastLoggedForDayRef.current = todayStr;
    }
  }, [jobApplications, goals, tasks, logs, setLogs]);
};

export default useDataLogger;
