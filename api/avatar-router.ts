import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { avatars, personas } from "@db/schema";

export const avatarRouter = createRouter({
  // 获取当前用户的数字分身
  getMyAvatar: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [avatar] = await db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, ctx.user.id));
    return avatar || null;
  }),

  // 创建/更新数字分身画像
  upsertAvatar: authedQuery
    .input(
      z.object({
        faceShape: z.string().max(50).optional(),
        skinTone: z.string().max(50).optional(),
        hairType: z.string().max(50).optional(),
        hairColor: z.string().max(50).optional(),
        bodyShape: z.string().max(50).optional(),
        height: z.number().int().min(50).max(250).optional(),
        weight: z.number().int().min(20).max(300).optional(),
        shoulderWidth: z.number().int().optional(),
        waistWidth: z.number().int().optional(),
        hipWidth: z.number().int().optional(),
        faceFeatures: z.string().optional(), // JSON
        frontPhotoUrl: z.string().optional(),
        sidePhotoUrl: z.string().optional(),
        fullBodyPhotoUrl: z.string().optional(),
        activePersona: z.enum(["lingzhi", "huge", "wukong", "ruoqi"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [existing] = await db
        .select()
        .from(avatars)
        .where(eq(avatars.userId, userId));

      if (existing) {
        await db.update(avatars).set({ ...input }).where(eq(avatars.userId, userId));
        const [updated] = await db.select().from(avatars).where(eq(avatars.userId, userId));
        return updated;
      } else {
        await db.insert(avatars).values({ userId, ...input });
        const [created] = await db.select().from(avatars).where(eq(avatars.userId, userId));
        return created;
      }
    }),

  // 切换活跃人设
  switchPersona: authedQuery
    .input(z.object({ personaKey: z.enum(["lingzhi", "huge", "wukong", "ruoqi"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [existing] = await db.select().from(avatars).where(eq(avatars.userId, ctx.user.id));

      if (existing) {
        await db.update(avatars).set({ activePersona: input.personaKey }).where(eq(avatars.userId, ctx.user.id));
      } else {
        await db.insert(avatars).values({ userId: ctx.user.id, activePersona: input.personaKey });
      }

      const [updated] = await db.select().from(avatars).where(eq(avatars.userId, ctx.user.id));
      return updated;
    }),

  // 获取所有人设列表
  listPersonas: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(personas)
      .where(eq(personas.isActive, true))
      .orderBy(personas.sortOrder);
    return rows;
  }),

  // 获取单个人设详情
  getPersona: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [row] = await db
        .select()
        .from(personas)
        .where(eq(personas.personaKey, input.key));
      return row || null;
    }),
});
