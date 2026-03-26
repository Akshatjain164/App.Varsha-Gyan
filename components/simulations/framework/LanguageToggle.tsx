"use client"

import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LanguageToggleProps {
  isHindi: boolean
  onToggle: () => void
}

export function LanguageToggle({ isHindi, onToggle }: LanguageToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`
        gap-2 transition-all
        ${isHindi 
          ? 'border-chart-4/50 bg-chart-4/10 text-chart-4 hover:bg-chart-4/20' 
          : 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
        }
      `}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{isHindi ? 'English' : 'हिंदी'}</span>
    </Button>
  )
}
