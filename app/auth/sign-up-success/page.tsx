import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-20" />
      <div className="fixed top-20 left-1/4 w-72 h-72 bg-chart-5/10 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md text-center">
        {/* Success Card */}
        <div className="relative rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-chart-5/10 border border-chart-5/30 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-chart-5" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-foreground mb-3">Check Your Email</h1>
          <p className="text-muted-foreground mb-8">
            We've sent a confirmation link to your email address. 
            Please click the link to verify your account and start learning!
          </p>

          {/* Logo reminder */}
          <div className="flex items-center gap-2 justify-center mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Welcome to <span className="text-foreground font-medium">Varsha-Gyan</span>
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full glow-cyan">
                Go to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Help text */}
          <p className="mt-6 text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or{' '}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
