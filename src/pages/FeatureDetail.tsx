import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import {
  ChevronLeft, Mic, Send, Play, Clock, Heart,
  Dumbbell, Apple, Moon, Brain, Sparkles, Shirt, Users,
  Wallet, Briefcase, MessageCircle, TrendingUp, Zap,
  BookOpen, Beaker
} from 'lucide-react'

const featureData: Record<string, {
  name: string
  icon: React.ElementType
  color: string
  gradient: string
  borderColor: string
  description: string
  prompts: string[]
  tools: { name: string; desc: string; icon: React.ElementType }[]
  assessmentType?: string
}> = {
  sleep: {
    name: '睡眠助眠',
    icon: Moon,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
    description: '内置自然白噪音、引导式冥想、睡前故事，帮你放下手机安心入睡',
    prompts: ['今晚睡不着怎么办', '播放雨声白噪音', '给我讲个睡前故事', '设置明天起床闹钟'],
    tools: [
      { name: '白噪音', desc: '雨声/溪流/森林', icon: Play },
      { name: '冥想引导', desc: '渐进式放松', icon: Moon },
      { name: '睡眠记录', desc: '分析作息规律', icon: Clock },
      { name: '睡前提醒', desc: '到点放下手机', icon: Zap },
    ],
  },
  mental: {
    name: '情绪疏导',
    icon: Brain,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-500/30',
    description: '专属私密树洞，共情安抚+理性拆解，帮你跳出思维死局',
    prompts: ['最近压力很大', '帮我分析一下焦虑的原因', '教我呼吸放松法', '想找人聊聊天'],
    tools: [
      { name: '情绪记录', desc: '追踪心情变化', icon: Heart },
      { name: '呼吸训练', desc: '4-7-8呼吸法', icon: Zap },
      { name: '正念冥想', desc: '专注当下', icon: Brain },
      { name: '倾诉空间', desc: '安全树洞', icon: MessageCircle },
    ],
  },
  skincare: {
    name: '护肤管理',
    icon: Sparkles,
    color: 'text-pink-400',
    gradient: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30',
    description: '肤质智能自测，定制个人护肤流程，内调外养方案',
    prompts: ['我是什么肤质', '推荐适合我的护肤品', '今天护肤步骤是什么', '痘痘怎么调理'],
    assessmentType: 'skin',
    tools: [
      { name: '肤质测试', desc: '精准判定肤质', icon: Sparkles },
      { name: '护肤日历', desc: '早晚流程提醒', icon: Clock },
      { name: '成分分析', desc: '解读产品成分', icon: Brain },
      { name: '好物推荐', desc: '按肤质推荐', icon: Heart },
    ],
  },
  fitness: {
    name: '健身塑形',
    icon: Dumbbell,
    color: 'text-violet-400',
    gradient: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    description: '定制居家/户外专属健身计划，动作语音拆解、体态矫正',
    prompts: ['帮我制定减脂计划', '今天的训练内容', '纠正我的深蹲动作', '推荐居家运动'],
    tools: [
      { name: '训练计划', desc: '定制健身方案', icon: Dumbbell },
      { name: '动作库', desc: '标准示范教学', icon: Play },
      { name: '体态评估', desc: '圆肩驼背矫正', icon: Zap },
      { name: '运动记录', desc: '打卡追踪进度', icon: TrendingUp },
    ],
  },
  diet: {
    name: '饮食养生',
    icon: Apple,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30',
    description: '体质智能测评，每日三餐健康搭配，专属食疗方案',
    prompts: ['我是什么体质', '今天吃什么好', '湿气重怎么调理', '推荐养生茶'],
    assessmentType: 'tcm_body',
    tools: [
      { name: '体质测试', desc: '中医体质辨识', icon: Apple },
      { name: '食谱推荐', desc: '每日健康搭配', icon: Heart },
      { name: '食疗方案', desc: '针对性调理', icon: Zap },
      { name: '忌口提醒', desc: '饮食禁忌清单', icon: Clock },
    ],
  },
  style: {
    name: '穿搭形象',
    icon: Shirt,
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    description: '按脸型/身材/场合做全套穿搭方案，虚拟试衣预览',
    prompts: ['明天穿什么', '适合我的发型推荐', '约会穿搭建议', '正式场合怎么穿'],
    assessmentType: 'face_shape',
    tools: [
      { name: '穿搭推荐', desc: '按场合搭配', icon: Shirt },
      { name: '虚拟试衣', desc: '3D分身预览', icon: Sparkles },
      { name: '发型建议', desc: '按脸型推荐', icon: Heart },
      { name: '购物参谋', desc: '避坑比价', icon: Zap },
    ],
  },
  social: {
    name: '人情世故',
    icon: Users,
    color: 'text-sky-400',
    gradient: 'from-sky-500/20 to-cyan-500/20',
    borderColor: 'border-sky-500/30',
    description: '高情商话术模板、节日提醒、社交话题建议、人脉档案管理',
    prompts: ['怎么委婉拒绝别人', '生日祝福怎么写', '聚会聊什么话题', '怎么化解家庭矛盾'],
    tools: [
      { name: '话术库', desc: '高情商表达', icon: MessageCircle },
      { name: '节日提醒', desc: '重要节点预警', icon: Clock },
      { name: '人脉档案', desc: '记录喜好性格', icon: Users },
      { name: '送礼参谋', desc: '选品推荐', icon: Heart },
    ],
  },
  finance: {
    name: '财务记账',
    icon: Wallet,
    color: 'text-lime-400',
    gradient: 'from-lime-500/20 to-green-500/20',
    borderColor: 'border-lime-500/30',
    description: '语音随手记账、消费分析、理财科普、账单到期预警',
    prompts: ['记一笔支出', '本月消费分析', '怎么开始理财', '账单到期提醒'],
    tools: [
      { name: '语音记账', desc: '一句话记录', icon: Mic },
      { name: '消费分析', desc: '月度统计', icon: TrendingUp },
      { name: '理财科普', desc: '基础知识', icon: Brain },
      { name: '账单提醒', desc: '到期预警', icon: Clock },
    ],
  },
  career: {
    name: '职业发展',
    icon: Briefcase,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    description: '岗位适配分析、简历优化、模拟面试、求职进度管理',
    prompts: ['我适合什么岗位', '帮我优化简历', '模拟面试训练', '职场穿搭建议'],
    tools: [
      { name: '职业测评', desc: '岗位匹配分析', icon: Brain },
      { name: '简历助手', desc: '亮点提炼润色', icon: Briefcase },
      { name: '面试训练', desc: '模拟问答', icon: MessageCircle },
      { name: '求职管理', desc: '进度追踪', icon: Clock },
    ],
  },
  chat: {
    name: '闲聊陪伴',
    icon: MessageCircle,
    color: 'text-fuchsia-400',
    gradient: 'from-fuchsia-500/20 to-pink-500/20',
    borderColor: 'border-fuchsia-500/30',
    description: '多话题自由陪聊，支持切换IP人设，无聊时主动找话题',
    prompts: ['讲个有趣的故事', '聊聊哲学', '推荐一本好书', '今天有什么新闻'],
    tools: [
      { name: '话题推荐', desc: '主动找话题', icon: MessageCircle },
      { name: '故事电台', desc: '趣味故事', icon: Play },
      { name: '兴趣引导', desc: '学习路径', icon: Sparkles },
      { name: 'IP切换', desc: '多角色陪伴', icon: Users },
    ],
  },
  habit: {
    name: '自律打卡',
    icon: TrendingUp,
    color: 'text-teal-400',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    borderColor: 'border-teal-500/30',
    description: '定制习惯养成计划，每日打卡监督，任务拆解降低执行压力',
    prompts: ['帮我养成早睡习惯', '设置今日打卡', '怎么戒除拖延症', '建立运动习惯'],
    tools: [
      { name: '习惯计划', desc: '个性化定制', icon: TrendingUp },
      { name: '每日打卡', desc: '监督鼓励', icon: Zap },
      { name: '进度追踪', desc: '数据可视化', icon: Clock },
      { name: '任务拆解', desc: '降低门槛', icon: Brain },
    ],
  },
  health: {
    name: '健康管理',
    icon: Heart,
    color: 'text-red-400',
    gradient: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/30',
    description: '全方位健康监测、用药提醒、体检预约、健康数据追踪',
    prompts: ['记录今日体重', '设置用药提醒', '推荐体检项目', '分析健康数据'],
    tools: [
      { name: '健康档案', desc: '数据记录', icon: Heart },
      { name: '用药提醒', desc: '定时通知', icon: Clock },
      { name: '体检预约', desc: '项目推荐', icon: Zap },
      { name: '健康趋势', desc: '数据图表', icon: TrendingUp },
    ],
  },
}

export default function FeatureDetail() {
  const { id } = useParams<{ id: string }>()
  const feature = id ? featureData[id] : null
  const [inputText, setInputText] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!feature) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/50">功能未找到</p>
      </div>
    )
  }

  const Icon = feature.icon

  return (
    <div className="min-h-screen bg-black pb-28 pt-6">
      {/* Header */}
      <div className={`px-4 flex items-center gap-3 mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </Link>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${feature.color}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{feature.name}</h2>
          <p className="text-xs text-white/40">{feature.description}</p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className={`px-4 mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-sm text-white/50 mb-3">快捷指令</h3>
        <div className="flex flex-wrap gap-2">
          {feature.prompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputText(prompt)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Base & Assessment Links */}
      <div className={`px-4 mb-6 flex gap-3 transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Link
          to={`/knowledge/${id}`}
          className={`flex-1 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} border ${feature.borderColor || 'border-white/10'} hover:opacity-80 transition-all`}
        >
          <BookOpen className={`w-5 h-5 ${feature.color}`} />
          <div className="text-left">
            <p className="text-sm font-medium text-white">知识库</p>
            <p className="text-[10px] text-white/50">专业指南与方案</p>
          </div>
        </Link>
        {feature.assessmentType && (
          <Link
            to={`/assessment/${feature.assessmentType}`}
            className={`flex-1 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} border ${feature.borderColor || 'border-white/10'} hover:opacity-80 transition-all`}
          >
            <Beaker className={`w-5 h-5 ${feature.color}`} />
            <div className="text-left">
              <p className="text-sm font-medium text-white">在线测评</p>
              <p className="text-[10px] text-white/50">精准了解自己</p>
            </div>
          </Link>
        )}
      </div>

      {/* Tools Grid */}
      <div className={`px-4 mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-sm text-white/50 mb-3">功能工具</h3>
        <div className="grid grid-cols-2 gap-3">
          {feature.tools.map((tool, i) => {
            const ToolIcon = tool.icon
            return (
              <button
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} border border-white/10 hover:border-white/20 transition-all`}
              >
                <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center">
                  <ToolIcon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{tool.name}</p>
                  <p className="text-[10px] text-white/40">{tool.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Input */}
      <div className="px-4">
        <div className="glass-panel rounded-2xl p-2 flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Mic className="w-5 h-5 text-white/40" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`向${feature.name}提问...`}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none px-2"
          />
          <button className="p-2.5 rounded-xl bg-neon-cyan/15 hover:bg-neon-cyan/25 transition-colors">
            <Send className="w-5 h-5 text-neon-cyan" />
          </button>
        </div>
      </div>
    </div>
  )
}
