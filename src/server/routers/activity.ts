/**
 * Pomodoro, Time Tracking, and Journal Routers
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const pomodoroRouter = router({
  // Pomodoro Sessions
  sessions: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.pomodoroSession.findMany({
        where: { userId: ctx.userId },
        orderBy: { startedAt: "desc" },
      });
    }),

    create: protectedProcedure
      .input(
        z.object({
          startedAt: z.string(),
          endedAt: z.string().optional(),
          kind: z.enum(["work", "break", "long-break"]),
          completed: z.boolean(),
          category: z.string().optional(),
          wasTrulyProductive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.pomodoroSession.create({
          data: {
            ...input,
            userId: ctx.userId!,
            startedAt: new Date(input.startedAt),
            endedAt: input.endedAt ? new Date(input.endedAt) : null,
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          endedAt: z.string().optional(),
          completed: z.boolean().optional(),
          wasTrulyProductive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.pomodoroSession.update({
          where: { id, userId: ctx.userId },
          data: {
            ...data,
            endedAt: data.endedAt ? new Date(data.endedAt) : undefined,
          },
        });
      }),
  }),

  // Pomodoro Settings
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.pomodoroSettings.findUnique({
        where: { userId: ctx.userId! },
      });
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          workMin: z.number(),
          breakMin: z.number(),
          longBreakMin: z.number(),
          cyclesUntilLong: z.number(),
          sound: z.boolean(),
          desktopNotifications: z.boolean(),
          vibration: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.pomodoroSettings.upsert({
          where: { userId: ctx.userId! },
          create: {
            ...input,
            userId: ctx.userId!,
          },
          update: input,
        });
      }),
  }),
});

export const timeTrackingRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.timeTrackingEntry.findMany({
      where: { userId: ctx.userId },
      orderBy: { date: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        activityType: z.enum(["game", "app"]),
        name: z.string(),
        date: z.string(),
        hours: z.number(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.timeTrackingEntry.create({
        data: {
          ...input,
          userId: ctx.userId!,
          date: new Date(input.date),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        activityType: z.enum(["game", "app"]).optional(),
        name: z.string().optional(),
        date: z.string().optional(),
        hours: z.number().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.timeTrackingEntry.update({
        where: { id, userId: ctx.userId },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.timeTrackingEntry.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),
});

export const journalRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.journalEntry.findMany({
      where: { userId: ctx.userId },
      orderBy: { dateISO: "desc" },
    });
  }),

  getByDate: protectedProcedure
    .input(z.object({ dateISO: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.journalEntry.findUnique({
        where: {
          userId_dateISO: {
            userId: ctx.userId!,
            dateISO: input.dateISO,
          },
        },
      });
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        dateISO: z.string(),
        mood: z.enum(["low", "ok", "high"]).optional(),
        lines: z.array(z.string()),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.journalEntry.upsert({
        where: {
          userId_dateISO: {
            userId: ctx.userId!,
            dateISO: input.dateISO,
          },
        },
        create: {
          ...input,
          userId: ctx.userId!,
          tags: input.tags || [],
        },
        update: {
          mood: input.mood,
          lines: input.lines,
          tags: input.tags || [],
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ dateISO: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.journalEntry.delete({
        where: {
          userId_dateISO: {
            userId: ctx.userId!,
            dateISO: input.dateISO,
          },
        },
      });
    }),
});
