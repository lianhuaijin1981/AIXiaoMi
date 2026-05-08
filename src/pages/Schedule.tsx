import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Bell, Sun, Moon, Cloud } from 'lucide-react'

const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
  work: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' },
  personal: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400' },
  health: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
  reminder: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' },
  social: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: 'text-pink-400' },
}

const typeLabels: Record<string, string> = {
  work: '工作', personal: '个人', health: '健康', reminder: '提醒', social: '社交',
}

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [mounted, setMounted] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('09:00')
  const utils = trpc.useUtils()

  useEffect(() => { setMounted(true) }, [])

  // Get events from API
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()
  const { data: events, isLoading } = trpc.schedule.list.useQuery({ startDate: startOfMonth, endDate: endOfMonth })

  // Create event mutation
  const createMutation = trpc.schedule.create.useMutation({
    onSuccess: () => {
      utils.schedule.list.invalidate()
      setShowAddModal(false)
      setNewEventTitle('')
    },
  })

  // Delete event mutation
  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => utils.schedule.list.invalidate(),
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const today = new Date().getDate()
  const isToday = (day: number) => day === today && month === new Date().getMonth() && year === new Date().getFullYear()

  // Filter events for selected day
  const selectedEvents = events?.filter(e => {
    const d = new Date(e.startTime)
    return d.getDate() === selectedDay && d.getMonth() === month && d.getFullYear() === year
  }) || []

  const getWeatherIcon = () => {
    const hour = new Date().getHours()
    // Sun icon used here
    if (hour < 6 || hour > 20) return <Moon className="w-5 h-5 text-amber-300" />
    if (hour < 18) return <Sun className="w-5 h-5 text-amber-400" />
    return <Cloud className="w-5 h-5 text-gray-400" />
  }

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return
    const [hours, minutes] = newEventTime.split(':')
    const startTime = new Date(year, month, selectedDay, parseInt(hours), parseInt(minutes)).toISOString()
    createMutation.mutate({
      title: newEventTitle,
      startTime,
      type: 'personal',
    })
  }

  // Build a set of days with events for the calendar dots
  const daysWithEvents = new Set<number>()
  events?.forEach(e => {
    const d = new Date(e.startTime)
    if (d.getMonth() === month && d.getFullYear() === year) {
      daysWithEvents.add(d.getDate())
    }
  })

  return (
    <div className="min-h-screen bg-black pb-28 px-4 pt-6">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </Link>
        <h2 className="text-lg font-bold text-white">日程管理</h2>
        <button onClick={() => setShowAddModal(true)} className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
          <Plus className="w-5 h-5 text-neon-cyan" />
        </button>
      </div>

      {/* Weather & Date */}
      <div className={`glass-panel rounded-2xl p-4 mb-4 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-white">{today}日</p>
            <p className="text-sm text-white/50 mt-1">{monthNames[month]} {year}</p>
          </div>
          <div className="flex items-center gap-2">
            {getWeatherIcon()}
            <span className="text-white/70 text-sm">22°C</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className={`glass-panel rounded-2xl p-4 mb-4 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-white/50" />
          </button>
          <span className="text-white font-medium">{year}年 {monthNames[month]}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-white/40 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const hasEvents = daysWithEvents.has(day)
            const isSelected = day === selectedDay
            const todayMark = isToday(day)

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative aspect-square flex items-center justify-center rounded-xl text-sm transition-all ${
                  isSelected ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                  : todayMark ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/70 hover:bg-white/5'
                }`}
              >
                {day}
                {hasEvents && (
                  <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-neon-cyan' : 'bg-neon-purple'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events for Selected Day */}
      <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-neon-cyan" />
          {selectedDay}日的安排
        </h3>

        {isLoading && (
          <div className="text-center py-4 text-white/30 text-sm">
            <div className="w-6 h-6 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-2" />
            加载日程中...
          </div>
        )}

        {selectedEvents.length === 0 && !isLoading && (
          <div className="text-center py-8 text-white/30 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            今天暂无安排，去添加一个吧
          </div>
        )}

        <div className="space-y-3">
          {selectedEvents.map(event => {
            const colors = typeColors[event.type] || typeColors.personal
            const start = new Date(event.startTime)
            const timeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
            return (
              <div key={event.id} className={`flex items-start gap-3 p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                <div className={`w-2 h-2 rounded-full mt-2 ${colors.icon.replace('text', 'bg')}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{event.title}</span>
                    <span className="text-xs text-white/40">{timeStr}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-white/30" />
                      <span className="text-xs text-white/30">{event.location}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-white/30 mt-1 inline-block">{typeLabels[event.type] || event.type}</span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate({ id: event.id })}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-4 h-4 text-white/20" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] rounded-t-3xl p-6 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">新建日程</h3>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                placeholder="日程标题..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-neon-cyan/50"
                autoFocus
              />
              <input
                type="time"
                value={newEventTime}
                onChange={e => setNewEventTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors">
                取消
              </button>
              <button
                onClick={handleAddEvent}
                disabled={createMutation.isPending || !newEventTitle.trim()}
                className="flex-1 py-3 rounded-xl bg-neon-cyan/15 text-neon-cyan text-sm font-medium border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? '添加中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
