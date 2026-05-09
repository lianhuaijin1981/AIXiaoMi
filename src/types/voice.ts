// 语音相关类型定义

// 唤醒词状态
export type WakeWordState = 'idle' | 'listening' | 'detected' | 'activated' | 'error'

// 语音交互状态
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

// 唤醒词配置
export interface WakeWordConfig {
  wakeWord: string // 唤醒词，默认"哎小蜜"
  sensitivity: 'low' | 'medium' | 'high' // 检测敏感度
  autoReactivate: boolean // 是否自动重新进入监听状态
  timeout: number // 唤醒后超时时间（毫秒），默认 10000
  enableSound: boolean // 是否播放唤醒提示音
}

// 唤醒词检测结果
export interface WakeWordResult {
  state: WakeWordState
  isListening: boolean
  isActivated: boolean
  detectedWord: string | null
  confidence: number // 检测置信度 0-1
  error: string | null
}

// 语音交互选项
export interface VoiceInteractionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  autoSpeak?: boolean // 是否自动语音播报AI回复
  wakeMode?: boolean // 是否启用唤醒词模式
  wakeWord?: string // 自定义唤醒词
  onWake?: () => void // 唤醒成功回调
}

// 语音交互结果
export interface VoiceInteractionResult {
  voiceState: VoiceState
  transcript: string
  isListening: boolean
  isSpeaking: boolean
  voiceEnabled: boolean
  currentPersona: string
  wakeWordState: WakeWordState
  isWakeMode: boolean

  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  speak: (text: string, persona?: string) => void
  stopSpeaking: () => void
  toggleVoice: () => void
  setPersona: (persona: string) => void

  // 唤醒词相关
  startWakeWordDetection: () => void
  stopWakeWordDetection: () => void
  toggleWakeMode: () => void
}

// 人设语音配置
export interface PersonaVoiceConfig {
  rate: number // 语速 0.1-10
  pitch: number // 音高 0-2
  voiceName?: string // 指定语音名称
  description: string // 人设描述
}

// 默认人设语音配置
export const defaultPersonaVoiceConfigs: Record<string, PersonaVoiceConfig> = {
  lingzhi: {
    rate: 0.9,
    pitch: 1.2,
    voiceName: 'Microsoft Kangkang',
    description: '温柔甜美',
  },
  huge: {
    rate: 0.85,
    pitch: 0.9,
    voiceName: 'Microsoft Huihui',
    description: '沉稳磁性',
  },
  wukong: {
    rate: 1.1,
    pitch: 1.0,
    voiceName: 'Microsoft Zhangjing',
    description: '活泼俏皮',
  },
  ruoqi: {
    rate: 0.9,
    pitch: 1.1,
    voiceName: 'Microsoft Lili',
    description: '温柔治愈',
  },
}

// 唤醒词状态标签
export function getWakeWordStateLabel(state: WakeWordState): string {
  const labels: Record<WakeWordState, string> = {
    idle: '点击激活语音唤醒',
    listening: '正在聆听唤醒词...',
    detected: '唤醒词已检测到！',
    activated: '已唤醒，我在听',
    error: '语音功能异常',
  }
  return labels[state]
}

// 语音状态标签
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
