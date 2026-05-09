import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

export default function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  } = usePushNotification()

  if (!isSupported) {
    return (
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <BellOff size={20} className="text-white/40" />
          <h3 className="font-semibold text-white">推送通知</h3>
        </div>
        <p className="text-sm text-white/60">您的浏览器不支持推送通知功能</p>
      </div>
    )
  }

  const getStatusInfo = () => {
    if (!isSupported) return { text: '不支持', color: 'text-white/40' }
    if (permission === 'denied') return { text: '已拒绝', color: 'text-red-400' }
    if (!isSubscribed) return { text: '未订阅', color: 'text-white/60' }
    return { text: '已启用', color: 'text-green-400' }
  }

  const status = getStatusInfo()

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-neon-cyan" />
          <div>
            <h3 className="font-semibold text-white">推送通知</h3>
            <p className={`text-sm ${status.color}`}>{status.text}</p>
          </div>
        </div>

        {isSubscribed && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle size={14} />
            已订阅
          </span>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-2">
        {permission === 'default' && (
          <button
            onClick={requestPermission}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan font-medium hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
          >
            {loading ? '请求中...' : '请求通知权限'}
          </button>
        )}

        {permission === 'granted' && !isSubscribed && (
          <button
            onClick={subscribeToPush}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-neon-cyan text-black font-medium hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all disabled:opacity-50"
          >
            {loading ? '订阅中...' : '启用推送通知'}
          </button>
        )}

        {isSubscribed && (
          <>
            <button
              onClick={sendTestNotification}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {loading ? '发送中...' : '发送测试通知'}
            </button>

            <button
              onClick={unsubscribeFromPush}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? '处理中...' : '取消订阅'}
            </button>
          </>
        )}

        {permission === 'denied' && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-400">
              您已拒绝通知权限。请在浏览器设置中允许通知后刷新页面。
            </p>
          </div>
        )}
      </div>

      {/* 说明文字 */}
      <div className="pt-2 border-t border-white/5">
        <p className="text-xs text-white/40">
          {isSubscribed
            ? '推送通知已启用，您将收到重要提醒和消息通知。'
            : '启用推送通知后，您将收到重要提醒和消息通知。'}
        </p>
      </div>
    </div>
  )
}
