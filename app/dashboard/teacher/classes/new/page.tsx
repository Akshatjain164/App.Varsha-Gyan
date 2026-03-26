"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, BookOpen, Copy, CheckCircle2 } from 'lucide-react'

function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function NewClassPage() {
  const [name, setName] = useState('')
  const [gradeLevel, setGradeLevel] = useState<number>(6)
  const [subject, setSubject] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to create a class')
        return
      }

      const classCode = generateClassCode()

      const { error: insertError } = await supabase
        .from('classes')
        .insert({
          name,
          grade: gradeLevel,
          description: subject ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} class` : null,
          teacher_id: user.id,
          code: classCode,
        })

      if (insertError) {
        console.error('Class insert error:', insertError)
        setError(`Failed to create class: ${insertError.message}`)
        return
      }

      setCreatedCode(classCode)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Success state — show the generated code
  if (createdCode) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl bg-card/50 border border-chart-5/30 backdrop-blur-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-chart-5/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-chart-5" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Class Created! 🎉</h1>
          <p className="text-muted-foreground mb-8">Share this code with your students so they can join</p>
          
          <div className="p-6 rounded-2xl bg-background/50 border border-border mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Class Join Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-mono font-bold text-primary tracking-[0.3em]">{createdCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5 text-chart-5" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            <strong>{name}</strong> — Class {gradeLevel}
          </p>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setCreatedCode(null); setName('') }} variant="outline">
              Create Another
            </Button>
            <Link href="/dashboard/teacher/classes">
              <Button className="glow-blue">View All Classes</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href="/dashboard/teacher/classes" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Classes
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Class</h1>
        <p className="text-muted-foreground">
          Set up a new class and get a unique code for students to join
        </p>
      </div>

      <div className="rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Physics Section A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Grade Level</Label>
            <select
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-foreground"
            >
              {[6, 7, 8, 9, 10, 11, 12].map((level) => (
                <option key={level} value={level}>
                  Class {level}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-foreground"
            >
              <option value="">All Subjects</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="mathematics">Mathematics</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="p-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Class Code</p>
                <p className="text-xs text-muted-foreground">
                  A unique 6-character code will be auto-generated for students to join
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full glow-blue" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Class...
              </>
            ) : (
              'Create Class'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
