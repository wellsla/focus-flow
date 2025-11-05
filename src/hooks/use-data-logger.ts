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

    const computedSnapshot = JSON.stringify(computed);

    // Skip if data hasn't changed
    if (lastLoggedForDayRef.current === computedSnapshot) {
      return;
    }

    setLogs((prevLogs) => {
      const idx = prevLogs.findIndex((l) => l.date === todayStr);

      if (idx === -1) {
        // No log for today, add it
        lastLoggedForDayRef.current = computedSnapshot;
        return [...prevLogs, computed];
      }

      const existing = prevLogs[idx];
      const existingSnapshot = JSON.stringify(existing);

      if (existingSnapshot !== computedSnapshot) {
        // Update existing log
        const copy = [...prevLogs];
        copy[idx] = computed;
        lastLoggedForDayRef.current = computedSnapshot;
        return copy;
      }

      // No changes needed
      lastLoggedForDayRef.current = computedSnapshot;
      return prevLogs;
    });
  }, [jobApplications, goals, tasks, setLogs]);
};

export default useDataLogger;
