"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

// Floating 3D shapes that react to scroll
function FloatingShape({ 
  shape, color, size, x, y, z, rotateSpeed, scrollMultiplier, scrollY, mouseX, mouseY 
}: {
  shape: 'cube' | 'ring' | 'pyramid' | 'sphere' | 'diamond' | 'helix'
  color: string
  size: number
  x: string
  y: string
  z: number
  rotateSpeed: number
  scrollMultiplier: number
  scrollY: number
  mouseX: number
  mouseY: number
}) {
  const parallax = scrollY * scrollMultiplier
  const mouseParallax = z * 0.02
  const rotateAngle = scrollY * rotateSpeed + Date.now() * 0.01 * rotateSpeed

  const shapes: Record<string, React.ReactNode> = {
    cube: (
      <div className="relative" style={{ width: size, height: size, transformStyle: 'preserve-3d' }}>
        {[
          { ry: '0deg', tz: size/2 },
          { ry: '90deg', tz: size/2 },
          { ry: '180deg', tz: size/2 },
          { ry: '270deg', tz: size/2 },
          { rx: '90deg', tz: size/2 },
          { rx: '-90deg', tz: size/2 },
        ].map((face, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `${face.ry ? `rotateY(${face.ry})` : `rotateX(${face.rx})`} translateZ(${face.tz}px)`,
              background: `linear-gradient(135deg, ${color}22, ${color}08)`,
              border: `1px solid ${color}44`,
              backdropFilter: 'blur(4px)',
            }}
          />
        ))}
      </div>
    ),
    ring: (
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}66`,
          borderRadius: '50%',
          boxShadow: `0 0 ${size/3}px ${color}33, inset 0 0 ${size/4}px ${color}22`,
        }}
      />
    ),
    pyramid: (
      <div style={{ width: 0, height: 0, borderLeft: `${size/2}px solid transparent`, borderRight: `${size/2}px solid transparent`, borderBottom: `${size}px solid ${color}33`, filter: `drop-shadow(0 0 ${size/5}px ${color}44)` }} />
    ),
    sphere: (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${color}55, ${color}11 60%, transparent)`,
          boxShadow: `0 0 ${size/2}px ${color}22, inset 0 0 ${size/3}px ${color}11`,
        }}
      />
    ),
    diamond: (
      <div
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `1px solid ${color}55`,
          transform: 'rotate(45deg)',
          boxShadow: `0 0 ${size/2}px ${color}22`,
        }}
      />
    ),
    helix: (
      <div className="flex flex-col gap-1" style={{ height: size }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: size * 0.7,
              height: 3,
              background: `${color}${Math.floor(30 + i * 10).toString(16)}`,
              borderRadius: 2,
              transform: `translateX(${Math.sin(i * 1.2) * size * 0.3}px)`,
            }}
          />
        ))}
      </div>
    ),
  }

  return (
    <div
      className="absolute transition-none"
      style={{
        left: x,
        top: y,
        transform: `
          translate3d(${mouseX * mouseParallax}px, ${mouseY * mouseParallax - parallax}px, ${z}px)
          rotateX(${rotateAngle * 0.7}deg)
          rotateY(${rotateAngle}deg)
          rotateZ(${rotateAngle * 0.3}deg)
        `,
        transformStyle: 'preserve-3d',
        zIndex: z > 0 ? 2 : 0,
        opacity: Math.max(0.3, 1 - scrollY * 0.001),
      }}
    >
      {shapes[shape]}
    </div>
  )
}

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const currentScroll = useRef(0)
  const currentMouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth < 768)

    const handleScroll = () => {
      currentScroll.current = window.scrollY
    }
    const handleMouse = (e: MouseEvent) => {
      currentMouse.current = {
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
      }
    }

    // Smooth RAF loop for buttery animations
    const tick = () => {
      setScrollY(currentScroll.current)
      setMousePos(currentMouse.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouse, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const p = scrollY * 0.5  // parallax base
  const perspective = 1200
  const scrollProgress = Math.min(scrollY / 800, 1) // 0 to 1 over 800px scroll

  // Dynamic tilt based on mouse
  const tiltX = mousePos.y * 5
  const tiltY = mousePos.x * -5

  // Show fewer shapes on mobile for performance
  const allShapes = [
    { shape: 'cube' as const,    color: '#00d4ff', size: 60,  x: '8%',  y: '15%', z: 30,   rotateSpeed: 0.08, scrollMultiplier: 0.8 },
    { shape: 'ring' as const,    color: '#3b82f6', size: 90,  x: '85%', y: '20%', z: -20,  rotateSpeed: 0.05, scrollMultiplier: 0.3 },
    { shape: 'diamond' as const, color: '#a855f7', size: 40,  x: '15%', y: '70%', z: 50,   rotateSpeed: 0.12, scrollMultiplier: 1.2 },
    { shape: 'sphere' as const,  color: '#00d4ff', size: 70,  x: '90%', y: '65%', z: 10,   rotateSpeed: 0.03, scrollMultiplier: 0.5 },
    { shape: 'pyramid' as const, color: '#f59e0b', size: 50,  x: '75%', y: '80%', z: 40,   rotateSpeed: 0.09, scrollMultiplier: 0.9 },
    { shape: 'helix' as const,   color: '#3b82f6', size: 80,  x: '5%',  y: '45%', z: -30,  rotateSpeed: 0.04, scrollMultiplier: 0.2 },
    { shape: 'cube' as const,    color: '#a855f7', size: 35,  x: '70%', y: '10%', z: 60,   rotateSpeed: 0.15, scrollMultiplier: 1.5 },
    { shape: 'ring' as const,    color: '#00d4ff', size: 50,  x: '45%', y: '85%', z: -10,  rotateSpeed: 0.06, scrollMultiplier: 0.4 },
    { shape: 'sphere' as const,  color: '#f59e0b', size: 30,  x: '30%', y: '15%', z: 70,   rotateSpeed: 0.1,  scrollMultiplier: 1.8 },
    { shape: 'diamond' as const, color: '#3b82f6', size: 25,  x: '60%', y: '50%', z: 45,   rotateSpeed: 0.11, scrollMultiplier: 1.0 },
  ]
  const shapes = isMobile ? allShapes.slice(0, 4) : allShapes

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ perspective: `${perspective}px`, perspectiveOrigin: '50% 50%' }}
    >
      {/* Deep space gradient layers - parallax at different speeds */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate3d(0, ${p * 0.15}px, 0)`,
        }}
      >
        <div className="absolute top-10 left-[5%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] right-[5%] w-[600px] h-[600px] bg-chart-2/12 rounded-full blur-[150px]" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-chart-3/10 rounded-full blur-[100px]" style={{ animationDelay: '1s', animationDuration: '5s' }} />
      </div>

      {/* Grid floor with 3D perspective */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate3d(0, ${p * 0.1}px, -100px) rotateX(${60 + scrollProgress * 20}deg)`,
          transformStyle: 'preserve-3d',
          opacity: 0.15 - scrollProgress * 0.1,
          background: `
            repeating-linear-gradient(
              90deg,
              rgba(0,212,255,0.15) 0px,
              transparent 1px,
              transparent 60px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(0,212,255,0.15) 0px,
              transparent 1px,
              transparent 60px
            )
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanning line effect */}
      <div
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
        style={{
          top: `${(scrollY * 0.3 + Date.now() * 0.02) % 120}%`,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)',
          boxShadow: '0 0 20px rgba(0,212,255,0.3)',
          opacity: 0.5,
        }}
      />

      {/* 3D floating shapes */}
      {mounted && shapes.map((s, i) => (
        <FloatingShape
          key={i}
          {...s}
          scrollY={scrollY}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
        />
      ))}

      {/* Main content with 3D tilt on mouse + parallax */}
      <div
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        style={{
          transform: `
            translate3d(0, ${p * 0.08}px, 50px)
            rotateX(${tiltX * 0.3}deg)
            rotateY(${tiltY * 0.3}deg)
          `,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Badge - pops forward in 3D */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
          style={{
            transform: `translate3d(0, 0, 80px) scale(${1 + scrollProgress * 0.05})`,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease-out',
          }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Class 6-12 STEM Learning</span>
        </div>

        {/* Main Heading - each line at different Z depths */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 tracking-tight" style={{ transformStyle: 'preserve-3d' }}>
          <span
            className="block text-foreground"
            style={{
              transform: `translate3d(${mousePos.x * -8}px, 0, 40px)`,
              transition: 'transform 0.15s ease-out',
              opacity: mounted ? 1 : 0,
              animation: mounted ? 'heroSlideIn 0.8s ease-out forwards' : 'none',
            }}
          >
            Learn Science
          </span>
          <span
            className="block bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent"
            style={{
              transform: `translate3d(${mousePos.x * 12}px, 0, 100px)`,
              transition: 'transform 0.15s ease-out',
              opacity: mounted ? 1 : 0,
              animation: mounted ? 'heroSlideIn 1s ease-out 0.2s forwards' : 'none',
              filter: `drop-shadow(0 0 30px rgba(0,212,255,0.3))`,
            }}
          >
            Like Never Before
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-2"
          style={{
            transform: `translate3d(0, 0, 30px)`,
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'heroSlideIn 0.8s ease-out 0.4s forwards' : 'none',
          }}
        >
          Dive into interactive simulations, complete gamified missions, and unlock achievements
          as you master Physics, Chemistry, Biology, and Mathematics.
        </p>

        {/* CTA Buttons - float forward */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 md:mb-16"
          style={{
            transform: `translate3d(0, 0, 60px)`,
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'heroSlideIn 0.8s ease-out 0.6s forwards' : 'none',
          }}
        >
          <Link href="/auth/sign-up">
            <Button size="lg" className="glow-cyan text-base md:text-lg px-6 md:px-8 py-5 md:py-6 group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                Start Learning
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Button>
          </Link>
          <Link href="/simulations">
            <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-primary/50 hover:bg-primary/10 group">
              <Play className="mr-2 w-5 h-5 transition-transform group-hover:scale-110" />
              Try Simulations
            </Button>
          </Link>
        </div>

        {/* Stats - staggered 3D entrance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-2" style={{ transformStyle: 'preserve-3d' }}>
          {[
            { value: '14+', label: 'Missions', z: 30 },
            { value: '7', label: 'Class Levels', z: 50 },
            { value: '4', label: 'Subjects', z: 70 },
            { value: '100%', label: 'Interactive', z: 90 },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group cursor-default"
              style={{
                transform: `translate3d(0, 0, ${stat.z}px) scale(${1 + mousePos.y * 0.02})`,
                transition: 'transform 0.2s ease-out, border-color 0.3s',
                opacity: mounted ? 1 : 0,
                animation: mounted ? `heroSlideIn 0.6s ease-out ${0.8 + index * 0.15}s forwards` : 'none',
              }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator with 3D depth */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{
          transform: `translate3d(-50%, ${-scrollProgress * 60}px, 20px)`,
          opacity: 1 - scrollProgress * 2,
        }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
