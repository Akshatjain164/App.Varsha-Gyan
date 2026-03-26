"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Users, Plus, LogIn, Loader2, CheckCircle2 } from 'lucide-react'

interface Class {
  id: string
  name: string
  grade: number
  description: string | null
  code: string
  teacher_id: string
}

interface Enrollment {
  id: string
  class_id: string
  enrolled_at: string
  classes: Class
}

export default function MyClassesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [classCode, setClassCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('class_enrollments')
        .select(`
          id,
          class_id,
          enrolled_at,
          classes (
            id,
            name,
            grade,
            description,
            code,
            teacher_id
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false })

      if (!error && data) {
        setEnrollments(data as unknown as Enrollment[])
      }
    }
    setLoading(false)
  }

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setJoining(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to join a class')
        return
      }

      // Find the class by code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('code', classCode.toUpperCase())
        .single()

      if (classError || !classData) {
        setError('Invalid class code. Please check and try again.')
        return
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('class_enrollments')
        .select('id')
        .eq('class_id', classData.id)
        .eq('student_id', user.id)
        .single()

      if (existing) {
        setError('You are already enrolled in this class')
        return
      }

      // Enroll in the class
      const { error: enrollError } = await supabase
        .from('class_enrollments')
        .insert({
          class_id: classData.id,
          student_id: user.id,
        })

      if (enrollError) {
        setError('Failed to join class. Please try again.')
        return
      }

      setSuccess(`Successfully joined ${classData.name}!`)
      setClassCode('')
      fetchEnrollments()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setJoining(false)
    }
  }

  const handleLeaveClass = async (enrollmentId: string, className: string) => {
    if (!confirm(`Are you sure you want to leave ${className}?`)) return

    const { error } = await supabase
      .from('class_enrollments')
      .delete()
      .eq('id', enrollmentId)

    if (!error) {
      fetchEnrollments()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Classes</h1>
        <p className="text-muted-foreground">
          Join classes to receive assignments from your teachers
        </p>
      </div>

      {/* Join Class */}
      <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Join a Class
        </h2>
        <form onSubmit={handleJoinClass} className="flex gap-3">
          <Input
            placeholder="Enter class code (e.g., ABC123)"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            className="flex-1 bg-background/50 uppercase font-mono tracking-wider"
            maxLength={6}
          />
          <Button type="submit" disabled={joining || !classCode.trim()} className="glow-cyan">
            {joining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Join
              </>
            )}
          </Button>
        </form>
        
        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
        {success && (
          <p className="mt-3 text-sm text-chart-5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </p>
        )}
      </div>

      {/* Enrolled Classes */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Enrolled Classes</h2>
        
        {enrollments.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-card/30 border border-border/30">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Classes Yet</h3>
            <p className="text-muted-foreground">
              Enter a class code above to join your teacher&apos;s class
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => (
              <div 
                key={enrollment.id}
                className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                    Class {enrollment.classes.grade}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {enrollment.classes.name}
                </h3>

                {enrollment.classes.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {enrollment.classes.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleLeaveClass(enrollment.id, enrollment.classes.name)}
                  >
                    Leave Class
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
