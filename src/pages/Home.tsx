import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { use3DTilt } from '../hooks/use3DTilt'
import { Mic, ChevronRight, Sparkles } from 'lucide-react'

export default function Home() {
  const { ref: tiltRef, handlers: tiltHandlers } = use3DTilt()
  const [bubblesVisible, setBubblesVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer1 = setTimeout(() => setTitleVisible(true), 300)
    const timer2 = setTimeout(() => setBubblesVisible(true), 800)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return
      const scrollY = window.scrollY
      const heroLayer = heroRef.current.querySelector('.hero-layer') as HTMLElement
      if (heroLayer) {
        heroLayer.style.transform = `translateY(${scrollY * 0.3}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const chatBubbles = [
    { text: '今晚睡不着怎么办？', delay: 0, side: 'left' as const },
    { text: '我来为你播放白噪音，同时引导你做个放松冥想。', delay: 0.5, side: 'right' as const },
    { text: '明天穿搭有什么建议？', delay: 1, side: 'left' as const },
    { text: '根据明天18°C多云的天气，为你搭配了一套look。', delay: 1.5, side: 'right' as const },
  ]

  return (
    <div ref={heroRef} className="relative min-h-screen bg-black overflow-hidden">
      {/* Background breathing glow */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-breathe"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(112, 0, 255, 0.05) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* 3D Digital Human Layer */}
      <div className="hero-layer absolute top-[15%] left-1/2 -translate-x-1/2 z-10 w-[320px] sm:w-[400px]">
        <div className="relative">
          <img
            src="/hero-avatar.jpg"
            alt="AI Digital Human"
            className="w-full h-auto rounded-3xl"
            style={{ filter: 'drop-shadow(0 0 60px rgba(112, 0, 255, 0.4))' }}
          />
          {/* Rim light overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, transparent 50%, rgba(112,0,255,0.15) 100%)',
            }}
          />
        </div>
      </div>

      {/* HUD Chat Interface with 3D Tilt */}
      <div
        ref={tiltRef}
        {...tiltHandlers}
        className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[360px]"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs text-white/60 font-space">爱小蜜 · 在线</span>
          </div>
          {chatBubbles.map((bubble, i) => (
            <div
              key={i}
              className={`flex ${bubble.side === 'right' ? 'justify-end' : 'justify-start'} animate-float-up`}
              style={{
                animationDelay: bubblesVisible ? `${bubble.delay}s` : '0s',
                opacity: bubblesVisible ? 1 : 0,
              }}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  bubble.side === 'right'
                    ? 'neon-border-cyan bg-cyan-500/10 text-cyan-100 rounded-br-md'
                    : 'bg-white/5 border border-white/10 text-white/80 rounded-bl-md'
                }`}
              >
                {bubble.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Title & CTA */}
      <div className="absolute top-[8%] left-0 right-0 z-30 text-center px-6">
        <div
          className={`transition-all duration-1000 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
            <span className="text-sm text-neon-cyan font-space tracking-widest uppercase">全天候 · 全场景</span>
            <Sparkles className="w-5 h-5 text-neon-cyan" />
          </div>
          <h1 className="font-space text-5xl sm:text-6xl font-bold text-white mb-2 text-glow-cyan">
            爱小蜜
          </h1>
          <p className="text-white/50 text-sm sm:text-base font-light tracking-wide">
            你的专属 AI 数字分身管家
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-[6%] left-0 right-0 z-30 px-6">
        <div className={`transition-all duration-1000 delay-500 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link
            to="/dashboard"
            className="group flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 neon-border-cyan hover:from-neon-cyan/30 hover:to-neon-purple/30 transition-all duration-300"
          >
            <Mic className="w-5 h-5 text-neon-cyan" />
            <span className="text-white font-medium text-lg">唤醒小蜜</span>
            <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-center text-white/30 text-xs mt-3">
            支持 iOS · Android · HarmonyOS
          </p>
        </div>
      </div>
    </div>
  )
}
