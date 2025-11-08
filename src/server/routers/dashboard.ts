/**
 * Dashboard, Settings, and Utility Routers
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  DashboardCardConfigSchema,
  DailyApplicationLogSchema,
  DailyGoalLogSchema,
  DailyTaskLogSchema,
  AppTimeTrackingSettingsSchema,
} from "@/lib/schemas";

export const dashboardRouter = router({
  cards: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.dashboardCard.findMany({
        where: { userId: ctx.userId },
        orderBy: { position: "asc" },
      });
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          subtext: z.string(),
          icon: z.string(),
          visualization: z.string(),
          config: DashboardCardConfigSchema.default({
            feature: "applications",
            metric: "total",
          }),
          position: z.number().optional(),
          isVisible: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.dashboardCard.create({
          data: {
            ...input,
            userId: ctx.userId!,
            config: input.config || {},
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          subtext: z.string().optional(),
          icon: z.string().optional(),
          visualization: z.string().optional(),
          config: DashboardCardConfigSchema.optional(),
          position: z.number().optional(),
          isVisible: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.dashboardCard.update({
          where: { id, userId: ctx.userId },
          data,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.dashboardCard.delete({
          where: { id: input.id, userId: ctx.userId },
        });
      }),

    reorder: protectedProcedure
      .input(
        z.object({
          cardIds: z.array(z.string()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updates = input.cardIds.map((id, index) =>
          ctx.prisma.dashboardCard.update({
            where: { id, userId: ctx.userId },
            data: { position: index },
          })
        );
        return await Promise.all(updates);
      }),
  }),

  dailyLogs: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.dailyLog.findMany({
        where: { userId: ctx.userId },
        orderBy: { date: "desc" },
      });
    }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.prisma.dailyLog.findUnique({
          where: {
            userId_date: {
              userId: ctx.userId!,
              date: new Date(input.date),
            },
          },
        });
      }),

    upsert: protectedProcedure
      .input(
        z.object({
          date: z.string(),
          applications: z.array(DailyApplicationLogSchema),
          goals: z.array(DailyGoalLogSchema),
          tasks: z.array(DailyTaskLogSchema),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.dailyLog.upsert({
          where: {
            userId_date: {
              userId: ctx.userId!,
              date: new Date(input.date),
            },
          },
          create: {
            ...input,
            userId: ctx.userId!,
            date: new Date(input.date),
          },
          update: {
            applications: input.applications,
            goals: input.goals,
            tasks: input.tasks,
          },
        });
      }),
  }),
});

export const settingsRouter = router({
  appSettings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.appSettings.findUnique({
        where: { userId: ctx.userId! },
      });
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          timeTracking: AppTimeTrackingSettingsSchema.default({
            gameHours: 0,
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.appSettings.upsert({
          where: { userId: ctx.userId! },
          create: {
            ...input,
            userId: ctx.userId!,
            timeTracking: input.timeTracking || {},
          },
          update: {
            timeTracking: input.timeTracking,
          },
        });
      }),
  }),

  flashReminders: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.flashReminder.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
      });
    }),

    create: protectedProcedure
      .input(
        z.object({
          text: z.string(),
          trigger: z.string(),
          timeOfDay: z.string().optional(),
          enabled: z.boolean().optional(),
          allowInFocus: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.flashReminder.create({
          data: {
            ...input,
            userId: ctx.userId!,
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          text: z.string().optional(),
          trigger: z.string().optional(),
          timeOfDay: z.string().optional(),
          enabled: z.boolean().optional(),
          allowInFocus: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.flashReminder.update({
          where: { id, userId: ctx.userId },
          data,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.flashReminder.delete({
          where: { id: input.id, userId: ctx.userId },
        });
      }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.userId! },
      });
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          title: z.string().optional(),
          education: z.string().optional(),
          experience: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.userProfile.upsert({
          where: { userId: ctx.userId! },
          create: {
            ...input,
            userId: ctx.userId!,
            experience: input.experience || [],
          },
          update: input,
        });
      }),
  }),
});
