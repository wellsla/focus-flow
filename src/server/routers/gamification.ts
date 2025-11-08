/**
 * Rewards, Achievements, and Roadmap Routers
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  AchievementConditionSchema,
  RewardConditionSchema,
  RoadmapNodeJsonSchema,
} from "@/lib/schemas";

export const achievementRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.achievement.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        icon: z.string(),
        gemReward: z.number(),
        condition: AchievementConditionSchema.default({
          type: "custom",
          target: 0,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.achievement.create({
        data: {
          userId: ctx.userId!,
          title: input.title,
          description: input.description,
          category: input.category,
          icon: input.icon,
          gemReward: input.gemReward,
          condition: input.condition ?? {},
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isUnlocked: z.boolean().optional(),
        isRevoked: z.boolean().optional(),
        unlockedAt: z.string().optional(),
        revokedAt: z.string().optional(),
        condition: AchievementConditionSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.achievement.update({
        where: { id, userId: ctx.userId },
        data: {
          ...data,
          unlockedAt: data.unlockedAt ? new Date(data.unlockedAt) : undefined,
          revokedAt: data.revokedAt ? new Date(data.revokedAt) : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.achievement.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),
});

export const rewardRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.reward.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        type: z.enum(["conditional", "purchasable"]),
        icon: z.string(),
        category: z.string(),
        conditions: z.array(RewardConditionSchema).optional(),
        resetFrequency: z.string().optional(),
        gemCost: z.number().optional(),
        isOneTime: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.reward.create({
        data: {
          ...input,
          userId: ctx.userId!,
          conditions: input.conditions || [],
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isUnlocked: z.boolean().optional(),
        isPurchased: z.boolean().optional(),
        purchasedAt: z.string().optional(),
        lastResetAt: z.string().optional(),
        timesUsed: z.number().optional(),
        conditions: z.array(RewardConditionSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.reward.update({
        where: { id, userId: ctx.userId },
        data: {
          ...data,
          purchasedAt: data.purchasedAt
            ? new Date(data.purchasedAt)
            : undefined,
          lastResetAt: data.lastResetAt
            ? new Date(data.lastResetAt)
            : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.reward.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),
});

export const rewardStateRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.rewardState.findUnique({
      where: { userId: ctx.userId! },
    });
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        gems: z.number().optional(),
        totalGemsEarned: z.number().optional(),
        totalGemsSpent: z.number().optional(),
        points: z.number().optional(),
        streakDays: z.number().optional(),
        lastCheckDate: z.string().optional(),
        unlockedAchievementIds: z.array(z.string()).optional(),
        purchasedRewardIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.rewardState.upsert({
        where: { userId: ctx.userId! },
        create: {
          ...input,
          userId: ctx.userId!,
          lastCheckDate: input.lastCheckDate
            ? new Date(input.lastCheckDate)
            : null,
          unlockedAchievementIds: input.unlockedAchievementIds || [],
          purchasedRewardIds: input.purchasedRewardIds || [],
        },
        update: {
          ...input,
          lastCheckDate: input.lastCheckDate
            ? new Date(input.lastCheckDate)
            : undefined,
        },
      });
    }),
});

export const roadmapRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.roadmapNode.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        status: z.string(),
        parentId: z.string().optional(),
        children: z.array(RoadmapNodeJsonSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.roadmapNode.create({
        data: {
          ...input,
          userId: ctx.userId!,
          children: input.children || [],
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        status: z.string().optional(),
        children: z.array(RoadmapNodeJsonSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.roadmapNode.update({
        where: { id, userId: ctx.userId },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.roadmapNode.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),
});
