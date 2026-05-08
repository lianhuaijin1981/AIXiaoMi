import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import {
  ChevronLeft, Search, BookOpen, Lightbulb, FileText,
  Heart, Dumbbell, Apple, Moon, Brain, Sparkles,
  Shirt, Users, Wallet, Briefcase, MessageCircle, TrendingUp
} from 'lucide-react'

const categoryConfig: Record<string, { name: string; icon: React.ElementType; color: string; desc: string }> = {
  sleep: { name: '睡眠助眠', icon: Moon, color: 'text-cyan-400', desc: '助眠技巧、作息调理、睡眠改善方案' },
  mental: { name: '情绪心理', icon: Brain, color: 'text-purple-400', desc: '情绪管理、焦虑缓解、心理健康' },
  skincare: { name: '护肤美容', icon: Sparkles, color: 'text-pink-400', desc: '肤质护理、成分解读、美容方案' },
  fitness: { name: '健身塑形', icon: Dumbbell, color: 'text-violet-400', desc: '训练计划、动作指导、体态矫正' },
  diet: { name: '饮食养生', icon: Apple, color: 'text-emerald-400', desc: '体质食疗、健康食谱、营养搭配' },
  style: { name: '穿搭形象', icon: Shirt, color: 'text-amber-400', desc: '穿搭技巧、发型推荐、形象提升' },
  social: { name: '人情世故', icon: Users, color: 'text-sky-400', desc: '社交礼仪、话术模板、人脉维护' },
  finance: { name: '财务记账', icon: Wallet, color: 'text-lime-400', desc: '理财入门、消费规划、记账方法' },
  career: { name: '职业发展', icon: Briefcase, color: 'text-blue-400', desc: '求职技巧、面试训练、职业规划' },
  chat: { name: '闲聊陪伴', icon: MessageCircle, color: 'text-fuchsia-400', desc: '趣味知识、生活见闻、兴趣入门' },
  habit: { name: '自律习惯', icon: TrendingUp, color: 'text-teal-400', desc: '习惯养成、拖延克服、目标管理' },
  health: { name: '健康管理', icon: Heart, color: 'text-red-400', desc: '体检指南、用药常识、健康监测' },
}

const contentTypeLabels: Record<string, string> = {
  guide: '指南', faq: '问答', template: '模板', tip: '小贴士',
  plan: '方案', recipe: '食谱', exercise: '运动', warning: '避坑',
}

export default function KnowledgePage() {
  const { category } = useParams<{ category: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const config = category ? categoryConfig[category] : null
  const Icon = config?.icon || BookOpen

  // 搜索知识
  const { data: searchResults } = trpc.knowledge.search.useQuery(
    { query: searchQuery, category: category || undefined, limit: 10 },
    { enabled: searchQuery.length >= 2 }
  )

  // 分类列表
  const { data: categoryItems } = trpc.knowledge.listByCategory.useQuery(
    { category: category || 'sleep', limit: 20 },
    { enabled: !!category }
  )

  const displayItems = searchQuery.length >= 2 ? searchResults : categoryItems

  if (!config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/50">分类未找到</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-28 px-4 pt-6">
      {/* Header */}
      <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </Link>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${config.color.replace('text-', '')}/20 to-white/5 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{config.name}知识库</h2>
          <p className="text-xs text-white/40">{config.desc}</p>
        </div>
      </div>

      {/* Search */}
      <div className={`glass-panel rounded-2xl p-2 flex items-center gap-2 mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Search className="w-5 h-5 text-white/30 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={`搜索${config.name}知识...`}
          className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none px-2 py-2"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-white/30 text-xs px-2">
            清除
          </button>
        )}
      </div>

      {/* Knowledge List */}
      <div className={`space-y-3 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {displayItems?.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {searchQuery.length >= 2 ? '没有找到相关知识，换个关键词试试' : '暂无知识内容'}
            </p>
          </div>
        )}

        {displayItems?.map((item: any) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="w-full text-left glass-panel rounded-2xl p-4 hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
                {item.contentType === 'template' ? <FileText className={`w-4 h-4 ${config.color}`} /> :
                 item.contentType === 'recipe' ? <Apple className={`w-4 h-4 ${config.color}`} /> :
                 item.contentType === 'exercise' ? <Dumbbell className={`w-4 h-4 ${config.color}`} /> :
                 <BookOpen className={`w-4 h-4 ${config.color}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white">{item.title}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                    {contentTypeLabels[item.contentType] || '指南'}
                  </span>
                </div>
                <p className="text-xs text-white/40 line-clamp-2">{item.summary || item.content.substring(0, 80)}...</p>
                {item.source && <p className="text-[10px] text-white/20 mt-1">来源：{item.source}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] rounded-t-3xl p-6 border-t border-white/10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${config.color}`} />
                <span className="text-xs text-white/40">{config.name} · {contentTypeLabels[selectedItem.contentType]}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-white/40 text-sm">
                关闭
              </button>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{selectedItem.title}</h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{selectedItem.content}</p>
            </div>
            {selectedItem.source && (
              <p className="text-xs text-white/30 mt-4">知识来源：{selectedItem.source}</p>
            )}
            <div className="mt-4 flex gap-2">
              <Link
                to="/chat"
                className="flex-1 py-3 rounded-xl bg-neon-cyan/15 text-neon-cyan text-sm font-medium text-center border border-neon-cyan/30"
              >
                向小蜜咨询更多
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
