import { z } from "zod";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { events } from "@db/schema";

export const scheduleRouter = createRouter({
  // List events for a date range
  list: authedQuery
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(events.userId, ctx.user.id)];

      if (input?.startDate) {
        conditions.push(gte(events.startTime, new Date(input.startDate)));
      }
      if (input?.endDate) {
        conditions.push(lte(events.startTime, new Date(input.endDate)));
      }

      const rows = await db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(desc(events.startTime));
      return rows;
    }),

  // Create a new event
  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        location: z.string().max(255).optional(),
        type: z.enum(["work", "personal", "health", "reminder", "social"]).default("personal"),
        startTime: z.string().datetime(),
        endTime: z.string().datetime().optional(),
        allDay: z.boolean().default(false),
        isRecurring: z.boolean().default(false),
        recurrenceRule: z.string().max(100).optional(),
        remindBefore: z.number().default(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(events).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        location: input.location,
        type: input.type,
        startTime: new Date(input.startTime),
        endTime: input.endTime ? new Date(input.endTime) : undefined,
        allDay: input.allDay,
        isRecurring: input.isRecurring,
        recurrenceRule: input.recurrenceRule,
        remindBefore: input.remindBefore,
      });
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.userId, ctx.user.id))
        .orderBy(desc(events.createdAt))
        .limit(1);
      return event;
    }),

  // Update an event
  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        location: z.string().max(255).optional(),
        type: z.enum(["work", "personal", "health", "reminder", "social"]).optional(),
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
        allDay: z.boolean().optional(),
        remindBefore: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      const [existing] = await db
        .select()
        .from(events)
        .where(and(eq(events.id, id), eq(events.userId, ctx.user.id)));
      if (!existing) throw new Error("Event not found");

      const updateData: Record<string, any> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.startTime !== undefined) updateData.startTime = new Date(updates.startTime);
      if (updates.endTime !== undefined) updateData.endTime = new Date(updates.endTime);
      if (updates.allDay !== undefined) updateData.allDay = updates.allDay;
      if (updates.remindBefore !== undefined) updateData.remindBefore = updates.remindBefore;

      await db.update(events).set(updateData).where(eq(events.id, id));
      const [updated] = await db.select().from(events).where(eq(events.id, id));
      return updated;
    }),

  // Delete an event
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(events)
        .where(and(eq(events.id, input.id), eq(events.userId, ctx.user.id)));
      return { success: true };
    }),
});
