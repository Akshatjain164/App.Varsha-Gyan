"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { SimulationControls } from "@/components/simulations/framework/SimulationControls"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, RotateCcw, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"

export default function EMInductionSimulation() {
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [magnetPos, setMagnetPos] = useState(0)
  const [magnetVel, setMagnetVel] = useState(0)
  const [coilTurns, setCoilTurns] = useState(50)
  const [magnetStrength, setMagnetStrength] = useState(5)
  const [isAnimating, setIsAnimating] = useState(false)
  const [emfHistory, setEmfHistory] = useState<number[]>([])
  const [experimentsCompleted, setExperimentsCompleted] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const graphRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const lastTime = useRef(0)
  const lastPos = useRef(0)

  const calcEMF = useCallback((vel: number) => -coilTurns * (magnetStrength/10) * 0.01 * vel * 100, [coilTurns, magnetStrength])
  const currentEMF = calcEMF(magnetVel)

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0,0,W,H); ctx.fillStyle="#0f172a"; ctx.fillRect(0,0,W,H)
    ctx.strokeStyle="rgba(168,85,247,0.1)"; ctx.lineWidth=1
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    const cx=W/2, cy=H/2, cw=120, ch=80
    // Coil
    ctx.fillStyle="rgba(168,85,247,0.2)"; ctx.fillRect(cx-cw/2,cy-ch/2,cw,ch)
    ctx.strokeStyle="#f59e0b"; ctx.lineWidth=3
    const turns=Math.min(coilTurns/10,15)
    for(let i=0;i<turns;i++){const x=cx-cw/2+(i+0.5)*(cw/turns);ctx.beginPath();ctx.ellipse(x,cy,8,ch/2,0,0,Math.PI*2);ctx.stroke()}
    ctx.font="12px sans-serif"; ctx.fillStyle="#f59e0b"; ctx.textAlign="center"
    ctx.fillText(`N = ${coilTurns}`, cx, cy+ch/2+20)
    // Magnet
    const mx=cx+(magnetPos/100)*200, mw=80, mh=40
    const grad=ctx.createLinearGradient(mx-mw/2,0,mx+mw/2,0)
    grad.addColorStop(0,"#ef4444"); grad.addColorStop(0.5,"#dc2626"); grad.addColorStop(0.5,"#3b82f6"); grad.addColorStop(1,"#2563eb")
    ctx.fillStyle=grad; ctx.fillRect(mx-mw/2,cy-mh/2,mw,mh)
    ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.strokeRect(mx-mw/2,cy-mh/2,mw,mh)
    ctx.font="bold 16px monospace"; ctx.fillStyle="#fff"; ctx.textAlign="center"
    ctx.fillText("N",mx-mw/4,cy+5); ctx.fillText("S",mx+mw/4,cy+5)
    // Galvanometer
    const gx=cx, gy=H-70, gr=38
    ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fillStyle="#1f2937"; ctx.fill()
    ctx.strokeStyle="#a855f7"; ctx.lineWidth=2; ctx.stroke()
    const needleAngle=Math.PI-(currentEMF/20)*Math.PI/2
    ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.cos(needleAngle)*(gr-12), gy-Math.sin(needleAngle)*(gr-12))
    ctx.strokeStyle="#ef4444"; ctx.lineWidth=2; ctx.stroke()
    ctx.font="bold 12px monospace"; ctx.fillStyle="#fff"; ctx.textAlign="center"
    ctx.fillText(`${currentEMF.toFixed(2)} mV`, gx, gy+12)
    if (Math.abs(currentEMF) > 0.1) {
      ctx.font="11px sans-serif"; ctx.fillStyle="#22c55e"
      ctx.fillText(isHindi?"प्रेरित EMF सक्रिय":"Induced EMF Active", cx, 28)
    }
    ctx.font="bold 14px monospace"; ctx.fillStyle="#fff"
    ctx.fillText("ε = -N × dΦ/dt", cx, H-18)
  }, [magnetPos, coilTurns, currentEMF, isHindi])

  const drawGraph = useCallback(() => {
    const g=graphRef.current; if(!g) return
    const ctx=g.getContext("2d"); if(!ctx) return
    const W=g.width, H=g.height, p=30
    ctx.clearRect(0,0,W,H); ctx.fillStyle="rgba(0,0,0,0.3)"; ctx.fillRect(0,0,W,H)
    ctx.strokeStyle="rgba(168,85,247,0.2)"; ctx.lineWidth=1
    for(let i=0;i<=10;i++){const y=p+(i/10)*(H-2*p);ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(W-p,y);ctx.stroke()}
    ctx.strokeStyle="#a855f7"; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(p,p); ctx.lineTo(p,H-p); ctx.lineTo(W-p,H-p); ctx.stroke()
    const z=p+(H-2*p)/2
    ctx.strokeStyle="rgba(255,255,255,0.2)"; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(p,z); ctx.lineTo(W-p,z); ctx.stroke()
    if(emfHistory.length>1){
      ctx.strokeStyle="#22c55e"; ctx.lineWidth=2; ctx.beginPath()
      emfHistory.forEach((v,i)=>{const x=p+(i/100)*(W-2*p), y=z-(v/20)*((H-2*p)/2); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)})
      ctx.stroke()
    }
  }, [emfHistory])

  useEffect(()=>{
    const animate=()=>{draw();animRef.current=requestAnimationFrame(animate)}
    animate(); return ()=>{if(animRef.current)cancelAnimationFrame(animRef.current)}
  },[draw])
  useEffect(()=>{drawGraph()},[drawGraph])

  useEffect(()=>{
    const now=Date.now(); const dt=(now-lastTime.current)/1000
    if(dt>0&&dt<0.5){
      const v=(magnetPos-lastPos.current)/dt; setMagnetVel(v)
      setEmfHistory(prev=>{const n=[...prev,calcEMF(v)];if(n.length>100)n.shift();return n})
    }
    lastTime.current=now; lastPos.current=magnetPos
  },[magnetPos,coilTurns,magnetStrength,calcEMF])

  const animateMagnet=()=>{
    if(isAnimating) return; setIsAnimating(true)
    let pos=-100, dir=1, cycles=0
    const animate=()=>{
      pos+=dir*3; setMagnetPos(pos)
      if(pos>=100)dir=-1; else if(pos<=-100){dir=1;cycles++;if(cycles>=2){setIsAnimating(false);setExperimentsCompleted(prev=>{const n=prev+1;if(n>=3)setTimeout(()=>setShowComplete(true),500);return n});return}}
      animRef.current=requestAnimationFrame(animate)
    }
    animate()
  }

  const controls = [
    { id:'pos', label:'Magnet Position', labelHi:'चुंबक स्थिति', value:magnetPos, min:-100, max:100, step:1, unit:'', onChange:setMagnetPos },
    { id:'turns', label:'Coil Turns', labelHi:'कुंडली घुमाव', value:coilTurns, min:10, max:200, step:10, unit:'', onChange:setCoilTurns },
    { id:'str', label:'Magnet Strength', labelHi:'चुंबक शक्ति', value:magnetStrength, min:1, max:10, step:1, unit:'', onChange:setMagnetStrength },
  ]

  if(showBriefing){
    return <MissionBriefing title="Electromagnetic Induction" titleHi="विद्युत चुम्बकीय प्रेरण"
      description="Discover Faraday's Law by moving magnets through coils!" descriptionHi="चुंबकों को कुंडलियों में घुमाकर फैराडे का नियम खोजें!"
      instructions="Move the magnet through the coil and observe induced EMF. Run 3 experiments to complete." instructionsHi="चुंबक कुंडली में घुमाएं और EMF देखें। 3 प्रयोग पूरे करें।"
      xpReward={220} difficulty="Advanced" subject="Physics" onStart={()=>setShowBriefing(false)} />
  }
  if(showComplete){
    return <SimulationComplete title="Electromagnetic Induction" xpEarned={220} score={experimentsCompleted*33} maxScore={99}
      onPlayAgain={()=>{setShowComplete(false);setExperimentsCompleted(0);setEmfHistory([])}} />
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <HolographicHUD missionActive color="purple">
              <div className="p-4">
                <h2 className="text-xl font-bold text-foreground mb-4">{isHindi?'विद्युत चुम्बकीय प्रेरण':'Electromagnetic Induction'}</h2>
                <canvas ref={canvasRef} width={600} height={320} style={{width:'100%'}} className="rounded-xl" />
                <div className="flex gap-3 mt-4">
                  <Button onClick={animateMagnet} disabled={isAnimating} className="flex-1 glow-purple">
                    <ArrowLeftRight className="w-4 h-4 mr-2"/>{isHindi?'चुंबक चलाएं':'Animate Magnet'}
                  </Button>
                  <Button onClick={()=>{setMagnetPos(0);setEmfHistory([])}} variant="outline"><RotateCcw className="w-4 h-4"/></Button>
                </div>
              </div>
            </HolographicHUD>
            <HolographicHUD color="purple">
              <div className="p-4">
                <canvas ref={graphRef} width={600} height={120} style={{width:'100%'}} className="rounded-xl" />
                <p className="text-xs text-muted-foreground text-center mt-2">{isHindi?'EMF बनाम समय':'EMF vs Time'}</p>
              </div>
            </HolographicHUD>
          </div>
          <div className="space-y-4">
            <HolographicHUD color="purple">
              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground mb-6">{isHindi?'नियंत्रण':'Controls'}</h3>
                <SimulationControls controls={controls} isHindi={isHindi} color="purple" />
              </div>
            </HolographicHUD>
            <HolographicHUD color="purple">
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isHindi?'वेग':'Velocity'}</span><span className="font-bold text-foreground">{magnetVel.toFixed(1)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isHindi?'प्रेरित EMF':'Induced EMF'}</span>
                  <span className="font-bold" style={{color:currentEMF>0?"#22c55e":currentEMF<0?"#ef4444":"#fff"}}>{currentEMF.toFixed(2)} mV</span></div>
              </div>
            </HolographicHUD>
            <HolographicHUD color="purple">
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{isHindi?'प्रयोग':'Experiments'}</p>
                <p className="text-3xl font-bold text-chart-3">{experimentsCompleted}/3</p>
              </div>
            </HolographicHUD>
          </div>
        </div>
      </div>
    </div>
  )
}
