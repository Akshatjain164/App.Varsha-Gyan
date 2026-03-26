"use client"

import dynamic from 'next/dynamic'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { MissionShowcase } from '@/components/landing/MissionShowcase'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'
import { SmoothScroll } from '@/components/landing/SmoothScroll'

import { Suspense } from 'react'

// Dynamic import Scene3D (heavy Three.js — no SSR)
const Scene3D = dynamic(
  () => import('@/components/landing/Scene3D').then(mod => ({ default: mod.Scene3D })),
  { 
    ssr: false,
    loading: () => <div className="fixed inset-0 z-0 bg-background" />
  }
)

export default function HomePage() {
  return (
    <SmoothScroll>
      <main className="relative min-h-screen bg-background overflow-hidden">
        {/* 3D WebGL Background */}
        <Scene3D />
        
        {/* Navigation */}
        <Navbar />
        
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Grid */}
        <section id="features">
          <FeaturesSection />
        </section>
        
        {/* Mission Showcase */}
        <section id="missions">
          <MissionShowcase />
        </section>
        
        {/* Call to Action */}
        <CTASection />
        
        {/* Footer */}
        <Footer />
      </main>
    </SmoothScroll>
  )
}
