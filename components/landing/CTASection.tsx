"use client"

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, GraduationCap, Users } from 'lucide-react'

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className={`
          relative rounded-3xl overflow-hidden
          transition-all duration-1000
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        `}>
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-chart-2/10 to-chart-3/20" />
          <div className="absolute inset-0 grid-bg opacity-20" />
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl animated-border opacity-50" style={{ padding: '2px' }}>
            <div className="w-full h-full bg-background rounded-3xl" />
          </div>

          {/* Content */}
          <div className="relative p-8 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Ready to </span>
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                Transform
              </span>
              <span className="text-foreground"> Your Learning?</span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join thousands of students and teachers already experiencing 
              the future of STEM education.
            </p>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Student Card */}
              <Link href="/auth/sign-up?role=student" className="group">
                <div className="p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:glow-cyan">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">I'm a Student</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start your interactive learning journey with gamified missions
                  </p>
                  <Button className="w-full group-hover:glow-cyan">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Link>

              {/* Teacher Card */}
              <Link href="/auth/sign-up?role=teacher" className="group">
                <div className="p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-chart-2/50 transition-all duration-300 hover:glow-blue">
                  <div className="w-16 h-16 rounded-2xl bg-chart-2/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-chart-2" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">I'm a Teacher</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create classes, assign missions, and track student progress
                  </p>
                  <Button variant="outline" className="w-full border-chart-2/50 hover:bg-chart-2/10">
                    Create Account
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
