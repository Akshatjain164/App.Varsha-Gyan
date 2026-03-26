import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-20" />
      <div className="fixed top-20 left-1/4 w-72 h-72 bg-destructive/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md text-center">
        {/* Error Card */}
        <div className="relative rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-foreground mb-3">Authentication Error</h1>
          <p className="text-muted-foreground mb-8">
            Something went wrong during authentication. 
            This could be due to an expired link or a network issue.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
