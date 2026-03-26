'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ClassOverviewCard } from '@/components/dashboard/ClassOverviewCard'
import { StudentActivityChart } from '@/components/dashboard/StudentActivityChart'
import { RecentAssignments } from '@/components/dashboard/RecentAssignments'
import { Users, BookOpen, ClipboardList, TrendingUp, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TeacherDashboardPage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
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

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)

        const { data: classesData, error: classesErr } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)
          .order('grade', { ascending: true })
        if (classesErr) console.log('[v0] classes error:', classesErr.message)
        const classList = classesData || []
        setClasses(classList)

        if (classList.length > 0) {
          const { count } = await supabase
            .from('class_enrollments')
            .select('*', { count: 'exact', head: true })
            .in('class_id', classList.map((c: any) => c.id))
          setTotalStudents(count || 0)
        }

        const { data: assignmentsData, error: assignmentsErr } = await supabase
          .from('assignments')
          .select('*, missions(title_en, subject), classes(name, grade)')
          .eq('teacher_id', user.id)
          .order('assigned_at', { ascending: false })
          .limit(5)
        if (assignmentsErr) console.log('[v0] assignments error:', assignmentsErr.message)
        setAssignments(assignmentsData || [])
      } catch (e: any) {
        console.log('[v0] teacher dashboard error:', e.message)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
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
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, <span className="text-primary">{profile?.full_name?.split(' ')[0] || 'Teacher'}</span>!
          </h1>
          <p className="text-muted-foreground">Manage your classes and track student progress</p>
        </div>
        <Link href="/dashboard/teacher/classes/new">
          <Button className="glow-cyan">
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, value: classes.length, label: 'Active Classes', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Users, value: totalStudents, label: 'Total Students', color: 'text-chart-2', bg: 'bg-chart-2/10' },
          { icon: ClipboardList, value: assignments.length, label: 'Assignments', color: 'text-chart-3', bg: 'bg-chart-3/10' },
          { icon: TrendingUp, value: classes.length > 0 ? Math.round(totalStudents / classes.length) : 0, label: 'Avg per Class', color: 'text-chart-4', bg: 'bg-chart-4/10' },
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

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Your Classes</h2>
          <Link href="/dashboard/teacher/classes" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {classes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-card/30 border border-border/30 border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No classes yet</p>
            <p className="text-sm text-muted-foreground mb-6">Create your first class to get started</p>
            <Link href="/dashboard/teacher/classes/new">
              <Button className="glow-cyan"><Plus className="w-4 h-4 mr-2" />Create Class</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <ClassOverviewCard key={cls.id} classData={cls} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StudentActivityChart classes={classes} />
        <RecentAssignments assignments={assignments} />
      </div>
    </div>
  )
}

