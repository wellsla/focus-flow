/**
 * Application Router
 * Handles CRUD operations for Job Applications
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { AchievementConditionSchema } from "@/lib/schemas"; // reuse record primitive types if needed later

// Application Comment & Deep Workflow Schemas for stronger typing
const ApplicationCommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(), // ISO
});

const DeepWorkflowSchema = z.object({
  step1_found: z
    .object({
      jobUrl: z.string(),
      foundDate: z.string(),
      source: z.string(),
    })
    .optional(),
  step2_readDescription: z
    .object({
      completed: z.boolean(),
      keyRequirements: z.string(),
      dealbreakers: z.string().optional(),
      notes: z.string(),
    })
    .optional(),
  step3_companyResearch: z
    .object({
      completed: z.boolean(),
      whatTheyDo: z.string(),
      whyThisRole: z.string(),
    })
    .optional(),
  step4_writeInformation: z
    .object({
      completed: z.boolean(),
      whyGoodFit: z.string(),
    })
    .optional(),
  step5_apply: z
    .object({
      completed: z.boolean(),
      appliedDate: z.string().optional(),
    })
    .optional(),
  step6_contact: z
    .object({
      completed: z.boolean(),
      contactedPerson: z.string().optional(),
      contactMethod: z.enum(["LinkedIn", "Email", "Phone", "Other"]).optional(),
      followUpPlan: z.string().optional(),
    })
    .optional(),
});

export const applicationRouter = router({
  // Get all applications
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.jobApplication.findMany({
      where: { userId: ctx.userId },
      orderBy: { dateApplied: "desc" },
    });
  }),

  // Get by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.jobApplication.findUnique({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  // Create application
  create: protectedProcedure
    .input(
      z.object({
        company: z.string().min(1),
        role: z.string().min(1),
        dateApplied: z.string(),
        status: z.enum([
          "Applied",
          "Interviewing",
          "Offer",
          "Rejected",
          "Wishlist",
        ]),
        url: z.string().url(),
        priority: z.enum(["High", "Common", "Uninterested"]),
        description: z.string().optional(),
        comments: z.array(ApplicationCommentSchema).optional(),
        deepWorkflow: DeepWorkflowSchema.optional(),
        applicationDepthScore: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.jobApplication.create({
        data: {
          ...input,
          userId: ctx.userId!,
          dateApplied: new Date(input.dateApplied),
          comments: input.comments || [],
        },
      });
    }),

  // Update application
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        company: z.string().min(1).optional(),
        role: z.string().min(1).optional(),
        dateApplied: z.string().optional(),
        status: z
          .enum(["Applied", "Interviewing", "Offer", "Rejected", "Wishlist"])
          .optional(),
        url: z.string().url().optional(),
        priority: z.enum(["High", "Common", "Uninterested"]).optional(),
        description: z.string().optional(),
        comments: z.array(ApplicationCommentSchema).optional(),
        deepWorkflow: DeepWorkflowSchema.optional(),
        applicationDepthScore: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.jobApplication.update({
        where: { id, userId: ctx.userId },
        data: {
          ...data,
          dateApplied: data.dateApplied
            ? new Date(data.dateApplied)
            : undefined,
        },
      });
    }),

  // Delete application
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.jobApplication.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  // Get by status
  getByStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum([
          "Applied",
          "Interviewing",
          "Offer",
          "Rejected",
          "Wishlist",
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.jobApplication.findMany({
        where: {
          userId: ctx.userId,
          status: input.status,
        },
        orderBy: { dateApplied: "desc" },
      });
    }),
});
