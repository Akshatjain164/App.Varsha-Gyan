"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()

  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDayMode, setIsDayMode] = useState(true)
  
  const [lightX, setLightX] = useState(400)
  const [lightY, setLightY] = useState(100)
  const [objectX, setObjectX] = useState(400)
  const [objectHeight, setObjectHeight] = useState(100)

  const [score, setScore] = useState(0)
  const [interactions, setInteractions] = useState(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 800 * dpr
    canvas.height = 500 * dpr
    ctx.scale(dpr, dpr)

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 500)
    if (isDayMode) {
      gradient.addColorStop(0, '#1e40af')
      gradient.addColorStop(1, '#60a5fa')
    } else {
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, '#1e293b')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 500)

    // Ground
    ctx.fillStyle = isDayMode ? '#22c55e' : '#166534'
    ctx.fillRect(0, 400, 800, 100)

    // Light source (Sun/Moon)
    ctx.beginPath()
    ctx.arc(lightX, lightY, 30, 0, Math.PI * 2)
    const lightGradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 30)
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
    ctx.strokeStyle = isDayMode ? 'rgba(250, 204, 21, 0.3)' : 'rgba(226, 232, 240, 0.2)'
    ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(lightX + Math.cos(angle) * 35, lightY + Math.sin(angle) * 35)
      ctx.lineTo(lightX + Math.cos(angle) * 55, lightY + Math.sin(angle) * 55)
      ctx.stroke()
    }

    // Object (tree or building)
    const objectBottom = 400
    const objectTop = objectBottom - objectHeight
    
    // Tree trunk
    ctx.fillStyle = '#78350f'
    ctx.fillRect(objectX - 10, objectTop + objectHeight * 0.6, 20, objectHeight * 0.4)
    
    // Tree top
    ctx.beginPath()
    ctx.moveTo(objectX, objectTop)
    ctx.lineTo(objectX - 40, objectTop + objectHeight * 0.6)
    ctx.lineTo(objectX + 40, objectTop + objectHeight * 0.6)
    ctx.closePath()
    ctx.fillStyle = '#166534'
    ctx.fill()

    // Calculate shadow
    const shadowLength = ((objectBottom - lightY) / (lightY - objectTop)) * objectHeight
    const shadowDirection = lightX < objectX ? 1 : -1
    const shadowEndX = objectX + shadowDirection * Math.abs(shadowLength) * (Math.abs(lightX - objectX) / (400 - lightY))

    // Shadow
    ctx.beginPath()
    ctx.moveTo(objectX - 10, objectBottom)
    ctx.lineTo(objectX + 10, objectBottom)
    ctx.lineTo(shadowEndX + 10 * shadowDirection, objectBottom)
    ctx.lineTo(shadowEndX - 10 * shadowDirection, objectBottom)
    ctx.closePath()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fill()

    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.roundRect(20, 20, 200, 80, 10)
    ctx.fill()
    
    ctx.fillStyle = '#fff'
    ctx.font = '14px sans-serif'
    ctx.fillText(isHindi ? 'प्रकाश की स्थिति' : 'Light Position', 35, 45)
    ctx.fillText(`X: ${lightX.toFixed(0)}, Y: ${lightY.toFixed(0)}`, 35, 65)
    ctx.fillText(isHindi ? `छाया लंबाई: ${Math.abs(shadowEndX - objectX).toFixed(0)}` : `Shadow Length: ${Math.abs(shadowEndX - objectX).toFixed(0)}`, 35, 85)
  }, [lightX, lightY, objectX, objectHeight, isDayMode, isHindi])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    if (!isPlaying) return

    let time = 0
    const animate = () => {
      time += 0.02
      setLightX(400 + Math.cos(time) * 200)
      setLightY(100 + Math.sin(time) * 50)
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying])

  const handleComplete = async () => {
    const finalScore = Math.min(100, 50 + interactions * 10)
    setScore(finalScore)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Get the mission ID by simulation type
      const { data: mission } = await supabase
        .from('missions')
        .select('id, xp_reward')
        .eq('simulation_type', 'light-shadows')
        .single()

      if (mission) {
        // Update progress using correct table name
        await supabase.from('mission_progress').upsert({
          student_id: user.id,
          mission_id: mission.id,
          status: 'completed',
          score: finalScore,
          attempts: 1,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'student_id,mission_id' })
        
        // Add XP
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 50 })
      }
    }

    setShowComplete(true)
  }

  const handleInteraction = () => {
    setInteractions(prev => prev + 1)
  }

  const controls = [
    {
      id: 'lightX',
      label: 'Light Horizontal Position',
      labelHi: 'प्रकाश की क्षैतिज स्थिति',
      value: lightX,
      min: 100,
      max: 700,
      step: 10,
      unit: 'px',
      onChange: (v: number) => { setLightX(v); handleInteraction() }
    },
    {
      id: 'lightY',
      label: 'Light Height',
      labelHi: 'प्रकाश की ऊंचाई',
      value: lightY,
      min: 50,
      max: 300,
      step: 10,
      unit: 'px',
      onChange: (v: number) => { setLightY(v); handleInteraction() }
    },
    {
      id: 'objectHeight',
      label: 'Object Height',
      labelHi: 'वस्तु की ऊंचाई',
      value: objectHeight,
      min: 50,
      max: 200,
      step: 10,
      unit: 'px',
      onChange: (v: number) => { setObjectHeight(v); handleInteraction() }
    },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Light & Shadows"
        titleHi="प्रकाश और छाया"
        description="Explore how light creates shadows by changing the position of light source and objects."
        descriptionHi="प्रकाश स्रोत और वस्तुओं की स्थिति बदलकर जानें कि प्रकाश कैसे छाया बनाता है।"
        instructions="Move the light source around and observe how the shadow changes in length and direction."
        instructionsHi="प्रकाश स्रोत को इधर-उधर घुमाएं और देखें कि छाया की लंबाई और दिशा कैसे बदलती है।"
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
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link href="/simulations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'वापस मिशनों पर' : 'Back to Missions'}</span>
          </Link>
          <LanguageToggle isHindi={isHindi} onToggle={toggleLanguage} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <HolographicHUD missionActive color="cyan">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {isHindi ? 'प्रकाश और छाया' : 'Light & Shadows'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDayMode(!isDayMode)}
                    >
                      {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLightX(400)
                        setLightY(100)
                        setObjectHeight(100)
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: 500 }}
                  className="rounded-xl bg-muted cursor-crosshair"
                />
              </div>
            </HolographicHUD>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <HolographicHUD color="cyan">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
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
