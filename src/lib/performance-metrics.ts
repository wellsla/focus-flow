import { getStorageItem, setStorageItem } from "@/lib/storage";
import type {
  Task,
  FinancialLog,
  TimeTrackingEntry,
  JobApplication,
} from "@/lib/types";

export type ExcellenceLevel =
  | "very-bad"
  | "bad"
  | "regular"
  | "good"
  | "great"
  | "excellent";

export interface OverallPerformanceSnapshot {
  scorePct: number; // 0..100
  level: ExcellenceLevel;
  thresholds: Record<ExcellenceLevel, [number, number]>; // inclusive ranges
  suggestions: string[]; // actionable suggestions
  sampleSizes: {
    tasks: number;
    routinesDays: number;
    applications: number;
    financesMonths: number;
    pomodoroSessions?: number;
  };
}

// Fixed thresholds per request
export const EXCELLENCE_THRESHOLDS: Record<ExcellenceLevel, [number, number]> =
  {
    "very-bad": [0, 50],
    bad: [50.1, 70],
    regular: [70.1, 80],
    good: [80.1, 90],
    great: [90.1, 95],
    excellent: [95.1, 100],
  };

function clamp(x: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, x));
}

function levelFromScore(pct: number): ExcellenceLevel {
  const entries = Object.entries(EXCELLENCE_THRESHOLDS) as Array<
    [ExcellenceLevel, [number, number]]
  >;
  for (const [lvl, [a, b]] of entries) {
    if (pct >= a && pct <= b) return lvl;
  }
  // Edge cases
  if (pct <= 0) return "very-bad";
  return "excellent";
}

export function computeTaskScore(tasks: Task[]): number {
  if (!tasks?.length) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return (done / tasks.length) * 100;
}

export function computeRoutineScore(): number {
  // dailyLogs: { date: yyyy-MM-dd, tasks: [{ status, count }] }
  const dailyLogs = getStorageItem<any[]>("dailyLogs") ?? [];
  if (!dailyLogs.length) return 0;
  let acc = 0;
  let days = 0;
  for (const log of dailyLogs) {
    const total = (log.tasks ?? []).reduce(
      (s: number, t: any) => s + (Number(t.count) || 0),
      0
    );
    const completed =
      (log.tasks ?? []).find((t: any) => t.status === "done")?.count || 0;
    if (total > 0) {
      acc += (completed / total) * 100;
      days += 1;
    }
  }
  if (days === 0) return 0;
  return acc / days;
}

export function computeApplicationsScore(apps: JobApplication[]): number {
  if (!apps?.length) return 0;
  // Heuristic: higher status => better. Map to 0..1 and average.
  const weight: Record<JobApplication["status"], number> = {
    Applied: 0.2,
    Interviewing: 0.6,
    Offer: 1,
    Rejected: 0,
    Wishlist: 0.1,
  };
  const avg =
    apps.reduce((s, a) => s + (weight[a.status] ?? 0), 0) / apps.length;
  return clamp(avg * 100);
}

export function computeFinanceScore(logs: FinancialLog[]): number {
  if (!logs?.length) return 0;
  // Net >= 0 considered good; proportion of months with non-negative net.
  const nonNegative = logs.filter((l) => (l.net ?? 0) >= 0).length;
  return (nonNegative / logs.length) * 100;
}

export function computeTimeDisciplineScore(
  entries: TimeTrackingEntry[]
): number {
  if (!entries?.length) return 100; // assume disciplined if no sinks logged
  // Less hours => better. Map 0h => 100, 4h+ => ~0 (clamped)
  const totalHours = entries.reduce((s, e) => s + (e.hours ?? 0), 0);
  const dailyAvg =
    totalHours / Math.max(1, new Set(entries.map((e) => e.date)).size);
  const score = 100 - dailyAvg * 25; // 0h=100, 1h=75, 2h=50, 3h=25, 4h=0
  return clamp(score);
}

export type DomainScores = {
  tasks: number;
  routines: number;
  applications: number;
  finances: number;
  time: number;
};

export interface PerformanceHistoryEntry {
  date: string; // YYYY-MM-DD
  scorePct: number;
  domains: DomainScores;
  totalGems?: number; // snapshot of current gem balance
}

const HISTORY_KEY = "performanceHistory";

export function computeDomainScores(): DomainScores {
  const tasks = getStorageItem<Task[]>("tasks") ?? [];
  const timeEntries =
    getStorageItem<TimeTrackingEntry[]>("timeTrackingEntries") ?? [];
  const financialLogs = getStorageItem<FinancialLog[]>("financialLogs") ?? [];
  const apps = getStorageItem<JobApplication[]>("jobApplications") ?? [];

  return {
    tasks: computeTaskScore(tasks),
    routines: computeRoutineScore(),
    applications: computeApplicationsScore(apps),
    finances: computeFinanceScore(financialLogs),
    time: computeTimeDisciplineScore(timeEntries),
  };
}

export function getPerformanceHistory(): PerformanceHistoryEntry[] {
  return getStorageItem<PerformanceHistoryEntry[]>(HISTORY_KEY) ?? [];
}

export function savePerformanceHistory(
  entries: PerformanceHistoryEntry[]
): void {
  setStorageItem(HISTORY_KEY, entries);
}

export function recordPerformanceSnapshot(
  dateISO: string
): PerformanceHistoryEntry {
  const domains = computeDomainScores();
  const overall = computeOverallPerformance();
  const rewards = getStorageItem<{ gems?: number }>("rewards");
  const totalGems = rewards?.gems ?? undefined;

  const entry: PerformanceHistoryEntry = {
    date: dateISO,
    scorePct: overall.scorePct,
    domains,
    totalGems,
  };

  const history = getPerformanceHistory();
  const idx = history.findIndex((h) => h.date === dateISO);
  if (idx >= 0) {
    history[idx] = entry;
  } else {
    history.push(entry);
  }
  savePerformanceHistory(history);
  return entry;
}

export function computeOverallPerformance(): OverallPerformanceSnapshot {
  const tasks = getStorageItem<Task[]>("tasks") ?? [];
  const timeEntries =
    getStorageItem<TimeTrackingEntry[]>("timeTrackingEntries") ?? [];
  const financialLogs = getStorageItem<FinancialLog[]>("financialLogs") ?? [];
  const apps = getStorageItem<JobApplication[]>("jobApplications") ?? [];

  const scores = [
    computeTaskScore(tasks),
    computeRoutineScore(),
    computeApplicationsScore(apps),
    computeFinanceScore(financialLogs),
    computeTimeDisciplineScore(timeEntries),
  ].filter((s) => !Number.isNaN(s));

  const scorePct = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  const level = levelFromScore(scorePct);

  const suggestions: string[] = [];
  if (scorePct > 95) {
    suggestions.push(
      "You're consistently above 95%. Consider increasing your load: add more routines, raise task difficulty, or set higher weekly goals."
    );
  } else if (scorePct > 90) {
    suggestions.push(
      "Great consistency. Try adding one more meaningful routine this week."
    );
  } else if (scorePct > 80) {
    suggestions.push(
      "Good progress. Focus on finishing medium-priority tasks to push above 90%."
    );
  } else if (scorePct > 70) {
    suggestions.push(
      "Regular performance. Trim time sinks and complete small tasks to build momentum."
    );
  } else if (scorePct > 50) {
    suggestions.push(
      "Below target. Pick three quick wins today and schedule a short focus session."
    );
  } else {
    suggestions.push(
      "Very low consistency. Start micro-habits: 10-minute tasks and one routine per day."
    );
  }

  return {
    scorePct: clamp(scorePct),
    level,
    thresholds: EXCELLENCE_THRESHOLDS,
    suggestions,
    sampleSizes: {
      tasks: tasks.length,
      routinesDays: (getStorageItem<any[]>("dailyLogs") ?? []).length,
      applications: apps.length,
      financesMonths: financialLogs.length,
    },
  };
}
