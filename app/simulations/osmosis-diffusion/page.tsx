"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { SimulationControls } from "@/components/simulations/framework/SimulationControls"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"

interface Particle {
  x: number; y: number; vx: number; vy: number
  type: "water" | "solute"; side: "left" | "right"
}

export default function OsmosisDiffusionSimulation() {
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [leftConc, setLeftConc] = useState(30)
  const [rightConc, setRightConc] = useState(70)
  const [particles, setParticles] = useState<Particle[]>([])
  const [experimentsCompleted, setExperimentsCompleted] = useState(0)
  const [score, setScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  const initParticles = useCallback(() => {
    const ps: Particle[] = []
    const addParticles = (side: "left" | "right", conc: number) => {
      const xBase = side === "left" ? 50 : 450
      const water = Math.round((100 - conc) / 5)
      const solute = Math.round(conc / 5)
      for (let i = 0; i < water; i++) ps.push({ x: xBase + Math.random() * 280, y: 80 + Math.random() * 280, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, type: "water", side })
      for (let i = 0; i < solute; i++) ps.push({ x: xBase + Math.random() * 280, y: 80 + Math.random() * 280, vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5, type: "solute", side })
    }
    addParticles("left", leftConc)
    addParticles("right", rightConc)
    setParticles(ps)
  }, [leftConc, rightConc])

  useEffect(() => { initParticles() }, [initParticles])

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = "rgba(168,85,247,0.1)"; ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
    ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 3; ctx.strokeRect(40, 60, 720, 300)
    const mx = W / 2
    ctx.fillStyle = "rgba(168,85,247,0.3)"; ctx.fillRect(mx-15, 60, 30, 300)
    ctx.fillStyle = "rgba(56,189,248,0.5)"
    for (let y = 80; y < 350; y += 40) { ctx.beginPath(); ctx.ellipse(mx, y, 8, 15, 0, 0, Math.PI*2); ctx.fill() }
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.type==="water"?6:10, 0, Math.PI*2)
      ctx.fillStyle = p.type==="water" ? "#38bdf8" : "#f59e0b"; ctx.fill()
    })
    ctx.font = "12px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"
    ctx.fillText(isHindi ? `बायां: ${leftConc}% विलेय` : `Left: ${leftConc}% solute`, 200, 390)
    ctx.fillText(isHindi ? `दायां: ${rightConc}% विलेय` : `Right: ${rightConc}% solute`, 600, 390)
    ctx.fillStyle = "#a855f7"
    ctx.fillText(isHindi ? "अर्ध-पारगम्य झिल्ली" : "Semi-Permeable Membrane", mx, 50)
  }, [particles, leftConc, rightConc, isHindi])

  useEffect(() => {
    const animate = () => { draw(); animRef.current = requestAnimationFrame(animate) }
    animate()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [draw])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        let {x, y, vx, vy, type, side} = p
        const mx = 400
        const lb = side==="left" ? 50 : mx+20, rb = side==="left" ? mx-20 : 750
        x += vx; y += vy
        if (x < lb || x > rb) vx *= -1
        if (y < 70 || y > 350) vy *= -1
        x = Math.max(lb, Math.min(rb, x)); y = Math.max(70, Math.min(350, y))
        if (type === "water") {
          const ls = prev.filter(pp=>pp.side==="left"&&pp.type==="solute").length
          const rs = prev.filter(pp=>pp.side==="right"&&pp.type==="solute").length
          if (side==="left" && x > mx-25 && rs > ls && Math.random() < 0.02) { side="right"; x=mx+25 }
          else if (side==="right" && x < mx+25 && ls > rs && Math.random() < 0.02) { side="left"; x=mx-25 }
        }
        vx += (Math.random()-0.5)*0.5; vy += (Math.random()-0.5)*0.5
        vx = Math.max(-2, Math.min(2, vx)); vy = Math.max(-2, Math.min(2, vy))
        return {x, y, vx, vy, type, side}
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [isRunning])

  const runExperiment = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setExperimentsCompleted(prev => {
        const n = prev + 1
        if (n >= 3) setTimeout(() => setShowComplete(true), 500)
        return n
      })
    }, 8000)
  }

  const handleComplete = async () => {
    const finalScore = Math.round((experimentsCompleted / 3) * 100)
    setScore(finalScore)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase.from('missions').select('id, xp_reward').eq('simulation_type', 'osmosis-diffusion').single()
      if (mission) {
        await supabase.from('mission_progress').upsert({ student_id: user.id, mission_id: mission.id, status: 'completed', score: finalScore, attempts: 1, completed_at: new Date().toISOString() }, { onConflict: 'student_id,mission_id' })
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 150 })
      }
    }
    setShowComplete(true)
  }

  const controls = [
    { id: 'leftConc', label: 'Left Solute %', labelHi: 'बायां विलेय %', value: leftConc, min: 0, max: 100, step: 10, unit: '%', onChange: (v: number) => { setLeftConc(v); if (!isRunning) initParticles() } },
    { id: 'rightConc', label: 'Right Solute %', labelHi: 'दायां विलेय %', value: rightConc, min: 0, max: 100, step: 10, unit: '%', onChange: (v: number) => { setRightConc(v); if (!isRunning) initParticles() } },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Osmosis & Diffusion"
        titleHi="परासरण और विसरण"
        description="Observe how molecules move across semi-permeable membranes!"
        descriptionHi="देखें कि अणु अर्ध-पारगम्य झिल्ली में कैसे चलते हैं!"
        instructions="Adjust concentrations on both sides and click Run Experiment to watch osmosis in action. Complete 3 experiments."
        instructionsHi="दोनों ओर सांद्रता समायोजित करें और प्रयोग चलाएं। 3 प्रयोग पूरे करें।"
        xpReward={200}
        difficulty="Advanced"
        subject="Biology"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="Osmosis & Diffusion"
        xpEarned={200}
        score={score}
        maxScore={100}
        onPlayAgain={() => { setShowComplete(false); setExperimentsCompleted(0); initParticles() }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link href="/simulations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'वापस' : 'Back'}</span>
          </Link>
          <LanguageToggle isHindi={isHindi} onToggle={toggleLanguage} />
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HolographicHUD missionActive color="purple">
            <div className="p-4">
              <h2 className="text-xl font-bold text-foreground mb-4">{isHindi ? 'परासरण और विसरण' : 'Osmosis & Diffusion'}</h2>
              <canvas ref={canvasRef} width={800} height={420} style={{ width: '100%' }} className="rounded-xl" />
              <div className="flex gap-3 mt-4">
                <Button onClick={runExperiment} disabled={isRunning} className="flex-1 glow-purple">
                  {isRunning ? <><Pause className="w-4 h-4 mr-2" />{isHindi ? 'चल रहा है...' : 'Running...'}</> : <><Play className="w-4 h-4 mr-2" />{isHindi ? 'प्रयोग चलाएं' : 'Run Experiment'}</>}
                </Button>
                <Button onClick={() => { setIsRunning(false); initParticles() }} variant="outline"><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </HolographicHUD>
        </div>
        <div className="space-y-4">
          <HolographicHUD color="purple">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-6">{isHindi ? 'नियंत्रण' : 'Controls'}</h3>
              <SimulationControls controls={controls} isHindi={isHindi} color="purple" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="purple">
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{isHindi ? 'प्रयोग' : 'Experiments'}</p>
              <p className="text-3xl font-bold text-chart-3">{experimentsCompleted}/3</p>
            </div>
          </HolographicHUD>
          <Button onClick={handleComplete} className="w-full glow-purple">{isHindi ? 'मिशन पूरा करें' : 'Complete Mission'}</Button>
        </div>
      </div>
    </div>
  )
}
