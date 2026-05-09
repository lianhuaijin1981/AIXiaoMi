// Service Worker for Web Push Notifications

const CACHE_NAME = 'aixiaomi-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/chat',
  '/static/css/main.css',
  '/static/js/main.js',
]

// 安装事件 - 缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    }),
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// 拦截请求 - 返回缓存或网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果缓存中有，返回缓存
      if (response) {
        return response
      }

      // 否则从网络请求
      return fetch(event.request).then((response) => {
        // 检查是否有效响应
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // 克隆响应
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// 推送事件 - 显示通知
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: 'AI小蜜',
        body: event.data.text() || '您有一条新消息',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
      }
    }
  }

  const options = {
    title: data.title || 'AI小蜜',
    body: data.body || '您有一条新消息',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.url || '/',
    requireInteraction: true,
    actions: data.actions || [],
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
  }

  event.waitUntil(self.registration.showNotification(options.title, options))
})

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click event:', event)

  event.notification.close()

  const urlToOpen = event.notification.data || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 如果已经有打开的窗口，聚焦到该窗口并导航
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(urlToOpen)
          return
        }
      }

      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// 后台同步（可选）
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag)

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
})

// 同步消息的示例函数
async function syncMessages() {
  // 从 IndexedDB 获取待发送的消息并发送
  console.log('Syncing messages...')
}
