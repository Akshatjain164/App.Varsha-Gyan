"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Lock, CheckCircle2, Play, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Mission {
  id: string
  title_en: string
  title_hi: string
  description_en: string
  description_hi: string
  subject: string
  target_class: number
  simulation_type: string
  difficulty: string
  complexity_level: number
  xp_reward: number
  theme_color: string
}

interface Progress {
  id: string
  status: 'not_started' | 'in_progress' | 'completed'
  score: number | null
  attempts: number
}

interface MissionCardProps {
  mission: Mission
  progress?: Progress | null
  locked?: boolean
}

const difficultyColors: Record<string, string> = {
  beginner: 'text-chart-1 bg-chart-1/10 border-chart-1/30',
  'beginner+': 'text-chart-1 bg-chart-1/10 border-chart-1/30',
  intermediate: 'text-chart-2 bg-chart-2/10 border-chart-2/30',
  'intermediate+': 'text-chart-2 bg-chart-2/10 border-chart-2/30',
  advanced: 'text-chart-3 bg-chart-3/10 border-chart-3/30',
  'advanced+': 'text-chart-3 bg-chart-3/10 border-chart-3/30',
  expert: 'text-chart-4 bg-chart-4/10 border-chart-4/30',
}

const subjectIcons: Record<string, string> = {
  physics: 'bg-primary/10 border-primary/30',
  chemistry: 'bg-chart-2/10 border-chart-2/30',
  biology: 'bg-chart-5/10 border-chart-5/30',
  mathematics: 'bg-chart-4/10 border-chart-4/30',
}

export function MissionCard({ mission, progress, locked = false }: MissionCardProps) {
  const [isHindi, setIsHindi] = useState(false)
  const isCompleted = progress?.status === 'completed'
  
  const title = isHindi ? mission.title_hi : mission.title_en
  const description = isHindi ? mission.description_hi : mission.description_en

  const glowClass = mission.complexity_level <= 2 
    ? 'hover:glow-cyan' 
    : mission.complexity_level <= 4 
    ? 'hover:glow-blue' 
    : mission.complexity_level <= 6 
    ? 'hover:glow-purple' 
    : 'hover:glow-gold'

  return (
    <div 
      className={`
        relative group rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm
        transition-all duration-300 overflow-hidden
        ${locked ? 'opacity-50' : glowClass}
        ${isCompleted ? 'border-chart-5/30' : ''}
      `}
    >
      {/* Completion Overlay */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-8 h-8 rounded-full bg-chart-5 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-background" />
          </div>
        </div>
      )}

      {/* Locked Overlay */}
      {locked && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${subjectIcons[mission.subject] || 'bg-muted'}`}>
            {mission.subject.charAt(0).toUpperCase() + mission.subject.slice(1)}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsHindi(!isHindi)
            }}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            title={isHindi ? 'Switch to English' : 'हिंदी में देखें'}
          >
            <Globe className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-2 py-0.5 rounded text-xs font-medium border ${difficultyColors[mission.difficulty.toLowerCase()] || 'bg-muted'}`}>
            {mission.difficulty}
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">{mission.xp_reward} XP</span>
          </div>
        </div>

        {/* Progress Bar (if started) */}
        {progress && !isCompleted && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress.attempts} attempts</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min((progress.score || 0), 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action */}
        <Link href={`/simulations/${mission.simulation_type}`}>
          <Button 
            className="w-full" 
            variant={isCompleted ? 'outline' : 'default'}
            disabled={locked}
          >
            <Play className="w-4 h-4 mr-2" />
            {isCompleted ? 'Play Again' : progress ? 'Continue' : 'Start Mission'}
          </Button>
        </Link>
      </div>
    </div>
  )
}
