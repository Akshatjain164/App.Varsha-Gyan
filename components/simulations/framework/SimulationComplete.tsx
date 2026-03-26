"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trophy, Zap, Star, ArrowRight, RotateCcw, Home } from 'lucide-react'
import confetti from 'canvas-confetti'

interface SimulationCompleteProps {
  title: string
  xpEarned: number
  score: number
  maxScore: number
  onPlayAgain: () => void
}

export function SimulationComplete({
  title,
  xpEarned,
  score,
  maxScore,
  onPlayAgain,
}: SimulationCompleteProps) {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(true)
  const [showXP, setShowXP] = useState(false)

  const stars = Math.ceil((score / maxScore) * 3)

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00d4ff', '#3b82f6', '#a855f7', '#f59e0b'],
    })

    // Animation sequence
    const timer1 = setTimeout(() => setIsAnimating(false), 300)
    const timer2 = setTimeout(() => setShowXP(true), 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div 
        className={`
          relative max-w-md w-full mx-4 transition-all duration-500
          ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
        `}
      >
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-chart-5/20 via-primary/20 to-chart-4/20 rounded-3xl blur-xl" />
        
        <div className="relative rounded-2xl bg-card border border-chart-5/30 overflow-hidden">
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-br from-chart-5/20 to-chart-4/10 text-center">
            {/* Trophy Icon */}
            <div className="w-20 h-20 rounded-full bg-chart-4/20 border-2 border-chart-4/40 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-chart-4" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-1">Mission Complete! 🎉</h1>
            <p className="text-sm text-chart-4 font-medium mb-1">मिशन पूरा हुआ!</p>
            <p className="text-muted-foreground">{title}</p>
          </div>

          {/* Stats */}
          <div className="p-8 space-y-6">
            {/* Stars */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`
                    w-10 h-10 transition-all duration-500
                    ${star <= stars 
                      ? 'text-chart-4 fill-chart-4 scale-100' 
                      : 'text-muted-foreground scale-90'
                    }
                  `}
                  style={{ transitionDelay: `${star * 200}ms` }}
                />
              ))}
            </div>

            {/* Score */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Score / स्कोर</p>
              <p className="text-4xl font-bold text-foreground">
                {score} <span className="text-muted-foreground text-xl">/ {maxScore}</span>
              </p>
            </div>

            {/* XP Earned */}
            <div 
              className={`
                p-4 rounded-xl bg-primary/10 border border-primary/30 text-center
                transition-all duration-500
                ${showXP ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold text-primary">+{xpEarned} XP</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Added to your profile / आपकी प्रोफ़ाइल में जोड़ा गया</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-muted/20 border-t border-border/50 space-y-3">
            <Button 
              onClick={() => router.push('/dashboard/student')}
              className="w-full glow-cyan"
            >
              Back to Dashboard / डैशबोर्ड पर वापस
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onPlayAgain}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again / फिर से खेलें
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/simulations')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                All Missions / सब मिशन
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
