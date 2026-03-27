"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

export function HeroSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Trigger entrance animations after a brief delay for 3D scene to load
    const timer = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { value: '14+', label: 'Missions' },
    { value: '7', label: 'Class Levels' },
    { value: '4', label: 'Subjects' },
    { value: '100%', label: 'Interactive' },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 z-10">
      {/* Subtle overlay — lets 3D scene show through */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/10 to-background/60 dark:from-background/40 dark:via-background/20 dark:to-background/80 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Badge */}
        <div className={`mb-8 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-background/60 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Class 6-12 STEM Learning</span>
          </div>
        </div>

        {/* Title with word-by-word reveal */}
        <h1 
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-center leading-[0.95] mb-6 md:mb-8 tracking-tight drop-shadow-lg dark:drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]"
        >
          {['Learn ', 'Science'].map((word, i) => (
            <span 
              key={word}
              className={`inline-block text-foreground transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >{word}</span>
          ))}
          <br />
          {[
            { text: 'Like ', cls: 'from-primary via-[#00e5ff] to-[#a855f7]' },
            { text: 'Never ', cls: 'from-[#a855f7] via-[#ec4899] to-[#f59e0b]' },
            { text: 'Before', cls: 'from-[#f59e0b] via-[#ec4899] to-[#a855f7]' },
          ].map(({ text, cls }, i) => (
            <span 
              key={text}
              className={`inline-block bg-gradient-to-r ${cls} bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${600 + i * 100}ms` }}
            >{text}</span>
          ))}
        </h1>

        {/* Subtitle */}
        <p 
          className={`text-base md:text-lg lg:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-4 py-3 rounded-2xl bg-background/30 backdrop-blur-sm transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '900ms' }}
        >
          Dive into interactive simulations, complete gamified missions, and
          unlock achievements as you master Physics, Chemistry, Biology,
          and Mathematics.
        </p>

        {/* CTAs */}
        <div className={`flex flex-col sm:flex-row items-center gap-4 mb-12 md:mb-16 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '1000ms' }}
        >
          <Link href="/auth/sign-up">
            <Button size="lg" className="glow-cyan text-base md:text-lg px-8 py-6 rounded-xl font-semibold group">
              Start Learning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/simulations">
            <Button size="lg" variant="outline" className="text-base md:text-lg px-8 py-6 rounded-xl font-semibold border-border/50 bg-background/30 backdrop-blur-sm hover:bg-muted/50 group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Try Simulations
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto w-full">
          {stats.map(({ value, label }, i) => (
            <div 
              key={label}
              className={`text-center p-4 md:p-5 rounded-2xl bg-background/40 border border-border/30 backdrop-blur-md hover:bg-background/60 hover:border-primary/20 transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}
              style={{ transitionDelay: `${1100 + i * 80}ms` }}
            >
              <div className="text-2xl md:text-3xl font-black text-primary mb-1">{value}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10 transition-opacity duration-700 ${loaded ? 'opacity-50' : 'opacity-0'}`}
        style={{ transitionDelay: '1500ms' }}
      >
        <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/50 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  )
}
