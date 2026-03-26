"use client"

import Link from 'next/link'
import { ClipboardList, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Assignment {
  id: string
  due_date: string | null
  assigned_at: string
  missions: {
    title_en: string
    subject: string
  } | null
  classes: {
    name: string
    grade: number
  } | null
}

interface RecentAssignmentsProps {
  assignments: Assignment[]
}

export function RecentAssignments({ assignments }: RecentAssignmentsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isPastDue = (dateString: string | null) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  return (
    <div className="rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Assignments</h3>
        <Link href="/dashboard/teacher/assignments/new">
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No assignments yet</p>
          <Link href="/dashboard/teacher/assignments/new">
            <Button variant="link" className="mt-2 text-chart-2">
              Create your first assignment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <Link 
              key={assignment.id}
              href={`/dashboard/teacher/assignments/${assignment.id}`}
              className="block p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {assignment.missions?.title_en || 'Unknown Mission'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {assignment.classes?.name} • Class {assignment.classes?.grade}
                  </p>
                </div>
                <div className={`
                  flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                  ${isPastDue(assignment.due_date) 
                    ? 'text-destructive bg-destructive/10' 
                    : 'text-muted-foreground bg-muted/30'
                  }
                `}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(assignment.due_date)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {assignments.length > 0 && (
        <Link href="/dashboard/teacher/assignments">
          <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-foreground">
            View All Assignments
          </Button>
        </Link>
      )}
    </div>
  )
}
