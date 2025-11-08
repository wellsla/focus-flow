/**
 * Task Router
 * Handles CRUD operations for Tasks
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const taskRouter = router({
  // Get all tasks for user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.task.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get single task by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findUnique({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  // Create new task
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["todo", "in-progress", "done", "cancelled"]),
        priority: z.enum(["low", "medium", "high"]),
        dueDate: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.create({
        data: {
          ...input,
          userId: ctx.userId!,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          tags: input.tags || [],
        },
      });
    }),

  // Update task
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in-progress", "done", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.string().optional(),
        completedDate: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.task.update({
        where: { id, userId: ctx.userId },
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          completedDate: data.completedDate
            ? new Date(data.completedDate)
            : undefined,
        },
      });
    }),

  // Delete task
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  // Bulk operations
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.deleteMany({
        where: {
          id: { in: input.ids },
          userId: ctx.userId,
        },
      });
    }),

  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: z.enum(["todo", "in-progress", "done", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.updateMany({
        where: {
          id: { in: input.ids },
          userId: ctx.userId,
        },
        data: {
          status: input.status,
          completedDate: input.status === "done" ? new Date() : null,
        },
      });
    }),
});
