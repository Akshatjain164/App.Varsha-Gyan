"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { SimulationControls } from "@/components/simulations/framework/SimulationControls"
import { Button } from "@/components/ui/button"
import { RotateCcw, Eye, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"

const getWavelengthColor = (wl: number) => {
  if (wl < 450) return "#7c3aed"
  if (wl < 490) return "#3b82f6"
  if (wl < 520) return "#06b6d4"
  if (wl < 565) return "#22c55e"
  if (wl < 590) return "#eab308"
  if (wl < 625) return "#f97316"
  return "#ef4444"
}

export default function WaveOpticsSimulation() {
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [slitSep, setSlitSep] = useState(0.5)
  const [wavelength, setWavelength] = useState(550)
  const [screenDist, setScreenDist] = useState(2)
  const [showWaves, setShowWaves] = useState(true)
  const [calcs, setCalcs] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const patternRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  const fringeWidth = (wavelength * 1e-9 * screenDist) / (slitSep * 1e-3) * 1000
  const lightColor = getWavelengthColor(wavelength)

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W = canvas.width, H = canvas.height, t = timeRef.current
    ctx.clearRect(0,0,W,H); ctx.fillStyle="#0a0a0f"; ctx.fillRect(0,0,W,H)
    ctx.strokeStyle="rgba(245,158,11,0.1)"; ctx.lineWidth=1
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    const sx=50, slitX=200, scrX=W-50, cy=H/2, gap=30*slitSep
    // Source
    const sg=ctx.createRadialGradient(sx,cy,0,sx,cy,20); sg.addColorStop(0,lightColor); sg.addColorStop(1,"transparent")
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,cy,15,0,Math.PI*2); ctx.fill()
    ctx.font="10px sans-serif"; ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.fillText(isHindi?"स्रोत":"Source",sx,cy+35)
    // Slit barrier
    ctx.fillStyle="#374151"
    ctx.fillRect(slitX-5,0,10,cy-gap/2-5); ctx.fillRect(slitX-5,cy-gap/2+5,10,gap-10); ctx.fillRect(slitX-5,cy+gap/2,10,H-cy-gap/2)
    // Screen
    ctx.fillStyle="#1f2937"; ctx.fillRect(scrX-5,0,15,H); ctx.strokeStyle="#f59e0b"; ctx.lineWidth=1; ctx.strokeRect(scrX-5,0,15,H)
    // Waves
    if (showWaves) {
      ctx.globalAlpha=0.3; const n=8, sp=0.02
      for(let i=0;i<n;i++){
        const r=((t*sp+i/n)%1)*150
        ctx.beginPath(); ctx.arc(sx,cy,r,-Math.PI/4,Math.PI/4); ctx.strokeStyle=lightColor; ctx.lineWidth=2; ctx.stroke()
      }
      const s1y=cy-gap/2, s2y=cy+gap/2
      for(let i=0;i<n;i++){
        const r=((t*sp+i/n)%1)*300
        ctx.beginPath(); ctx.arc(slitX,s1y,r,-Math.PI/3,Math.PI/3); ctx.strokeStyle=lightColor; ctx.lineWidth=1.5; ctx.stroke()
        ctx.beginPath(); ctx.arc(slitX,s2y,r,-Math.PI/3,Math.PI/3); ctx.stroke()
      }
      ctx.globalAlpha=1
    }
    // Labels
    ctx.font="bold 13px monospace"; ctx.fillStyle="#fff"; ctx.textAlign="center"
    ctx.fillText(isHindi?"द्वि-छिद्र":"Double Slit",slitX,22); ctx.fillText(isHindi?"स्क्रीन":"Screen",scrX,22)
    ctx.fillStyle="#f59e0b"
    ctx.fillText(`d=${slitSep}mm`,slitX,H-15); ctx.fillText(`D=${screenDist}m`,(slitX+scrX)/2,H-15)
    ctx.fillText(`λ=${wavelength}nm`,sx,H-15)
  },[slitSep,wavelength,screenDist,showWaves,lightColor,isHindi])

  const drawPattern = useCallback(() => {
    const g=patternRef.current; if(!g) return
    const ctx=g.getContext("2d"); if(!ctx) return
    const W=g.width, H=g.height
    ctx.clearRect(0,0,W,H); ctx.fillStyle="#0a0a0f"; ctx.fillRect(0,0,W,H)
    const pw=W-40
    for(let x=0;x<pw;x++){
      const y=(x-pw/2)/pw*50
      const pd=slitSep*1e-3*(y*1e-3)/screenDist
      const ph=(2*Math.PI*pd)/(wavelength*1e-9)
      const intensity=Math.pow(Math.cos(ph/2),2)
      const alpha=intensity*0.9+0.1
      const hex=Math.round(alpha*255).toString(16).padStart(2,"0")
      const grad=ctx.createLinearGradient(20+x,5,20+x,H-15)
      grad.addColorStop(0,`${lightColor}00`); grad.addColorStop(0.4,lightColor+hex)
      grad.addColorStop(0.6,lightColor+hex); grad.addColorStop(1,`${lightColor}00`)
      ctx.fillStyle=grad; ctx.fillRect(20+x,5,1,H-20)
    }
    ctx.font="bold 11px monospace"; ctx.fillStyle="#f59e0b"; ctx.textAlign="center"
    ctx.fillText(isHindi?"केंद्रीय अधिकतम":"Central Maximum",W/2,12)
    const fw=(fringeWidth/50)*pw
    ctx.strokeStyle="#22c55e"; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(W/2,H-20); ctx.lineTo(W/2+fw,H-20); ctx.stroke()
    ctx.font="10px sans-serif"; ctx.fillStyle="#22c55e"
    ctx.fillText(`β=${fringeWidth.toFixed(3)}mm`,W/2+fw/2,H-5)
  },[slitSep,wavelength,screenDist,fringeWidth,lightColor,isHindi])

  useEffect(()=>{
    const animate=()=>{timeRef.current++;draw();animRef.current=requestAnimationFrame(animate)}
    animate(); return ()=>{if(animRef.current)cancelAnimationFrame(animRef.current)}
  },[draw])
  useEffect(()=>{drawPattern()},[drawPattern])

  const controls = [
    { id:'slit', label:'Slit Separation d (mm)', labelHi:'छिद्र दूरी d (mm)', value:slitSep, min:0.1, max:2, step:0.1, unit:'mm', onChange:setSlitSep },
    { id:'wl', label:'Wavelength λ (nm)', labelHi:'तरंगदैर्ध्य λ (nm)', value:wavelength, min:380, max:700, step:10, unit:'nm', onChange:setWavelength },
    { id:'d', label:'Screen Distance D (m)', labelHi:'स्क्रीन दूरी D (m)', value:screenDist, min:0.5, max:5, step:0.5, unit:'m', onChange:setScreenDist },
  ]

  if(showBriefing){
    return <MissionBriefing title="Wave Optics: Double Slit" titleHi="तरंग प्रकाशिकी: द्वि-छिद्र"
      description="Explore Young's double slit experiment and wave interference!" descriptionHi="यंग के द्वि-छिद्र प्रयोग का अन्वेषण करें!"
      instructions="Adjust slit separation, wavelength, and screen distance. Log 5 calculations to complete." instructionsHi="छिद्र दूरी, तरंगदैर्ध्य और स्क्रीन दूरी समायोजित करें। 5 गणनाएं लॉग करें।"
      xpReward={250} difficulty="Advanced" subject="Physics" onStart={()=>setShowBriefing(false)} />
  }
  if(showComplete){
    return <SimulationComplete title="Wave Optics" xpEarned={250} score={100} maxScore={100}
      onPlayAgain={()=>{setShowComplete(false);setCalcs(0)}} />
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link href="/simulations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4"/><span>{isHindi?'वापस':'Back'}</span>
          </Link>
          <LanguageToggle isHindi={isHindi} onToggle={toggleLanguage} />
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <HolographicHUD missionActive color="gold">
            <div className="p-4">
              <h2 className="text-xl font-bold text-foreground mb-4">{isHindi?'तरंग प्रकाशिकी':'Wave Optics: Double Slit'}</h2>
              <canvas ref={canvasRef} width={700} height={280} style={{width:'100%'}} className="rounded-xl" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="gold">
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-2 text-center">{isHindi?'व्यतिकरण पैटर्न':'Interference Pattern'}</p>
              <canvas ref={patternRef} width={700} height={80} style={{width:'100%'}} className="rounded-xl" />
            </div>
          </HolographicHUD>
        </div>
        <div className="space-y-4">
          <HolographicHUD color="gold">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-6">{isHindi?'नियंत्रण':'Controls'}</h3>
              <SimulationControls controls={controls} isHindi={isHindi} color="gold" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="gold">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full border border-border" style={{backgroundColor:lightColor,boxShadow:`0 0 12px ${lightColor}`}} />
                <div><p className="text-xs text-muted-foreground">{isHindi?'तरंगदैर्ध्य':'Wavelength'}</p><p className="font-bold">{wavelength} nm</p></div>
              </div>
              <p className="text-xs font-mono text-center text-foreground">β = λD/d</p>
              <p className="text-sm font-bold text-center mt-1 text-chart-4">{fringeWidth.toFixed(4)} mm</p>
            </div>
          </HolographicHUD>
          <div className="flex gap-2">
            <Button onClick={()=>setShowWaves(!showWaves)} variant={showWaves?"default":"outline"} className="flex-1" size="sm">
              <Eye className="w-4 h-4 mr-1"/>{isHindi?'तरंगें':'Waves'}
            </Button>
            <Button onClick={()=>{setSlitSep(0.5);setWavelength(550);setScreenDist(2)}} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4"/>
            </Button>
          </div>
          <Button onClick={()=>{setCalcs(c=>{const n=c+1;if(n>=5)setTimeout(()=>setShowComplete(true),500);return n})}} className="w-full glow-gold">
            {isHindi?`गणना लॉग करें (${calcs}/5)`:`Log Calculation (${calcs}/5)`}
          </Button>
        </div>
      </div>
    </div>
  )
}
