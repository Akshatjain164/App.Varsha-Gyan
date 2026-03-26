"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import {
  Sparkles,
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Profile {
  id: string
  full_name: string | null
  role: string
  avatar_url: string | null
}

interface TeacherSidebarProps {
  user: User
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/teacher/classes', icon: BookOpen, label: 'My Classes' },
  { href: '/dashboard/teacher/students', icon: Users, label: 'Students' },
  { href: '/dashboard/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
  { href: '/dashboard/teacher/analytics', icon: BarChart3, label: 'Analytics' },
]

export function TeacherSidebar({ user, profile }: TeacherSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
            <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center border border-chart-2/30">
              <Sparkles className="w-5 h-5 text-chart-2" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-foreground">Varsha</span>
              <span className="text-chart-2">-Gyan</span>
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

        {/* Teacher Badge */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-chart-2" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Teacher Account</p>
              <p className="text-xs text-muted-foreground">Full Access</p>
            </div>
          </div>
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
                        ? 'bg-chart-2/10 text-chart-2 border border-chart-2/30'
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center text-primary-foreground font-bold">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || 'Teacher'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-card border border-border shadow-lg">
                <Link href="/dashboard/teacher/settings">
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
