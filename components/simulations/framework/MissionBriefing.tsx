"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, Zap, Target, ChevronRight, Globe } from 'lucide-react'

interface MissionBriefingProps {
  title: string
  titleHi: string
  description: string
  descriptionHi: string
  instructions: string
  instructionsHi: string
  xpReward: number
  difficulty: string
  subject: string
  onStart: () => void
}

export function MissionBriefing({
  title,
  titleHi,
  description,
  descriptionHi,
  instructions,
  instructionsHi,
  xpReward,
  difficulty,
  subject,
  onStart,
}: MissionBriefingProps) {
  const [isHindi, setIsHindi] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const currentTitle = isHindi ? titleHi : title
  const currentDescription = isHindi ? descriptionHi : description
  const currentInstructions = isHindi ? instructionsHi : instructions

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div 
        className={`
          relative max-w-2xl w-full mx-4 transition-all duration-500
          ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        {/* Holographic Frame */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-chart-2 to-chart-3 rounded-3xl opacity-20 blur-sm" />
        
        <div className="relative rounded-2xl bg-card border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-br from-primary/10 to-chart-2/5 border-b border-border/50">
            {/* Language Toggle */}
            <button
              onClick={() => setIsHindi(!isHindi)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-background/50 border border-border/50 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              {isHindi ? 'English' : 'हिंदी'}
            </button>

            {/* Mission Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isHindi ? 'मिशन ब्रीफिंग' : 'Mission Briefing'}
                </p>
                <p className="text-sm text-muted-foreground capitalize">{subject}</p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-2">{currentTitle}</h1>
            <p className="text-muted-foreground">{currentDescription}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isHindi ? 'पुरस्कार' : 'Reward'}</p>
                  <p className="text-sm font-bold text-primary">{xpReward} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isHindi ? 'कठिनाई' : 'Difficulty'}</p>
                  <p className="text-sm font-bold text-chart-2 capitalize">{difficulty}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {isHindi ? 'निर्देश' : 'Instructions'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentInstructions}
              </p>
            </div>

            {/* Objectives */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {isHindi ? 'उद्देश्य' : 'Objectives'}
              </h3>
              <ul className="space-y-2">
                {[
                  isHindi ? 'सिमुलेशन पूरा करें' : 'Complete the simulation',
                  isHindi ? 'मापदंडों के साथ प्रयोग करें' : 'Experiment with parameters',
                  isHindi ? 'अवधारणा को समझें' : 'Understand the concept',
                ].map((obj, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                      {i + 1}
                    </div>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-muted/20 border-t border-border/50">
            <Button onClick={onStart} className="w-full glow-cyan text-lg py-6">
              {isHindi ? 'मिशन शुरू करें' : 'Start Mission'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
