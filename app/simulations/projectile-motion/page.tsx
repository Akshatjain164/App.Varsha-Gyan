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

interface Point {
  x: number
  y: number
}

export default function ProjectileMotionSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()

  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const [angle, setAngle] = useState(45)
  const [velocity, setVelocity] = useState(50)
  const [gravity, setGravity] = useState(9.8)
  
  const [projectilePos, setProjectilePos] = useState<Point>({ x: 50, y: 400 })
  const [trajectory, setTrajectory] = useState<Point[]>([])
  const [time, setTime] = useState(0)
  const [maxHeight, setMaxHeight] = useState(0)
  const [range, setRange] = useState(0)

  const [score, setScore] = useState(0)
  const [interactions, setInteractions] = useState(0)

  const SCALE = 3
  const GROUND_Y = 400
  const START_X = 50

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 800 * dpr
    canvas.height = 500 * dpr
    ctx.scale(dpr, dpr)

    // Background with grid
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, 800, 500)

    // Grid
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)'
    ctx.lineWidth = 1
    for (let x = 0; x < 800; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 500)
      ctx.stroke()
    }
    for (let y = 0; y < 500; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(800, y)
      ctx.stroke()
    }

    // Ground
    ctx.fillStyle = '#166534'
    ctx.fillRect(0, GROUND_Y, 800, 100)

    // Launcher
    const launcherX = START_X
    const launcherY = GROUND_Y
    const launcherLength = 40
    const rad = (angle * Math.PI) / 180

    ctx.save()
    ctx.translate(launcherX, launcherY)
    ctx.rotate(-rad)
    
    ctx.fillStyle = '#64748b'
    ctx.fillRect(-10, -8, launcherLength + 10, 16)
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(launcherLength - 15, -6, 15, 12)
    
    ctx.restore()

    // Launcher base
    ctx.beginPath()
    ctx.arc(launcherX, launcherY, 15, 0, Math.PI * 2)
    ctx.fillStyle = '#475569'
    ctx.fill()

    // Trajectory path
    if (trajectory.length > 1) {
      ctx.beginPath()
      ctx.moveTo(trajectory[0].x, trajectory[0].y)
      for (let i = 1; i < trajectory.length; i++) {
        ctx.lineTo(trajectory[i].x, trajectory[i].y)
      }
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Trail dots
      for (let i = 0; i < trajectory.length; i += 5) {
        ctx.beginPath()
        ctx.arc(trajectory[i].x, trajectory[i].y, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)'
        ctx.fill()
      }
    }

    // Projectile
    ctx.beginPath()
    ctx.arc(projectilePos.x, projectilePos.y, 8, 0, Math.PI * 2)
    const ballGradient = ctx.createRadialGradient(
      projectilePos.x - 2, projectilePos.y - 2, 0,
      projectilePos.x, projectilePos.y, 8
    )
    ballGradient.addColorStop(0, '#00d4ff')
    ballGradient.addColorStop(1, '#3b82f6')
    ctx.fillStyle = ballGradient
    ctx.fill()
    
    // Glow effect
    ctx.beginPath()
    ctx.arc(projectilePos.x, projectilePos.y, 12, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)'
    ctx.fill()

    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.roundRect(600, 20, 180, 120, 10)
    ctx.fill()
    
    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(isHindi ? 'डेटा' : 'DATA', 620, 45)
    
    ctx.fillStyle = '#fff'
    ctx.font = '12px monospace'
    ctx.fillText(`${isHindi ? 'समय' : 'Time'}: ${time.toFixed(2)}s`, 620, 70)
    ctx.fillText(`${isHindi ? 'अधिकतम ऊंचाई' : 'Max Height'}: ${maxHeight.toFixed(1)}m`, 620, 90)
    ctx.fillText(`${isHindi ? 'परास' : 'Range'}: ${range.toFixed(1)}m`, 620, 110)
    ctx.fillText(`${isHindi ? 'कोण' : 'Angle'}: ${angle}°`, 620, 130)
  }, [projectilePos, trajectory, angle, time, maxHeight, range, isHindi])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    const rad = (angle * Math.PI) / 180
    const vx = velocity * Math.cos(rad)
    const vy = velocity * Math.sin(rad)
    let t = 0
    const dt = 0.016
    const newTrajectory: Point[] = []
    let currentMaxHeight = 0

    const animate = () => {
      t += dt
      const x = START_X + vx * t * SCALE
      const y = GROUND_Y - (vy * t - 0.5 * gravity * t * t) * SCALE
      
      const currentHeight = vy * t - 0.5 * gravity * t * t
      if (currentHeight > currentMaxHeight) {
        currentMaxHeight = currentHeight
      }

      newTrajectory.push({ x, y })
      setTrajectory([...newTrajectory])
      setProjectilePos({ x, y })
      setTime(t)
      setMaxHeight(currentMaxHeight)
      setRange(vx * t)

      if (y >= GROUND_Y) {
        setIsPlaying(false)
        setProjectilePos({ x, y: GROUND_Y })
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, angle, velocity, gravity])

  const handleReset = () => {
    setIsPlaying(false)
    setProjectilePos({ x: START_X, y: GROUND_Y })
    setTrajectory([])
    setTime(0)
    setMaxHeight(0)
    setRange(0)
  }

  const handleComplete = async () => {
    const finalScore = Math.min(100, 50 + interactions * 5)
    setScore(finalScore)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase
        .from('missions')
        .select('id, xp_reward')
        .eq('simulation_type', 'projectile-motion')
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
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 125 })
      }
    }

    setShowComplete(true)
  }

  const handleInteraction = () => {
    setInteractions(prev => prev + 1)
  }

  const controls = [
    {
      id: 'angle',
      label: 'Launch Angle',
      labelHi: 'प्रक्षेपण कोण',
      value: angle,
      min: 10,
      max: 80,
      step: 5,
      unit: '°',
      onChange: (v: number) => { setAngle(v); handleReset(); handleInteraction() }
    },
    {
      id: 'velocity',
      label: 'Initial Velocity',
      labelHi: 'प्रारंभिक वेग',
      value: velocity,
      min: 20,
      max: 100,
      step: 5,
      unit: 'm/s',
      onChange: (v: number) => { setVelocity(v); handleReset(); handleInteraction() }
    },
    {
      id: 'gravity',
      label: 'Gravity',
      labelHi: 'गुरुत्वाकर्षण',
      value: gravity,
      min: 1,
      max: 20,
      step: 0.5,
      unit: 'm/s²',
      onChange: (v: number) => { setGravity(v); handleReset(); handleInteraction() }
    },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Projectile Motion"
        titleHi="प्रक्षेप्य गति"
        description="Study how objects move through the air when launched at an angle."
        descriptionHi="जानें कि कोण पर फेंकी गई वस्तुएं हवा में कैसे चलती हैं।"
        instructions="Adjust the launch angle, velocity, and gravity to see how they affect the trajectory."
        instructionsHi="प्रक्षेपण कोण, वेग और गुरुत्वाकर्षण बदलकर देखें कि वे प्रक्षेपवक्र को कैसे प्रभावित करते हैं।"
        xpReward={180}
        difficulty="Intermediate+"
        subject="Physics"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="Projectile Motion"
        xpEarned={180}
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
                    {isHindi ? 'प्रक्षेप्य गति' : 'Projectile Motion'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      disabled={projectilePos.y >= GROUND_Y && trajectory.length > 0}
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
                  style={{ width: '100%', height: 500 }}
                  className="rounded-xl"
                />
              </div>
            </HolographicHUD>
          </div>

          <div className="space-y-6">
            <HolographicHUD color="blue">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {isHindi ? 'नियंत्रण' : 'Controls'}
                </h3>
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
