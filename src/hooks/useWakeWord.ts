import { useState, useRef, useCallback, useEffect } from 'react'
import type { WakeWordState, WakeWordConfig, WakeWordResult } from '../types/voice'

// 默认配置
const DEFAULT_CONFIG: WakeWordConfig = {
  wakeWord: '哎小蜜',
  sensitivity: 'medium',
  autoReactivate: true,
  timeout: 10000,
  enableSound: true,
}

// 敏感度对应的匹配阈值
const SENSITIVITY_THRESHOLDS: Record<string, number> = {
  low: 0.8, // 需要更精确的匹配
  medium: 0.6, // 中等匹配
  high: 0.4, // 宽松匹配
}

export interface UseWakeWordReturn extends WakeWordResult {
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  resetState: () => void
}

export function useWakeWord(
  config?: Partial<WakeWordConfig>,
  onWake?: () => void,
): UseWakeWordReturn {
  const finalConfig: WakeWordConfig = { ...DEFAULT_CONFIG, ...config }

  const [state, setState] = useState<WakeWordState>('idle')
  const [detectedWord, setDetectedWord] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // 初始化 AudioContext（用于播放提示音）
  useEffect(() => {
    if (typeof window !== 'undefined' && finalConfig.enableSound) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [finalConfig.enableSound])

  // 播放唤醒提示音
  const playWakeSound = useCallback(() => {
    if (!finalConfig.enableSound || !audioContextRef.current) return

    try {
      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // 播放简短的"叮"声
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (err) {
      console.error('播放唤醒提示音失败:', err)
    }
  }, [finalConfig.enableSound])

  // 检测唤醒词
  const checkWakeWord = useCallback((transcript: string): boolean => {
    const wakeWord = finalConfig.wakeWord.toLowerCase()
    const text = transcript.toLowerCase()

    // 直接匹配
    if (text.includes(wakeWord)) {
      setConfidence(1.0)
      return true
    }

    // 容错匹配（支持变体）
    const variants = [
      '哎小蜜',
      '哎小米',
      '爱小蜜',
      '爱小米',
      '嗨小蜜',
      '嗨小米',
    ]

    for (const variant of variants) {
      if (text.includes(variant)) {
        setConfidence(0.8)
        return true
      }
    }

    // 模糊匹配（拼音相似度）
    const threshold = SENSITIVITY_THRESHOLDS[finalConfig.sensitivity]
    if (threshold > 0.5) {
      // 低敏感度不做模糊匹配
      return false
    }

    // 简单模糊匹配：检查是否包含关键词"小蜜"或"小米"
    if (text.includes('小蜜') || text.includes('小米')) {
      setConfidence(0.6)
      return true
    }

    return false
  }, [finalConfig.wakeWord, finalConfig.sensitivity])

  // 初始化语音识别
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('当前浏览器不支持语音识别')
      setState('error')
      setError('当前浏览器不支持语音识别')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true // 连续监听
    recognition.interimResults = true // 启用临时结果
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      isListeningRef.current = true
      setState('listening')
      setError(null)
      console.log('语音唤醒监听已启动')
    }

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const isFinal = event.results[i].isFinal

        console.log('识别到语音:', transcript, isFinal ? '(最终)' : '(临时)')

        // 检查是否包含唤醒词
        if (checkWakeWord(transcript)) {
          console.log('检测到唤醒词:', transcript)
          setDetectedWord(transcript)
          setState('detected')

          // 播放提示音
          playWakeSound()

          // 触发回调
          if (onWake) {
            onWake()
          }

          // 切换到激活状态
          setTimeout(() => {
            setState('activated')

            // 设置超时，自动返回监听状态
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => {
              if (finalConfig.autoReactivate) {
                setState('listening')
                setDetectedWord(null)
              } else {
                setState('idle')
              }
            }, finalConfig.timeout)
          }, 500)
        }
      }
    }

    recognition.onend = () => {
      isListeningRef.current = false
      console.log('语音识别已结束，状态:', state)

      // 如果是监听状态意外结束，尝试重新启动
      if (state === 'listening') {
        console.log('尝试重新启动语音识别...')
        try {
          recognition.start()
        } catch (e) {
          console.error('重新启动失败:', e)
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
      isListeningRef.current = false

      if (event.error === 'not-allowed') {
        setError('请允许麦克风权限以使用语音唤醒功能')
        setState('error')
      } else if (event.error === 'network') {
        setError('网络错误，请检查网络连接')
        setState('error')
      } else if (event.error!== 'aborted') {
        setError(`语音识别错误: ${event.error}`)
        setState('error')
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // ignore
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [finalConfig.wakeWord, finalConfig.sensitivity, finalConfig.autoReactivate, finalConfig.timeout, onWake, playWakeSound, checkWakeWord])

  // 开始监听
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return

    try {
      setError(null)
      recognitionRef.current.start()
    } catch (e: any) {
      console.error('启动语音识别失败:', e)
      setError('启动语音识别失败')
      setState('error')
    }
  }, [])

  // 停止监听
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return

    try {
      recognitionRef.current.stop()
      isListeningRef.current = false
      setState('idle')
      setDetectedWord(null)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    } catch (e) {
      console.error('停止语音识别失败:', e)
    }
  }, [])

  // 切换监听状态
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening()
    } else {
      startListening()
    }
  }, [startListening, stopListening])

  // 重置状态
  const resetState = useCallback(() => {
    setState('idle')
    setDetectedWord(null)
    setConfidence(0)
    setError(null)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    state,
    isListening: isListeningRef.current,
    isActivated: state === 'activated',
    detectedWord,
    confidence,
    error,

    startListening,
    stopListening,
    toggleListening,
    resetState,
  }
}
