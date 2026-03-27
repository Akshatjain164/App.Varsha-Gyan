"use client"

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, GraduationCap, Users } from 'lucide-react'

export function CTASection() {
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
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
          <div className="absolute inset-0 border border-border/30 rounded-3xl" />

          {/* Content */}
          <div className="relative p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-foreground">Ready to </span>
              <span className="bg-gradient-to-r from-primary via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
                Transform
              </span>
              <span className="text-foreground"> Your Learning?</span>
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join thousands of students and teachers already experiencing 
              the future of STEM education.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Link href="/auth/sign-up?role=student" className="group">
                <div className={`p-6 md:p-8 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-md 
                  hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: visible ? '200ms' : '0ms' }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 
                    group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">I&apos;m a Student</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start your interactive learning journey with gamified missions
                  </p>
                  <Button className="w-full glow-cyan group-hover:scale-[1.02] transition-transform">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Link>

              <Link href="/auth/sign-up?role=teacher" className="group">
                <div className={`p-6 md:p-8 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-md 
                  hover:border-purple-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: visible ? '400ms' : '0ms' }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4 
                    group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">I&apos;m a Teacher</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create classes, assign missions, and track student progress
                  </p>
                  <Button variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10 group-hover:scale-[1.02] transition-transform">
                    Create Account
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
