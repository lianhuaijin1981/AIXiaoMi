import { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useWakeWord } from '@/hooks/useWakeWord'
import { getWakeWordStateLabel } from '@/types/voice'

interface VoiceWakeIndicatorProps {
  onWake?: () => void
  className?: string
}

export default function VoiceWakeIndicator({ onWake, className = '' }: VoiceWakeIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    state,
    isListening,
    isActivated,
    detectedWord,
    error,
    startListening,
    stopListening,
    toggleListening,
  } = useWakeWord(
    {
      wakeWord: '哎小蜜',
      sensitivity: 'medium',
      autoReactivate: true,
      timeout: 10000,
      enableSound: true,
    },
    () => {
      // 唤醒成功回调
      console.log('唤醒词已检测到！')
      if (onWake) {
        onWake()
      }
    },
  )

  // 唤醒状态变化时输出日志
  useEffect(() => {
    console.log('唤醒状态变化:', state)
  }, [state])

  // 获取状态颜色
  const getStatusColor = () => {
    switch (state) {
      case 'idle':
        return 'text-white/40 border-white/20 bg-white/5'
      case 'listening':
        return 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10'
      case 'detected':
        return 'text-green-400 border-green-400/50 bg-green-400/10'
      case 'activated':
        return 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/20'
      case 'error':
        return 'text-red-400 border-red-400/50 bg-red-400/10'
      default:
        return 'text-white/40 border-white/20 bg-white/5'
    }
  }

  // 获取动画类名
  const getAnimationClass = () => {
    switch (state) {
      case 'listening':
        return 'animate-pulse'
      case 'detected':
        return 'animate-bounce'
      case 'activated':
        return 'animate-ping-once'
      default:
        return ''
    }
  }

  return (
    <div className={`fixed bottom-20 right-4 z-50 ${className}`}>
      {/* 展开的面板 */}
      {isExpanded && (
        <div className="mb-4 p-4 rounded-2xl glass-panel border border-white/10 w-64 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium text-sm">语音唤醒</h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 状态显示 */}
          <div className={`px-3 py-2 rounded-xl border ${getStatusColor()} mb-3`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${state === 'listening' ? 'bg-neon-cyan animate-pulse' : state === 'activated' ? 'bg-green-400' : 'bg-white/40'}`} />
              <span className="text-xs">{getWakeWordStateLabel(state)}</span>
            </div>
          </div>

          {/* 检测到唤醒词提示 */}
          {state === 'detected' && detectedWord && (
            <div className="mb-3 p-2 rounded-lg bg-green-400/10 border border-green-400/20">
              <p className="text-xs text-green-400">检测到: "{detectedWord}"</p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-400/10 border border-red-400/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-400/20 text-red-400 hover:bg-red-400/30'
                  : 'bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-xs">{isListening ? '停止' : '开始'}</span>
            </button>
          </div>

          {/* 提示文字 */}
          <p className="text-[10px] text-white/30 mt-3 text-center">
            说出"哎小蜜"唤醒助手
          </p>
        </div>
      )}

      {/* 悬浮按钮 */}
      <button
        onClick={() => {
          if (!isExpanded && !isListening) {
            // 如果未展开且未监听，点击后展开并自动开始监听
            setIsExpanded(true)
            setTimeout(() => startListening(), 100)
          } else if (!isExpanded && isListening) {
            // 如果未展开但正在监听，只展开面板
            setIsExpanded(true)
          } else {
            // 如果已展开，切换面板显示
            setIsExpanded(!isExpanded)
          }
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
          state === 'activated'
            ? 'bg-neon-cyan text-black scale-110 shadow-neon-cyan/50'
            : state === 'listening'
              ? 'bg-white/10 text-neon-cyan border-2 border-neon-cyan/50 ' + getAnimationClass()
              : state === 'detected'
                ? 'bg-green-400/20 text-green-400 ' + getAnimationClass()
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
        }`}
        title={getWakeWordStateLabel(state)}
      >
        {state === 'activated' ? (
          <div className="text-center">
            <Volume2 className="w-5 h-5 mx-auto" />
            <span className="text-[8px] font-medium">我在</span>
          </div>
        ) : state === 'listening' ? (
          <Mic className="w-6 h-6" />
        ) : state === 'detected' ? (
          <div className="text-center">
            <Volume2 className="w-5 h-5 mx-auto" />
            <span className="text-[8px]">检测到</span>
          </div>
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* 监听状态的脉冲动画 */}
      {state === 'listening' && (
        <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/30 animate-ping" />
      )}

      {/* 激活状态的成功动画 */}
      {state === 'activated' && (
        <div className="absolute -inset-2 rounded-full border border-neon-cyan/20 animate-pulse" />
      )}
    </div>
  )
}
