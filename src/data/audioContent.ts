import { AudioTrack, AudioCategoryInfo } from '../types/audio'

// 音频分类信息
export const audioCategories: AudioCategoryInfo[] = [
  {
    id: 'white-noise',
    name: '白噪音',
    icon: '🌧️',
    description: '自然白噪音，帮助专注和放松',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    id: 'meditation',
    name: '冥想引导',
    icon: '🧘',
    description: '专业冥想引导，缓解压力焦虑',
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 'sleep',
    name: '助眠音乐',
    icon: '🌙',
    description: '轻柔助眠音乐，改善睡眠质量',
    color: 'from-indigo-400 to-purple-400',
  },
  {
    id: 'focus',
    name: '专注音乐',
    icon: '🎯',
    description: '提升专注力的背景音乐',
    color: 'from-green-400 to-teal-400',
  },
]

// 白噪音资源
export const whiteNoiseTracks: AudioTrack[] = [
  {
    id: 'rain-light',
    title: '小雨淅沥',
    description: '轻柔的雨声，适合工作和学习',
    category: 'white-noise',
    duration: 3600, // 1小时循环
    audioUrl: '/audio/white-noise/light-rain.mp3',
    isLooping: true,
    tags: ['雨声', '轻柔', '工作'],
  },
  {
    id: 'rain-heavy',
    title: '大雨滂沱',
    description: '滂沱大雨声，屏蔽外界干扰',
    category: 'white-noise',
    duration: 3600,
    audioUrl: '/audio/white-noise/heavy-rain.mp3',
    isLooping: true,
    tags: ['雨声', '重度', '屏蔽噪音'],
  },
  {
    id: 'ocean-waves',
    title: '海浪拍岸',
    description: '海浪轻轻拍打沙滩的声音',
    category: 'white-noise',
    duration: 3600,
    audioUrl: '/audio/white-noise/ocean-waves.mp3',
    isLooping: true,
    tags: ['海浪', '海洋', '放松'],
  },
  {
    id: 'forest-birds',
    title: '森林鸟鸣',
    description: '清晨森林里的鸟鸣声',
    category: 'white-noise',
    duration: 3600,
    audioUrl: '/audio/white-noise/forest-birds.mp3',
    isLooping: true,
    tags: ['森林', '鸟鸣', '自然'],
  },
  {
    id: 'wind-leaves',
    title: '风吹树叶',
    description: '微风吹动树叶的沙沙声',
    category: 'white-noise',
    duration: 3600,
    audioUrl: '/audio/white-noise/wind-leaves.mp3',
    isLooping: true,
    tags: ['风声', '树叶', '轻柔'],
  },
  {
    id: 'creek-flowing',
    title: '小溪流水',
    description: '山间小溪潺潺流水声',
    category: 'white-noise',
    duration: 3600,
    audioUrl: '/audio/white-noise/creek.mp3',
    isLooping: true,
    tags: ['流水', '溪流', '山间'],
  },
]

// 冥想引导资源
export const meditationTracks: AudioTrack[] = [
  {
    id: 'meditation-breathing',
    title: '呼吸冥想',
    description: '10分钟基础呼吸冥想，适合初学者',
    category: 'meditation',
    duration: 600,
    audioUrl: '/audio/meditation/breathing.mp3',
    isLooping: false,
    tags: ['呼吸', '初学者', '放松'],
  },
  {
    id: 'meditation-body-scan',
    title: '身体扫描冥想',
    description: '20分钟身体扫描，深度放松全身',
    category: 'meditation',
    duration: 1200,
    audioUrl: '/audio/meditation/body-scan.mp3',
    isLooping: false,
    tags: ['身体扫描', '深度放松', '中级'],
  },
  {
    id: 'meditation-loving-kindness',
    title: '慈心冥想',
    description: '培养慈悲与接纳的冥想练习',
    category: 'meditation',
    duration: 900,
    audioUrl: '/audio/meditation/loving-kindness.mp3',
    isLooping: false,
    tags: ['慈心', '情绪调节', '中级'],
  },
  {
    id: 'meditation-stress-relief',
    title: '压力释放冥想',
    description: '15分钟快速缓解压力与焦虑',
    category: 'meditation',
    duration: 900,
    audioUrl: '/audio/meditation/stress-relief.mp3',
    isLooping: false,
    tags: ['压力', '焦虑', '快速'],
  },
  {
    id: 'meditation-gratitude',
    title: '感恩冥想',
    description: '培养感恩之心的冥想练习',
    category: 'meditation',
    duration: 900,
    audioUrl: '/audio/meditation/gratitude.mp3',
    isLooping: false,
    tags: ['感恩', '积极心理', '情绪'],
  },
]

// 助眠音乐
export const sleepTracks: AudioTrack[] = [
  {
    id: 'sleep-piano',
    title: '钢琴小夜曲',
    description: '轻柔的钢琴曲，帮助入眠',
    category: 'sleep',
    duration: 1800,
    audioUrl: '/audio/sleep/piano.mp3',
    isLooping: false,
    tags: ['钢琴', '轻柔', '古典'],
  },
  {
    id: 'sleep-nature',
    title: '自然摇篮曲',
    description: '自然声音与轻柔旋律的完美结合',
    category: 'sleep',
    duration: 2400,
    audioUrl: '/audio/sleep/nature-lullaby.mp3',
    isLooping: false,
    tags: ['自然', '摇篮曲', '混合'],
  },
  {
    id: 'sleep-delta',
    title: 'Delta波助眠',
    description: 'Δ波频率音乐，科学助眠',
    category: 'sleep',
    duration: 3600,
    audioUrl: '/audio/sleep/delta-waves.mp3',
    isLooping: true,
    tags: ['Δ波', '科学', '深度睡眠'],
  },
]

// 专注音乐
export const focusTracks: AudioTrack[] = [
  {
    id: 'focus-alpha',
    title: 'Alpha波专注',
    description: 'α波频率音乐，提升专注力',
    category: 'focus',
    duration: 3600,
    audioUrl: '/audio/focus/alpha-waves.mp3',
    isLooping: true,
    tags: ['α波', '专注', '学习'],
  },
  {
    id: 'focus-lofi',
    title: 'Lo-Fi 学习音乐',
    description: '适合长期学习的Lo-Fi音乐',
    category: 'focus',
    duration: 3600,
    audioUrl: '/audio/focus/lofi-study.mp3',
    isLooping: true,
    tags: ['Lo-Fi', '学习', '轻松'],
  },
  {
    id: 'focus-ambient',
    title: '环境音乐',
    description: '沉浸式环境音乐，屏蔽干扰',
    category: 'focus',
    duration: 3600,
    audioUrl: '/audio/focus/ambient.mp3',
    isLooping: true,
    tags: ['环境', '沉浸', '工作'],
  },
]

// 所有音频资源
export const allAudioTracks: AudioTrack[] = [
  ...whiteNoiseTracks,
  ...meditationTracks,
  ...sleepTracks,
  ...focusTracks,
]

// 根据分类获取音频
export function getTracksByCategory(category: string): AudioTrack[] {
  if (category === 'all') return allAudioTracks
  return allAudioTracks.filter((track) => track.category === category)
}

// 根据ID获取音频
export function getTrackById(id: string): AudioTrack | undefined {
  return allAudioTracks.find((track) => track.id === id)
}
