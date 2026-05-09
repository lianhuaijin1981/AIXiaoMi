import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  ChevronLeft, Settings, Bell, Shield, Moon, HelpCircle,
  ChevronRight, User, Volume2, Smartphone, LogOut,
  Sparkles, Crown, Zap
} from 'lucide-react'
import PushNotificationSettings from '@/components/PushNotificationSettings'

const menuGroups = [
  {
    title: '账号设置',
    items: [
      { icon: User, label: '个人信息', value: '编辑资料' },
      { icon: Shield, label: '隐私安全', value: '' },
      { icon: Bell, label: '消息通知', value: '已开启' },
    ],
  },
  {
    title: '应用设置',
    items: [
      { icon: Moon, label: '深色模式', value: '跟随系统' },
      { icon: Volume2, label: '语音设置', value: '' },
      { icon: Smartphone, label: '设备管理', value: '3台设备' },
    ],
  },
  {
    title: '其他',
    items: [
      { icon: Crown, label: 'VIP会员', value: '升级特权' },
      { icon: HelpCircle, label: '帮助中心', value: '' },
      { icon: Settings, label: '系统设置', value: '' },
    ],
  },
]

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Get user profile from API
  const { data: profile } = trpc.user.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  useEffect(() => { setMounted(true) }, [])

  const stats = [
    { label: '连续打卡', value: `${profile?.streakDays || 0}天`, icon: Zap },
    { label: '对话次数', value: `${profile?.totalMessages || 0}次`, icon: Sparkles },
    { label: '习惯养成', value: '5个', icon: Crown },
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">请先登录</h2>
          <p className="text-white/50 text-sm mb-6">登录后即可使用爱小蜜的全部功能</p>
          <a
            href={`/api/oauth/authorize?redirect_uri=${encodeURIComponent(window.location.origin + '/api/oauth/callback')}`}
            className="inline-block px-6 py-3 rounded-xl bg-neon-cyan/15 text-neon-cyan text-sm font-medium border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-colors"
          >
            立即登录
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-28 pt-6">
      {/* Header */}
      <div className={`px-4 flex items-center justify-between mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </Link>
        <h2 className="text-lg font-bold text-white">个人中心</h2>
        <button className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Settings className="w-5 h-5 text-white/50" />
        </button>
      </div>

      {/* Profile Card */}
      <div className={`px-4 mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon-cyan/10 to-neon-purple/10 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neon-cyan/40">
              <img src={user?.avatar || '/avatar-lingzhi.jpg'} alt="用户头像" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">{user?.name || '小主人'}</h3>
              <p className="text-white/40 text-sm mt-0.5">UID: {user?.unionId?.slice(0, 8) || '884828'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">VIP会员</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">深度用户</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`px-4 mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="glass-panel rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-neon-cyan" />
                </div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Menu Groups */}
      <div className={`px-4 space-y-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {menuGroups.map((group, gi) => (
          <div key={gi}>
            <h4 className="text-xs text-white/30 font-medium mb-2 px-1">{group.title}</h4>
            <div className="glass-panel rounded-2xl overflow-hidden">
              {group.items.map((item, ii) => {
                const Icon = item.icon
                const isLast = ii === group.items.length - 1
                return (
                  <button
                    key={ii}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors ${!isLast ? 'border-b border-white/[0.06]' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white/50" />
                    </div>
                    <span className="flex-1 text-left text-sm text-white/80">{item.label}</span>
                    {item.value && <span className="text-xs text-white/30">{item.value}</span>}
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 推送通知设置 */}
      <div className={`px-4 mt-4 transition-all duration-700 delay-350 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <PushNotificationSettings />
      </div>

      {/* Logout */}
      <div className={`px-4 mt-6 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/5 hover:border-red-500/20 transition-all group"
        >
          <LogOut className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
          <span className="text-sm text-white/50 group-hover:text-red-400 transition-colors">退出登录</span>
        </button>
        <p className="text-center text-white/20 text-xs mt-4">爱小蜜 v1.0.0 · 全栈版</p>
      </div>
    </div>
  )
}
