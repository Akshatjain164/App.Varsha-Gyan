import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/50 bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-foreground">Varsha</span>
                <span className="text-primary">-Gyan</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transforming STEM education through gamification and interactive simulations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#missions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Missions</Link></li>
              <li><Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Students</Link></li>
              <li><Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Teachers</Link></li>
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Subjects</h4>
            <ul className="space-y-2">
              <li><Link href="/simulations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Physics</Link></li>
              <li><Link href="/simulations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chemistry</Link></li>
              <li><Link href="/simulations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Biology</Link></li>
              <li><Link href="/simulations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mathematics</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Varsha-Gyan. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Made with</span>
            <span className="text-primary">science</span>
            <span className="text-sm text-muted-foreground">in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
