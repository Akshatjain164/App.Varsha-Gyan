"use client"

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  const colors = [
    'rgba(0, 212, 255, 0.8)',   // Cyan
    'rgba(59, 130, 246, 0.7)',  // Blue
    'rgba(168, 85, 247, 0.6)',  // Purple
  ]

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor((width * height) / 15000)
    const particles: Particle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    
    particlesRef.current = particles
  }, [])

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)
    
    const particles = particlesRef.current
    const mouse = mouseRef.current
    
    // Update and draw particles
    particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > width) particle.vx *= -1
      if (particle.y < 0 || particle.y > height) particle.vy *= -1
      
      // Mouse interaction - gentle attraction
      const dx = mouse.x - particle.x
      const dy = mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 150) {
        const force = (150 - distance) / 150 * 0.02
        particle.vx += dx * force * 0.01
        particle.vy += dy * force * 0.01
      }
      
      // Limit velocity
      const maxVel = 1.5
      particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx))
      particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy))
      
      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()
      
      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j]
        const connDx = particle.x - other.x
        const connDy = particle.y - other.y
        const connDist = Math.sqrt(connDx * connDx + connDy * connDy)
        
        if (connDist < 120) {
          const opacity = (1 - connDist / 120) * 0.3
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    
    const animate = () => {
      drawParticles(ctx, canvas.width, canvas.height)
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initParticles, drawParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}
