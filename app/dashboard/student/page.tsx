'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MissionCard } from '@/components/dashboard/MissionCard'
import { ProgressStats } from '@/components/dashboard/ProgressStats'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { Rocket, Trophy, Zap, Target, Loader2 } from 'lucide-react'

export default function StudentDashboardPage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr || !user) {
          window.location.href = '/auth/login'
          return
        }

        // Load profile
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileErr) {
          console.log('[v0] profile error:', profileErr.message)
          // Profile might not exist yet – create one from signup metadata
          const meta = user.user_metadata || {}
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              full_name: meta.full_name || user.email?.split('@')[0] || 'Student',
              role: meta.role || 'student', 
              class_grade: meta.class_grade || 6, 
              total_xp: 0 
            })
            .select()
            .single()
          setProfile(newProfile)
        } else {
          setProfile(profileData)
        }

        const classGrade = profileData?.class_grade || 6

        // Load missions for this class
        const { data: missionsData, error: missionsErr } = await supabase
          .from('missions')
          .select('*')
          .eq('target_class', classGrade)
          .order('complexity_level', { ascending: true })

        if (missionsErr) console.log('[v0] missions error:', missionsErr.message)
        setMissions(missionsData || [])

        // Load progress – order by last_attempt_at (actual column)
        const { data: progressData, error: progressErr } = await supabase
          .from('mission_progress')
          .select('*, missions(title_en, subject, xp_reward)')
          .eq('student_id', user.id)
          .order('last_attempt_at', { ascending: false, nullsFirst: false })
          .limit(5)

        if (progressErr) console.log('[v0] progress error:', progressErr.message)
        setProgress(progressData || [])

        // Load achievements
        const { data: achData, error: achErr } = await supabase
          .from('achievements')
          .select('*')
          .eq('student_id', user.id)

        if (achErr) console.log('[v0] achievements error:', achErr.message)
        setAchievements(achData || [])
      } catch (e: any) {
        console.log('[v0] dashboard load error:', e.message)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const completedMissions = progress.filter(p => p.status === 'completed').length
  const totalXP = profile?.total_xp || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3 p-8 rounded-2xl bg-destructive/10 border border-destructive/20">
          <p className="text-destructive font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, <span className="text-primary">{profile?.full_name?.split(' ')[0] || 'Student'}</span>!
        </h1>
        <p className="text-muted-foreground">
          Continue your Class {profile?.class_grade || 6} learning journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Zap, value: totalXP, label: 'Total XP', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Rocket, value: completedMissions, label: 'Missions Done', color: 'text-chart-2', bg: 'bg-chart-2/10' },
          { icon: Trophy, value: achievements.length, label: 'Achievements', color: 'text-chart-3', bg: 'bg-chart-3/10' },
          { icon: Target, value: missions.length, label: 'Available', color: 'text-chart-4', bg: 'bg-chart-4/10' },
        ].map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Missions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Missions</h2>
            <span className="text-sm text-muted-foreground">Class {profile?.class_grade || 6}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.slice(0, 4).map((mission) => {
              const missionProgress = progress.find(p => p.mission_id === mission.id)
              return (
                <MissionCard key={mission.id} mission={mission} progress={missionProgress} />
              )
            })}
          </div>

          {missions.length === 0 && (
            <div className="text-center py-12 rounded-2xl bg-card/30 border border-border/30">
              <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No missions found for Class {profile?.class_grade || 6}.</p>
              <p className="text-xs text-muted-foreground mt-2">Check back soon or try a different class.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProgressStats
            totalXP={totalXP}
            completedMissions={completedMissions}
            totalMissions={missions.length}
          />
          <RecentActivity activities={progress} />
        </div>
      </div>
    </div>
  )
}
