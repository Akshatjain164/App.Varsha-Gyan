import { createClient } from '@/lib/supabase/server'
import { MissionCard } from '@/components/dashboard/MissionCard'
import { Atom, Beaker, Dna, Calculator } from 'lucide-react'

const subjectData = {
  physics: { icon: Atom, color: 'text-primary', bgColor: 'bg-primary/10' },
  chemistry: { icon: Beaker, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  biology: { icon: Dna, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
  mathematics: { icon: Calculator, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
}

export default async function MissionsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('class_grade')
    .eq('id', user?.id)
    .single()

  // Get all missions for student's class
  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('target_class', profile?.class_grade || 6)
    .order('subject', { ascending: true })

  // Get student's progress
  const { data: progress } = await supabase
    .from('mission_progress')
    .select('*')
    .eq('student_id', user?.id)

  // Group missions by subject
  const missionsBySubject = missions?.reduce((acc, mission) => {
    if (!acc[mission.subject]) {
      acc[mission.subject] = []
    }
    acc[mission.subject].push(mission)
    return acc
  }, {} as Record<string, typeof missions>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Missions</h1>
        <p className="text-muted-foreground">
          Complete interactive simulations to earn XP and unlock achievements
        </p>
      </div>

      {/* Missions by Subject */}
      {Object.entries(missionsBySubject || {}).map(([subject, subjectMissions]) => {
        const subjectInfo = subjectData[subject as keyof typeof subjectData]
        const Icon = subjectInfo?.icon || Atom

        return (
          <div key={subject} className="space-y-4">
            {/* Subject Header */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${subjectInfo?.bgColor || 'bg-muted'} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${subjectInfo?.color || 'text-foreground'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground capitalize">{subject}</h2>
                <p className="text-sm text-muted-foreground">{subjectMissions?.length || 0} missions</p>
              </div>
            </div>

            {/* Mission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectMissions?.map((mission) => {
                const missionProgress = progress?.find(p => p.mission_id === mission.id)
                return (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    progress={missionProgress}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {(!missions || missions.length === 0) && (
        <div className="text-center py-16 rounded-2xl bg-card/30 border border-border/30">
          <Atom className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Missions Available</h3>
          <p className="text-muted-foreground">
            Missions for Class {profile?.class_grade || 6} are coming soon!
          </p>
        </div>
      )}
    </div>
  )
}
