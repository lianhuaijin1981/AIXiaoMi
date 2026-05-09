// 音频内容类型定义

export interface AudioTrack {
  id: string
  title: string
  description: string
  category: AudioCategory
  duration: number // 秒
  audioUrl: string
  coverImage?: string
  isLooping: boolean // 是否循环播放（白噪音通常是循环的）
  tags: string[]
}

export type AudioCategory = 'white-noise' | 'meditation' | 'sleep' | 'focus'

export interface AudioCategoryInfo {
  id: AudioCategory
  name: string
  icon: string
  description: string
  color: string
}

export interface PlaybackState {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isLooping: boolean
}

export interface AudioLibraryState {
  tracks: AudioTrack[]
  categories: AudioCategoryInfo[]
  selectedCategory: AudioCategory | 'all'
  favoriteIds: string[]
  recentlyPlayed: string[] // track ids
}
