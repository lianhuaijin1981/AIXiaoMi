import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tasks } from "@db/schema";

export const taskRouter = createRouter({
  // List all tasks for current user
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, ctx.user.id))
      .orderBy(desc(tasks.createdAt));
    return rows;
  }),

  // Create a new task
  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        category: z.string().max(50).default("general"),
        priority: z.enum(["high", "medium", "low"]).default("medium"),
        dueTime: z.string().max(10).optional(),
        dueDate: z.string().datetime().optional(),
        repeatPattern: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(tasks).values({
        userId: ctx.user.id,
        title: input.title,
        category: input.category,
        priority: input.priority,
        dueTime: input.dueTime,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        repeatPattern: input.repeatPattern,
      });
      // Fetch the newly created task
      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, ctx.user.id))
        .orderBy(desc(tasks.createdAt))
        .limit(1);
      return task;
    }),

  // Toggle task completion
  toggle: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
      if (!existing) throw new Error("Task not found");

      await db
        .update(tasks)
        .set({ completed: !existing.completed })
        .where(eq(tasks.id, input.id));

      const [updated] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.id));
      return updated;
    }),

  // Update a task
  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        category: z.string().max(50).optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        dueTime: z.string().max(10).optional(),
        dueDate: z.string().datetime().optional(),
        repeatPattern: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      const [existing] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.user.id)));
      if (!existing) throw new Error("Task not found");

      const updateData: Record<string, any> = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.category) updateData.category = updates.category;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.dueTime !== undefined) updateData.dueTime = updates.dueTime;
      if (updates.dueDate !== undefined) updateData.dueDate = new Date(updates.dueDate);
      if (updates.repeatPattern !== undefined) updateData.repeatPattern = updates.repeatPattern;

      await db.update(tasks).set(updateData).where(eq(tasks.id, id));

      const [updated] = await db.select().from(tasks).where(eq(tasks.id, id));
      return updated;
    }),

  // Delete a task
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
      return { success: true };
    }),
});
