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
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/use-language'

interface Surface {
  id: string
  name: string
  nameHi: string
  friction: number
  color: string
  pattern: 'smooth' | 'rough' | 'textured'
}

const surfaces: Surface[] = [
  { id: 'ice', name: 'Ice', nameHi: 'बर्फ', friction: 0.03, color: '#bfdbfe', pattern: 'smooth' },
  { id: 'wood', name: 'Wood', nameHi: 'लकड़ी', friction: 0.4, color: '#c2410c', pattern: 'textured' },
  { id: 'concrete', name: 'Concrete', nameHi: 'कंक्रीट', friction: 0.6, color: '#78716c', pattern: 'rough' },
  { id: 'rubber', name: 'Rubber', nameHi: 'रबर', friction: 0.9, color: '#1f2937', pattern: 'rough' },
]

export default function FrictionLabSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()

  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const [selectedSurface, setSelectedSurface] = useState<Surface>(surfaces[1])
  const [appliedForce, setAppliedForce] = useState(50)
  const [mass, setMass] = useState(5)
  
  const [blockX, setBlockX] = useState(100)
  const [velocity, setVelocity] = useState(0)
  const [acceleration, setAcceleration] = useState(0)

  const [score, setScore] = useState(0)
  const [interactions, setInteractions] = useState(0)

  const G = 9.8

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 800 * dpr
    canvas.height = 400 * dpr
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, 800, 400)

    // Grid
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x < 800; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 400)
      ctx.stroke()
    }

    // Surface
    ctx.fillStyle = selectedSurface.color
    ctx.fillRect(0, 280, 800, 120)

    // Surface texture
    if (selectedSurface.pattern === 'rough') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      for (let x = 0; x < 800; x += 10) {
        for (let y = 280; y < 400; y += 10) {
          if (Math.random() > 0.5) {
            ctx.fillRect(x, y, 5, 5)
          }
        }
      }
    } else if (selectedSurface.pattern === 'textured') {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < 800; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 280)
        ctx.lineTo(x + 10, 400)
        ctx.stroke()
      }
    }

    // Block
    const blockWidth = 80
    const blockHeight = 60
    const blockY = 280 - blockHeight

    // Block shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(blockX + 5, blockY + 5, blockWidth, blockHeight)

    // Block body
    const blockGradient = ctx.createLinearGradient(blockX, blockY, blockX, blockY + blockHeight)
    blockGradient.addColorStop(0, '#3b82f6')
    blockGradient.addColorStop(1, '#1d4ed8')
    ctx.fillStyle = blockGradient
    ctx.fillRect(blockX, blockY, blockWidth, blockHeight)

    // Block highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(blockX + 5, blockY + 5, blockWidth - 10, 10)

    // Mass label
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${mass} kg`, blockX + blockWidth / 2, blockY + blockHeight / 2 + 6)

    // Force arrow (applied)
    if (appliedForce > 0) {
      const arrowLength = Math.min(appliedForce * 1.5, 150)
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(blockX - 10, blockY + blockHeight / 2)
      ctx.lineTo(blockX - 10 - arrowLength, blockY + blockHeight / 2)
      ctx.stroke()

      // Arrow head
      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.moveTo(blockX - 10, blockY + blockHeight / 2)
      ctx.lineTo(blockX - 20, blockY + blockHeight / 2 - 10)
      ctx.lineTo(blockX - 20, blockY + blockHeight / 2 + 10)
      ctx.closePath()
      ctx.fill()

      ctx.font = '12px sans-serif'
      ctx.fillText(`F = ${appliedForce} N`, blockX - 10 - arrowLength / 2, blockY + blockHeight / 2 - 15)
    }

    // Friction force arrow
    const frictionForce = selectedSurface.friction * mass * G
    if (velocity > 0.1 || appliedForce > frictionForce) {
      const fricArrowLength = Math.min(frictionForce * 1.5, 100)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(blockX + blockWidth + 10, blockY + blockHeight / 2)
      ctx.lineTo(blockX + blockWidth + 10 + fricArrowLength, blockY + blockHeight / 2)
      ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(blockX + blockWidth + 10, blockY + blockHeight / 2)
      ctx.lineTo(blockX + blockWidth + 20, blockY + blockHeight / 2 - 10)
      ctx.lineTo(blockX + blockWidth + 20, blockY + blockHeight / 2 + 10)
      ctx.closePath()
      ctx.fill()

      ctx.font = '12px sans-serif'
      ctx.fillText(`f = ${frictionForce.toFixed(1)} N`, blockX + blockWidth + 10 + fricArrowLength / 2, blockY + blockHeight / 2 - 15)
    }

    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.roundRect(20, 20, 220, 120, 10)
    ctx.fill()
    
    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 14px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(isHindi ? 'डेटा' : 'DATA', 35, 45)
    
    ctx.fillStyle = '#fff'
    ctx.font = '12px monospace'
    ctx.fillText(`${isHindi ? 'घर्षण गुणांक' : 'Friction (μ)'}: ${selectedSurface.friction}`, 35, 70)
    ctx.fillText(`${isHindi ? 'सामान्य बल' : 'Normal Force'}: ${(mass * G).toFixed(1)} N`, 35, 90)
    ctx.fillText(`${isHindi ? 'घर्षण बल' : 'Friction Force'}: ${frictionForce.toFixed(1)} N`, 35, 110)
    ctx.fillText(`${isHindi ? 'वेग' : 'Velocity'}: ${velocity.toFixed(2)} m/s`, 35, 130)
  }, [blockX, velocity, selectedSurface, appliedForce, mass, isHindi])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    const frictionForce = selectedSurface.friction * mass * G
    const netForce = appliedForce - frictionForce
    const acc = netForce / mass

    let vel = 0
    let pos = 100

    const animate = () => {
      if (netForce > 0) {
        vel += acc * 0.016
        pos += vel * 5

        if (pos > 650) {
          pos = 650
          vel = 0
          setIsPlaying(false)
        }

        setVelocity(vel)
        setBlockX(pos)
        setAcceleration(acc)
      } else {
        setIsPlaying(false)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, selectedSurface, appliedForce, mass])

  const handleReset = () => {
    setIsPlaying(false)
    setBlockX(100)
    setVelocity(0)
    setAcceleration(0)
  }

  const handleComplete = async () => {
    const finalScore = Math.min(100, 50 + interactions * 5)
    setScore(finalScore)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase
        .from('missions')
        .select('id, xp_reward')
        .eq('simulation_type', 'friction-lab')
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
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 100 })
      }
    }

    setShowComplete(true)
  }

  const handleInteraction = () => {
    setInteractions(prev => prev + 1)
  }

  const controls = [
    {
      id: 'force',
      label: 'Applied Force',
      labelHi: 'लगाया गया बल',
      value: appliedForce,
      min: 0,
      max: 100,
      step: 5,
      unit: 'N',
      onChange: (v: number) => { setAppliedForce(v); handleReset(); handleInteraction() }
    },
    {
      id: 'mass',
      label: 'Block Mass',
      labelHi: 'ब्लॉक का द्रव्यमान',
      value: mass,
      min: 1,
      max: 20,
      step: 1,
      unit: 'kg',
      onChange: (v: number) => { setMass(v); handleReset(); handleInteraction() }
    },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Friction Lab"
        titleHi="घर्षण प्रयोगशाला"
        description="Explore how friction affects motion by testing different surfaces and forces."
        descriptionHi="विभिन्न सतहों और बलों का परीक्षण करके जानें कि घर्षण गति को कैसे प्रभावित करता है।"
        instructions="Select different surfaces, adjust the applied force and mass, then observe how the block moves."
        instructionsHi="विभिन्न सतहों का चयन करें, लगाए गए बल और द्रव्यमान को समायोजित करें, फिर देखें कि ब्लॉक कैसे चलता है।"
        xpReward={150}
        difficulty="Intermediate"
        subject="Physics"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="Friction Lab"
        xpEarned={150}
        score={score}
        maxScore={100}
        onPlayAgain={() => {
          setShowComplete(false)
          handleReset()
          setInteractions(0)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link href="/simulations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'वापस मिशनों पर' : 'Back to Missions'}</span>
          </Link>
          <LanguageToggle isHindi={isHindi} onToggle={toggleLanguage} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HolographicHUD missionActive color="blue">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {isHindi ? 'घर्षण प्रयोगशाला' : 'Friction Lab'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: 400 }}
                  className="rounded-xl"
                />
              </div>
            </HolographicHUD>
          </div>

          <div className="space-y-6">
            <HolographicHUD color="blue">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {isHindi ? 'सतह' : 'Surface'}
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {surfaces.map((surface) => (
                    <button
                      key={surface.id}
                      onClick={() => { setSelectedSurface(surface); handleReset(); handleInteraction() }}
                      className={`
                        p-3 rounded-xl border text-center transition-all
                        ${selectedSurface.id === surface.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 bg-card/30 hover:border-primary/50'
                        }
                      `}
                    >
                      <div 
                        className="w-full h-4 rounded mb-2"
                        style={{ backgroundColor: surface.color }}
                      />
                      <span className="text-xs text-foreground">
                        {isHindi ? surface.nameHi : surface.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        μ = {surface.friction}
                      </span>
                    </button>
                  ))}
                </div>

                <SimulationControls controls={controls} isHindi={isHindi} color="blue" />
              </div>
            </HolographicHUD>

            <Button onClick={handleComplete} className="w-full glow-blue">
              {isHindi ? 'मिशन पूरा करें' : 'Complete Mission'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
