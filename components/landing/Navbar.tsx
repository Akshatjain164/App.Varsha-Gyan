"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Menu, X, Sun, Moon } from 'lucide-react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on outside click
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#missions', label: 'Missions' },
    { href: '/simulations', label: 'Try Simulations' },
    { href: '#features', label: 'About' },
  ]

  return (
    <nav ref={navRef} className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled 
        ? 'bg-background/80 backdrop-blur-lg border-b border-border/50' 
        : 'bg-transparent'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/30 group-hover:glow-cyan transition-all">
              <Image 
                src="/images/varsha-gyan-logo.jpg" 
                alt="Varsha-Gyan Logo" 
                width={40} 
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-foreground">Varsha</span>
              <span className="text-primary">-Gyan</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons + Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-foreground">
                Log In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="glow-cyan">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border/50" />
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full justify-start">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
