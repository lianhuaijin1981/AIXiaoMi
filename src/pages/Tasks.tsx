import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import {
  ChevronLeft, Plus, CheckCircle2, Circle, Trash2,
  Clock, Moon, Dumbbell, Apple, Sparkles, Heart
} from 'lucide-react'

const categories = [
  { id: 'all', name: '全部', icon: Sparkles },
  { id: 'sleep', name: '睡眠', icon: Moon },
  { id: 'fitness', name: '健身', icon: Dumbbell },
  { id: 'diet', name: '饮食', icon: Apple },
  { id: 'skincare', name: '护肤', icon: Sparkles },
  { id: 'mental', name: '情绪', icon: Heart },
]

const priorityColors = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
}

export default function Tasks() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [mounted, setMounted] = useState(false)
  const utils = trpc.useUtils()

  useEffect(() => { setMounted(true) }, [])

  // Get tasks from API
  const { data: tasks, isLoading } = trpc.task.list.useQuery()

  // Create task mutation
  const createMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate()
      setShowAddModal(false)
      setNewTaskTitle('')
    },
  })

  // Toggle task mutation
  const toggleMutation = trpc.task.toggle.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  })

  // Delete task mutation
  const deleteMutation = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  })

  const filteredTasks = activeCategory === 'all'
    ? tasks
    : tasks?.filter(t => t.category === activeCategory)

  const completedCount = tasks?.filter(t => t.completed).length || 0
  const totalCount = tasks?.length || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    createMutation.mutate({
      title: newTaskTitle,
      category: activeCategory === 'all' ? 'general' : activeCategory,
      priority: 'medium',
    })
  }

  return (
    <div className="min-h-screen bg-black pb-28 px-4 pt-6">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </Link>
        <h2 className="text-lg font-bold text-white">今日任务</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20"
        >
          <Plus className="w-5 h-5 text-neon-cyan" />
        </button>
      </div>

      {/* Progress */}
      <div className={`glass-panel rounded-2xl p-4 mb-4 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-white">{completedCount}/{totalCount}</p>
            <p className="text-xs text-white/40 mt-0.5">今日完成进度</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="#00F0FF" strokeWidth="4"
                strokeDasharray={`${progress * 1.76} 176`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-neon-cyan">{progress}%</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Category Filter */}
      <div className={`flex gap-2 mb-4 overflow-x-auto scrollbar-hide transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {categories.map(cat => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Task List */}
      <div className={`space-y-2 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {isLoading && (
          <div className="text-center py-8 text-white/30 text-sm">
            <div className="w-6 h-6 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-2" />
            加载任务中...
          </div>
        )}

        {filteredTasks?.map(task => {
          const priority = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
          return (
            <div key={task.id} className={`group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all ${task.completed ? 'opacity-50' : ''}`}>
              <button onClick={() => toggleMutation.mutate({ id: task.id })} className="flex-shrink-0">
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-neon-cyan" />
                ) : (
                  <Circle className="w-6 h-6 text-white/20 hover:text-white/40 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.completed ? 'text-white/30 line-through' : 'text-white'}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${priority.bg} ${priority.text} border ${priority.border}`}>
                    {task.priority === 'high' ? '高优' : task.priority === 'medium' ? '中优' : '低优'}
                  </span>
                  {task.dueTime && (
                    <span className="flex items-center gap-1 text-[10px] text-white/30">
                      <Clock className="w-3 h-3" />
                      {task.dueTime}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate({ id: task.id })}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-400/60" />
              </button>
            </div>
          )
        })}

        {filteredTasks?.length === 0 && !isLoading && (
          <div className="text-center py-8 text-white/30 text-sm">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
            暂无任务，点击右上角添加一个吧
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] rounded-t-3xl p-6 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">新建任务</h3>
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="输入任务内容..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-neon-cyan/50 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors">
                取消
              </button>
              <button
                onClick={addTask}
                disabled={createMutation.isPending || !newTaskTitle.trim()}
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
