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

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#missions', label: 'Missions' },
    { href: '/simulations', label: 'Try Simulations' },
    { href: '#features', label: 'About' },
  ]

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-background/80 backdrop-blur-lg border-b border-border/50' 
          : 'bg-transparent'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group z-[60]">
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
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons + Theme Toggle (Desktop) */}
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
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors z-[60] relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Overlay Menu */}
      <div className={`
        fixed inset-0 z-[55] md:hidden transition-all duration-300
        ${isMobileMenuOpen 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
        }
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className={`
          relative flex flex-col items-center justify-center h-full gap-6
          transition-all duration-500
          ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}
        `}>
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-2xl font-semibold text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-px w-16 bg-border/50 my-2" />
          
          <button
            onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsMobileMenuOpen(false) }}
            className="flex items-center gap-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="flex flex-col gap-3 mt-4 w-64">
            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full text-lg py-6">
                Log In
              </Button>
            </Link>
            <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full glow-cyan text-lg py-6">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
