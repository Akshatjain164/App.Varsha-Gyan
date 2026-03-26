"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { SimulationControls } from "@/components/simulations/framework/SimulationControls"
import { Button } from "@/components/ui/button"
import { RotateCcw, Zap, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"
import { cn } from "@/lib/utils"

export default function SemiconductorsSimulation() {
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [voltage, setVoltage] = useState(0)
  const [biasMode, setBiasMode] = useState<"forward"|"reverse">("forward")
  const [dataPoints, setDataPoints] = useState<{v:number,i:number}[]>([])
  const [showDepletion, setShowDepletion] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const graphRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  const calcI = (v: number, mode: "forward"|"reverse") => {
    const Is=1e-12, VT=0.026
    if(mode==="forward") return Is*(Math.exp(v/VT)-1)*1000
    return -Is*1000
  }
  const actualV = biasMode==="forward" ? voltage : -voltage
  const current = calcI(Math.abs(voltage), biasMode)
  const iDisplay = biasMode==="forward" ? current : -current

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W=canvas.width, H=canvas.height, t=timeRef.current
    ctx.clearRect(0,0,W,H)
    ctx.strokeStyle="rgba(245,158,11,0.1)"; ctx.lineWidth=1
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    const cx=W/2, cy=H/2, bw=150, bh=110
    // P-region
    ctx.fillStyle="#ef4444"; ctx.fillRect(cx-bw,cy-bh/2,bw,bh)
    ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.strokeRect(cx-bw,cy-bh/2,bw,bh)
    ctx.font="bold 22px monospace"; ctx.fillStyle="#fff"; ctx.textAlign="center"
    ctx.fillText("P",cx-bw/2,cy+8)
    ctx.font="11px sans-serif"; ctx.fillText(isHindi?"(होल)":"(holes)",cx-bw/2,cy+26)
    // N-region
    ctx.fillStyle="#3b82f6"; ctx.fillRect(cx,cy-bh/2,bw,bh)
    ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.strokeRect(cx,cy-bh/2,bw,bh)
    ctx.font="bold 22px monospace"; ctx.fillStyle="#fff"
    ctx.fillText("N",cx+bw/2,cy+8)
    ctx.font="11px sans-serif"; ctx.fillText(isHindi?"(इलेक्ट्रॉन)":"(electrons)",cx+bw/2,cy+26)
    // Depletion
    if(showDepletion){
      const dw=biasMode==="forward"?Math.max(5,30-voltage*40):Math.min(60,30+voltage*40)
      ctx.fillStyle="rgba(255,255,255,0.25)"; ctx.fillRect(cx-dw/2,cy-bh/2,dw,bh)
      ctx.font="10px sans-serif"; ctx.fillStyle="#f59e0b"; ctx.textAlign="center"
      ctx.fillText(isHindi?"अवक्षय":"Depletion",cx,cy-bh/2-15)
    }
    // Carriers
    for(let i=0;i<12;i++){
      const bx=cx-bw+20+(i%4)*28, by=cy-38+Math.floor(i/4)*28
      let ox=biasMode==="forward"&&voltage>0.3?((t*0.03+i*0.2)%1)*40:0
      ctx.beginPath(); ctx.arc(bx+ox,by,7,0,Math.PI*2); ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.stroke()
      ctx.fillStyle="#ef4444"; ctx.fill()
      ctx.fillStyle="#fff"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center"; ctx.fillText("+",bx+ox,by+4)
    }
    for(let i=0;i<12;i++){
      const bx=cx+20+(i%4)*28, by=cy-38+Math.floor(i/4)*28
      let ox=biasMode==="forward"&&voltage>0.3?-((t*0.03+i*0.2)%1)*40:0
      ctx.beginPath(); ctx.arc(bx+ox,by,7,0,Math.PI*2); ctx.fillStyle="#3b82f6"; ctx.fill()
      ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.stroke()
      ctx.fillStyle="#fff"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center"; ctx.fillText("-",bx+ox,by+4)
    }
    // Battery wires
    const battY=H-45
    ctx.strokeStyle="#f59e0b"; ctx.lineWidth=3
    ctx.beginPath(); ctx.moveTo(cx-bw,cy+bh/2); ctx.lineTo(cx-bw,battY); ctx.lineTo(cx-25,battY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx+bw,cy+bh/2); ctx.lineTo(cx+bw,battY); ctx.lineTo(cx+25,battY); ctx.stroke()
    ctx.fillStyle="#1f2937"; ctx.fillRect(cx-20,battY-12,40,24)
    ctx.strokeStyle="#f59e0b"; ctx.lineWidth=2; ctx.strokeRect(cx-20,battY-12,40,24)
    ctx.font="bold 13px sans-serif"
    ctx.fillStyle=biasMode==="forward"?"#ef4444":"#3b82f6"; ctx.fillText(biasMode==="forward"?"+":"-",cx-10,battY+4)
    ctx.fillStyle=biasMode==="forward"?"#3b82f6":"#ef4444"; ctx.fillText(biasMode==="forward"?"-":"+",cx+10,battY+4)
    ctx.font="bold 12px monospace"; ctx.fillStyle="#fff"; ctx.textAlign="center"
    ctx.fillText(`${actualV.toFixed(2)}V`,cx,battY+30)
    if(biasMode==="forward"&&voltage>0.3){
      ctx.font="bold 13px monospace"; ctx.fillStyle="#22c55e"; ctx.fillText(`I = ${current.toFixed(2)} mA`,cx,28)
    } else if(biasMode==="reverse"){
      ctx.font="13px sans-serif"; ctx.fillStyle="#ef4444"; ctx.fillText(isHindi?"पश्च बायस - कोई धारा नहीं":"No current (reverse bias)",cx,28)
    } else {
      ctx.font="12px sans-serif"; ctx.fillStyle="#f59e0b"; ctx.fillText(isHindi?"सीमा वोल्टेज से नीचे":"Below threshold voltage",cx,28)
    }
  },[voltage,biasMode,showDepletion,actualV,current,isHindi])

  const drawGraph = useCallback(() => {
    const g=graphRef.current; if(!g) return
    const ctx=g.getContext("2d"); if(!ctx) return
    const W=g.width,H=g.height,p=35,gw=W-2*p,gh=H-2*p
    const ox=p+gw*0.3, oy=p+gh*0.7
    ctx.clearRect(0,0,W,H); ctx.fillStyle="rgba(0,0,0,0.3)"; ctx.fillRect(0,0,W,H)
    ctx.strokeStyle="rgba(245,158,11,0.2)"; ctx.lineWidth=1
    for(let i=0;i<=10;i++){const x=p+(i/10)*gw,y=p+(i/10)*gh;ctx.beginPath();ctx.moveTo(x,p);ctx.lineTo(x,H-p);ctx.stroke();ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(W-p,y);ctx.stroke()}
    ctx.strokeStyle="#f59e0b"; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(p,oy); ctx.lineTo(W-p,oy); ctx.moveTo(ox,p); ctx.lineTo(ox,H-p); ctx.stroke()
    // Ideal curve
    ctx.strokeStyle="rgba(245,158,11,0.4)"; ctx.lineWidth=2; ctx.beginPath()
    for(let v=0;v<=1;v+=0.01){
      const i=calcI(v,"forward"), x=ox+(v/1)*(W-p-ox-15), y=oy-Math.min(i/100,1)*(oy-p-15)
      v===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
    }
    ctx.stroke()
    ctx.beginPath(); ctx.moveTo(p+15,oy+4); ctx.lineTo(ox,oy+4); ctx.stroke()
    // Data points
    dataPoints.forEach(pt=>{
      const x=ox+(pt.v/1)*(W-p-ox-15), y=oy-Math.min(pt.i/100,1)*(oy-p-15)
      ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fillStyle="#22c55e"; ctx.fill()
    })
    // Current point
    const cx2=ox+(actualV/1)*(W-p-ox-15), cy2=oy-Math.min(current/100,1)*(oy-p-15)
    ctx.beginPath(); ctx.arc(cx2,cy2,8,0,Math.PI*2); ctx.fillStyle="rgba(245,158,11,0.5)"; ctx.fill()
    ctx.strokeStyle="#f59e0b"; ctx.lineWidth=2; ctx.stroke()
    ctx.font="10px sans-serif"; ctx.fillStyle="#f59e0b"; ctx.textAlign="center"
    ctx.fillText("I (mA)",ox-15,p+8); ctx.fillText("V",W-p-8,oy+18)
    const tx=ox+(0.7/1)*(W-p-ox-15)
    ctx.setLineDash([4,4]); ctx.strokeStyle="rgba(255,255,255,0.4)"; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(tx,oy); ctx.lineTo(tx,oy+12); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.fillText("0.7V",tx,oy+22)
  },[dataPoints,actualV,current,calcI])

  useEffect(()=>{
    const animate=()=>{timeRef.current++;draw();animRef.current=requestAnimationFrame(animate)}
    animate(); return ()=>{if(animRef.current)cancelAnimationFrame(animRef.current)}
  },[draw])
  useEffect(()=>{drawGraph()},[drawGraph])

  const plotPoint = () => {
    if(!dataPoints.some(p=>Math.abs(p.v-actualV)<0.05)){
      const n=[...dataPoints,{v:actualV,i:iDisplay}]
      setDataPoints(n); if(n.length>=8)setTimeout(()=>setShowComplete(true),500)
    }
  }

  const controls = [
    { id:'v', label:'Applied Voltage (V)', labelHi:'आरोपित वोल्टेज (V)', value:voltage, min:0, max:1, step:0.05, unit:'V', onChange:setVoltage },
  ]

  if(showBriefing){
    return <MissionBriefing title="Semiconductor Physics" titleHi="अर्धचालक भौतिकी"
      description="Explore P-N junction behavior and diode characteristics!" descriptionHi="P-N संधि व्यवहार और डायोड विशेषताएं जानें!"
      instructions="Apply forward/reverse bias and plot the V-I curve. Plot 8 data points to complete." instructionsHi="अग्र/पश्च बायस लागू करें और V-I वक्र प्लॉट करें। 8 बिंदु प्लॉट करें।"
      xpReward={250} difficulty="Advanced" subject="Physics" onStart={()=>setShowBriefing(false)} />
  }
  if(showComplete){
    return <SimulationComplete title="Semiconductor Physics" xpEarned={250} score={100} maxScore={100}
      onPlayAgain={()=>{setShowComplete(false);setDataPoints([]);setVoltage(0)}} />
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
              <h2 className="text-xl font-bold text-foreground mb-4">{isHindi?'P-N संधि':'P-N Junction'}</h2>
              <canvas ref={canvasRef} width={700} height={300} style={{width:'100%'}} className="rounded-xl" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="gold">
            <div className="p-4">
              <canvas ref={graphRef} width={700} height={200} style={{width:'100%'}} className="rounded-xl" />
              <p className="text-xs text-muted-foreground text-center mt-2">
                {isHindi?`V-I विशेषताएं (${dataPoints.length}/8 बिंदु)`:`V-I Characteristics (${dataPoints.length}/8 points)`}
              </p>
            </div>
          </HolographicHUD>
        </div>
        <div className="space-y-4">
          <HolographicHUD color="gold">
            <div className="p-5">
              <div className="grid grid-cols-2 gap-2 mb-6">
                {(["forward","reverse"] as const).map(m=>(
                  <button key={m} onClick={()=>setBiasMode(m)}
                    className={cn("p-2 rounded-lg border text-xs font-medium transition-all",biasMode===m?"border-primary bg-primary/10 text-primary":"border-border/50 bg-card/30 text-muted-foreground hover:border-primary/50")}>
                    {m==="forward"?(isHindi?"अग्र बायस":"Forward Bias"):(isHindi?"पश्च बायस":"Reverse Bias")}
                  </button>
                ))}
              </div>
              <SimulationControls controls={controls} isHindi={isHindi} color="gold" />
            </div>
          </HolographicHUD>
          <HolographicHUD color="gold">
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{isHindi?'वोल्टेज':'Voltage'}</span><span className="font-bold">{actualV.toFixed(2)} V</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{isHindi?'धारा':'Current'}</span>
                <span className="font-bold" style={{color:current>0.1?"#22c55e":"#fff"}}>{current.toFixed(4)} mA</span></div>
            </div>
          </HolographicHUD>
          <div className="flex gap-2">
            <Button onClick={plotPoint} className="flex-1 glow-gold">
              <Zap className="w-4 h-4 mr-2"/>{isHindi?'प्लॉट करें':'Plot Point'}
            </Button>
            <Button onClick={()=>{setDataPoints([]);setVoltage(0)}} variant="outline">
              <RotateCcw className="w-4 h-4"/>
            </Button>
          </div>
          <Button onClick={()=>setShowDepletion(!showDepletion)} variant={showDepletion?"default":"outline"} className="w-full" size="sm">
            {isHindi?'अवक्षय क्षेत्र':'Depletion Region'}
          </Button>
        </div>
      </div>
    </div>
  )
}
