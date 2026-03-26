"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { SimulationControls } from "@/components/simulations/framework/SimulationControls"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"

const materialConductivity: Record<string, number> = { copper: 0.03, iron: 0.02, wood: 0.005, plastic: 0.003 }

const getTempColor = (temp: number) => {
  const n = Math.min(Math.max(temp/150, 0), 1)
  return `rgb(${Math.round(255*n)}, 50, ${Math.round(255*(1-n))})`
}

export default function HeatTransferSimulation() {
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [leftTemp, setLeftTemp] = useState(100)
  const [rightTemp, setRightTemp] = useState(20)
  const [material, setMaterial] = useState("copper")
  const [leftT, setLeftT] = useState(100)
  const [rightT, setRightT] = useState(20)
  const [equilibrium, setEquilibrium] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle="rgba(0,212,255,0.1)"; ctx.lineWidth=1
    for (let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for (let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    const cy=H/2, lx=W*0.25, rx=W*0.75, r=90
    // Left object
    const lg=ctx.createRadialGradient(lx,cy,0,lx,cy,r); lg.addColorStop(0,getTempColor(leftT)); lg.addColorStop(1,getTempColor(leftT*0.7))
    ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(lx,cy,r,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle="#00d4ff"; ctx.lineWidth=3; ctx.stroke()
    // Right object
    const rg=ctx.createRadialGradient(rx,cy,0,rx,cy,r); rg.addColorStop(0,getTempColor(rightT)); rg.addColorStop(1,getTempColor(rightT*0.7))
    ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(rx,cy,r,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle="#00d4ff"; ctx.lineWidth=3; ctx.stroke()
    // Bar
    const barH=25, matColor=material==="copper"?"#b87333":material==="iron"?"#4a4a4a":material==="wood"?"#8B4513":"#808080"
    ctx.fillStyle=matColor; ctx.fillRect(lx+r-10,cy-barH/2,rx-lx-r*2+20,barH)
    ctx.strokeStyle="#00d4ff"; ctx.lineWidth=2; ctx.strokeRect(lx+r-10,cy-barH/2,rx-lx-r*2+20,barH)
    // Heat particles
    if (isRunning && Math.abs(leftT-rightT) > 1) {
      const dir=leftT>rightT?1:-1; const n=Math.min(Math.ceil(Math.abs(leftT-rightT)/10),10)
      for (let i=0;i<n;i++) {
        const p=((Date.now()/500+i*0.2)%1)
        const px=dir>0?lx+r+p*(rx-lx-r*2):rx-r-p*(rx-lx-r*2)
        const py=cy+Math.sin(p*Math.PI*4)*8
        ctx.fillStyle=dir>0?"rgba(255,100,50,0.8)":"rgba(50,100,255,0.8)"
        ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fill()
      }
    }
    // Temperature labels
    ctx.font="bold 22px monospace"; ctx.textAlign="center"; ctx.fillStyle="#fff"
    ctx.fillText(`${Math.round(leftT)}°C`, lx, cy+8)
    ctx.fillText(`${Math.round(rightT)}°C`, rx, cy+8)
    ctx.font="13px sans-serif"; ctx.fillStyle="rgba(255,255,255,0.7)"
    ctx.fillText(isHindi?"गर्म वस्तु":"Hot Object", lx, cy+r+25)
    ctx.fillText(isHindi?"ठंडी वस्तु":"Cold Object", rx, cy+r+25)
    if (equilibrium) { ctx.font="bold 18px monospace"; ctx.fillStyle="#22c55e"; ctx.fillText(isHindi?"तापीय संतुलन!":"Thermal Equilibrium!", W/2, 40) }
    // Arrow
    if (isRunning && Math.abs(leftT-rightT) > 5) {
      const ay=cy-r-35, adir=leftT>rightT?1:-1
      ctx.strokeStyle="#00d4ff"; ctx.lineWidth=2
      ctx.beginPath(); ctx.moveTo(lx,ay); ctx.lineTo(rx,ay); ctx.stroke()
      const ax=adir>0?rx:lx
      ctx.fillStyle="#00d4ff"; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax-adir*12,ay-8); ctx.lineTo(ax-adir*12,ay+8); ctx.fill()
      ctx.font="12px sans-serif"; ctx.fillText(isHindi?"ऊष्मा प्रवाह":"Heat Flow", W/2, ay-12)
    }
  }, [leftT, rightT, material, isRunning, equilibrium, isHindi])

  useEffect(() => {
    const animate = () => { draw(); animRef.current = requestAnimationFrame(animate) }
    animate()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [draw])

  useEffect(() => {
    if (!isRunning) return
    const cond = materialConductivity[material]
    const interval = setInterval(() => {
      setLeftT(l => {
        setRightT(r => {
          const diff = l - r
          if (Math.abs(diff) < 1) { setIsRunning(false); setEquilibrium(true); setTimeout(()=>setShowComplete(true), 1000); return r }
          return r + diff * cond
        })
        return l - (l - rightT) * cond
      })
    }, 50)
    return () => clearInterval(interval)
  }, [isRunning, material])

  const reset = () => { setIsRunning(false); setLeftT(leftTemp); setRightT(rightTemp); setEquilibrium(false) }

  const controls = [
    { id: 'left', label: 'Left Temp (°C)', labelHi: 'बायां तापमान (°C)', value: leftTemp, min: 0, max: 150, step: 5, unit: '°C', onChange: (v: number) => { setLeftTemp(v); if (!isRunning) setLeftT(v) } },
    { id: 'right', label: 'Right Temp (°C)', labelHi: 'दायां तापमान (°C)', value: rightTemp, min: 0, max: 150, step: 5, unit: '°C', onChange: (v: number) => { setRightTemp(v); if (!isRunning) setRightT(v) } },
  ]

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Heat Transfer Lab"
        titleHi="ऊष्मा स्थानांतरण प्रयोगशाला"
        description="Explore how heat flows between objects of different temperatures!"
        descriptionHi="विभिन्न तापमान की वस्तुओं के बीच ऊष्मा कैसे बहती है, जानें!"
        instructions="Set temperatures, choose a material, then observe heat transfer until thermal equilibrium is reached."
        instructionsHi="तापमान सेट करें, सामग्री चुनें, फिर ऊष्मा स्थानांतरण देखें।"
        xpReward={120}
        difficulty="Intermediate"
        subject="Physics"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete title="Heat Transfer Lab" xpEarned={120} score={80} maxScore={100}
        onPlayAgain={() => { setShowComplete(false); reset(); setEquilibrium(false) }} />
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link href="/simulations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>{isHindi?'वापस':'Back'}</span>
          </Link>
          <LanguageToggle isHindi={isHindi} onToggle={toggleLanguage} />
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HolographicHUD missionActive color="cyan">
            <div className="p-4">
              <h2 className="text-xl font-bold text-foreground mb-4">{isHindi?'ऊष्मा स्थानांतरण':'Heat Transfer'}</h2>
              <canvas ref={canvasRef} width={700} height={400} style={{ width:'100%' }} className="rounded-xl" />
              <div className="flex gap-3 mt-4">
                <Button onClick={() => setIsRunning(!isRunning)} disabled={equilibrium} className="flex-1 glow-cyan">
                  {isRunning ? <><Pause className="w-4 h-4 mr-2"/>{isHindi?'रोकें':'Pause'}</> : <><Play className="w-4 h-4 mr-2"/>{isHindi?'शुरू':'Start'}</>}
                </Button>
                <Button onClick={reset} variant="outline"><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </HolographicHUD>
        </div>
        <div className="space-y-4">
          <HolographicHUD color="cyan">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">{isHindi?'नियंत्रण':'Controls'}</h3>
              <SimulationControls controls={controls} isHindi={isHindi} color="cyan" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="cyan">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">{isHindi?'सामग्री':'Material'}</h3>
              <div className="grid grid-cols-2 gap-2">
                {[{id:'copper',en:'Copper (Fast)',hi:'तांबा (तेज़)'},{id:'iron',en:'Iron (Medium)',hi:'लोहा (मध्यम)'},{id:'wood',en:'Wood (Slow)',hi:'लकड़ी (धीमा)'},{id:'plastic',en:'Plastic (Slower)',hi:'प्लास्टिक (धीमा)'}].map(m=>(
                  <button key={m.id} onClick={()=>setMaterial(m.id)} disabled={isRunning}
                    className={`p-2 rounded-lg border text-xs text-center transition-all ${material===m.id?'border-primary bg-primary/10 text-primary':'border-border/50 bg-card/30 text-muted-foreground hover:border-primary/50'}`}>
                    {isHindi?m.hi:m.en}
                  </button>
                ))}
              </div>
            </div>
          </HolographicHUD>
          <HolographicHUD color="cyan">
            <div className="p-4">
              <div className="h-4 rounded-full" style={{background:'linear-gradient(to right,blue,purple,red)'}} />
              <div className="flex justify-between text-xs mt-1 text-muted-foreground"><span>0°C</span><span>75°C</span><span>150°C</span></div>
            </div>
          </HolographicHUD>
        </div>
      </div>
    </div>
  )
}
