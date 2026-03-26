"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Zap, BookOpen, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Subject SVG icons for mission cards
function PhysicsIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Atom nucleus */}
      <circle cx="60" cy="60" r="8" fill={color} opacity="0.9" />
      {/* Electron orbits */}
      <ellipse cx="60" cy="60" rx="40" ry="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" transform="rotate(0 60 60)" />
      <ellipse cx="60" cy="60" rx="40" ry="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" transform="rotate(60 60 60)" />
      <ellipse cx="60" cy="60" rx="40" ry="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" transform="rotate(120 60 60)" />
      {/* Electrons */}
      <circle cx="100" cy="60" r="4" fill={color} opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="25" r="4" fill={color} opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="120 60 60" to="480 60 60" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="95" r="4" fill={color} opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="240 60 60" to="600 60 60" dur="5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function BiologyIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Cell membrane */}
      <ellipse cx="60" cy="60" rx="45" ry="38" fill={`${color}15`} stroke={color} strokeWidth="2" opacity="0.6" />
      {/* Nucleus */}
      <ellipse cx="55" cy="55" rx="18" ry="15" fill={`${color}25`} stroke={color} strokeWidth="1.5" opacity="0.7" />
      {/* Nucleolus */}
      <circle cx="52" cy="53" r="6" fill={color} opacity="0.4" />
      {/* Mitochondria */}
      <ellipse cx="82" cy="45" rx="10" ry="5" fill={`${color}30`} stroke={color} strokeWidth="1" opacity="0.5" transform="rotate(-30 82 45)" />
      <ellipse cx="38" cy="78" rx="8" ry="4" fill={`${color}30`} stroke={color} strokeWidth="1" opacity="0.5" transform="rotate(20 38 78)" />
      {/* ER */}
      <path d="M 70 65 Q 78 70, 85 65 Q 92 60, 88 72 Q 85 80, 78 75" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

function ChemistryIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Flask body */}
      <path d="M 45 25 L 45 55 L 25 95 Q 22 102, 30 105 L 90 105 Q 98 102, 95 95 L 75 55 L 75 25" fill={`${color}15`} stroke={color} strokeWidth="2" opacity="0.7" />
      {/* Flask top */}
      <rect x="43" y="20" width="34" height="8" rx="2" fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
      {/* Liquid */}
      <path d="M 32 85 Q 60 75, 88 85 L 90 105 Q 98 102, 95 95 L 88 82 Q 60 92, 32 82 Z" fill={color} opacity="0.25" />
      {/* Bubbles */}
      <circle cx="50" cy="80" r="3" fill={color} opacity="0.4">
        <animate attributeName="cy" values="85;70;85" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="65" cy="75" r="2" fill={color} opacity="0.3">
        <animate attributeName="cy" values="80;65;80" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="55" cy="90" r="2.5" fill={color} opacity="0.35">
        <animate attributeName="cy" values="90;72;90" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function MathIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Coordinate grid */}
      <line x1="20" y1="60" x2="100" y2="60" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <line x1="60" y1="20" x2="60" y2="100" stroke={color} strokeWidth="1.5" opacity="0.3" />
      {/* Sine wave */}
      <path d="M 20 60 Q 35 30, 50 60 Q 65 90, 80 60 Q 95 30, 100 55" fill="none" stroke={color} strokeWidth="2.5" opacity="0.7" />
      {/* Pi symbol */}
      <text x="25" y="45" fontFamily="serif" fontSize="18" fill={color} opacity="0.5">π</text>
      {/* Integral */}
      <text x="80" y="95" fontFamily="serif" fontSize="20" fill={color} opacity="0.5">∫</text>
      {/* Dots on curve */}
      <circle cx="50" cy="60" r="3" fill={color} opacity="0.6" />
      <circle cx="80" cy="60" r="3" fill={color} opacity="0.6" />
    </svg>
  )
}

const subjectIcons: Record<string, (props: { color: string }) => React.ReactNode> = {
  'Physics': PhysicsIcon,
  'Biology': BiologyIcon,
  'Chemistry': ChemistryIcon,
  'Mathematics': MathIcon,
}

const missions = [
  {
    class: 6,
    title: 'Light & Shadows',
    titleHi: 'प्रकाश और छाया',
    subject: 'Physics',
    difficulty: 'Beginner',
    xp: 50,
    color: 'from-cyan-500/20 to-cyan-600/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'cyan',
    iconColor: '#00d4ff',
  },
  {
    class: 7,
    title: 'Plant Cell Explorer',
    titleHi: 'पादप कोशिका',
    subject: 'Biology',
    difficulty: 'Beginner+',
    xp: 75,
    color: 'from-cyan-500/20 to-blue-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'cyan',
    iconColor: '#22c55e',
  },
  {
    class: 8,
    title: 'Chemical Reactions',
    titleHi: 'रासायनिक अभिक्रियाएं',
    subject: 'Chemistry',
    difficulty: 'Intermediate',
    xp: 100,
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'blue',
    iconColor: '#3b82f6',
  },
  {
    class: 9,
    title: 'Projectile Motion',
    titleHi: 'प्रक्षेप्य गति',
    subject: 'Physics',
    difficulty: 'Intermediate+',
    xp: 125,
    color: 'from-blue-500/20 to-purple-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'blue',
    iconColor: '#6366f1',
  },
  {
    class: 10,
    title: "Ohm's Law Circuit",
    titleHi: 'ओम का नियम',
    subject: 'Physics',
    difficulty: 'Advanced',
    xp: 150,
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'purple',
    iconColor: '#a855f7',
  },
  {
    class: 11,
    title: 'EM Induction',
    titleHi: 'विद्युत चुम्बकीय प्रेरण',
    subject: 'Physics',
    difficulty: 'Advanced+',
    xp: 175,
    color: 'from-purple-500/20 to-amber-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'purple',
    iconColor: '#c084fc',
  },
  {
    class: 12,
    title: 'Wave Optics',
    titleHi: 'तरंग प्रकाशिकी',
    subject: 'Physics',
    difficulty: 'Expert',
    xp: 200,
    color: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'gold',
    iconColor: '#f59e0b',
  },
]

export function MissionShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHindi, setIsHindi] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % missions.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + missions.length) % missions.length)
  }

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide()
    }
  }

  return (
    <section ref={containerRef} className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div id="missions" className={`text-center mb-8 md:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Explore </span>
            <span className="text-primary text-glow-cyan">Missions</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            From basic concepts in Class 6 to advanced physics in Class 12. 
            Each mission is tailored to your learning level.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsHindi(!isHindi)}
              className="px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors text-sm"
            >
              {isHindi ? 'English' : 'हिंदी'}
            </button>
            <Link href="/simulations">
              <Button className="glow-cyan" size="sm">
                Try All Simulations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div
          className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 bg-card/80 backdrop-blur-sm hidden md:flex"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 bg-card/80 backdrop-blur-sm hidden md:flex"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Cards Container */}
          <div className="flex justify-center items-center gap-3 md:gap-4 px-4 md:px-8">
            {[-1, 0, 1].map((offset) => {
              const index = (currentIndex + offset + missions.length) % missions.length
              const mission = missions[index]
              const isActive = offset === 0
              const IconComponent = subjectIcons[mission.subject] || PhysicsIcon

              return (
                <div
                  key={`${mission.class}-${offset}`}
                  className={`
                    relative rounded-2xl bg-gradient-to-br ${mission.color} 
                    border ${mission.borderColor} backdrop-blur-sm
                    transition-all duration-500 cursor-pointer overflow-hidden
                    ${isActive 
                      ? 'w-full max-w-[320px] md:max-w-[384px] h-[380px] md:h-[420px] scale-100 opacity-100 z-10' 
                      : 'w-[200px] md:w-72 h-[340px] md:h-[370px] scale-90 opacity-50 hidden md:block'
                    }
                  `}
                  onClick={() => !isActive && setCurrentIndex(index)}
                >
                  {/* Class Badge */}
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 px-3 py-1 rounded-full bg-background/80 border border-border text-xs md:text-sm font-medium z-10">
                    Class {mission.class}
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 px-3 py-1 rounded-full bg-background/80 border border-border text-xs md:text-sm z-10">
                    {mission.difficulty}
                  </div>

                  {/* Subject Icon Area */}
                  <div className="flex items-center justify-center h-[180px] md:h-[200px] pt-8 md:pt-10 px-6">
                    <div className="w-28 h-28 md:w-32 md:h-32 opacity-70">
                      <IconComponent color={mission.iconColor} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">
                      {mission.subject}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                      {isHindi ? mission.titleHi : mission.title}
                    </h3>
                    
                    {/* XP */}
                    <div className="flex items-center gap-3 md:gap-4 mt-3 md:mt-4">
                      <div className="flex items-center gap-1.5 md:gap-2 text-primary">
                        <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium text-sm md:text-base">{mission.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-sm md:text-base">Interactive</span>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-3 md:mt-4">
                      {[...Array(3)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 md:w-5 md:h-5 ${i < 2 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Glow Effect */}
                  {isActive && (
                    <div className={`absolute -inset-1 rounded-2xl glow-${mission.glowColor} opacity-30 -z-10`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {missions.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          {/* Mobile Navigation + Swipe hint */}
          <div className="flex flex-col items-center gap-3 mt-4 md:hidden">
            <p className="text-xs text-muted-foreground">Swipe to browse missions</p>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" onClick={prevSlide}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextSlide}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
