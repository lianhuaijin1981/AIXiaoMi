import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import type { AudioTrack, PlaybackState } from '../types/audio'

interface AudioContextType {
  playbackState: PlaybackState
  play: (track: AudioTrack) => void
  pause: () => void
  stop: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleLoop: () => void
  formatTime: (seconds: number) => string
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isLooping: true,
  })

  // 初始化 Audio 元素
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = playbackState.volume

    const audio = audioRef.current

    const updateTime = () => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }))
    }

    const updateDuration = () => {
      setPlaybackState((prev) => ({
        ...prev,
        duration: audio.duration,
      }))
    }

    const handleEnded = () => {
      if (playbackState.isLooping && playbackState.currentTrack?.isLooping) {
        audio.currentTime = 0
        audio.play()
      } else {
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: false,
        }))
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // 播放音频
  const play = useCallback(
    (track: AudioTrack) => {
      const audio = audioRef.current
      if (!audio) return

      if (playbackState.currentTrack?.id === track.id) {
        // 同一首歌，切换播放/暂停
        if (playbackState.isPlaying) {
          audio.pause()
          setPlaybackState((prev) => ({ ...prev, isPlaying: false }))
        } else {
          audio.play()
          setPlaybackState((prev) => ({ ...prev, isPlaying: true }))
        }
      } else {
        // 新歌曲
        audio.src = track.audioUrl
        audio.load()
        audio.play()
        setPlaybackState((prev) => ({
          ...prev,
          currentTrack: track,
          isPlaying: true,
          currentTime: 0,
        }))
      }
    },
    [playbackState.currentTrack, playbackState.isPlaying],
  )

  // 暂停
  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }))
  }, [])

  // 停止
  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }))
  }, [])

  // 跳转到指定时间
  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = time
    setPlaybackState((prev) => ({ ...prev, currentTime: time }))
  }, [])

  // 设置音量
  const setVolume = useCallback(
    (volume: number) => {
      const audio = audioRef.current
      if (!audio) return

      const newVolume = Math.max(0, Math.min(1, volume))
      audio.volume = newVolume
      setPlaybackState((prev) => ({
        ...prev,
        volume: newVolume,
        isMuted: newVolume === 0,
      }))
    },
    [],
  )

  // 切换静音
  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (playbackState.isMuted) {
      audio.volume = playbackState.volume || 0.7
      setPlaybackState((prev) => ({
        ...prev,
        isMuted: false,
        volume: prev.volume || 0.7,
      }))
    } else {
      audio.volume = 0
      setPlaybackState((prev) => ({
        ...prev,
        isMuted: true,
      }))
    }
  }, [playbackState.isMuted, playbackState.volume])

  // 切换循环
  const toggleLoop = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      isLooping: !prev.isLooping,
    }))
  }, [])

  // 格式化时间
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AudioContext.Provider
      value={{
        playbackState,
        play,
        pause,
        stop,
        seekTo,
        setVolume,
        toggleMute,
        toggleLoop,
        formatTime,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioProvider')
  }
  return context
}
