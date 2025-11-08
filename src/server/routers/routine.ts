/**
 * Routine Router
 * Handles CRUD operations for Routines and Checkmarks
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { RoutineReflectionSchema } from "@/lib/schemas";

export const routineRouter = router({
  // Get all routines
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.routineItem.findMany({
      where: { userId: ctx.userId },
      include: { checkmarks: true },
      orderBy: { order: "asc" },
    });
  }),

  // Create routine
  create: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        title: z.string().min(1),
        frequency: z.enum(["daily", "weekly", "monthly", "every3days"]),
        active: z.boolean().optional(),
        order: z.number().optional(),
        routineType: z
          .enum(["study", "code", "job-search", "finances", "general"])
          .optional(),
        requiresReflection: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.routineItem.create({
        data: {
          ...input,
          userId: ctx.userId!,
        },
      });
    }),

  // Update routine
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        category: z.string().optional(),
        title: z.string().min(1).optional(),
        frequency: z
          .enum(["daily", "weekly", "monthly", "every3days"])
          .optional(),
        active: z.boolean().optional(),
        order: z.number().optional(),
        routineType: z
          .enum(["study", "code", "job-search", "finances", "general"])
          .optional(),
        requiresReflection: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.routineItem.update({
        where: { id, userId: ctx.userId },
        data,
      });
    }),

  // Delete routine
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.routineItem.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  // Checkmark operations
  getCheckmarks: protectedProcedure
    .input(
      z.object({
        routineId: z.string().optional(),
        dateISO: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.checkmark.findMany({
        where: {
          userId: ctx.userId,
          ...(input.routineId && { routineId: input.routineId }),
          ...(input.dateISO && { dateISO: input.dateISO }),
        },
      });
    }),

  toggleCheckmark: protectedProcedure
    .input(
      z.object({
        routineId: z.string(),
        dateISO: z.string(),
        done: z.boolean(),
        reflection: RoutineReflectionSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.checkmark.upsert({
        where: {
          routineId_dateISO: {
            routineId: input.routineId,
            dateISO: input.dateISO,
          },
        },
        create: {
          userId: ctx.userId!,
          routineId: input.routineId,
          dateISO: input.dateISO,
          done: input.done,
          reflection: input.reflection,
        },
        update: {
          done: input.done,
          reflection: input.reflection,
        },
      });
    }),
});
