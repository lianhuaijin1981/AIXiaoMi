import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  ChevronLeft, CheckCircle2, RotateCcw,
  Sparkles, Beaker, Activity
} from 'lucide-react'

const assessmentConfig: Record<string, {
  name: string; icon: React.ElementType; color: string;
  desc: string; questions: { id: string; text: string; options: { value: string; label: string; score: number }[] }[]
}> = {
  skin: {
    name: '肤质测评', icon: Beaker, color: 'text-pink-400',
    desc: '通过5道题目精准判断你的肤质类型',
    questions: [
      {
        id: 'q1', text: '洗完脸后不涂护肤品，1小时后你的皮肤感觉如何？',
        options: [
          { value: 'tight', label: '紧绷干燥，甚至起皮', score: 3 },
          { value: 'oily', label: 'T区明显出油，脸颊还好', score: 2 },
          { value: 'comfortable', label: '水润舒适，没有不适感', score: 1 },
        ],
      },
      {
        id: 'q2', text: '你的毛孔状态是？',
        options: [
          { value: 'invisible', label: '几乎看不见毛孔', score: 1 },
          { value: 'nose', label: '只在鼻子和T区比较明显', score: 2 },
          { value: 'large', label: '全脸毛孔都比较粗大', score: 3 },
        ],
      },
      {
        id: 'q3', text: '换季或换护肤品时，你的皮肤容易？',
        options: [
          { value: 'no', label: '没什么特别反应', score: 1 },
          { value: 'sometimes', label: '偶尔轻微不适', score: 2 },
          { value: 'yes', label: '经常泛红、刺痛或过敏', score: 3 },
        ],
      },
      {
        id: 'q4', text: '下午照镜子时，你的脸通常？',
        options: [
          { value: 'dry', label: '还是干干的，甚至起皮', score: 3 },
          { value: 'shine', label: 'T区泛油光，可照镜子反光', score: 2 },
          { value: 'normal', label: '和早上差不多，状态稳定', score: 1 },
        ],
      },
      {
        id: 'q5', text: '你长痘痘的频率是？',
        options: [
          { value: 'rare', label: '很少长痘', score: 1 },
          { value: 'sometimes', label: '姨妈期或压力大时偶尔长', score: 2 },
          { value: 'often', label: '经常长痘，此起彼伏', score: 3 },
        ],
      },
    ],
  },
  tcm_body: {
    name: '中医体质测评', icon: Activity, color: 'text-emerald-400',
    desc: '基于中华中医药学会标准，辨识你的中医体质',
    questions: [
      {
        id: 'q1', text: '你平时容易疲劳吗？',
        options: [
          { value: 'no', label: '精力充沛，不易疲劳', score: 1 },
          { value: 'sometimes', label: '活动后容易累', score: 2 },
          { value: 'yes', label: '即使没做什么也很累', score: 3 },
        ],
      },
      {
        id: 'q2', text: '你的手脚平时感觉？',
        options: [
          { value: 'warm', label: '温暖', score: 1 },
          { value: 'normal', label: '正常', score: 2 },
          { value: 'cold', label: '冰凉，尤其冬天', score: 3 },
        ],
      },
      {
        id: 'q3', text: '你的舌苔看起来？',
        options: [
          { value: 'normal', label: '淡红薄白，正常', score: 1 },
          { value: 'white', label: '偏白较厚', score: 2 },
          { value: 'yellow', label: '偏黄腻', score: 3 },
        ],
      },
      {
        id: 'q4', text: '你的体型偏？',
        options: [
          { value: 'slim', label: '偏瘦', score: 2 },
          { value: 'average', label: '匀称', score: 1 },
          { value: 'heavy', label: '偏胖，尤其腹部', score: 3 },
        ],
      },
      {
        id: 'q5', text: '你的情绪状态偏？',
        options: [
          { value: 'calm', label: '平稳乐观', score: 1 },
          { value: 'anxious', label: '容易焦虑紧张', score: 2 },
          { value: 'low', label: '经常低落烦闷', score: 3 },
        ],
      },
    ],
  },
  face_shape: {
    name: '脸型测评', icon: Beaker, color: 'text-amber-400',
    desc: '通过自测判断你的脸型，获取发型和妆容建议',
    questions: [
      {
        id: 'q1', text: '测量你的额头宽度和下颌宽度？',
        options: [
          { value: 'forehead_wide', label: '额头比下颌宽', score: 1 },
          { value: 'same', label: '额头和下颌差不多宽', score: 2 },
          { value: 'jaw_wide', label: '下颌比额头宽', score: 3 },
        ],
      },
      {
        id: 'q2', text: '你的脸长与脸宽的比例？',
        options: [
          { value: 'round', label: '长宽接近，偏圆润', score: 1 },
          { value: 'oval', label: '长度略大于宽度', score: 2 },
          { value: 'long', label: '明显长于宽度', score: 3 },
        ],
      },
      {
        id: 'q3', text: '你的下巴形状是？',
        options: [
          { value: 'pointed', label: '尖下巴', score: 1 },
          { value: 'round', label: '圆下巴', score: 2 },
          { value: 'square', label: '方下巴，线条明显', score: 3 },
        ],
      },
    ],
  },
}

export default function AssessmentPage() {
  const { type } = useParams<{ type: string }>()
  useAuth()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const utils = trpc.useUtils()

  useEffect(() => { setMounted(true) }, [])

  const config = type ? assessmentConfig[type] : null
  const Icon = config?.icon || Beaker

  const createAssessment = trpc.knowledge.createAssessment.useMutation({
    onSuccess: (data) => {
      setResult(data)
      utils.knowledge.listAssessments.invalidate()
    },
  })

  const handleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    if (currentQ < (config?.questions.length || 0) - 1) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 300)
    }
  }

  const handleSubmit = () => {
    if (!config) return
    createAssessment.mutate({
      assessmentType: type as any,
      answers: JSON.stringify(answers),
    })
  }

  const handleReset = () => {
    setCurrentQ(0)
    setAnswers({})
    setResult(null)
  }

  const allAnswered = config && Object.keys(answers).length === config.questions.length

  if (!config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/50">测评类型未找到</p>
      </div>
    )
  }

  // Show result
  if (result) {
    const details = JSON.parse(result.resultDetails || '{}')
    const recommendations = JSON.parse(result.recommendations || '[]')

    return (
      <div className="min-h-screen bg-black pb-28 px-4 pt-6">
        <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <Link to="/dashboard" className="p-1 -ml-1">
            <ChevronLeft className="w-6 h-6 text-white/70" />
          </Link>
          <h2 className="text-lg font-bold text-white">测评结果</h2>
        </div>

        <div className="glass-panel rounded-2xl p-6 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-neon-cyan" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{result.resultLabel}</h3>
          <p className="text-sm text-white/50">综合匹配度 {result.resultScore}%</p>
        </div>

        {details.characteristics && (
          <div className="glass-panel rounded-2xl p-4 mb-4">
            <h4 className="text-sm font-medium text-white mb-3">特征描述</h4>
            <ul className="space-y-2">
              {details.characteristics.map((c: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <CheckCircle2 className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="glass-panel rounded-2xl p-4 mb-6">
          <h4 className="text-sm font-medium text-white mb-3">专属推荐</h4>
          <div className="space-y-3">
            {recommendations.map((rec: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <Sparkles className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">{rec.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            重新测评
          </button>
          <Link
            to="/chat"
            className="flex-1 py-3 rounded-xl bg-neon-cyan/15 text-neon-cyan text-sm font-medium text-center border border-neon-cyan/30"
          >
            咨询小蜜
          </Link>
        </div>
      </div>
    )
  }

  const question = config.questions[currentQ]
  const progress = ((currentQ + 1) / config.questions.length) * 100

  return (
    <div className="min-h-screen bg-black pb-28 px-4 pt-6">
      {/* Header */}
      <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-white">{config.name}</h2>
          <p className="text-xs text-white/40">{config.desc}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">问题 {currentQ + 1}/{config.questions.length}</span>
          <span className="text-xs text-neon-cyan">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className={`mb-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-lg text-white font-medium mb-4 leading-relaxed">{question.text}</h3>
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(question.id, opt.value)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                answers[question.id] === opt.value
                  ? 'bg-neon-cyan/10 border-neon-cyan/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  answers[question.id] === opt.value ? 'border-neon-cyan' : 'border-white/20'
                }`}>
                  {answers[question.id] === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />}
                </div>
                <span className="text-sm text-white/80">{opt.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {allAnswered && (
          <button
            onClick={handleSubmit}
            disabled={createAssessment.isPending}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-white text-sm font-medium border border-neon-cyan/30"
          >
            {createAssessment.isPending ? '分析中...' : '查看结果'}
          </button>
        )}
      </div>
    </div>
  )
}
