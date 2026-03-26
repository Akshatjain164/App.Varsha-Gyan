import { createClient } from '@/lib/supabase/server'
import { Trophy, Star, Zap, Target, Medal, Award } from 'lucide-react'

const badgeIcons: Record<string, typeof Trophy> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  medal: Medal,
  award: Award,
}

const badgeColors: Record<string, { bg: string, text: string, border: string }> = {
  bronze: { bg: 'bg-amber-900/20', text: 'text-amber-600', border: 'border-amber-600/30' },
  silver: { bg: 'bg-slate-400/20', text: 'text-slate-400', border: 'border-slate-400/30' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  platinum: { bg: 'bg-cyan-400/20', text: 'text-cyan-400', border: 'border-cyan-400/30' },
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('student_id', user?.id)
    .order('earned_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp')
    .eq('id', user?.id)
    .single()

  // Define possible achievements
  const possibleAchievements = [
    { badge_name: 'First Mission', badge_type: 'bronze', description: 'Complete your first mission', icon: 'star' },
    { badge_name: 'Quick Learner', badge_type: 'bronze', description: 'Complete 5 missions', icon: 'zap' },
    { badge_name: 'Knowledge Seeker', badge_type: 'silver', description: 'Complete 10 missions', icon: 'target' },
    { badge_name: 'Science Explorer', badge_type: 'silver', description: 'Complete 25 missions', icon: 'medal' },
    { badge_name: 'Master Scientist', badge_type: 'gold', description: 'Complete 50 missions', icon: 'trophy' },
    { badge_name: 'XP Collector', badge_type: 'bronze', description: 'Earn 500 XP', icon: 'zap' },
    { badge_name: 'XP Hunter', badge_type: 'silver', description: 'Earn 2000 XP', icon: 'zap' },
    { badge_name: 'XP Legend', badge_type: 'gold', description: 'Earn 5000 XP', icon: 'award' },
    { badge_name: 'Perfect Score', badge_type: 'gold', description: 'Get 100% on any mission', icon: 'star' },
    { badge_name: 'Consistent Learner', badge_type: 'platinum', description: '7-day learning streak', icon: 'trophy' },
  ]

  const earnedBadgeNames = achievements?.map(a => a.badge_name) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Earn badges by completing missions and reaching milestones
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{achievements?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{profile?.total_xp || 0}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(((achievements?.length || 0) / possibleAchievements.length) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earned Achievements */}
      {achievements && achievements.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Earned Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const colors = badgeColors[achievement.badge_type] || badgeColors.bronze
              const IconComponent = badgeIcons[achievement.badge_type] || Trophy
              return (
                <div 
                  key={achievement.id}
                  className={`p-5 rounded-2xl ${colors.bg} border ${colors.border} backdrop-blur-sm`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                      <IconComponent className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${colors.text}`}>{achievement.badge_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Achievements */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">All Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {possibleAchievements.map((achievement, index) => {
            const isEarned = earnedBadgeNames.includes(achievement.badge_name)
            const colors = isEarned 
              ? badgeColors[achievement.badge_type] || badgeColors.bronze
              : { bg: 'bg-muted/30', text: 'text-muted-foreground', border: 'border-border/50' }
            const IconComponent = badgeIcons[achievement.icon] || Trophy
            
            return (
              <div 
                key={index}
                className={`p-5 rounded-2xl ${colors.bg} border ${colors.border} backdrop-blur-sm ${!isEarned ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <IconComponent className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${colors.text}`}>{achievement.badge_name}</h3>
                      {isEarned && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-chart-5/20 text-chart-5">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                    <p className={`text-xs mt-2 capitalize ${colors.text}`}>
                      {achievement.badge_type} Badge
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
