"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HolographicHUD } from '@/components/simulations/framework/HolographicHUD'
import { MissionBriefing } from '@/components/simulations/framework/MissionBriefing'
import { SimulationComplete } from '@/components/simulations/framework/SimulationComplete'
import { SimulationControls } from '@/components/simulations/framework/SimulationControls'
import { LanguageToggle } from '@/components/simulations/framework/LanguageToggle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Pause, RotateCcw, Sun, Moon } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/use-language'

export default function LightShadowsSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const isDragging = useRef(false)
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()

  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDayMode, setIsDayMode] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 })
  
  const [lightX, setLightX] = useState(400)
  const [lightY, setLightY] = useState(100)
  const [objectHeight, setObjectHeight] = useState(100)

  const [score, setScore] = useState(0)
  const [interactions, setInteractions] = useState(0)

  // Responsive canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        const h = Math.min(500, w * 0.625)
        setCanvasSize({ w, h })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvasSize.w
    const H = canvasSize.h
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    // Scale coordinates relative to base 800x500
    const sx = W / 800
    const sy = H / 500
    const lx = lightX * sx
    const ly = lightY * sy
    const oh = objectHeight * sy
    const ox = (W / 2) // Object always centered
    const groundY = H * 0.8

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, H)
    if (isDayMode) {
      gradient.addColorStop(0, '#1e40af')
      gradient.addColorStop(1, '#60a5fa')
    } else {
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, '#1e293b')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, W, H)

    // Stars in night mode
    if (!isDayMode) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      for (let i = 0; i < 40; i++) {
        const sx2 = ((i * 137.5) % W)
        const sy2 = ((i * 97.3) % (groundY * 0.6))
        ctx.beginPath()
        ctx.arc(sx2, sy2, Math.random() * 1.5 + 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Ground
    ctx.fillStyle = isDayMode ? '#22c55e' : '#166534'
    ctx.fillRect(0, groundY, W, H - groundY)
    // Ground texture
    ctx.fillStyle = isDayMode ? '#16a34a' : '#14532d'
    for (let i = 0; i < W; i += 20) {
      ctx.fillRect(i, groundY, 2, 3)
    }

    // Light glow
    const glowGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 120 * sx)
    glowGrad.addColorStop(0, isDayMode ? 'rgba(250,204,21,0.15)' : 'rgba(226,232,240,0.1)')
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, W, H)

    // Light source
    ctx.beginPath()
    ctx.arc(lx, ly, 25 * sx, 0, Math.PI * 2)
    const lightGradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, 25 * sx)
    if (isDayMode) {
      lightGradient.addColorStop(0, '#fef08a')
      lightGradient.addColorStop(1, '#f59e0b')
    } else {
      lightGradient.addColorStop(0, '#e2e8f0')
      lightGradient.addColorStop(1, '#94a3b8')
    }
    ctx.fillStyle = lightGradient
    ctx.fill()

    // Light rays
    ctx.strokeStyle = isDayMode ? 'rgba(250,204,21,0.3)' : 'rgba(226,232,240,0.15)'
    ctx.lineWidth = 2
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(lx + Math.cos(angle) * 30 * sx, ly + Math.sin(angle) * 30 * sx)
      ctx.lineTo(lx + Math.cos(angle) * 50 * sx, ly + Math.sin(angle) * 50 * sx)
      ctx.stroke()
    }

    // Object (tree)
    const objectTop = groundY - oh
    
    // Tree trunk
    ctx.fillStyle = '#78350f'
    const trunkW = 16 * sx
    ctx.fillRect(ox - trunkW / 2, objectTop + oh * 0.6, trunkW, oh * 0.4)
    
    // Tree top (triangle)
    ctx.beginPath()
    ctx.moveTo(ox, objectTop)
    ctx.lineTo(ox - 35 * sx, objectTop + oh * 0.65)
    ctx.lineTo(ox + 35 * sx, objectTop + oh * 0.65)
    ctx.closePath()
    ctx.fillStyle = isDayMode ? '#166534' : '#0f4c2a'
    ctx.fill()

    // Shadow calculation (with safety guards)
    const lightToGround = groundY - ly
    const lightToTop = ly - objectTop
    
    if (lightToGround > 0 && lightToTop > 0.1) {
      const shadowScale = lightToGround / lightToTop
      const shadowLength = Math.min(W * 2, Math.abs(lx - ox) * shadowScale)
      const shadowDir = lx < ox ? 1 : -1
      const shadowEndX = ox + shadowDir * shadowLength

      // Shadow gradient
      const shadowGrad = ctx.createLinearGradient(ox, groundY, shadowEndX, groundY)
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.5)')
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.beginPath()
      ctx.moveTo(ox - trunkW / 2, groundY)
      ctx.lineTo(ox + trunkW / 2, groundY)
      ctx.lineTo(shadowEndX + trunkW / 2 * shadowDir, groundY)
      ctx.lineTo(shadowEndX - trunkW / 2 * shadowDir, groundY)
      ctx.closePath()
      ctx.fillStyle = shadowGrad
      ctx.fill()

      // Umbra label
      const umbraLen = Math.abs(shadowEndX - ox).toFixed(0)
      
      // Info panel
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      const panelW = 200 * sx
      const panelH = 90 * sy
      ctx.beginPath()
      ctx.roundRect(12, 12, panelW, panelH, 8)
      ctx.fill()
      
      ctx.fillStyle = '#00d4ff'
      ctx.font = `bold ${13 * sx}px system-ui, sans-serif`
      ctx.fillText(isHindi ? 'प्रकाश और छाया' : 'LIGHT & SHADOWS', 22, 32 * sy)
      
      ctx.fillStyle = '#fff'
      ctx.font = `${12 * sx}px system-ui, sans-serif`
      ctx.fillText(isHindi ? `प्रकाश: (${lightX.toFixed(0)}, ${lightY.toFixed(0)})` : `Light: (${lightX.toFixed(0)}, ${lightY.toFixed(0)})`, 22, 52 * sy)
      ctx.fillText(isHindi ? `छाया लंबाई: ${umbraLen}px` : `Shadow: ${umbraLen}px`, 22, 72 * sy)
      ctx.fillText(isHindi ? `ऊंचाई: ${objectHeight.toFixed(0)}px` : `Height: ${objectHeight.toFixed(0)}px`, 22, 90 * sy)
    }

    // Drag hint
    if (interactions === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.beginPath()
      ctx.roundRect(W / 2 - 100 * sx, H - 40 * sy, 200 * sx, 30 * sy, 8)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `${11 * sx}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(isHindi ? '☀️ प्रकाश को खींचें' : '☀️ Drag the light source', W / 2, H - 22 * sy)
      ctx.textAlign = 'start'
    }
  }, [lightX, lightY, objectHeight, isDayMode, isHindi, canvasSize, interactions])

  useEffect(() => {
    draw()
  }, [draw])

  // Mouse/touch drag for light source
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 800
    const y = ((e.clientY - rect.top) / rect.height) * 500
    // Check if near light source
    if (Math.hypot(x - lightX, y - lightY) < 50) {
      isDragging.current = true
      canvas.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(50, Math.min(750, ((e.clientX - rect.left) / rect.width) * 800))
    const y = Math.max(30, Math.min(350, ((e.clientY - rect.top) / rect.height) * 500))
    setLightX(x)
    setLightY(y)
    setInteractions(prev => prev + 1)
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  useEffect(() => {
    if (!isPlaying) return
    let time = 0
    const animate = () => {
      time += 0.015
      setLightX(400 + Math.cos(time) * 250)
      setLightY(120 + Math.sin(time * 0.7) * 70)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying])

  const handleComplete = async () => {
    const finalScore = Math.min(100, 50 + interactions * 5)
    setScore(finalScore)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase
        .from('missions')
        .select('id, xp_reward')
        .eq('simulation_type', 'light-shadows')
        .single()

      if (mission) {
        await supabase.from('mission_progress').upsert({
          student_id: user.id,
          mission_id: mission.id,
          status: 'completed',
          score: finalScore,
          attempts: 1,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'student_id,mission_id' })
        
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 50 })
      }
    }

    setShowComplete(true)
  }

  const controls = [
    {
      id: 'lightX',
      label: 'Light Horizontal',
      labelHi: 'प्रकाश क्षैतिज',
      value: lightX,
      min: 50, max: 750, step: 5, unit: 'px',
      onChange: (v: number) => { setLightX(v); setInteractions(p => p + 1) }
    },
    {
      id: 'lightY',
      label: 'Light Height',
      labelHi: 'प्रकाश ऊंचाई',
      value: lightY,
      min: 30, max: 350, step: 5, unit: 'px',
      onChange: (v: number) => { setLightY(v); setInteractions(p => p + 1) }
    },
    {
      id: 'objectHeight',
      label: 'Tree Height',
      labelHi: 'पेड़ की ऊंचाई',
      value: objectHeight,
      min: 40, max: 220, step: 5, unit: 'px',
      onChange: (v: number) => { setObjectHeight(v); setInteractions(p => p + 1) }
    },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Light & Shadows"
        titleHi="प्रकाश और छाया"
        description="Explore how light creates shadows by changing the position of the light source and objects."
        descriptionHi="प्रकाश स्रोत और वस्तुओं की स्थिति बदलकर जानें कि प्रकाश कैसे छाया बनाता है।"
        instructions="Drag the sun/moon or use the sliders to move the light. Watch how the shadow changes length and direction."
        instructionsHi="सूर्य/चंद्रमा को खींचें या स्लाइडर का उपयोग करें। देखें कि छाया की लंबाई और दिशा कैसे बदलती है।"
        xpReward={100}
        difficulty="Beginner"
        subject="Physics"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="Light & Shadows"
        xpEarned={100}
        score={score}
        maxScore={100}
        onPlayAgain={() => {
          setShowComplete(false)
          setInteractions(0)
          setLightX(400)
          setLightY(100)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-6xl mx-auto mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <Link href="/simulations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'वापस' : 'Back'}</span>
          </Link>
          <LanguageToggle isHindi={isHindi} onToggle={toggleLanguage} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2" ref={containerRef}>
            <HolographicHUD missionActive color="cyan">
              <div className="p-2 md:p-4">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-foreground">
                    {isHindi ? 'प्रकाश और छाया' : 'Light & Shadows'}
                  </h2>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsDayMode(!isDayMode)}>
                      {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setLightX(400); setLightY(100); setObjectHeight(100) }}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: canvasSize.h }}
                  className="rounded-xl bg-muted cursor-crosshair touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                />
              </div>
            </HolographicHUD>
          </div>

          <div className="space-y-4 md:space-y-6">
            <HolographicHUD color="cyan">
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 md:mb-6">
                  {isHindi ? 'नियंत्रण' : 'Controls'}
                </h3>
                <SimulationControls controls={controls} isHindi={isHindi} color="cyan" />
              </div>
            </HolographicHUD>

            <Button onClick={handleComplete} className="w-full glow-cyan">
              {isHindi ? 'मिशन पूरा करें' : 'Complete Mission'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
