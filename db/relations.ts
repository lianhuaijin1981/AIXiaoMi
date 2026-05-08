import { relations } from "drizzle-orm";
import {
  users, avatars, messages, tasks, events,
  contacts, transactions
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  avatar: one(avatars, {
    fields: [users.id],
    references: [avatars.userId],
  }),
  messages: many(messages),
  tasks: many(tasks),
  events: many(events),
  contacts: many(contacts),
  transactions: many(transactions),
}));

export const avatarsRelations = relations(avatars, ({ one }) => ({
  user: one(users, {
    fields: [avatars.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));
