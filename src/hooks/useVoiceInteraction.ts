import { useState, useRef, useCallback, useEffect } from 'react'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export interface VoiceInteractionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  autoSpeak?: boolean // 是否自动语音播报AI回复
}

export interface VoiceInteractionResult {
  voiceState: VoiceState
  transcript: string
  isListening: boolean
  isSpeaking: boolean
  voiceEnabled: boolean
  currentPersona: string

  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  speak: (text: string, persona?: string) => void
  stopSpeaking: () => void
  toggleVoice: () => void
  setPersona: (persona: string) => void
}

// 人设对应的语音参数
const personaVoiceConfig: Record<string, { rate: number; pitch: number; voiceName?: string }> = {
  lingzhi: { rate: 0.9, pitch: 1.2, voiceName: 'Microsoft Kangkang' }, // 温柔甜美
  huge: { rate: 0.85, pitch: 0.9, voiceName: 'Microsoft Huihui' }, // 沉稳磁性
  wukong: { rate: 1.1, pitch: 1.0, voiceName: 'Microsoft Zhangjing' }, // 活泼俏皮
  ruoqi: { rate: 0.9, pitch: 1.1, voiceName: 'Microsoft Lili' }, // 温柔治愈
}

export function useVoiceInteraction(options: VoiceInteractionOptions = {}): VoiceInteractionResult {
  const {
    language = 'zh-CN',
    continuous = false,
    interimResults = false,
    autoSpeak = false,
  } = options

  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [currentPersona, setCurrentPersona] = useState('lingzhi')

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const isListeningRef = useRef(false)

  // 初始化语音识别
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('当前浏览器不支持语音识别')
      setVoiceEnabled(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      isListeningRef.current = true
      setVoiceState('listening')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript)
      }
    }

    recognition.onend = () => {
      isListeningRef.current = false
      if (voiceState === 'listening') {
        setVoiceState('idle')
      }
    }

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
      isListeningRef.current = false
      setVoiceState('error')
      setTimeout(() => setVoiceState('idle'), 2000)
    }

    recognitionRef.current = recognition

    // 初始化语音合成
    if (window.speechSynthesis) {
      synthesisRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
    }
  }, [language, continuous, interimResults])

  // 开始监听
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return
    try {
      setTranscript('')
      recognitionRef.current.start()
    } catch (e) {
      console.error('启动语音识别失败:', e)
      setVoiceState('error')
    }
  }, [])

  // 停止监听
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return
    try {
      recognitionRef.current.stop()
      isListeningRef.current = false
      setVoiceState('processing')
    } catch (e) {
      console.error('停止语音识别失败:', e)
    }
  }, [])

  // 切换监听
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening()
    } else {
      startListening()
    }
  }, [startListening, stopListening])

  // 语音播报
  const speak = useCallback((text: string, persona?: string) => {
    if (!synthesisRef.current || !voiceEnabled) return

    // 停止当前播报
    synthesisRef.current.cancel()

    const personaKey = persona || currentPersona
    const config = personaVoiceConfig[personaKey] || personaVoiceConfig.lingzhi

    setVoiceState('speaking')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = config.rate
    utterance.pitch = config.pitch

    // 尝试匹配合适的语音
    const voices = synthesisRef.current.getVoices()
    const preferredVoice = voices.find(v => v.name.includes(config.voiceName || ''))
    if (preferredVoice) {
      utterance.voice = preferredVoice
    } else {
      //  fallback: 选择中文语音
      const chineseVoice = voices.find(v => v.lang.startsWith('zh'))
      if (chineseVoice) utterance.voice = chineseVoice
    }

    utterance.onend = () => {
      setVoiceState(prev => isListeningRef.current ? 'listening' : 'idle')
    }

    utterance.onerror = (event) => {
      console.error('语音播报错误:', event)
      setVoiceState('error')
      setTimeout(() => setVoiceState('idle'), 2000)
    }

    synthesisRef.current.speak(utterance)
  }, [voiceEnabled, currentPersona, language])

  // 停止播报
  const stopSpeaking = useCallback(() => {
    if (!synthesisRef.current) return
    synthesisRef.current.cancel()
    setVoiceState(isListeningRef.current ? 'listening' : 'idle')
  }, [])

  // 切换语音功能
  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => !prev)
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
    }
  }, [])

  return {
    voiceState,
    transcript,
    isListening: isListeningRef.current,
    isSpeaking: voiceState === 'speaking',
    voiceEnabled,
    currentPersona,

    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    toggleVoice,
    setPersona: setCurrentPersona,
  }
}

export function getVoiceStateLabel(state: VoiceState): string {
  const labels: Record<VoiceState, string> = {
    idle: '点击麦克风开始说话',
    listening: '正在聆听...',
    processing: '处理中...',
    speaking: 'AI正在说话...',
    error: '语音功能异常',
  }
  return labels[state]
}
