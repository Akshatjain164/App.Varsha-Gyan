"use client"

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

interface SimulationCanvasProps {
  width?: number
  height?: number
  onDraw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
  className?: string
}

export interface SimulationCanvasRef {
  getContext: () => CanvasRenderingContext2D | null
  getCanvas: () => HTMLCanvasElement | null
  clear: () => void
}

export const SimulationCanvas = forwardRef<SimulationCanvasRef, SimulationCanvasProps>(
  function SimulationCanvas({ width = 800, height = 500, onDraw, className = '' }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useImperativeHandle(ref, () => ({
      getContext: () => canvasRef.current?.getContext('2d') || null,
      getCanvas: () => canvasRef.current,
      clear: () => {
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      },
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set up high DPI canvas
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // Draw
      onDraw(ctx, canvas)
    }, [width, height, onDraw])

    return (
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className={`rounded-xl bg-background/50 ${className}`}
      />
    )
  }
)
