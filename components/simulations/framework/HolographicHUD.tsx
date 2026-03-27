"use client"

import { ReactNode } from 'react'

interface HolographicHUDProps {
  children: ReactNode
  missionActive?: boolean
  color?: 'cyan' | 'blue' | 'purple' | 'gold'
}

const colorClasses = {
  cyan: {
    border: 'border-chart-1/40',
    glow: 'shadow-[0_0_30px_rgba(0,212,255,0.15),inset_0_0_30px_rgba(0,212,255,0.05)]',
    corner: 'bg-chart-1',
  },
  blue: {
    border: 'border-chart-2/40',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15),inset_0_0_30px_rgba(59,130,246,0.05)]',
    corner: 'bg-chart-2',
  },
  purple: {
    border: 'border-chart-3/40',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15),inset_0_0_30px_rgba(168,85,247,0.05)]',
    corner: 'bg-chart-3',
  },
  gold: {
    border: 'border-chart-4/40',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15),inset_0_0_30px_rgba(245,158,11,0.05)]',
    corner: 'bg-chart-4',
  },
}

export function HolographicHUD({ children, missionActive = false, color = 'cyan' }: HolographicHUDProps) {
  const colors = colorClasses[color]

  return (
    <div className={`
      relative rounded-2xl border-2 ${colors.border} ${colors.glow}
      bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm
      overflow-hidden
    `}>
      {/* Corner Decorations */}
      <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${colors.border}`}>
        <div className={`absolute top-0 left-0 w-2 h-2 ${colors.corner}`} />
      </div>
      <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${colors.border}`}>
        <div className={`absolute top-0 right-0 w-2 h-2 ${colors.corner}`} />
      </div>
      <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${colors.border}`}>
        <div className={`absolute bottom-0 left-0 w-2 h-2 ${colors.corner}`} />
      </div>
      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${colors.border}`}>
        <div className={`absolute bottom-0 right-0 w-2 h-2 ${colors.corner}`} />
      </div>

      {/* Mission Active Indicator */}
      {missionActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-chart-5/20 border border-chart-5/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-chart-5 animate-pulse" />
            <span className="text-xs font-medium text-chart-5 uppercase tracking-wider">Mission Active</span>
          </div>
        </div>
      )}

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />

      {/* Content */}
      <div className={`relative z-10 ${missionActive ? 'pt-12 md:pt-10' : ''}`}>
        {children}
      </div>
    </div>
  )
}
