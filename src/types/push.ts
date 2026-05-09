// 推送通知相关类型定义

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  url?: string
  actions?: PushNotificationAction[]
  data?: Record<string, unknown>
}

export interface PushNotificationAction {
  action: string
  title: string
  icon?: string
}

export interface PushSubscriptionRequest {
  subscription: PushSubscriptionData
  userId: string
  deviceType: 'web' | 'ios' | 'android'
  userAgent: string
}

export interface PushNotificationResponse {
  success: boolean
  message: string
  details?: unknown>
}

// VAPID 密钥对
export interface VapidKeys {
  publicKey: string
  privateKey: string
}

// 通知权限状态
export type NotificationPermissionState = 'granted' | 'denied' | 'default'

// 推送通知设置
export interface PushNotificationSettings {
  enabled: boolean
  quietHoursStart?: string // HH:MM format, e.g., "22:00"
  quietHoursEnd?: string // HH:MM format, e.g., "08:00"
  allowedTypes: PushNotificationType[]
}

// 推送通知类型
export type PushNotificationType =
  | 'message' // 新消息
  | 'reminder' // 提醒
  | 'health' // 健康提醒
  | 'task' // 任务提醒
  | 'social' // 社交通知
  | 'promotion' // 促销通知
  | 'system' // 系统通知

export interface PushNotificationRecord {
  id: string
  userId: string
  type: PushNotificationType
  title: string
  body: string
  url?: string
  read: boolean
  createdAt: Date
  sentAt?: Date
}
