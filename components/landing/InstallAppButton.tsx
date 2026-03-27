"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true)
      return
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // Listen for the standard Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Do not show the button if the app is already installed
  if (isStandalone) return null

  // Do not show the button if it's not iOS and we haven't received the install prompt (e.g. on desktop)
  if (!isIOS && !deferredPrompt) return null

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS doesn't support automatic prompts, so we show instructions
      setShowIOSPrompt(true)
      setTimeout(() => setShowIOSPrompt(false), 5000)
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  return (
    <div className="md:hidden">
      <Button 
        onClick={handleInstallClick}
        variant="default" 
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4" />
        Install App
      </Button>

      {/* iOS Manual Instructions Popup */}
      {showIOSPrompt && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] bg-popover border border-border p-4 rounded-xl shadow-2xl z-[100] animate-in slide-in-from-bottom flex flex-col items-center text-center gap-2">
          <p className="text-sm font-medium">To install on iOS:</p>
          <p className="text-xs text-muted-foreground">Tap the <strong>Share</strong> button at the bottom of Safari and select <strong>"Add to Home Screen"</strong></p>
        </div>
      )}
    </div>
  )
}
