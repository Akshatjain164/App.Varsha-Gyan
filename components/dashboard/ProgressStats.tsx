"use client"

import { Zap, Target, TrendingUp } from 'lucide-react'

interface ProgressStatsProps {
  totalXP: number
  completedMissions: number
  totalMissions: number
}

export function ProgressStats({ totalXP, completedMissions, totalMissions }: ProgressStatsProps) {
  const level = Math.floor(totalXP / 1000) + 1
  const xpInCurrentLevel = totalXP % 1000
  const xpProgress = xpInCurrentLevel / 10

  const missionProgress = totalMissions > 0 
    ? Math.round((completedMissions / totalMissions) * 100) 
    : 0

  return (
    <div className="rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Your Progress</h3>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-foreground">Level {level}</span>
          </div>
          <span className="text-sm text-muted-foreground">{xpInCurrentLevel}/1000 XP</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Mission Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-chart-2" />
            </div>
            <span className="font-medium text-foreground">Missions</span>
          </div>
          <span className="text-sm text-muted-foreground">{completedMissions}/{totalMissions}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-chart-2 rounded-full transition-all duration-500"
            style={{ width: `${missionProgress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-chart-5" />
            <span className="text-xs text-muted-foreground">Avg Score</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {completedMissions > 0 ? `${missionProgress}%` : '—'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-chart-4" />
            <span className="text-xs text-muted-foreground">Next Level</span>
          </div>
          <p className="text-lg font-bold text-foreground">{1000 - xpInCurrentLevel} XP</p>
        </div>
      </div>
    </div>
  )
}
