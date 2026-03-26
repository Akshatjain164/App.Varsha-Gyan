"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  Sparkles, 
  LayoutDashboard, 
  Rocket, 
  Trophy, 
  BookOpen, 
  Settings, 
  LogOut,
  ChevronDown,
  Zap,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Profile {
  id: string
  full_name: string | null
  role: string
  class_grade: number | null
  total_xp: number
  avatar_url: string | null
}

interface StudentSidebarProps {
  user: User
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard/student', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/student/missions', icon: Rocket, label: 'Missions' },
  { href: '/dashboard/student/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/dashboard/student/my-classes', icon: BookOpen, label: 'My Classes' },
]

export function StudentSidebar({ user, profile }: StudentSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const xpProgress = profile?.total_xp ? (profile.total_xp % 1000) / 10 : 0
  const level = profile?.total_xp ? Math.floor(profile.total_xp / 1000) + 1 : 1

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

    <aside className={`
      fixed left-0 top-0 h-screen w-64 bg-card/50 border-r border-border/50 backdrop-blur-sm flex flex-col z-50
      transition-transform duration-300 ease-in-out
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
      {/* Logo */}
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-foreground">Varsha</span>
            <span className="text-primary">-Gyan</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-lg hover:bg-muted/50"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* XP Progress */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Level {level}</span>
          </div>
          <span className="text-xs text-muted-foreground">{profile?.total_xp || 0} XP</span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {1000 - (profile?.total_xp || 0) % 1000} XP to next level
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/30' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground font-bold">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || 'Student'}
              </p>
              <p className="text-xs text-muted-foreground">
                Class {profile?.class_grade || '?'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-card border border-border shadow-lg">
              <Link href="/dashboard/student/settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  )
}
