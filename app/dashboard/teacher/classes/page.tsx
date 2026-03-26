import { createClient } from '@/lib/supabase/server'
import { ClassOverviewCard } from '@/components/dashboard/ClassOverviewCard'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function TeacherClassesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', user?.id)
    .order('grade', { ascending: true })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Classes</h1>
          <p className="text-muted-foreground">
            Manage your classes and view enrolled students
          </p>
        </div>
        <Link href="/dashboard/teacher/classes/new">
          <Button className="glow-blue">
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </Link>
      </div>

      {/* Classes Grid */}
      {classes && classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <ClassOverviewCard key={cls.id} classData={cls} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-card/30 border border-border/30">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No Classes Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first class to start assigning missions and tracking student progress
          </p>
          <Link href="/dashboard/teacher/classes/new">
            <Button className="glow-blue">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Class
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
