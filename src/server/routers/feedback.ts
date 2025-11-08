/**
 * Feedback Router
 * Aggregates records across features and generates AI feedback in markdown.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { getFeedbackInsights } from "@/ai/flows/feedback-insights";

const RecordTypeEnum = z.enum([
  "application",
  "goal",
  "task",
  "pomodoro",
  "timeTracking",
  "finance",
  "journal",
]);

const FiltersSchema = z.object({
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  types: z.array(RecordTypeEnum).optional(),
});

export type UnifiedRecord = {
  id: string;
  type: z.infer<typeof RecordTypeEnum>;
  date: string; // ISO
  title: string;
  details?: string | null;
  meta?: Record<string, unknown> | null;
};

function inRange(date: Date, start?: string, end?: string) {
  if (start && date < new Date(start)) return false;
  if (end && date > new Date(end)) return false;
  return true;
}

import type { Context } from "../context";

async function fetchUnifiedRecords(
  ctx: Context,
  input: z.infer<typeof FiltersSchema>
): Promise<UnifiedRecord[]> {
  const { startDate, endDate } = input;
  const only = new Set(
    input.types ?? [
      "application",
      "goal",
      "task",
      "pomodoro",
      "timeTracking",
      "finance",
      "journal",
    ]
  );

  const results: UnifiedRecord[] = [];

  // Applications
  if (only.has("application")) {
    const apps = await ctx.prisma.jobApplication.findMany({
      where: { userId: ctx.userId! },
      orderBy: { dateApplied: "desc" },
    });
    for (const a of apps) {
      const d =
        a.dateApplied instanceof Date ? a.dateApplied : new Date(a.dateApplied);
      if (!inRange(d, startDate, endDate)) continue;
      results.push({
        id: a.id,
        type: "application",
        date: d.toISOString(),
        title: `${a.status}: ${a.role} @ ${a.company}`,
        details: a.description ?? null,
        meta: { priority: a.priority, url: a.url },
      });
    }
  }

  // Goals
  if (only.has("goal")) {
    const goals = await ctx.prisma.goal.findMany({
      where: { userId: ctx.userId! },
      orderBy: { createdAt: "desc" },
    });
    for (const g of goals) {
      const d =
        g.createdAt instanceof Date ? g.createdAt : new Date(g.createdAt);
      if (!inRange(d, startDate, endDate)) continue;
      results.push({
        id: g.id,
        type: "goal",
        date: d.toISOString(),
        title: `${g.goalType}: ${g.title} (${g.status})`,
        details: g.description ?? null,
        meta: { timeframe: g.timeframe, targetDate: g.targetDate },
      });
    }
  }

  // Tasks
  if (only.has("task")) {
    const tasks = await ctx.prisma.task.findMany({
      where: { userId: ctx.userId! },
      orderBy: { createdAt: "desc" },
    });
    for (const t of tasks) {
      const d =
        t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
      if (!inRange(d, startDate, endDate)) continue;
      results.push({
        id: t.id,
        type: "task",
        date: d.toISOString(),
        title: `Task: ${t.title} (${t.status})`,
        details: t.description ?? null,
        meta: {
          priority: t.priority,
          dueDate: t.dueDate,
          completedDate: t.completedDate,
        },
      });
    }
  }

  // Pomodoro Sessions
  if (only.has("pomodoro")) {
    const sessions = await ctx.prisma.pomodoroSession.findMany({
      where: { userId: ctx.userId! },
      orderBy: { startedAt: "desc" },
    });
    for (const s of sessions) {
      const d =
        s.startedAt instanceof Date ? s.startedAt : new Date(s.startedAt);
      if (!inRange(d, startDate, endDate)) continue;
      results.push({
        id: s.id,
        type: "pomodoro",
        date: d.toISOString(),
        title: `Pomodoro: ${s.kind}${s.completed ? " (completed)" : ""}`,
        details: s.category ?? null,
        meta: { endedAt: s.endedAt, productive: s.wasTrulyProductive },
      });
    }
  }

  // Time Tracking
  if (only.has("timeTracking")) {
    const entries = await ctx.prisma.timeTrackingEntry.findMany({
      where: { userId: ctx.userId! },
      orderBy: { date: "desc" },
    });
    for (const e of entries) {
      const d = e.date instanceof Date ? e.date : new Date(e.date);
      if (!inRange(d, startDate, endDate)) continue;
      results.push({
        id: e.id,
        type: "timeTracking",
        date: d.toISOString(),
        title: `Time: ${e.activityType} - ${e.name} (${e.hours}h)`,
        details:
          e.startTime && e.endTime ? `${e.startTime} - ${e.endTime}` : null,
        meta: {},
      });
    }
  }

  // Finance Logs
  if (only.has("finance")) {
    const logs = await ctx.prisma.financialLog.findMany({
      where: { userId: ctx.userId! },
      orderBy: { date: "desc" },
    });
    for (const f of logs) {
      const d = f.date instanceof Date ? f.date : new Date(f.date);
      if (!inRange(d, startDate, endDate)) continue;
      results.push({
        id: f.id,
        type: "finance",
        date: d.toISOString(),
        title: `Finance: Net ${f.currency} ${f.net.toFixed(2)}`,
        details: `Income ${f.currency} ${f.totalIncome.toFixed(2)} | Expenses ${
          f.currency
        } ${f.totalExpenses.toFixed(2)} | Debt ${
          f.currency
        } ${f.totalDebt.toFixed(2)}`,
        meta: {},
      });
    }
  }

  // Journal entries
  if (only.has("journal")) {
    const journals = await ctx.prisma.journalEntry.findMany({
      where: { userId: ctx.userId! },
      orderBy: { dateISO: "desc" },
    });
    for (const j of journals) {
      const d = new Date(j.dateISO); // stored as string yyyy-MM-dd
      if (!inRange(d, startDate, endDate)) continue;
      results.push({
        id: j.id,
        type: "journal",
        date: d.toISOString(),
        title: `Journal: ${j.mood ?? "neutral"}`,
        details: (j.lines ?? []).slice(0, 3).join(" | ") || null,
        meta: { tags: j.tags ?? [] },
      });
    }
  }

  results.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return results;
}

export const feedbackRouter = router({
  getRecords: protectedProcedure
    .input(FiltersSchema)
    .query(async ({ ctx, input }): Promise<UnifiedRecord[]> => {
      const { startDate, endDate } = input;
      const only = new Set(
        input.types ?? [
          "application",
          "goal",
          "task",
          "pomodoro",
          "timeTracking",
          "finance",
          "journal",
        ]
      );

      const results: UnifiedRecord[] = [];

      // Applications
      if (only.has("application")) {
        const apps = await ctx.prisma.jobApplication.findMany({
          where: { userId: ctx.userId },
          orderBy: { dateApplied: "desc" },
        });
        for (const a of apps) {
          const d =
            a.dateApplied instanceof Date
              ? a.dateApplied
              : new Date(String(a.dateApplied));
          if (!inRange(d, startDate, endDate)) continue;
          results.push({
            id: a.id,
            type: "application",
            date: d.toISOString(),
            title: `${a.status}: ${a.role} @ ${a.company}`,
            details: a.description ?? null,
            meta: { priority: a.priority, url: a.url },
          });
        }
      }

      // Goals
      if (only.has("goal")) {
        const goals = await ctx.prisma.goal.findMany({
          where: { userId: ctx.userId },
          orderBy: { createdAt: "desc" },
        });
        for (const g of goals) {
          const d =
            g.createdAt instanceof Date
              ? g.createdAt
              : new Date(String(g.createdAt));
          if (!inRange(d, startDate, endDate)) continue;
          results.push({
            id: g.id,
            type: "goal",
            date: d.toISOString(),
            title: `${g.goalType}: ${g.title} (${g.status})`,
            details: g.description ?? null,
            meta: { timeframe: g.timeframe, targetDate: g.targetDate },
          });
        }
      }

      // Tasks
      if (only.has("task")) {
        const tasks = await ctx.prisma.task.findMany({
          where: { userId: ctx.userId },
          orderBy: { createdAt: "desc" },
        });
        for (const t of tasks) {
          const d =
            t.createdAt instanceof Date
              ? t.createdAt
              : new Date(String(t.createdAt));
          if (!inRange(d, startDate, endDate)) continue;
          results.push({
            id: t.id,
            type: "task",
            date: d.toISOString(),
            title: `Task: ${t.title} (${t.status})`,
            details: t.description ?? null,
            meta: {
              priority: t.priority,
              dueDate: t.dueDate,
              completedDate: t.completedDate,
            },
          });
        }
      }

      // Pomodoro Sessions
      if (only.has("pomodoro")) {
        const sessions = await ctx.prisma.pomodoroSession.findMany({
          where: { userId: ctx.userId },
          orderBy: { startedAt: "desc" },
        });
        for (const s of sessions) {
          const d =
            s.startedAt instanceof Date
              ? s.startedAt
              : new Date(String(s.startedAt));
          if (!inRange(d, startDate, endDate)) continue;
          results.push({
            id: s.id,
            type: "pomodoro",
            date: d.toISOString(),
            title: `Pomodoro: ${s.kind}${s.completed ? " (completed)" : ""}`,
            details: s.category ?? null,
            meta: { endedAt: s.endedAt, productive: s.wasTrulyProductive },
          });
        }
      }

      // Time Tracking
      if (only.has("timeTracking")) {
        const entries = await ctx.prisma.timeTrackingEntry.findMany({
          where: { userId: ctx.userId },
          orderBy: { date: "desc" },
        });
        for (const e of entries) {
          const d = e.date instanceof Date ? e.date : new Date(String(e.date));
          if (!inRange(d, startDate, endDate)) continue;
          results.push({
            id: e.id,
            type: "timeTracking",
            date: d.toISOString(),
            title: `Time: ${e.activityType} - ${e.name} (${e.hours}h)`,
            details:
              e.startTime && e.endTime ? `${e.startTime} - ${e.endTime}` : null,
            meta: {},
          });
        }
      }

      // Finance Logs
      if (only.has("finance")) {
        const logs = await ctx.prisma.financialLog.findMany({
          where: { userId: ctx.userId },
          orderBy: { date: "desc" },
        });
        for (const f of logs) {
          const d = f.date instanceof Date ? f.date : new Date(String(f.date));
          if (!inRange(d, startDate, endDate)) continue;
          results.push({
            id: f.id,
            type: "finance",
            date: d.toISOString(),
            title: `Finance: Net ${f.currency} ${f.net.toFixed(2)}`,
            details: `Income ${f.currency} ${f.totalIncome.toFixed(
              2
            )} | Expenses ${f.currency} ${f.totalExpenses.toFixed(2)} | Debt ${
              f.currency
            } ${f.totalDebt.toFixed(2)}`,
            meta: {},
          });
        }
      }

      // Journal entries
      if (only.has("journal")) {
        const journals = await ctx.prisma.journalEntry.findMany({
          where: { userId: ctx.userId },
          orderBy: { dateISO: "desc" },
        });
        for (const j of journals) {
          // dateISO is stored as string yyyy-MM-dd
          const d = new Date(String(j.dateISO));
          if (!inRange(d, startDate, endDate)) continue;
          results.push({
            id: j.id,
            type: "journal",
            date: d.toISOString(),
            title: `Journal: ${j.mood ?? "neutral"}`,
            details: (j.lines ?? []).slice(0, 3).join(" | ") || null,
            meta: { tags: j.tags ?? [] },
          });
        }
      }

      return fetchUnifiedRecords(ctx, input);
    }),

  generate: protectedProcedure
    .input(
      z.object({
        filters: FiltersSchema,
        // Optional override: explicit record IDs to focus on
        focusIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Reuse getRecords logic
      const records = await fetchUnifiedRecords(ctx, input.filters);

      const filtered = input.focusIds?.length
        ? records.filter((r) => input.focusIds!.includes(r.id))
        : records;

      // Summarize into a compact text for the LLM
      const summary = filtered
        .slice(0, 200) // safety cap
        .map(
          (r) =>
            `- [${r.type}] ${new Date(r.date).toISOString().slice(0, 10)}: ${
              r.title
            }${r.details ? ` — ${r.details}` : ""}`
        )
        .join("\n");

      const { feedbackMarkdown } = await getFeedbackInsights({
        recordsSummary: summary,
        persona: "skeptical-philosophical-wise-boss",
      });

      return {
        markdown: feedbackMarkdown,
        recordCount: filtered.length,
      };
    }),
});
