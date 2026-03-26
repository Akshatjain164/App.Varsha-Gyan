import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interactive Simulations | Varsha-Gyan',
  description: 'Explore 14+ interactive STEM simulations across Physics, Chemistry, Biology, and Mathematics. Complete gamified missions and earn XP!',
}

export default function SimulationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simulations are publicly accessible for demo purposes
  // Progress saving requires authentication (handled in each simulation)
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
