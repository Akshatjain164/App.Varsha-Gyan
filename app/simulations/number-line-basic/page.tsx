"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { SimulationControls } from "@/components/simulations/framework/SimulationControls"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"

export default function NumberLineBasicSimulation() {
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [startNumber, setStartNumber] = useState(3)
  const [operand, setOperand] = useState(4)
  const [operation, setOperation] = useState<"add" | "subtract">("add")
  const [characterPosition, setCharacterPosition] = useState(3)
  const [jumpStep, setJumpStep] = useState(0)
  const [score, setScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  const result = operation === "add" ? startNumber + operand : startNumber - operand

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = "rgba(0,212,255,0.1)"; ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
    const centerY = H*0.6, unit = W/20, ox = W/2
    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(20, centerY); ctx.lineTo(W-20, centerY); ctx.stroke()
    ctx.fillStyle = "#00d4ff"
    ctx.beginPath(); ctx.moveTo(W-20,centerY); ctx.lineTo(W-35,centerY-10); ctx.lineTo(W-35,centerY+10); ctx.fill()
    ctx.beginPath(); ctx.moveTo(20,centerY); ctx.lineTo(35,centerY-10); ctx.lineTo(35,centerY+10); ctx.fill()
    ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center"
    for (let i = -10; i <= 10; i++) {
      const x = ox + i*unit; if (x < 30 || x > W-30) continue
      ctx.strokeStyle="#00d4ff"; ctx.lineWidth=2
      ctx.beginPath(); ctx.moveTo(x, centerY-10); ctx.lineTo(x, centerY+10); ctx.stroke()
      ctx.fillStyle = i===0 ? "#00d4ff" : "rgba(255,255,255,0.8)"
      ctx.fillText(i.toString(), x, centerY+35)
    }
    if (jumpStep > 0) {
      const dir = operation==="add" ? 1 : -1
      ctx.strokeStyle = "rgba(0,212,255,0.6)"; ctx.lineWidth=2; ctx.setLineDash([5,5])
      for (let i=0; i<Math.min(jumpStep,operand); i++) {
        const fx=ox+(startNumber+i*dir)*unit, tx=ox+(startNumber+(i+1)*dir)*unit
        ctx.beginPath(); ctx.moveTo(fx, centerY-15); ctx.quadraticCurveTo((fx+tx)/2, centerY-55, tx, centerY-15); ctx.stroke()
        ctx.setLineDash([]); ctx.fillStyle="#00d4ff"; ctx.font="bold 14px sans-serif"
        ctx.fillText(`${i+1}`, (fx+tx)/2, centerY-65); ctx.setLineDash([5,5])
      }
      ctx.setLineDash([])
    }
    const cx = ox + characterPosition*unit, bounce = isAnimating ? Math.sin(Date.now()/100)*5 : 0
    ctx.fillStyle = "#00d4ff"; ctx.beginPath(); ctx.arc(cx, centerY-50+bounce, 15, 0, Math.PI*2); ctx.fill()
    ctx.strokeStyle="#00d4ff"; ctx.lineWidth=4
    ctx.beginPath(); ctx.moveTo(cx, centerY-35+bounce); ctx.lineTo(cx, centerY-15+bounce); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, centerY-15+bounce); ctx.lineTo(cx-10, centerY+bounce); ctx.moveTo(cx, centerY-15+bounce); ctx.lineTo(cx+10, centerY+bounce); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx-15, centerY-30+bounce); ctx.lineTo(cx+15, centerY-30+bounce); ctx.stroke()
    ctx.fillStyle="rgba(0,212,255,0.3)"; ctx.beginPath(); ctx.arc(cx, centerY, 20, 0, Math.PI*2); ctx.fill()
    ctx.font="bold 22px monospace"; ctx.fillStyle="#fff"; ctx.textAlign="center"
    const op = operation==="add" ? "+" : "−"
    ctx.fillText(`${startNumber} ${op} ${operand} = ${jumpStep>=operand ? result : "?"}`, W/2, 45)
  }, [characterPosition, isAnimating, jumpStep, operand, operation, result, startNumber])

  useEffect(() => {
    const animate = () => { draw(); animRef.current = requestAnimationFrame(animate) }
    animate()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [draw])

  const startAnimation = () => {
    if (isAnimating) return
    setIsAnimating(true); setJumpStep(0); setCharacterPosition(startNumber)
    let step = 0; const dir = operation==="add" ? 1 : -1
    const interval = setInterval(() => {
      step++; setJumpStep(step); setCharacterPosition(startNumber + step*dir)
      if (step >= operand) {
        clearInterval(interval); setIsAnimating(false)
        setScore(prev => { const s = prev+10; if (s >= 50) setTimeout(()=>setShowComplete(true), 500); return s })
      }
    }, 600)
  }

  const controls = [
    { id: 'start', label: 'Start Number', labelHi: 'शुरुआती संख्या', value: startNumber, min: -5, max: 10, step: 1, unit: '', onChange: (v: number) => { setStartNumber(v); setCharacterPosition(v); setJumpStep(0) } },
    { id: 'jump', label: 'Jump By', labelHi: 'कूद', value: operand, min: 1, max: 8, step: 1, unit: '', onChange: setOperand },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Number Line Explorer"
        titleHi="संख्या रेखा अन्वेषक"
        description="Learn addition and subtraction by jumping on the number line!"
        descriptionHi="संख्या रेखा पर कूदकर जोड़ और घटाव सीखें!"
        instructions="Set the start number and jump amount, then watch the character jump to the answer. Score 50 points to complete."
        instructionsHi="शुरुआती संख्या और कूद की मात्रा सेट करें, फिर पात्र को उत्तर तक पहुंचते देखें।"
        xpReward={100}
        difficulty="Beginner"
        subject="Mathematics"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="Number Line Explorer"
        xpEarned={100}
        score={score}
        maxScore={100}
        onPlayAgain={() => { setShowComplete(false); setScore(0); setJumpStep(0); setCharacterPosition(startNumber) }}
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
          <HolographicHUD missionActive color="cyan">
            <div className="p-4">
              <h2 className="text-xl font-bold text-foreground mb-4">{isHindi ? 'संख्या रेखा अन्वेषक' : 'Number Line Explorer'}</h2>
              <canvas ref={canvasRef} width={700} height={350} style={{ width: '100%' }} className="rounded-xl" />
              <div className="flex gap-3 mt-4">
                <Button onClick={startAnimation} disabled={isAnimating} className="flex-1 glow-cyan">
                  <Play className="w-4 h-4 mr-2" />{isHindi ? 'कूदो!' : 'Jump!'}
                </Button>
                <Button onClick={() => { setCharacterPosition(startNumber); setJumpStep(0) }} variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </HolographicHUD>
        </div>
        <div className="space-y-4">
          <HolographicHUD color="cyan">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">{isHindi ? 'संक्रिया' : 'Operation'}</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {(['add', 'subtract'] as const).map(op => (
                  <button key={op} onClick={() => setOperation(op)} className={`p-3 rounded-xl border text-center transition-all text-sm font-medium ${operation===op ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card/30 text-muted-foreground hover:border-primary/50'}`}>
                    {op === 'add' ? (isHindi ? 'जोड़ (+)' : 'Add (+)') : (isHindi ? 'घटाव (−)' : 'Subtract (−)')}
                  </button>
                ))}
              </div>
              <SimulationControls controls={controls} isHindi={isHindi} color="cyan" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="cyan">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ChevronRight className="w-4 h-4 text-chart-1" />
                <span>{isHindi ? 'जोड़: दाईं ओर कूदें' : 'Addition: Jump RIGHT'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ChevronLeft className="w-4 h-4 text-chart-1" />
                <span>{isHindi ? 'घटाव: बाईं ओर कूदें' : 'Subtraction: Jump LEFT'}</span>
              </div>
            </div>
          </HolographicHUD>
          <HolographicHUD color="cyan">
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{isHindi ? 'स्कोर' : 'Score'}</p>
              <p className="text-3xl font-bold text-chart-1">{score}/50</p>
            </div>
          </HolographicHUD>
        </div>
      </div>
    </div>
  )
}
