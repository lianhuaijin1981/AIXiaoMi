import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userProfiles } from "@db/schema";

export const userRouter = createRouter({
  // Get current user profile
  profile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, ctx.user.id));
    return profile || null;
  }),

  // Create or update profile
  upsertProfile: authedQuery
    .input(
      z.object({
        activePersona: z.enum(["lingzhi", "huge", "wukong", "ruoqi"]).optional(),
        age: z.number().int().min(1).max(120).optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        height: z.number().int().min(50).max(250).optional(),
        weight: z.number().int().min(20).max(300).optional(),
        skinType: z.string().max(50).optional(),
        bodyType: z.string().max(50).optional(),
        tcmConstitution: z.string().max(50).optional(),
        fitnessGoal: z.string().max(100).optional(),
        sleepGoal: z.string().max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [existing] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));

      if (existing) {
        await db
          .update(userProfiles)
          .set({ ...input })
          .where(eq(userProfiles.userId, userId));
        const [updated] = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId));
        return updated;
      } else {
        await db.insert(userProfiles).values({ userId, ...input });
        const [created] = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId));
        return created;
      }
    }),

  // Update streak days
  updateStreak: authedQuery
    .input(z.object({ streakDays: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, ctx.user.id));

      if (profile) {
        await db
          .update(userProfiles)
          .set({ streakDays: input.streakDays })
          .where(eq(userProfiles.userId, ctx.user.id));
        const [updated] = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, ctx.user.id));
        return updated;
      }
      return null;
    }),
});
