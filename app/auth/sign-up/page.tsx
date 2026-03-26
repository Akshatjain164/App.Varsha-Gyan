"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowLeft, Loader2, Eye, EyeOff, GraduationCap, Users } from 'lucide-react'

function SignUpForm() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') as 'student' | 'teacher' | null

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole || 'student')
  const [classLevel, setClassLevel] = useState<number>(6)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: role,
            class_grade: role === 'student' ? classLevel : null,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // If auto-confirmed (session exists), redirect to correct dashboard
      if (signUpData.session) {
        const dashboardPath = role === 'teacher' 
          ? '/dashboard/teacher' 
          : '/dashboard/student'
        router.push(dashboardPath)
        router.refresh()
      } else {
        // Email confirmation required
        router.push('/auth/sign-up-success')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-20" />
      <div className="fixed top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-chart-3/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="relative rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-foreground">Varsha</span>
              <span className="text-primary">-Gyan</span>
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Start your learning journey today</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-4 rounded-xl border transition-all ${
                role === 'student'
                  ? 'border-primary bg-primary/10 glow-cyan'
                  : 'border-border/50 bg-card/30 hover:border-primary/30'
              }`}
            >
              <GraduationCap className={`w-6 h-6 mx-auto mb-2 ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className={`text-sm font-medium ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`}>
                Student
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-4 rounded-xl border transition-all ${
                role === 'teacher'
                  ? 'border-chart-2 bg-chart-2/10 glow-blue'
                  : 'border-border/50 bg-card/30 hover:border-chart-2/30'
              }`}
            >
              <Users className={`w-6 h-6 mx-auto mb-2 ${role === 'teacher' ? 'text-chart-2' : 'text-muted-foreground'}`} />
              <div className={`text-sm font-medium ${role === 'teacher' ? 'text-chart-2' : 'text-muted-foreground'}`}>
                Teacher
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            {role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="classLevel">Class</Label>
                <select
                  id="classLevel"
                  value={classLevel}
                  onChange={(e) => setClassLevel(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-foreground"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map((level) => (
                    <option key={level} value={level}>
                      Class {level}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full ${role === 'student' ? 'glow-cyan' : 'glow-blue'}`} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
