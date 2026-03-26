"use client"

import { CheckCircle2, PlayCircle, Clock } from 'lucide-react'

interface Activity {
  id: string
  status: string
  last_attempt_at: string | null
  completed_at: string | null
  missions: {
    title_en: string
    subject: string
    xp_reward: number
  } | null
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start a mission to see your progress here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const isCompleted = activity.status === 'completed'
            const timeStr = activity.completed_at || activity.last_attempt_at
            return (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isCompleted ? 'bg-chart-5/10' : 'bg-primary/10'}
                `}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-chart-5" />
                  ) : (
                    <PlayCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.missions?.title_en || 'Unknown Mission'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground capitalize">
                      {activity.missions?.subject}
                    </span>
                    {timeStr && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(timeStr)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {isCompleted && (
                  <span className="text-xs text-primary font-medium">
                    +{activity.missions?.xp_reward || 0} XP
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
