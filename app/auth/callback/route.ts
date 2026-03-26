import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard/student'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check user role to redirect appropriately
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // Use profile role, or fall back to user_metadata from signup
      const role = profile?.role || data.user.user_metadata?.role || 'student'
      const redirectPath = role === 'teacher' 
        ? '/dashboard/teacher' 
        : '/dashboard/student'

      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Return error page on failure
  return NextResponse.redirect(`${origin}/auth/error`)
}
