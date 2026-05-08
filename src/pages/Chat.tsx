import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Send, Mic, ChevronLeft, MoreVertical, Image, Paperclip } from 'lucide-react'

interface DisplayMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  avatar?: string
}

const avatars = [
  { id: 'lingzhi', name: '林志玲', image: '/avatar-lingzhi.jpg', desc: '温柔知性' },
  { id: 'huge', name: '胡歌', image: '/avatar-huge.jpg', desc: '沉稳理性' },
  { id: 'wukong', name: '孙悟空', image: '/avatar-wukong.jpg', desc: '活泼果敢' },
  { id: 'ruoqi', name: '唐若琪', image: '/avatar-ruoqi.jpg', desc: '治愈陪伴' },
]

const quickPrompts = [
  '帮我规划今天的日程',
  '推荐今晚的助眠音乐',
  '分析我的睡眠质量',
  '给我一些护肤建议',
]

export default function Chat() {
  const [inputText, setInputText] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const utils = trpc.useUtils()

  // Get chat history
  const { data: historyMessages, isLoading } = trpc.chat.list.useQuery()

  // Send message mutation
  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate()
    },
  })

  // Clear chat mutation
  const clearMutation = trpc.chat.clear.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate()
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historyMessages])

  const handleSend = () => {
    if (!inputText.trim() || sendMutation.isPending) return
    sendMutation.mutate({ content: inputText, persona: selectedAvatar.id as any })
    setInputText('')
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt)
  }

  const displayMessages: DisplayMessage[] = historyMessages?.map((m) => ({
    id: m.id.toString(),
    text: m.content,
    sender: m.role === 'user' ? 'user' : 'ai',
    timestamp: new Date(m.createdAt),
    avatar: m.role === 'assistant' ? `/avatar-${m.persona || 'lingzhi'}.jpg` : undefined,
  })) || []

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel border-b-0 rounded-none px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-1 -ml-1">
              <ChevronLeft className="w-6 h-6 text-white/70" />
            </Link>
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neon-cyan/50">
                <img src={selectedAvatar.image} alt={selectedAvatar.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
            </button>
            <div>
              <h3 className="text-white font-medium text-sm">{selectedAvatar.name}</h3>
              <p className="text-white/40 text-xs">{selectedAvatar.desc} · {sendMutation.isPending ? '思考中...' : '在线'}</p>
            </div>
          </div>
          <button onClick={() => clearMutation.mutate()} className="p-1" title="清空对话">
            <MoreVertical className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {showAvatarPicker && (
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/40 mb-2">切换人设</p>
            <div className="flex gap-3">
              {avatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => { setSelectedAvatar(avatar); setShowAvatarPicker(false) }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    selectedAvatar.id === avatar.id ? 'bg-neon-cyan/10 border border-neon-cyan/30' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                    <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-white/70">{avatar.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {displayMessages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:border-neon-cyan/30 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4 text-white/30 text-sm">
            <div className="w-6 h-6 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-2" />
            加载对话中...
          </div>
        )}

        {displayMessages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                <img src={msg.avatar || selectedAvatar.image} alt="AI" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-neon-cyan/15 text-cyan-50 rounded-br-md border border-neon-cyan/20'
                : 'bg-white/5 text-white/80 rounded-bl-md border border-white/10'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {sendMutation.isPending && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
              <img src={selectedAvatar.image} alt="AI" className="w-full h-full object-cover" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-[88px] z-30 px-4 py-3">
        <div className="glass-panel rounded-2xl p-2 flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Paperclip className="w-5 h-5 text-white/40" />
          </button>
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Image className="w-5 h-5 text-white/40" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="跟小蜜说点什么..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none px-2"
          />
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="p-2.5 rounded-xl bg-neon-cyan/20 hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-neon-cyan" />
            </button>
          ) : (
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Mic className="w-5 h-5 text-white/50" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
