import { Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TeacherSettingsPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-lg">
          We&apos;re building your settings panel! You&apos;ll soon be able to manage your profile, class preferences, and notification settings.
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
