/**
 * Finance Router
 * Handles financial accounts, logs, and income settings
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const financeRouter = router({
  // Financial Accounts
  accounts: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.financialAccount.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
      });
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          type: z.enum(["expense", "debt", "income"]),
          amount: z.number(),
          currency: z.enum(["R$", "$", "€"]),
          date: z.string().optional(),
          lastPaid: z.string().optional(),
          category: z.string().optional(),
          priority: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.financialAccount.create({
          data: {
            ...input,
            userId: ctx.userId!,
            date: input.date ? new Date(input.date) : null,
            lastPaid: input.lastPaid ? new Date(input.lastPaid) : null,
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          type: z.enum(["expense", "debt", "income"]).optional(),
          amount: z.number().optional(),
          currency: z.enum(["R$", "$", "€"]).optional(),
          date: z.string().optional(),
          lastPaid: z.string().optional(),
          category: z.string().optional(),
          priority: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.financialAccount.update({
          where: { id, userId: ctx.userId },
          data: {
            ...data,
            date: data.date ? new Date(data.date) : undefined,
            lastPaid: data.lastPaid ? new Date(data.lastPaid) : undefined,
          },
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.financialAccount.delete({
          where: { id: input.id, userId: ctx.userId },
        });
      }),
  }),

  // Financial Logs
  logs: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.financialLog.findMany({
        where: { userId: ctx.userId },
        orderBy: { date: "desc" },
      });
    }),

    create: protectedProcedure
      .input(
        z.object({
          date: z.string(),
          totalIncome: z.number(),
          totalExpenses: z.number(),
          totalDebt: z.number(),
          net: z.number(),
          currency: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.financialLog.create({
          data: {
            ...input,
            userId: ctx.userId!,
            date: new Date(input.date),
          },
        });
      }),
  }),

  // Income Settings
  incomeSettings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.incomeSettings.findUnique({
        where: { userId: ctx.userId! },
      });
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          status: z.enum(["Unemployed", "Benefited", "Employed"]),
          amount: z.number(),
          frequency: z.enum(["annually", "monthly", "hourly", "daily"]),
          currency: z.string(),
          benefitsEndDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.incomeSettings.upsert({
          where: { userId: ctx.userId! },
          create: {
            ...input,
            userId: ctx.userId!,
            benefitsEndDate: input.benefitsEndDate
              ? new Date(input.benefitsEndDate)
              : null,
          },
          update: {
            ...input,
            benefitsEndDate: input.benefitsEndDate
              ? new Date(input.benefitsEndDate)
              : null,
          },
        });
      }),
  }),
});
