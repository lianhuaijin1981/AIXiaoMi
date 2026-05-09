import { Routes, Route, useLocation } from 'react-router'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Schedule from './pages/Schedule'
import Tasks from './pages/Tasks'
import Profile from './pages/Profile'
import FeatureDetail from './pages/FeatureDetail'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import AvatarPage from './pages/AvatarPage'
import KnowledgePage from './pages/KnowledgePage'
import AssessmentPage from './pages/AssessmentPage'
import AudioLibrary from './pages/AudioLibrary'
import ThreeDAvatar from './pages/ThreeDAvatar'
import AudioPlayer from './components/AudioPlayer'
import VoiceWakeIndicator from './components/VoiceWakeIndicator'
import { AudioProvider } from './context/AudioContext'
import BottomNav from './components/BottomNav'
import { useEffect, useState } from 'react'

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    if (isLanding) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isLanding])

  return (
    <AudioProvider>
      <div className="min-h-screen bg-black">
        <div className={`mx-auto ${!isLanding ? 'max-w-md min-h-screen relative bg-black shadow-2xl' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feature/:id" element={<FeatureDetail />} />
            <Route path="/avatar" element={<AvatarPage />} />
            <Route path="/knowledge/:category" element={<KnowledgePage />} />
            <Route path="/assessment/:type" element={<AssessmentPage />} />
            <Route path="/audio" element={<AudioLibrary />} />
            <Route path="/3d-avatar" element={<ThreeDAvatar />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {!isLanding && <BottomNav />}
          <AudioPlayer />
          {/* 语音唤醒指示器 - 全局可用 */}
          <VoiceWakeIndicator
            onWake={() => {
              console.log('语音唤醒已激活！')
              // 可以在这里添加唤醒后的逻辑，比如跳转到聊天页面
            }}
          />
        </div>
      </div>
    </AudioProvider>
  )
}
