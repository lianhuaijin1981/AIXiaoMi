import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Play, Pause, Heart, Clock } from 'lucide-react'
import { audioCategories, allAudioTracks, getTracksByCategory, getTrackById } from '../data/audioContent'
import type { AudioCategory, AudioTrack } from '../types/audio'
import { useAudioPlayer } from '../context/AudioContext'

export default function AudioLibrary() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<AudioCategory | 'all'>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const { playbackState, play, pause } = useAudioPlayer()
  const { currentTrack, isPlaying } = playbackState

  const filteredTracks = getTracksByCategory(selectedCategory)

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) => {
      const newFavs = new Set(prev)
      if (newFavs.has(trackId)) {
        newFavs.delete(trackId)
      } else {
        newFavs.add(trackId)
      }
      return newFavs
    })
  }

  const handlePlayTrack = (track: AudioTrack) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pause()
    } else {
      play(track)
    }
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) {
      return `${hrs}小时${mins}分`
    }
    return `${mins}分钟`
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 glass-panel backdrop-blur-xl">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">音频内容库</h1>
        </div>
      </div>

      {/* 分类选择 */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-neon-cyan text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            全部
          </button>
          {audioCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-neon-cyan text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 分类描述 */}
      {selectedCategory !== 'all' && (
        <div className="px-4 mb-4">
          {audioCategories
            .filter((cat) => cat.id === selectedCategory)
            .map((cat) => (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl bg-gradient-to-r ${cat.color} bg-opacity-20 border border-white/10`}
              >
                <h3 className="font-semibold mb-1">
                  {cat.icon} {cat.name}
                </h3>
                <p className="text-sm text-white/70">{cat.description}</p>
              </div>
            ))}
        </div>
      )}

      {/* 音频列表 */}
      <div className="px-4 space-y-3">
        {filteredTracks.map((track) => {
          const isCurrentTrack = currentTrack?.id === track.id
          const isPlayingThis = isCurrentTrack && isPlaying

          return (
            <div
              key={track.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCurrentTrack
                  ? 'bg-neon-cyan/10 border-neon-cyan/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* 播放按钮 */}
                <button
                  onClick={() => handlePlayTrack(track)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isCurrentTrack
                      ? 'bg-neon-cyan text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isPlayingThis ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>

                {/* 音频信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{track.title}</h4>
                  <p className="text-xs text-white/60 mt-0.5">{track.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Clock size={12} />
                      {track.isLooping ? '循环播放' : formatDuration(track.duration)}
                    </span>
                    <div className="flex gap-1">
                      {track.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 收藏按钮 */}
                <button
                  onClick={() => toggleFavorite(track.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.has(track.id)
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Heart size={18} fill={favorites.has(track.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 空状态 */}
      {filteredTracks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <div className="text-6xl mb-4">🎵</div>
          <p>该分类暂无音频内容</p>
        </div>
      )}
    </div>
  )
}
