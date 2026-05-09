import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import webpush from "web-push";
import { getDb } from "./queries/connection";
import { userProfiles } from "@db/schema";
import { eq } from "drizzle-orm";

// 配置 web-push VAPID 密钥
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: process.env.VAPID_SUBJECT || "mailto:admin@example.com",
};

webpush.setVapidDetails(
  vapidKeys.subject,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 推送订阅存储（生产环境应使用数据库）
interface PushSubscriptionRecord {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  createdAt: Date;
}

// 内存存储（生产环境应使用数据库）
const pushSubscriptions: Map<string, PushSubscriptionRecord[]> = new Map();

export const pushRouter = createRouter({
  // 获取 VAPID 公钥（公开接口）
  getVapidPublicKey: publicQuery.query(() => {
    return {
      publicKey: vapidKeys.publicKey,
    };
  }),

  // 订阅推送通知
  subscribe: authedQuery
    .input(
      z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = getDb();

      // 检查现有订阅
      const existingSubscriptions = pushSubscriptions.get(userId) || [];
      const existingIndex = existingSubscriptions.findIndex(
        (sub) => sub.endpoint === input.endpoint
      );

      const newSubscription: PushSubscriptionRecord = {
        userId,
        endpoint: input.endpoint,
        keys: input.keys,
        userAgent: input.userAgent || "unknown",
        createdAt: new Date(),
      };

      if (existingIndex >= 0) {
        // 更新现有订阅
        existingSubscriptions[existingIndex] = newSubscription;
      } else {
        // 添加新订阅
        existingSubscriptions.push(newSubscription);
      }

      pushSubscriptions.set(userId, existingSubscriptions);

      // 可选：将订阅信息存储到数据库
      // await db.insert(pushSubscriptionsTable).values({...}).onConflictDoUpdate(...)

      return {
        success: true,
        message: "订阅成功",
      };
    }),

  // 取消订阅推送通知
  unsubscribe: authedQuery
    .input(
      z.object({
        endpoint: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const existingSubscriptions = pushSubscriptions.get(userId) || [];

      const filteredSubscriptions = existingSubscriptions.filter(
        (sub) => sub.endpoint !== input.endpoint
      );

      pushSubscriptions.set(userId, filteredSubscriptions);

      return {
        success: true,
        message: "取消订阅成功",
      };
    }),

  // 获取当前用户的推送订阅列表
  getSubscriptions: authedQuery.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const subscriptions = pushSubscriptions.get(userId) || [];
    return subscriptions;
  }),

  // 发送推送通知（需要认证，但可以限制为仅允许发送给本人或管理员）
  sendNotification: authedQuery
    .input(
      z.object({
        userId: z.string(),
        title: z.string().max(100),
        body: z.string().max(500),
        url: z.string().url().optional(),
        tag: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targetUserId = input.userId;
      const subscriptions = pushSubscriptions.get(targetUserId) || [];

      if (subscriptions.length === 0) {
        return {
          success: false,
          message: "用户未订阅推送通知",
        };
      }

      const notificationPayload = {
        title: input.title,
        body: input.body,
        url: input.url || "/",
        tag: input.tag || "default",
      };

      // 向用户的所有设备发送推送
      const results = await Promise.allSettled(
        subscriptions.map((sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys,
          };

          return webpush.sendNotification(
            pushSubscription as any,
            JSON.stringify(notificationPayload)
          );
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return {
        success: true,
        message: `推送完成：${successful} 成功，${failed} 失败`,
        details: {
          successful,
          failed,
        },
      };
    }),

  // 发送测试推送通知
  sendTestNotification: authedQuery.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const subscriptions = pushSubscriptions.get(userId) || [];

    if (subscriptions.length === 0) {
      return {
        success: false,
        message: "您尚未订阅推送通知",
      };
    }

    const notificationPayload = {
      title: "AI小蜜 - 测试通知",
      body: "这是一条测试推送通知，如果您看到此消息，说明推送功能正常工作！",
      url: "/",
      tag: "test",
    };

    try {
      const results = await Promise.allSettled(
        subscriptions.map((sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys,
          };

          return webpush.sendNotification(
            pushSubscription as any,
            JSON.stringify(notificationPayload)
          );
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;

      return {
        success: true,
        message: `测试推送已发送（${successful} 个设备）`,
      };
    } catch (error) {
      console.error("Send test notification error:", error);
      return {
        success: false,
        message: "发送测试推送失败",
      };
    }
  }),
});
