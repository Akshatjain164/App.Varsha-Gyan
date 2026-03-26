import { ParticleNetwork } from '@/components/landing/ParticleNetwork'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { MissionShowcase } from '@/components/landing/MissionShowcase'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Particle Network Background */}
      <ParticleNetwork />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section with Parallax */}
      <HeroSection />
      
      {/* Features Grid */}
      <section id="features">
        <FeaturesSection />
      </section>
      
      {/* Mission Showcase Carousel */}
      <section id="missions">
        <MissionShowcase />
      </section>
      
      {/* Call to Action */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}
