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
import BottomNav from './components/BottomNav'
import { useEffect } from 'react'

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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isLanding && <BottomNav />}
      </div>
    </div>
  )
}
