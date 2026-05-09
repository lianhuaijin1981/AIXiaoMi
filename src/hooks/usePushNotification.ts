import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/providers/trpc'

export interface UsePushNotificationReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  loading: boolean
  error: string | null
  requestPermission: () => Promise<boolean>
  subscribeToPush: () => Promise<boolean>
  unsubscribeFromPush: () => Promise<boolean>
  sendTestNotification: () => Promise<void>
}

export function usePushNotification(): UsePushNotificationReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // tRPC queries/mutations
  const getVapidPublicKey = trpc.push.getVapidPublicKey.useQuery()
  const subscribeMutation = trpc.push.subscribe.useMutation()
  const unsubscribeMutation = trpc.push.unsubscribe.useMutation()
  const sendTestMutation = trpc.push.sendTestNotification.useMutation()

  // 检查浏览器支持
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  // 注册 Service Worker
  useEffect(() => {
    if (!isSupported) return

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        setRegistration(reg)
        console.log('Service Worker 注册成功:', reg)

        // 检查现有订阅
        const subscription = await reg.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (err) {
        console.error('Service Worker 注册失败:', err)
        setError('Service Worker 注册失败')
      }
    }

    registerServiceWorker()
  }, [isSupported])

  // 请求通知权限
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('您的浏览器不支持推送通知')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        return true
      } else if (result === 'denied') {
        setError('您已拒绝通知权限，请在浏览器设置中允许通知')
        return false
      } else {
        setError('未能获取通知权限')
        return false
      }
    } catch (err) {
      setError('请求通知权限时出错')
      return false
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  // 订阅推送
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      setError('Service Worker 未注册')
      return false
    }

    if (permission!== 'granted') {
      const granted = await requestPermission()
      if (!granted) return false
    }

    setLoading(true)
    setError(null)

    try {
      // 获取 VAPID 公钥
      const { publicKey } = await getVapidPublicKey.refetch()
      if (!publicKey) {
        throw new Error('无法获取 VAPID 公钥')
      }

      // 订阅推送
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      })

      // 将订阅信息发送到服务器
      const subscriptionJson = subscription.toJSON()

      await subscribeMutation.mutateAsync({
        endpoint: subscriptionJson.endpoint!,
        keys: {
          p256dh: subscriptionJson.keys!.p256dh!,
          auth: subscriptionJson.keys!.auth!,
        },
        userAgent: navigator.userAgent,
      })

      setIsSubscribed(true)
      return true
    } catch (err: any) {
      console.error('订阅推送失败:', err)
      setError(err.message || '订阅推送失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [registration, permission, requestPermission, getVapidPublicKey, subscribeMutation])

  // 取消订阅
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      setError('Service Worker 未注册')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // 从服务器删除订阅
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        })

        // 取消浏览器订阅
        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      return true
    } catch (err: any) {
      console.error('取消订阅失败:', err)
      setError(err.message || '取消订阅失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [registration, unsubscribeMutation])

  // 发送测试通知
  const sendTestNotification = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await sendTestMutation.mutateAsync()
      console.log('测试通知已发送')
    } catch (err: any) {
      console.error('发送测试通知失败:', err)
      setError(err.message || '发送测试通知失败')
    } finally {
      setLoading(false)
    }
  }, [sendTestMutation])

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  }
}
