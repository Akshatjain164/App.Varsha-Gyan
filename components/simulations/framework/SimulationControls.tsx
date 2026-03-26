"use client"

import { ReactNode } from 'react'
import { Slider } from '@/components/ui/slider'

interface ControlConfig {
  id: string
  label: string
  labelHi: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

interface SimulationControlsProps {
  controls: ControlConfig[]
  isHindi?: boolean
  color?: 'cyan' | 'blue' | 'purple' | 'gold'
  children?: ReactNode
}

const colorClasses = {
  cyan: 'bg-chart-1',
  blue: 'bg-chart-2',
  purple: 'bg-chart-3',
  gold: 'bg-chart-4',
}

export function SimulationControls({ controls, isHindi = false, color = 'cyan', children }: SimulationControlsProps) {
  return (
    <div className="space-y-6">
      {controls.map((control) => (
        <div key={control.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {isHindi ? control.labelHi : control.label}
            </label>
            <span className="text-sm font-mono text-primary">
              {control.value.toFixed(control.step < 1 ? 1 : 0)} {control.unit}
            </span>
          </div>
          
          <div className="relative">
            {/* Glow track */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full opacity-50"
              style={{ 
                width: `${((control.value - control.min) / (control.max - control.min)) * 100}%`,
                background: `linear-gradient(90deg, transparent, ${color === 'cyan' ? 'rgb(0, 212, 255)' : color === 'blue' ? 'rgb(59, 130, 246)' : color === 'purple' ? 'rgb(168, 85, 247)' : 'rgb(245, 158, 11)'})`
              }}
            />
            
            <Slider
              value={[control.value]}
              min={control.min}
              max={control.max}
              step={control.step}
              onValueChange={([value]) => control.onChange(value)}
              className="relative z-10"
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{control.min} {control.unit}</span>
            <span>{control.max} {control.unit}</span>
          </div>
        </div>
      ))}
      
      {children}
    </div>
  )
}
