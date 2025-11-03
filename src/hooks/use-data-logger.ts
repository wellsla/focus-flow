"use client";

import { useEffect } from "react";
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

/**
 * Logs daily snapshots of applications, goals, and tasks.
 * Creates one entry per day automatically.
 */
const useDataLogger = () => {
  const [logs, setLogs] = useLocalStorage<DailyLog[]>("dailyLogs", []);
  const [jobApplications] = useLocalStorage<JobApplication[]>(
    "jobApplications",
    []
  );
  const [goals] = useLocalStorage<Goal[]>("goals", []);
  const [tasks] = useLocalStorage<Task[]>("tasks", []);

  useEffect(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const lastLogDate =
      logs.length > 0 ? parseISO(logs[logs.length - 1].date) : null;

    const needsLog = !lastLogDate || isBefore(lastLogDate, parseISO(todayStr));
    const alreadyLogged = logs.some((log) => log.date === todayStr);

    if (needsLog && !alreadyLogged) {
      const newLog: DailyLog = {
        date: todayStr,
        applications: toStatusArray(countByStatus(jobApplications)),
        goals: toStatusArray(countByStatus(goals)),
        tasks: toStatusArray(countByStatus(tasks)),
      };

      setLogs((prevLogs) => [...prevLogs, newLog]);
    }
  }, [jobApplications, goals, tasks, logs, setLogs]);
};

export default useDataLogger;
