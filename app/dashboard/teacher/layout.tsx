import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeacherSidebar } from '@/components/dashboard/TeacherSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teacher Dashboard | Varsha-Gyan',
  description: 'Manage your classes, track student progress, assign missions, and view analytics on Varsha-Gyan.',
}

export default async function TeacherDashboardLayout({
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
    .select('id, full_name, role, total_xp, avatar_url')
    .eq('id', user.id)
    .single()

  // Create profile from signup metadata if missing
  if (!profile) {
    const meta = user.user_metadata || {}
    const emailPrefix = user.email?.split('@')[0] ?? 'Teacher'
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: meta.full_name || emailPrefix,
        role: meta.role || 'teacher',
        total_xp: 0,
      })
      .select('id, full_name, role, total_xp, avatar_url')
      .single()
    profile = newProfile
  }

  // Check role from profile OR user_metadata (trigger may not have fired yet)
  const userRole = profile?.role || user.user_metadata?.role || 'student'
  if (userRole !== 'teacher') {
    redirect('/dashboard/student')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar user={user} profile={profile} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
