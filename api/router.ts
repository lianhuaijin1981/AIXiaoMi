import { authRouter } from "./auth-router";
import { chatRouter } from "./chat-router";
import { taskRouter } from "./task-router";
import { scheduleRouter } from "./schedule-router";
import { userRouter } from "./user-router";
import { knowledgeRouter } from "./knowledge-router";
import { avatarRouter } from "./avatar-router";
import { pushRouter } from "./push-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  chat: chatRouter,
  task: taskRouter,
  schedule: scheduleRouter,
  user: userRouter,
  knowledge: knowledgeRouter,
  avatar: avatarRouter,
  push: pushRouter,
});

export type AppRouter = typeof appRouter;
