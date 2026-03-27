"use client"

import { useEffect, useRef, useState } from 'react'
import { 
  Atom, Beaker, Dna, Calculator, 
  Gamepad2, Trophy, Users, Zap 
} from 'lucide-react'

const features = [
  {
    icon: Atom,
    title: 'Physics Simulations',
    description: 'Explore projectile motion, electromagnetic induction, and wave optics with interactive visualizations.',
  },
  {
    icon: Beaker,
    title: 'Chemistry Labs',
    description: 'Mix chemicals, balance equations, and observe reactions in a safe virtual environment.',
  },
  {
    icon: Dna,
    title: 'Biology Explorer',
    description: 'Dive into cells, understand osmosis, and witness biological processes in action.',
  },
  {
    icon: Calculator,
    title: 'Math Visualizer',
    description: 'See vectors, graphs, and mathematical concepts come alive through animations.',
  },
  {
    icon: Gamepad2,
    title: 'Gamified Missions',
    description: 'Complete challenges, earn XP, and progress through class-appropriate difficulty levels.',
  },
  {
    icon: Trophy,
    title: 'Achievements',
    description: 'Unlock badges, climb leaderboards, and showcase your STEM mastery.',
  },
  {
    icon: Users,
    title: 'Teacher Dashboard',
    description: 'Assign missions, track student progress, and analyze class performance.',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get real-time results and explanations as you experiment and learn.',
  },
]

const iconColors = [
  'text-cyan-400', 'text-blue-400', 'text-purple-400', 'text-amber-400',
  'text-cyan-400', 'text-amber-400', 'text-blue-400', 'text-purple-400'
]

const bgColors = [
  'bg-cyan-400/10', 'bg-blue-400/10', 'bg-purple-400/10', 'bg-amber-400/10',
  'bg-cyan-400/10', 'bg-amber-400/10', 'bg-blue-400/10', 'bg-purple-400/10'
]

export function FeaturesSection() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1, rootMargin: '100px' }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 px-4 z-10">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-background/30 dark:bg-background/80 backdrop-blur-sm pointer-events-none" />

      <div className="relative z-10">
        {/* Section Header */}
        <div className={`max-w-6xl mx-auto text-center mb-12 md:mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Everything You Need to </span>
            <span className="text-primary">Excel</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete learning ecosystem designed to make STEM education engaging, 
            interactive, and effective.
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`group relative p-5 md:p-6 rounded-2xl bg-card/60 border border-border/40 
                  backdrop-blur-md transition-all duration-500 hover:bg-card/80 hover:border-primary/30
                  hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: visible ? `${index * 80}ms` : '0ms' }}
              >
                <div className={`w-11 h-11 rounded-xl ${bgColors[index]} flex items-center justify-center mb-4
                  group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${iconColors[index]}`} />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
