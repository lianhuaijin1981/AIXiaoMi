import { Link, useLocation } from 'react-router'
import { Home, MessageCircle, Calendar, CheckSquare, User } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()
  const navItems = [
    { path: '/dashboard', icon: Home, label: '首页' },
    { path: '/chat', icon: MessageCircle, label: '小蜜' },
    { path: '/schedule', icon: Calendar, label: '日程' },
    { path: '/tasks', icon: CheckSquare, label: '任务' },
    { path: '/profile', icon: User, label: '我的' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="glass-panel mx-4 mb-4 rounded-2xl px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-neon-cyan'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
