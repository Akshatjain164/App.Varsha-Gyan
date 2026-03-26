"use client"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HolographicHUD } from '@/components/simulations/framework/HolographicHUD'
import { MissionBriefing } from '@/components/simulations/framework/MissionBriefing'
import { SimulationComplete } from '@/components/simulations/framework/SimulationComplete'
import { LanguageToggle } from '@/components/simulations/framework/LanguageToggle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/use-language'
import { cn } from '@/lib/utils'

interface Organelle {
  id: string
  name_en: string
  name_hi: string
  description_en: string
  description_hi: string
  color: string
}

const organelles: Organelle[] = [
  { id: 'cell_wall', name_en: 'Cell Wall', name_hi: 'कोशिका भित्ति', description_en: 'Rigid outer layer made of cellulose that provides structure and protection.', description_hi: 'सेल्यूलोज से बनी कठोर बाहरी परत जो संरचना और सुरक्षा प्रदान करती है।', color: '#2d5a27' },
  { id: 'cell_membrane', name_en: 'Cell Membrane', name_hi: 'कोशिका झिल्ली', description_en: 'Semi-permeable membrane controlling what enters and exits the cell.', description_hi: 'अर्ध-पारगम्य झिल्ली जो कोशिका में प्रवेश और निकास को नियंत्रित करती है।', color: '#4a7c44' },
  { id: 'nucleus', name_en: 'Nucleus', name_hi: 'केंद्रक', description_en: 'Control center containing DNA that directs all cell activities.', description_hi: 'DNA युक्त नियंत्रण केंद्र जो सभी कोशिका गतिविधियों को निर्देशित करता है।', color: '#8b4513' },
  { id: 'chloroplast', name_en: 'Chloroplast', name_hi: 'हरितलवक', description_en: 'Site of photosynthesis — contains chlorophyll to capture light energy.', description_hi: 'प्रकाश संश्लेषण का स्थान — प्रकाश ऊर्जा पकड़ने के लिए क्लोरोफिल होता है।', color: '#228b22' },
  { id: 'vacuole', name_en: 'Central Vacuole', name_hi: 'रिक्तिका', description_en: 'Large water-filled sac storing nutrients and maintaining cell pressure.', description_hi: 'पोषक तत्व संग्रहीत करने वाली बड़ी जल से भरी थैली।', color: '#87ceeb' },
  { id: 'mitochondria', name_en: 'Mitochondria', name_hi: 'माइटोकॉन्ड्रिया', description_en: 'Powerhouse of the cell — produces ATP energy via cellular respiration.', description_hi: 'कोशिका का पावरहाउस — कोशिकीय श्वसन द्वारा ATP ऊर्जा उत्पन्न करता है।', color: '#ff6b6b' },
  { id: 'er', name_en: 'Endoplasmic Reticulum', name_hi: 'अंतर्द्रव्यी जालिका', description_en: 'Network of membranes involved in protein and lipid synthesis.', description_hi: 'प्रोटीन और लिपिड संश्लेषण में शामिल झिल्लियों का नेटवर्क।', color: '#dda0dd' },
  { id: 'golgi', name_en: 'Golgi Body', name_hi: 'गॉल्जी काय', description_en: 'Packages and distributes proteins and lipids to different cell parts.', description_hi: 'प्रोटीन और लिपिड को पैकेज करके विभिन्न कोशिका भागों में भेजता है।', color: '#ffd700' },
]

export default function PlantCellSimulation() {
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()
  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [selected, setSelected] = useState<Organelle | null>(null)
  const [learned, setLearned] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)

  const handleClick = (org: Organelle) => {
    setSelected(org)
    setLearned(prev => new Set([...prev, org.id]))
  }

  const handleComplete = async () => {
    const finalScore = Math.round((learned.size / organelles.length) * 100)
    setScore(finalScore)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase.from('missions').select('id, xp_reward').eq('simulation_type', 'plant-cell').single()
      if (mission) {
        await supabase.from('mission_progress').upsert({ student_id: user.id, mission_id: mission.id, status: 'completed', score: finalScore, attempts: 1, completed_at: new Date().toISOString() }, { onConflict: 'student_id,mission_id' })
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 100 })
      }
    }
    setShowComplete(true)
  }

  if (showBriefing) {
    return (
      <MissionBriefing
        title="Plant Cell Explorer"
        titleHi="पादप कोशिका अन्वेषक"
        description="Explore the structure of a plant cell and learn about its organelles!"
        descriptionHi="पादप कोशिका की संरचना का अन्वेषण करें और इसके अंगकों के बारे में जानें!"
        instructions="Click on different parts of the cell to learn about them. Explore all organelles to complete the mission."
        instructionsHi="कोशिका के विभिन्न भागों पर क्लिक करें और उनके बारे में जानें।"
        xpReward={120}
        difficulty="Beginner"
        subject="Biology"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="Plant Cell Explorer"
        xpEarned={120}
        score={score}
        maxScore={100}
        onPlayAgain={() => { setShowComplete(false); setLearned(new Set()); setSelected(null) }}
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
        {/* Cell Diagram */}
        <div className="lg:col-span-2">
          <HolographicHUD missionActive color="cyan">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">{isHindi ? 'पादप कोशिका' : 'Plant Cell'}</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}><ZoomIn className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))}><ZoomOut className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom(1)}><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl bg-muted/20 h-[400px]">
                <svg viewBox="0 0 100 100" style={{ width: `${zoom * 100}%`, maxWidth: '500px', transition: 'width 0.3s' }}>
                  {/* Cell Wall */}
                  <rect x="2" y="2" width="96" height="96" rx="20" fill="#2d5a27" stroke="#00d4ff" strokeWidth="0.5" className="cursor-pointer hover:brightness-110" onClick={() => handleClick(organelles[0])} />
                  {/* Cell Membrane */}
                  <rect x="5" y="5" width="90" height="90" rx="18" fill="#4a7c44" stroke="#00d4ff" strokeWidth="0.3" className="cursor-pointer hover:brightness-110" onClick={() => handleClick(organelles[1])} />
                  {/* Cytoplasm */}
                  <rect x="7" y="7" width="86" height="86" rx="16" fill="#5a8f54" />
                  {/* Central Vacuole */}
                  <ellipse cx="62" cy="58" rx="18" ry="22" fill="#87ceeb" fillOpacity="0.6" stroke="#00d4ff" strokeWidth="0.3" className="cursor-pointer hover:fill-opacity-80" onClick={() => handleClick(organelles[4])} />
                  {/* Nucleus */}
                  <circle cx="38" cy="38" r="12" fill="#8b4513" stroke="#00d4ff" strokeWidth="0.3" className="cursor-pointer hover:brightness-110" onClick={() => handleClick(organelles[2])} />
                  <circle cx="38" cy="38" r="4" fill="#654321" />
                  {/* Chloroplasts */}
                  {[{x:20,y:55},{x:25,y:70},{x:78,y:25},{x:15,y:30}].map((p,i)=>(
                    <ellipse key={i} cx={p.x} cy={p.y} rx="6" ry="3" fill="#228b22" stroke="#00d4ff" strokeWidth="0.2" className="cursor-pointer hover:brightness-110" onClick={() => handleClick(organelles[3])} />
                  ))}
                  {/* Mitochondria */}
                  {[{x:25,y:28},{x:72,y:82},{x:82,y:45}].map((p,i)=>(
                    <ellipse key={i} cx={p.x} cy={p.y} rx="5" ry="3" fill="#ff6b6b" stroke="#00d4ff" strokeWidth="0.2" className="cursor-pointer hover:brightness-110" onClick={() => handleClick(organelles[5])} />
                  ))}
                  {/* ER */}
                  <path d="M30 65 Q35 60 40 65 Q45 70 50 65 Q55 60 55 70" fill="none" stroke="#dda0dd" strokeWidth="2" className="cursor-pointer" onClick={() => handleClick(organelles[6])} />
                  {/* Golgi */}
                  {[0,3,6].map(offset=>(
                    <path key={offset} d={`M73 ${22+offset} Q78 ${24+offset} 73 ${26+offset}`} fill="none" stroke="#ffd700" strokeWidth="1.5" className="cursor-pointer" onClick={() => handleClick(organelles[7])} />
                  ))}
                  {/* Learned indicators */}
                  {organelles.map((org, i) => learned.has(org.id) && (
                    <circle key={org.id} cx={[8,8,38,20,62,25,42,76][i]} cy={[8,8,38,55,58,28,65,22][i]} r="3" fill="#22c55e" />
                  ))}
                </svg>
              </div>
            </div>
          </HolographicHUD>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <HolographicHUD color="cyan">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">{isHindi ? 'अंगक जानकारी' : 'Organelle Info'}</h3>
              {selected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: selected.color }} />
                    <p className="font-semibold text-foreground">{isHindi ? selected.name_hi : selected.name_en}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{isHindi ? selected.description_hi : selected.description_en}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{isHindi ? 'कोशिका के किसी भाग पर क्लिक करें' : 'Click on any part of the cell to learn about it.'}</p>
              )}
            </div>
          </HolographicHUD>

          <HolographicHUD color="cyan">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">{isHindi ? 'खोजे गए अंगक' : 'Explored'} ({learned.size}/{organelles.length})</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {organelles.map(org => (
                  <div key={org.id} className={cn('text-xs p-1.5 rounded border truncate', learned.has(org.id) ? 'bg-chart-5/20 border-chart-5/40 text-foreground' : 'bg-muted/20 border-border/30 text-muted-foreground')}>
                    {isHindi ? org.name_hi : org.name_en}
                  </div>
                ))}
              </div>
            </div>
          </HolographicHUD>

          <Button onClick={handleComplete} className="w-full glow-cyan">
            {isHindi ? 'मिशन पूरा करें' : 'Complete Mission'}
          </Button>
        </div>
      </div>
    </div>
  )
}
