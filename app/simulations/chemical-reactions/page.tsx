"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { HolographicHUD } from "@/components/simulations/framework/HolographicHUD"
import { LanguageToggle } from "@/components/simulations/framework/LanguageToggle"
import { MissionBriefing } from "@/components/simulations/framework/MissionBriefing"
import { SimulationComplete } from "@/components/simulations/framework/SimulationComplete"
import { Button } from "@/components/ui/button"
import { Beaker, RotateCcw, Sparkles, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/use-language"
import { cn } from "@/lib/utils"

interface Element { symbol: string; name_en: string; name_hi: string; color: string }
interface Reaction { reactants: [string,string]; products: string[]; eq_en: string; eq_hi: string; type_en: string; type_hi: string; color: string; effect: string }

const elements: Element[] = [
  { symbol: "H₂", name_en: "Hydrogen", name_hi: "हाइड्रोजन", color: "#60a5fa" },
  { symbol: "O₂", name_en: "Oxygen", name_hi: "ऑक्सीजन", color: "#f87171" },
  { symbol: "Na", name_en: "Sodium", name_hi: "सोडियम", color: "#fbbf24" },
  { symbol: "Cl₂", name_en: "Chlorine", name_hi: "क्लोरीन", color: "#4ade80" },
  { symbol: "Fe", name_en: "Iron", name_hi: "लोहा", color: "#a1a1aa" },
  { symbol: "H₂O", name_en: "Water", name_hi: "पानी", color: "#38bdf8" },
  { symbol: "CO₂", name_en: "Carbon Dioxide", name_hi: "कार्बन डाइऑक्साइड", color: "#94a3b8" },
  { symbol: "C", name_en: "Carbon", name_hi: "कार्बन", color: "#374151" },
]

const reactions: Reaction[] = [
  { reactants: ["H₂","O₂"], products: ["H₂O"], eq_en: "2H₂ + O₂ → 2H₂O", eq_hi: "2H₂ + O₂ → 2H₂O", type_en: "Combination", type_hi: "संयोजन", color: "#38bdf8", effect: "bubbles" },
  { reactants: ["Na","Cl₂"], products: ["NaCl"], eq_en: "2Na + Cl₂ → 2NaCl", eq_hi: "2Na + Cl₂ → 2NaCl", type_en: "Combination", type_hi: "संयोजन", color: "#fbbf24", effect: "flash" },
  { reactants: ["Fe","O₂"], products: ["Fe₂O₃"], eq_en: "4Fe + 3O₂ → 2Fe₂O₃", eq_hi: "4Fe + 3O₂ → 2Fe₂O₃", type_en: "Oxidation", type_hi: "ऑक्सीकरण", color: "#b45309", effect: "glow" },
  { reactants: ["C","O₂"], products: ["CO₂"], eq_en: "C + O₂ → CO₂", eq_hi: "C + O₂ → CO₂", type_en: "Combustion", type_hi: "दहन", color: "#ef4444", effect: "fire" },
  { reactants: ["Na","H₂O"], products: ["NaOH","H₂"], eq_en: "2Na + 2H₂O → 2NaOH + H₂", eq_hi: "2Na + 2H₂O → 2NaOH + H₂", type_en: "Single Displacement", type_hi: "एकल विस्थापन", color: "#a855f7", effect: "explosion" },
]

export default function ChemicalReactionsSimulation() {
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [chamber, setChamber] = useState<string[]>([])
  const [activeReaction, setActiveReaction] = useState<Reaction | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [discovered, setDiscovered] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)

  const addToChamber = (symbol: string) => {
    if (chamber.length < 2 && !isReacting) setChamber(prev => [...prev, symbol])
  }

  const react = () => {
    if (chamber.length !== 2) return
    const r = reactions.find(rx => (rx.reactants.includes(chamber[0] as typeof rx.reactants[0]) && rx.reactants.includes(chamber[1] as typeof rx.reactants[0])))
    if (r) {
      setIsReacting(true); setActiveReaction(r)
      setTimeout(() => {
        setIsReacting(false)
        const key = [...r.reactants].sort().join("+")
        if (!discovered.has(key)) {
          setDiscovered(prev => { const n = new Set([...prev, key]); if(n.size>=4) setTimeout(()=>setShowComplete(true),500); return n })
          setScore(prev => prev + 25)
        }
      }, 2000)
    } else {
      setActiveReaction(null)
    }
  }

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase.from('missions').select('id, xp_reward').eq('simulation_type', 'chemical-reactions').single()
      if (mission) {
        await supabase.from('mission_progress').upsert({ student_id: user.id, mission_id: mission.id, status: 'completed', score, attempts: 1, completed_at: new Date().toISOString() }, { onConflict: 'student_id,mission_id' })
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 120 })
      }
    }
    setShowComplete(true)
  }

  if (showBriefing) {
    return <MissionBriefing title="Chemical Reactions Lab" titleHi="रासायनिक अभिक्रिया प्रयोगशाला"
      description="Combine elements to discover chemical reactions!" descriptionHi="तत्वों को मिलाकर रासायनिक अभिक्रियाएं खोजें!"
      instructions="Select 2 elements for the reaction chamber, then click React! Discover 4 reactions to complete." instructionsHi="2 तत्व चुनें और React! क्लिक करें। 4 अभिक्रियाएं खोजें।"
      xpReward={150} difficulty="Intermediate" subject="Chemistry" onStart={() => setShowBriefing(false)} />
  }
  if (showComplete) {
    return <SimulationComplete title="Chemical Reactions Lab" xpEarned={150} score={score} maxScore={100}
      onPlayAgain={() => { setShowComplete(false); setDiscovered(new Set()); setScore(0); setChamber([]); setActiveReaction(null) }} />
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
        {/* Reaction Chamber */}
        <div className="lg:col-span-2">
          <HolographicHUD missionActive color="blue">
            <div className="p-6 flex flex-col items-center gap-6">
              <h2 className="text-xl font-bold text-foreground self-start">{isHindi?'अभिक्रिया कक्ष':'Reaction Chamber'}</h2>
              {/* Chamber */}
              <div className="relative w-64 h-64 rounded-full border-4 flex items-center justify-center gap-4 transition-all duration-500"
                style={{ borderColor: activeReaction?.color || '#3b82f6', backgroundColor: isReacting ? `${activeReaction?.color}20` : 'rgba(0,0,0,0.3)', boxShadow: isReacting ? `0 0 40px ${activeReaction?.color}60` : 'none' }}>
                {chamber.map((sym, i) => (
                  <div key={i} className={cn("w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold transition-all", isReacting && "scale-75 opacity-50")}
                    style={{ backgroundColor: elements.find(e=>e.symbol===sym)?.color }}>
                    {sym}
                  </div>
                ))}
                {chamber.length === 0 && <span className="text-muted-foreground text-sm text-center px-4">{isHindi?'तत्व जोड़ें':'Add elements'}</span>}
                {isReacting && activeReaction?.effect === "fire" && (
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-gradient-to-t from-orange-600 to-yellow-400 rounded-full animate-pulse"/></div>
                )}
                {isReacting && activeReaction?.effect === "bubbles" && (
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    {[...Array(8)].map((_,i)=>(
                      <div key={i} className="absolute w-3 h-3 bg-blue-400/60 rounded-full animate-bounce"
                        style={{ left:`${20+Math.random()*60}%`, bottom:`${Math.random()*50}%`, animationDelay:`${Math.random()*0.5}s` }} />
                    ))}
                  </div>
                )}
              </div>
              {/* Products */}
              {isReacting && activeReaction && (
                <div className="text-center">
                  <Sparkles className="w-6 h-6 mx-auto mb-1 animate-spin" style={{ color: activeReaction.color }}/>
                  <p className="font-bold text-lg" style={{ color: activeReaction.color }}>{activeReaction.products.join(" + ")}</p>
                </div>
              )}
              {/* Equation */}
              {activeReaction && (
                <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50 w-full">
                  <p className="text-xl font-mono font-bold mb-1" style={{ color: activeReaction.color }}>
                    {isHindi ? activeReaction.eq_hi : activeReaction.eq_en}
                  </p>
                  <p className="text-sm text-muted-foreground">{isHindi ? activeReaction.type_hi : activeReaction.type_en}</p>
                </div>
              )}
              {/* Buttons */}
              <div className="flex gap-3">
                <Button onClick={react} disabled={chamber.length!==2||isReacting} className="glow-blue">
                  <Beaker className="w-4 h-4 mr-2"/>{isHindi?'अभिक्रिया!':'React!'}
                </Button>
                <Button onClick={()=>{setChamber([]);setActiveReaction(null)}} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2"/>{isHindi?'रीसेट':'Reset'}
                </Button>
              </div>
            </div>
          </HolographicHUD>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <HolographicHUD color="blue">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{isHindi?'उपलब्ध तत्व':'Available Elements'}</h3>
              <div className="grid grid-cols-4 gap-2">
                {elements.map(el => (
                  <button key={el.symbol} onClick={() => addToChamber(el.symbol)} disabled={isReacting}
                    className={cn("h-14 rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all hover:scale-105 disabled:opacity-50",
                      chamber.includes(el.symbol) && "ring-2 ring-white")}
                    style={{ backgroundColor: el.color }}>
                    <span className="text-sm">{el.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </HolographicHUD>

          <HolographicHUD color="blue">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {isHindi?'खोजी गई अभिक्रियाएं':'Discovered'} ({discovered.size}/5)
              </h3>
              <div className="space-y-2">
                {reactions.map((r,i) => {
                  const key=[...r.reactants].sort().join("+"); const done=discovered.has(key)
                  return (
                    <div key={i} className={cn("text-xs p-2 rounded border transition-all", done?"bg-chart-5/20 border-chart-5/40":"bg-muted/20 border-border/30 opacity-50")}>
                      {done ? (isHindi ? r.eq_hi : r.eq_en) : "???"}
                    </div>
                  )
                })}
              </div>
            </div>
          </HolographicHUD>

          <HolographicHUD color="blue">
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{isHindi?'स्कोर':'Score'}</p>
              <p className="text-3xl font-bold text-chart-2">{score}</p>
            </div>
          </HolographicHUD>

          <Button onClick={handleComplete} className="w-full glow-blue">
            {isHindi?'मिशन पूरा करें':'Complete Mission'}
          </Button>
        </div>
      </div>
    </div>
  )
}
