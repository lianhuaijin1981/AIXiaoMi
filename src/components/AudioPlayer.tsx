import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { useAudioPlayer } from '@/context/AudioContext'

export default function AudioPlayer() {
  const {
    playbackState,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    toggleMute,
    formatTime,
  } = useAudioPlayer()

  const { currentTrack, isPlaying, currentTime, duration, volume, isMuted } = playbackState

  // 如果没有当前播放的音频，不渲染
  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration
    seekTo(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100
    setVolume(newVolume)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play(currentTrack)
    }
  }

  const handleClose = () => {
    stop()
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 max-w-md mx-auto px-4">
      <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-white/20">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* 音频信息 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-magenta/30 flex items-center justify-center flex-shrink-0">
            <Play size={20} className="text-white ml-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{currentTrack.title}</h4>
            <p className="text-xs text-white/60">{currentTrack.description}</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-white/60 w-12 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-neon-cyan
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-xs text-white/60 w-12">{formatTime(duration)}</span>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-neon-cyan text-black flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
