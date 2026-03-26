"use client"

import Link from 'next/link'
import { Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClassData {
  id: string
  name: string
  grade: number
  description: string | null
  code: string
}

interface ClassOverviewCardProps {
  classData: ClassData
}

const gradeColors: Record<number, { bg: string, text: string, border: string }> = {
  6: { bg: 'bg-chart-1/10', text: 'text-chart-1', border: 'border-chart-1/30' },
  7: { bg: 'bg-chart-1/10', text: 'text-chart-1', border: 'border-chart-1/30' },
  8: { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-chart-2/30' },
  9: { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-chart-2/30' },
  10: { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-chart-3/30' },
  11: { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-chart-3/30' },
  12: { bg: 'bg-chart-4/10', text: 'text-chart-4', border: 'border-chart-4/30' },
}

export function ClassOverviewCard({ classData }: ClassOverviewCardProps) {
  const colors = gradeColors[classData.grade] || gradeColors[6]

  return (
    <div className={`
      group rounded-2xl bg-card/50 border ${colors.border} backdrop-blur-sm
      p-5 transition-all duration-300 hover:border-opacity-60
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`px-3 py-1 rounded-lg ${colors.bg} ${colors.text} text-sm font-medium`}>
          Class {classData.grade}
        </div>
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
        {classData.name}
      </h3>

      {/* Description */}
      {classData.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {classData.description}
        </p>
      )}

      {/* Class Code */}
      <div className="p-3 rounded-xl bg-muted/30 mb-4">
        <p className="text-xs text-muted-foreground mb-1">Class Code</p>
        <p className="text-lg font-mono font-bold text-foreground tracking-wider">
          {classData.code}
        </p>
      </div>

      {/* Action */}
      <Link href={`/dashboard/teacher/classes/${classData.id}`}>
        <Button variant="outline" className="w-full group-hover:border-chart-2/50">
          View Class
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  )
}
