import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  Moon, Brain, Dumbbell, Apple, Shirt, Heart,
  Users, Wallet, Briefcase, MessageCircle, Sparkles,
  ChevronRight, Zap, TrendingUp
} from 'lucide-react'

const features = [
  { id: 'sleep', name: '睡眠助眠', icon: Moon, color: 'from-cyan-500/20 to-blue-500/20', borderColor: 'border-cyan-500/30', image: '/feature-sleep.jpg' },
  { id: 'mental', name: '情绪疏导', icon: Brain, color: 'from-purple-500/20 to-indigo-500/20', borderColor: 'border-purple-500/30', image: '/feature-mental.jpg' },
  { id: 'skincare', name: '护肤管理', icon: Sparkles, color: 'from-pink-500/20 to-rose-500/20', borderColor: 'border-pink-500/30', image: '/feature-skincare.jpg' },
  { id: 'fitness', name: '健身塑形', icon: Dumbbell, color: 'from-violet-500/20 to-purple-500/20', borderColor: 'border-violet-500/30', image: '/feature-fitness.jpg' },
  { id: 'diet', name: '饮食养生', icon: Apple, color: 'from-emerald-500/20 to-green-500/20', borderColor: 'border-emerald-500/30', image: '/feature-diet.jpg' },
  { id: 'style', name: '穿搭形象', icon: Shirt, color: 'from-amber-500/20 to-orange-500/20', borderColor: 'border-amber-500/30', image: '/feature-skincare.jpg' },
  { id: 'social', name: '人情世故', icon: Users, color: 'from-sky-500/20 to-cyan-500/20', borderColor: 'border-sky-500/30', image: '/feature-sleep.jpg' },
  { id: 'finance', name: '财务记账', icon: Wallet, color: 'from-lime-500/20 to-green-500/20', borderColor: 'border-lime-500/30', image: '/feature-diet.jpg' },
  { id: 'career', name: '职业发展', icon: Briefcase, color: 'from-blue-500/20 to-indigo-500/20', borderColor: 'border-blue-500/30', image: '/feature-mental.jpg' },
  { id: 'chat', name: '闲聊陪伴', icon: MessageCircle, color: 'from-fuchsia-500/20 to-pink-500/20', borderColor: 'border-fuchsia-500/30', image: '/feature-fitness.jpg' },
  { id: 'habit', name: '自律打卡', icon: TrendingUp, color: 'from-teal-500/20 to-emerald-500/20', borderColor: 'border-teal-500/30', image: '/feature-diet.jpg' },
  { id: 'health', name: '健康管理', icon: Heart, color: 'from-red-500/20 to-rose-500/20', borderColor: 'border-red-500/30', image: '/feature-mental.jpg' },
]

export default function Dashboard() {
  const [greeting, setGreeting] = useState('')
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Get real data from API
  const { data: tasks } = trpc.task.list.useQuery(undefined, { enabled: isAuthenticated })
  const { data: profile } = trpc.user.profile.useQuery(undefined, { enabled: isAuthenticated })

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    if (hour < 6) setGreeting('夜深了')
    else if (hour < 12) setGreeting('早上好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
  }, [])

  const completedCount = tasks?.filter(t => t.completed).length || 0
  const totalCount = tasks?.length || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-black pb-28 px-4 pt-6">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div>
          <p className="text-white/50 text-sm">{greeting}，{user?.name || '小主人'}</p>
          <h2 className="text-xl font-bold text-white mt-0.5">今天想聊点什么？</h2>
        </div>
        <Link to="/chat" className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neon-cyan/50">
            <img src="/avatar-lingzhi.jpg" alt="小蜜" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
        </Link>
      </div>

      {/* Quick Actions */}
      <div className={`flex gap-3 mb-6 overflow-x-auto scrollbar-hide transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Link to="/chat" className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-cyan/15 to-neon-purple/15 border border-neon-cyan/20">
          <Zap className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-white whitespace-nowrap">快速提问</span>
        </Link>
        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <Moon className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-white/70 whitespace-nowrap">助眠模式</span>
        </button>
        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <Dumbbell className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-white/70 whitespace-nowrap">今日健身</span>
        </button>
      </div>

      {/* Status Cards */}
      <div className={`grid grid-cols-2 gap-3 mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs text-white/50">今日能量</span>
          </div>
          <p className="text-2xl font-bold text-white">{progress}<span className="text-sm font-normal text-white/50">%</span></p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-white/50">连续打卡</span>
          </div>
          <p className="text-2xl font-bold text-white">{profile?.streakDays || 0}<span className="text-sm font-normal text-white/50">天</span></p>
          <p className="text-xs text-white/40 mt-1">Keep it up!</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-lg font-semibold text-white mb-4">全部服务</h3>
        <div className="grid grid-cols-3 gap-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.id}
                to={feature.id === 'chat' ? '/chat' : `/feature/${feature.id}`}
                className={`group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br ${feature.color} border ${feature.borderColor} transition-all duration-300 hover:scale-105`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative z-10 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">{feature.name}</span>
                </div>
                <ChevronRight className="absolute top-2 right-2 w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
