import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentSidebar } from '@/components/dashboard/StudentSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Dashboard | Varsha-Gyan',
  description: 'Track your missions, XP progress, achievements, and class performance on Varsha-Gyan.',
}

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  let { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, class_grade, total_xp, avatar_url')
    .eq('id', user.id)
    .single()

  // If no profile exists yet, create one using signup metadata
  if (!profile) {
    const meta = user.user_metadata || {}
    const emailPrefix = user.email?.split('@')[0] ?? 'Student'
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: meta.full_name || emailPrefix,
        role: meta.role || 'student',
        class_grade: meta.class_grade || 6,
        total_xp: 0,
      })
      .select('id, full_name, role, class_grade, total_xp, avatar_url')
      .single()
    profile = newProfile
  }

  if (profile?.role === 'teacher') {
    redirect('/dashboard/teacher')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar user={user} profile={profile} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
