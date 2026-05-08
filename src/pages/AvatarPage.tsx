import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  ChevronLeft, Camera, Ruler, Sparkles,
  Save, RotateCcw, CheckCircle2
} from 'lucide-react'

const faceShapes = ['鹅蛋脸', '圆脸', '方脸', '长脸', '心形脸']
const skinTones = ['白皙', '偏白', '自然', '偏黄', '健康色']
const bodyShapes = ['沙漏型', '苹果型', '梨型', '矩形', '倒三角']

export default function AvatarPage() {
  const { isAuthenticated } = useAuth()
  const utils = trpc.useUtils()

  const { data: myAvatar } = trpc.avatar.getMyAvatar.useQuery(undefined, { enabled: isAuthenticated })
  const { data: personas } = trpc.avatar.listPersonas.useQuery()

  const upsertMutation = trpc.avatar.upsertAvatar.useMutation({
    onSuccess: () => utils.avatar.getMyAvatar.invalidate(),
  })
  const switchMutation = trpc.avatar.switchPersona.useMutation({
    onSuccess: () => utils.avatar.getMyAvatar.invalidate(),
  })

  const [form, setForm] = useState({
    faceShape: '', skinTone: '', hairType: '', hairColor: '', bodyShape: '',
    height: '', weight: '', activePersona: 'lingzhi',
  })
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (myAvatar) {
      setForm({
        faceShape: myAvatar.faceShape || '',
        skinTone: myAvatar.skinTone || '',
        hairType: myAvatar.hairType || '',
        hairColor: myAvatar.hairColor || '',
        bodyShape: myAvatar.bodyShape || '',
        height: myAvatar.height?.toString() || '',
        weight: myAvatar.weight?.toString() || '',
        activePersona: myAvatar.activePersona || 'lingzhi',
      })
    }
  }, [myAvatar])

  const handleSave = () => {
    upsertMutation.mutate({
      faceShape: form.faceShape || undefined,
      skinTone: form.skinTone || undefined,
      hairType: form.hairType || undefined,
      hairColor: form.hairColor || undefined,
      bodyShape: form.bodyShape || undefined,
      height: form.height ? parseInt(form.height) : undefined,
      weight: form.weight ? parseInt(form.weight) : undefined,
      activePersona: form.activePersona as any,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const activePersonaData = personas?.find(p => p.personaKey === form.activePersona)

  return (
    <div className="min-h-screen bg-black pb-28 px-4 pt-6">
      {/* Header */}
      <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/profile" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </Link>
        <h2 className="text-lg font-bold text-white">数字分身</h2>
      </div>

      {/* Active Persona Preview */}
      <div className={`glass-panel rounded-2xl p-5 mb-6 relative overflow-hidden transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-neon-cyan/10 to-neon-purple/10 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-neon-cyan/40">
            <img src={activePersonaData?.avatarImage || '/avatar-lingzhi.jpg'} alt="人设" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{activePersonaData?.name || '林志玲'}</h3>
            <p className="text-neon-cyan text-sm">{activePersonaData?.title || '温柔知性女神'}</p>
            <p className="text-white/40 text-xs mt-1">{activePersonaData?.voiceType || '温柔甜美'} · {activePersonaData?.personality?.slice(0, 20)}...</p>
          </div>
        </div>
      </div>

      {/* Persona Switcher */}
      <div className={`mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-sm text-white/50 mb-3">切换虚拟人设</h3>
        <div className="grid grid-cols-4 gap-3">
          {personas?.map(p => (
            <button
              key={p.personaKey}
              onClick={() => {
                setForm(prev => ({ ...prev, activePersona: p.personaKey }))
                if (isAuthenticated) switchMutation.mutate({ personaKey: p.personaKey as any })
              }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                form.activePersona === p.personaKey
                  ? 'bg-neon-cyan/15 border border-neon-cyan/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <img src={p.avatarImage || '/avatar-lingzhi.jpg'} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-white/70 text-center">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className={`glass-panel rounded-2xl p-4 mb-6 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-sm text-white/50 mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4" />
          形象照片
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {['正面照', '侧面照', '全身照'].map((label, i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-white/20" />
              <span className="text-[10px] text-white/30">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-2">上传照片后，AI将分析你的脸型、肤色和体型特征</p>
      </div>

      {/* Physical Attributes */}
      <div className={`space-y-4 mb-6 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-sm text-white/50 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          身体特征
        </h3>

        {/* Height / Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel rounded-xl p-3">
            <label className="text-xs text-white/40">身高 (cm)</label>
            <input
              type="number"
              value={form.height}
              onChange={e => setForm(prev => ({ ...prev, height: e.target.value }))}
              placeholder="170"
              className="w-full bg-transparent text-white text-lg font-bold outline-none mt-1"
            />
          </div>
          <div className="glass-panel rounded-xl p-3">
            <label className="text-xs text-white/40">体重 (kg)</label>
            <input
              type="number"
              value={form.weight}
              onChange={e => setForm(prev => ({ ...prev, weight: e.target.value }))}
              placeholder="65"
              className="w-full bg-transparent text-white text-lg font-bold outline-none mt-1"
            />
          </div>
        </div>

        {/* Face Shape */}
        <div>
          <label className="text-xs text-white/40 mb-2 block">脸型</label>
          <div className="flex flex-wrap gap-2">
            {faceShapes.map(shape => (
              <button
                key={shape}
                onClick={() => setForm(prev => ({ ...prev, faceShape: shape }))}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  form.faceShape === shape
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Skin Tone */}
        <div>
          <label className="text-xs text-white/40 mb-2 block">肤色</label>
          <div className="flex flex-wrap gap-2">
            {skinTones.map(tone => (
              <button
                key={tone}
                onClick={() => setForm(prev => ({ ...prev, skinTone: tone }))}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  form.skinTone === tone
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Body Shape */}
        <div>
          <label className="text-xs text-white/40 mb-2 block">体型</label>
          <div className="flex flex-wrap gap-2">
            {bodyShapes.map(shape => (
              <button
                key={shape}
                onClick={() => setForm(prev => ({ ...prev, bodyShape: shape }))}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  form.bodyShape === shape
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={handleSave}
          disabled={upsertMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 neon-border-cyan hover:from-neon-cyan/30 hover:to-neon-purple/30 transition-all disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-neon-cyan" />
              <span className="text-white font-medium">已保存</span>
            </>
          ) : upsertMutation.isPending ? (
            <>
              <RotateCcw className="w-5 h-5 text-neon-cyan animate-spin" />
              <span className="text-white font-medium">保存中...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 text-neon-cyan" />
              <span className="text-white font-medium">保存数字分身</span>
            </>
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/40 leading-relaxed">
            数字分身数据将用于：1) 个性化穿搭推荐 2) 发型/妆容建议 3) 健身计划定制 4) 护肤方案匹配。填写越完整，小蜜的建议越精准。
          </p>
        </div>
      </div>
    </div>
  )
}
