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
import { Zap, RotateCcw, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"

export default function OhmsLawSimulation() {
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [voltage, setVoltage] = useState(6)
  const [resistance, setResistance] = useState(100)
  const [dataPoints, setDataPoints] = useState<{v: number, i: number}[]>([])
  const [score, setScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const graphRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  const current = (voltage / resistance) * 1000 // mA

  const drawCircuit = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = "rgba(168,85,247,0.1)"; ctx.lineWidth = 1
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
    const cx = W/2, cy = H/2, cw = 300, ch = 180
    ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 3; ctx.lineCap = "round"
    ctx.beginPath(); ctx.moveTo(cx-cw/2,cy-ch/2); ctx.lineTo(cx+cw/2,cy-ch/2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx+cw/2,cy-ch/2); ctx.lineTo(cx+cw/2,cy+ch/2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx+cw/2,cy+ch/2); ctx.lineTo(cx-cw/2,cy+ch/2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx-cw/2,cy+ch/2); ctx.lineTo(cx-cw/2,cy-ch/2); ctx.stroke()
    // Battery
    ctx.fillStyle = "#1f2937"; ctx.fillRect(cx-cw/2-25, cy-40, 50, 80)
    ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 2; ctx.strokeRect(cx-cw/2-25, cy-40, 50, 80)
    ctx.font = "bold 16px monospace"; ctx.fillStyle = "#a855f7"; ctx.textAlign = "center"
    ctx.fillText(`${voltage}V`, cx-cw/2, cy+5)
    // Resistor zigzag
    ctx.beginPath(); ctx.moveTo(cx-50, cy-ch/2)
    for (let i=0;i<8;i++) ctx.lineTo(cx-40+i*10, cy-ch/2+(i%2===0?-15:15))
    ctx.lineTo(cx+50, cy-ch/2)
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 3; ctx.stroke()
    ctx.font = "bold 14px monospace"; ctx.fillStyle = "#fbbf24"
    ctx.fillText(`${resistance}Ω`, cx, cy-ch/2-25)
    // Ammeter
    ctx.beginPath(); ctx.arc(cx+cw/2, cy, 30, 0, Math.PI*2)
    ctx.fillStyle = "#1f2937"; ctx.fill()
    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 2; ctx.stroke()
    ctx.font = "bold 10px sans-serif"; ctx.fillStyle = "#00d4ff"; ctx.textAlign = "center"
    ctx.fillText("A", cx+cw/2, cy-10)
    ctx.font = "bold 12px monospace"
    ctx.fillText(`${current.toFixed(1)}mA`, cx+cw/2, cy+10)
    // Electrons
    if (current > 0) {
      const t = Date.now()/1000; const n = Math.min(Math.ceil(current/10), 12)
      const perim = 2*cw+2*ch
      for (let i=0;i<n;i++) {
        const pos = ((t*0.5+i/n)%1)*perim
        let ex, ey
        if (pos < cw) { ex=cx-cw/2+pos; ey=cy-ch/2 }
        else if (pos < cw+ch) { ex=cx+cw/2; ey=cy-ch/2+(pos-cw) }
        else if (pos < 2*cw+ch) { ex=cx+cw/2-(pos-cw-ch); ey=cy+ch/2 }
        else { ex=cx-cw/2; ey=cy+ch/2-(pos-2*cw-ch) }
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI*2); ctx.fillStyle="#00d4ff"; ctx.fill()
        ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI*2); ctx.fillStyle="rgba(0,212,255,0.3)"; ctx.fill()
      }
    }
    ctx.font = "bold 18px monospace"; ctx.fillStyle = "#fff"; ctx.textAlign = "center"
    ctx.fillText("V = I × R", cx, H-40)
    ctx.font = "14px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.fillText(`${voltage}V = ${current.toFixed(1)}mA × ${resistance}Ω`, cx, H-15)
  }, [voltage, resistance, current])

  const drawGraph = useCallback(() => {
    const graph = graphRef.current; if (!graph) return
    const ctx = graph.getContext("2d"); if (!ctx) return
    const W = graph.width, H = graph.height, pad = 40
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = "rgba(168,85,247,0.2)"; ctx.lineWidth = 1
    for (let i=0;i<=10;i++) {
      const x=pad+(i/10)*(W-2*pad), y=pad+(i/10)*(H-2*pad)
      ctx.beginPath(); ctx.moveTo(x,pad); ctx.lineTo(x,H-pad); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke()
    }
    ctx.strokeStyle="#a855f7"; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke()
    ctx.font="12px sans-serif"; ctx.fillStyle="#a855f7"; ctx.textAlign="center"
    ctx.fillText(isHindi?"करंट (mA)":"I (mA)", pad, pad-10)
    ctx.fillText(isHindi?"वोल्टेज (V)":"V (V)", W-pad, H-pad+20)
    dataPoints.forEach(p => {
      const x=pad+(p.v/12)*(W-2*pad), y=H-pad-(p.i/120)*(H-2*pad)
      ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fillStyle="#00d4ff"; ctx.fill()
      ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.stroke()
    })
    const curX=pad+(voltage/12)*(W-2*pad), curY=H-pad-(current/120)*(H-2*pad)
    ctx.beginPath(); ctx.arc(curX,curY,8,0,Math.PI*2); ctx.fillStyle="rgba(168,85,247,0.5)"; ctx.fill()
    ctx.strokeStyle="#a855f7"; ctx.lineWidth=2; ctx.stroke()
  }, [dataPoints, voltage, current, isHindi])

  useEffect(() => {
    const animate = () => { drawCircuit(); animRef.current = requestAnimationFrame(animate) }
    animate()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [drawCircuit])

  useEffect(() => { drawGraph() }, [drawGraph])

  const plotPoint = () => {
    if (!dataPoints.some(p => Math.abs(p.v-voltage) < 0.1)) {
      const newPoints = [...dataPoints, {v: voltage, i: current}]
      setDataPoints(newPoints)
      if (newPoints.length >= 5) setTimeout(() => setShowComplete(true), 500)
    }
  }

  const handleComplete = async () => {
    const finalScore = Math.min(100, dataPoints.length * 20)
    setScore(finalScore)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase.from('missions').select('id, xp_reward').eq('simulation_type', 'ohms-law').single()
      if (mission) {
        await supabase.from('mission_progress').upsert({ student_id: user.id, mission_id: mission.id, status: 'completed', score: finalScore, attempts: 1, completed_at: new Date().toISOString() }, { onConflict: 'student_id,mission_id' })
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 150 })
      }
    }
    setShowComplete(true)
  }

  const controls = [
    { id: 'voltage', label: 'Voltage', labelHi: 'वोल्टेज', value: voltage, min: 0, max: 12, step: 0.5, unit: 'V', onChange: setVoltage },
    { id: 'resistance', label: 'Resistance', labelHi: 'प्रतिरोध', value: resistance, min: 10, max: 500, step: 10, unit: 'Ω', onChange: setResistance },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Ohm's Law Circuit"
        titleHi="ओम का नियम सर्किट"
        description="Discover the relationship between Voltage, Current, and Resistance!"
        descriptionHi="वोल्टेज, करंट और प्रतिरोध के बीच संबंध खोजें!"
        instructions="Adjust voltage and resistance to see how current changes. Plot 5 data points on the V-I graph to verify V = IR."
        instructionsHi="वोल्टेज और प्रतिरोध बदलें। V-I ग्राफ पर 5 बिंदु प्लॉट करें।"
        xpReward={200}
        difficulty="Advanced"
        subject="Physics"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="Ohm's Law Circuit"
        xpEarned={200}
        score={score}
        maxScore={100}
        onPlayAgain={() => { setShowComplete(false); setDataPoints([]) }}
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
        <div className="lg:col-span-2 space-y-4">
          <HolographicHUD missionActive color="purple">
            <div className="p-4">
              <h2 className="text-xl font-bold text-foreground mb-4">{isHindi ? 'ओम का नियम सर्किट' : "Ohm's Law Circuit"}</h2>
              <canvas ref={canvasRef} width={600} height={380} style={{ width: '100%' }} className="rounded-xl" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="purple">
            <div className="p-4">
              <canvas ref={graphRef} width={600} height={180} style={{ width: '100%' }} className="rounded-xl" />
              <p className="text-xs text-muted-foreground text-center mt-2">
                {isHindi ? `V-I ग्राफ (${dataPoints.length}/5 बिंदु)` : `V-I Graph (${dataPoints.length}/5 points plotted)`}
              </p>
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
              <p className="text-xs text-muted-foreground">{isHindi ? 'करंट रीडिंग' : 'Current'}</p>
              <p className="text-3xl font-bold text-chart-3">{current.toFixed(2)} <span className="text-sm">mA</span></p>
            </div>
          </HolographicHUD>
          <Button onClick={plotPoint} className="w-full glow-purple">
            <Zap className="w-4 h-4 mr-2" />
            {isHindi ? 'ग्राफ पर प्लॉट करें' : 'Plot on Graph'}
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => setDataPoints([])} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              {isHindi ? 'रीसेट' : 'Reset'}
            </Button>
            <Button onClick={handleComplete} variant="outline" className="flex-1">
              {isHindi ? 'पूरा करें' : 'Complete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
