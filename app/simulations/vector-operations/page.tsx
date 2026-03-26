"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { SimulationControls } from "@/components/simulations/framework/SimulationControls"
import { Button } from "@/components/ui/button"
import { Plus, Minus, RotateCcw, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"
import { cn } from "@/lib/utils"

const toRad = (d: number) => d * Math.PI / 180
const toDeg = (r: number) => r * 180 / Math.PI

export default function VectorOperationsSimulation() {
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [operation, setOperation] = useState<"add"|"subtract">("add")
  const [vA, setVA] = useState({ magnitude: 5, angle: 30 })
  const [vB, setVB] = useState({ magnitude: 4, angle: 120 })
  const [showComponents, setShowComponents] = useState(true)
  const [showResultant, setShowResultant] = useState(true)
  const [solved, setSolved] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const aComp = { x: vA.magnitude*Math.cos(toRad(vA.angle)), y: vA.magnitude*Math.sin(toRad(vA.angle)) }
  const bComp = { x: vB.magnitude*Math.cos(toRad(vB.angle)), y: vB.magnitude*Math.sin(toRad(vB.angle)) }
  const resultant = { x: operation==="add" ? aComp.x+bComp.x : aComp.x-bComp.x, y: operation==="add" ? aComp.y+bComp.y : aComp.y-bComp.y }
  const resMag = Math.sqrt(resultant.x**2+resultant.y**2)
  const resAngle = toDeg(Math.atan2(resultant.y, resultant.x))

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const W = canvas.width, H = canvas.height, cx=W/2, cy=H/2, scale=28
    ctx.clearRect(0,0,W,H)
    ctx.strokeStyle="rgba(168,85,247,0.15)"; ctx.lineWidth=1
    for(let i=-10;i<=10;i++){
      ctx.beginPath(); ctx.moveTo(cx+i*scale,0); ctx.lineTo(cx+i*scale,H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0,cy-i*scale); ctx.lineTo(W,cy-i*scale); ctx.stroke()
    }
    ctx.strokeStyle="#a855f7"; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke()
    ctx.font="14px sans-serif"; ctx.fillStyle="#a855f7"; ctx.textAlign="center"
    ctx.fillText("x",W-12,cy+18); ctx.fillText("y",cx+12,14)

    const arrow = (x1:number,y1:number,x2:number,y2:number,color:string,label:string) => {
      const hl=12, ang=Math.atan2(y2-y1,x2-x1)
      ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=3
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x2,y2)
      ctx.lineTo(x2-hl*Math.cos(ang-Math.PI/6),y2-hl*Math.sin(ang-Math.PI/6))
      ctx.lineTo(x2-hl*Math.cos(ang+Math.PI/6),y2-hl*Math.sin(ang+Math.PI/6))
      ctx.closePath(); ctx.fill()
      ctx.font="bold 15px monospace"; ctx.textAlign="center"
      ctx.fillText(label,(x1+x2)/2+15,(y1+y2)/2-12)
    }

    if (showComponents) {
      ctx.setLineDash([5,5]); ctx.lineWidth=1
      ctx.strokeStyle="rgba(239,68,68,0.5)"
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+aComp.x*scale,cy); ctx.lineTo(cx+aComp.x*scale,cy-aComp.y*scale); ctx.stroke()
      ctx.strokeStyle="rgba(34,197,94,0.5)"
      const bsx=cx+aComp.x*scale, bsy=cy-aComp.y*scale
      const bdx=(operation==="add"?bComp.x:-bComp.x)*scale, bdy=(operation==="add"?bComp.y:-bComp.y)*scale
      ctx.beginPath(); ctx.moveTo(bsx,bsy); ctx.lineTo(bsx+bdx,bsy); ctx.lineTo(bsx+bdx,bsy-bdy); ctx.stroke()
      ctx.setLineDash([])
    }
    arrow(cx,cy,cx+aComp.x*scale,cy-aComp.y*scale,"#ef4444","A")
    if(operation==="add") arrow(cx+aComp.x*scale,cy-aComp.y*scale,cx+aComp.x*scale+bComp.x*scale,cy-aComp.y*scale-bComp.y*scale,"#22c55e","B")
    else arrow(cx+aComp.x*scale,cy-aComp.y*scale,cx+aComp.x*scale-bComp.x*scale,cy-aComp.y*scale+bComp.y*scale,"#22c55e","-B")
    if(showResultant) arrow(cx,cy,cx+resultant.x*scale,cy-resultant.y*scale,"#a855f7","R")
    ctx.font="bold 16px monospace"; ctx.fillStyle="#fff"; ctx.textAlign="center"
    ctx.fillText(`R = A ${operation==="add"?"+":"−"} B`,W/2,H-15)
  },[vA,vB,operation,showComponents,showResultant,aComp,bComp,resultant])

  useEffect(()=>{draw()},[draw])

  const controls = [
    { id:'am', label:'|A| Magnitude', labelHi:'|A| परिमाण', value:vA.magnitude, min:1, max:10, step:0.5, unit:'', onChange:(v:number)=>setVA(p=>({...p,magnitude:v})) },
    { id:'aa', label:'A Angle (°)', labelHi:'A कोण (°)', value:vA.angle, min:0, max:360, step:5, unit:'°', onChange:(v:number)=>setVA(p=>({...p,angle:v})) },
    { id:'bm', label:'|B| Magnitude', labelHi:'|B| परिमाण', value:vB.magnitude, min:1, max:10, step:0.5, unit:'', onChange:(v:number)=>setVB(p=>({...p,magnitude:v})) },
    { id:'ba', label:'B Angle (°)', labelHi:'B कोण (°)', value:vB.angle, min:0, max:360, step:5, unit:'°', onChange:(v:number)=>setVB(p=>({...p,angle:v})) },
  ]

  if(showBriefing){
    return <MissionBriefing title="Vector Operations" titleHi="सदिश संक्रियाएं"
      description="Master 2D vector addition and subtraction!" descriptionHi="2D सदिश जोड़ और घटाव में महारत हासिल करें!"
      instructions="Create vectors by adjusting magnitude and angle. Log 5 calculations to complete." instructionsHi="परिमाण और कोण समायोजित करें। 5 गणनाएं लॉग करें।"
      xpReward={220} difficulty="Advanced" subject="Mathematics" onStart={()=>setShowBriefing(false)} />
  }
  if(showComplete){
    return <SimulationComplete title="Vector Operations" xpEarned={220} score={100} maxScore={100}
      onPlayAgain={()=>{setShowComplete(false);setSolved(0)}} />
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
        <div className="lg:col-span-2">
          <HolographicHUD missionActive color="purple">
            <div className="p-4">
              <h2 className="text-xl font-bold text-foreground mb-4">{isHindi?'सदिश संक्रियाएं':'Vector Operations'}</h2>
              <canvas ref={canvasRef} width={600} height={480} style={{width:'100%'}} className="rounded-xl bg-background/50" />
              <div className="flex gap-3 mt-4">
                <Button onClick={()=>setOperation("add")} variant={operation==="add"?"default":"outline"} className={cn("flex-1",operation==="add"&&"glow-purple")}>
                  <Plus className="w-4 h-4 mr-1"/>{isHindi?'जोड़':'Add'}
                </Button>
                <Button onClick={()=>setOperation("subtract")} variant={operation==="subtract"?"default":"outline"} className="flex-1">
                  <Minus className="w-4 h-4 mr-1"/>{isHindi?'घटाव':'Subtract'}
                </Button>
                <Button onClick={()=>{setVA({magnitude:5,angle:30});setVB({magnitude:4,angle:120})}} variant="outline">
                  <RotateCcw className="w-4 h-4"/>
                </Button>
              </div>
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
          <div className="grid grid-cols-2 gap-2">
            <HolographicHUD color="purple">
              <div className="p-3">
                <h4 className="text-xs font-semibold text-red-400 mb-1">{isHindi?'सदिश A':'Vector A'}</h4>
                <p className="text-xs">|A| = {vA.magnitude}</p><p className="text-xs">θ = {vA.angle}°</p>
                <p className="text-xs text-muted-foreground">{aComp.x.toFixed(1)}, {aComp.y.toFixed(1)}</p>
              </div>
            </HolographicHUD>
            <HolographicHUD color="purple">
              <div className="p-3">
                <h4 className="text-xs font-semibold text-green-400 mb-1">{isHindi?'सदिश B':'Vector B'}</h4>
                <p className="text-xs">|B| = {vB.magnitude}</p><p className="text-xs">θ = {vB.angle}°</p>
                <p className="text-xs text-muted-foreground">{bComp.x.toFixed(1)}, {bComp.y.toFixed(1)}</p>
              </div>
            </HolographicHUD>
          </div>
          <HolographicHUD color="purple">
            <div className="p-4">
              <h4 className="text-sm font-semibold text-chart-3 mb-2">{isHindi?'परिणामी':'Resultant'} R = A {operation==="add"?"+":"−"} B</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span>|R| =</span><span className="font-bold">{resMag.toFixed(2)}</span>
                <span>θ =</span><span className="font-bold">{resAngle.toFixed(1)}°</span>
              </div>
            </div>
          </HolographicHUD>
          <div className="flex gap-2">
            <Button size="sm" variant={showComponents?"default":"outline"} onClick={()=>setShowComponents(!showComponents)} className="flex-1 text-xs">{isHindi?'घटक':'Components'}</Button>
            <Button size="sm" variant={showResultant?"default":"outline"} onClick={()=>setShowResultant(!showResultant)} className="flex-1 text-xs">{isHindi?'परिणामी':'Resultant'}</Button>
          </div>
          <Button onClick={()=>{setSolved(s=>{const n=s+1;if(n>=5)setTimeout(()=>setShowComplete(true),500);return n})}} className="w-full glow-purple">
            {isHindi?`गणना लॉग करें (${solved}/5)`:`Log Calculation (${solved}/5)`}
          </Button>
        </div>
      </div>
    </div>
  )
}
