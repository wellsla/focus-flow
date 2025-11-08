/**
 * Goal Router
 * Handles CRUD operations for Goals
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const goalRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.goal.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.goal.findUnique({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        timeframe: z.enum(["Short-Term", "Mid-Term", "Long-Term"]),
        status: z.enum(["Not Started", "In Progress", "Achieved"]),
        targetDate: z.string().optional(),
        goalType: z.enum(["Goal", "Anti-Goal"]),
        actionSteps: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.goal.create({
        data: {
          ...input,
          userId: ctx.userId!,
          targetDate: input.targetDate ? new Date(input.targetDate) : null,
          actionSteps: input.actionSteps || [],
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        timeframe: z.enum(["Short-Term", "Mid-Term", "Long-Term"]).optional(),
        status: z.enum(["Not Started", "In Progress", "Achieved"]).optional(),
        targetDate: z.string().optional(),
        goalType: z.enum(["Goal", "Anti-Goal"]).optional(),
        actionSteps: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.goal.update({
        where: { id, userId: ctx.userId },
        data: {
          ...data,
          targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.goal.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  getByStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["Not Started", "In Progress", "Achieved"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.goal.findMany({
        where: {
          userId: ctx.userId,
          status: input.status,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getByTimeframe: protectedProcedure
    .input(
      z.object({
        timeframe: z.enum(["Short-Term", "Mid-Term", "Long-Term"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.goal.findMany({
        where: {
          userId: ctx.userId,
          timeframe: input.timeframe,
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
