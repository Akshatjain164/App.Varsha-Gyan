import { ClipboardList, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TeacherAssignmentsPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground text-lg">
          Create and manage assignments, set due dates, and review submissions — your mission control center for homework.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          🚧 Coming Soon
        </div>
        <div>
          <Link href="/dashboard/teacher" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
