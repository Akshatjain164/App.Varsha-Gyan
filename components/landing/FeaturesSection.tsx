"use client"

import { useEffect, useRef, useState } from 'react'
import { 
  Atom, 
  Beaker, 
  Dna, 
  Calculator, 
  Gamepad2, 
  Trophy, 
  Users, 
  Zap 
} from 'lucide-react'

const features = [
  {
    icon: Atom,
    title: 'Physics Simulations',
    description: 'Explore projectile motion, electromagnetic induction, and wave optics with interactive visualizations.',
    color: 'chart-1',
    glowClass: 'glow-cyan'
  },
  {
    icon: Beaker,
    title: 'Chemistry Labs',
    description: 'Mix chemicals, balance equations, and observe reactions in a safe virtual environment.',
    color: 'chart-2',
    glowClass: 'glow-blue'
  },
  {
    icon: Dna,
    title: 'Biology Explorer',
    description: 'Dive into cells, understand osmosis, and witness biological processes in action.',
    color: 'chart-3',
    glowClass: 'glow-purple'
  },
  {
    icon: Calculator,
    title: 'Math Visualizer',
    description: 'See vectors, graphs, and mathematical concepts come alive through animations.',
    color: 'chart-4',
    glowClass: 'glow-gold'
  },
  {
    icon: Gamepad2,
    title: 'Gamified Missions',
    description: 'Complete challenges, earn XP, and progress through class-appropriate difficulty levels.',
    color: 'chart-1',
    glowClass: 'glow-cyan'
  },
  {
    icon: Trophy,
    title: 'Achievements',
    description: 'Unlock badges, climb leaderboards, and showcase your STEM mastery.',
    color: 'chart-4',
    glowClass: 'glow-gold'
  },
  {
    icon: Users,
    title: 'Teacher Dashboard',
    description: 'Assign missions, track student progress, and analyze class performance.',
    color: 'chart-2',
    glowClass: 'glow-blue'
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get real-time results and explanations as you experiment and learn.',
    color: 'chart-3',
    glowClass: 'glow-purple'
  },
]

export function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(features.length).fill(false))
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardsRef.current.findIndex(ref => ref === entry.target)
          if (index !== -1 && entry.isIntersecting) {
            setVisibleCards(prev => {
              const newState = [...prev]
              newState[index] = true
              return newState
            })
          }
        })
      },
      { threshold: 0.2 }
    )

    cardsRef.current.forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="relative py-24 px-4">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-foreground">Everything You Need to </span>
          <span className="text-primary text-glow-cyan">Excel</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A complete learning ecosystem designed to make STEM education engaging, 
          interactive, and effective for students and teachers alike.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              ref={el => { cardsRef.current[index] = el }}
              className={`
                group relative p-6 rounded-2xl bg-card/50 border border-border/50 
                backdrop-blur-sm transition-all duration-500 hover:border-primary/50
                ${visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4
                group-hover:${feature.glowClass} transition-all duration-300
              `}>
                <Icon className={`w-6 h-6 text-${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
