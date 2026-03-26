"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HolographicHUD } from '@/components/simulations/framework/HolographicHUD'
import { MissionBriefing } from '@/components/simulations/framework/MissionBriefing'
import { SimulationComplete } from '@/components/simulations/framework/SimulationComplete'
import { LanguageToggle } from '@/components/simulations/framework/LanguageToggle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw, Droplets } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/use-language'

interface Substance {
  id: string
  name: string
  nameHi: string
  ph: number
  color: string
}

const substances: Substance[] = [
  { id: 'lemon', name: 'Lemon Juice', nameHi: 'नींबू का रस', ph: 2, color: '#fef08a' },
  { id: 'vinegar', name: 'Vinegar', nameHi: 'सिरका', ph: 3, color: '#fde68a' },
  { id: 'coffee', name: 'Coffee', nameHi: 'कॉफी', ph: 5, color: '#92400e' },
  { id: 'milk', name: 'Milk', nameHi: 'दूध', ph: 6.5, color: '#fefce8' },
  { id: 'water', name: 'Pure Water', nameHi: 'शुद्ध पानी', ph: 7, color: '#bfdbfe' },
  { id: 'blood', name: 'Blood', nameHi: 'रक्त', ph: 7.4, color: '#ef4444' },
  { id: 'baking_soda', name: 'Baking Soda', nameHi: 'बेकिंग सोडा', ph: 9, color: '#f5f5f4' },
  { id: 'soap', name: 'Soap', nameHi: 'साबुन', ph: 10, color: '#c4b5fd' },
  { id: 'bleach', name: 'Bleach', nameHi: 'ब्लीच', ph: 13, color: '#fcd34d' },
]

const phColors = [
  '#dc2626', '#ea580c', '#f97316', '#fb923c', '#fbbf24',
  '#facc15', '#a3e635', '#4ade80', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'
]

export default function pHScaleSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()
  const { isHindi, toggleLanguage } = useLanguage()

  const [showBriefing, setShowBriefing] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null)
  const [solutionPh, setSolutionPh] = useState(7)
  const [testedSubstances, setTestedSubstances] = useState<Set<string>>(new Set())

  const [score, setScore] = useState(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 600 * dpr
    canvas.height = 400 * dpr
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, 600, 400)

    // pH Scale
    const scaleX = 50
    const scaleY = 50
    const scaleWidth = 500
    const scaleHeight = 40

    // Draw scale gradient
    const gradient = ctx.createLinearGradient(scaleX, scaleY, scaleX + scaleWidth, scaleY)
    phColors.forEach((color, i) => {
      gradient.addColorStop(i / 14, color)
    })
    ctx.fillStyle = gradient
    ctx.roundRect(scaleX, scaleY, scaleWidth, scaleHeight, 8)
    ctx.fill()

    // Scale labels
    ctx.fillStyle = '#fff'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 14; i++) {
      const x = scaleX + (i / 14) * scaleWidth
      ctx.fillText(i.toString(), x, scaleY + scaleHeight + 20)
    }

    // Labels
    ctx.font = 'bold 14px sans-serif'
    ctx.fillStyle = '#ef4444'
    ctx.textAlign = 'left'
    ctx.fillText(isHindi ? 'अम्लीय' : 'ACIDIC', scaleX, scaleY + scaleHeight + 45)
    ctx.fillStyle = '#a3e635'
    ctx.textAlign = 'center'
    ctx.fillText(isHindi ? 'उदासीन' : 'NEUTRAL', scaleX + scaleWidth / 2, scaleY + scaleHeight + 45)
    ctx.fillStyle = '#8b5cf6'
    ctx.textAlign = 'right'
    ctx.fillText(isHindi ? 'क्षारीय' : 'BASIC', scaleX + scaleWidth, scaleY + scaleHeight + 45)

    // pH Indicator needle
    const needleX = scaleX + (solutionPh / 14) * scaleWidth
    ctx.beginPath()
    ctx.moveTo(needleX - 10, scaleY - 10)
    ctx.lineTo(needleX + 10, scaleY - 10)
    ctx.lineTo(needleX, scaleY + 5)
    ctx.closePath()
    ctx.fillStyle = '#00d4ff'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Current pH display
    ctx.fillStyle = 'rgba(0, 212, 255, 0.1)'
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)'
    ctx.lineWidth = 2
    ctx.roundRect(240, 140, 120, 80, 12)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 36px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(solutionPh.toFixed(1), 300, 190)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('pH', 300, 210)

    // Beaker
    const beakerX = 220
    const beakerY = 240
    const beakerWidth = 160
    const beakerHeight = 140

    // Beaker outline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(beakerX, beakerY)
    ctx.lineTo(beakerX, beakerY + beakerHeight)
    ctx.lineTo(beakerX + beakerWidth, beakerY + beakerHeight)
    ctx.lineTo(beakerX + beakerWidth, beakerY)
    ctx.stroke()

    // Liquid in beaker
    const liquidHeight = beakerHeight * 0.7
    const phColorIndex = Math.min(14, Math.max(0, Math.round(solutionPh)))
    ctx.fillStyle = phColors[phColorIndex] + '80'
    ctx.fillRect(beakerX + 3, beakerY + beakerHeight - liquidHeight, beakerWidth - 6, liquidHeight - 3)

    // Liquid glow
    ctx.fillStyle = phColors[phColorIndex] + '30'
    ctx.fillRect(beakerX + 3, beakerY + beakerHeight - liquidHeight - 10, beakerWidth - 6, 10)

    // Substance name
    if (selectedSubstance) {
      ctx.fillStyle = '#fff'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        isHindi ? selectedSubstance.nameHi : selectedSubstance.name,
        beakerX + beakerWidth / 2,
        beakerY + beakerHeight + 25
      )
    }
  }, [solutionPh, selectedSubstance, isHindi])

  useEffect(() => {
    draw()
  }, [draw])

  const handleSubstanceClick = (substance: Substance) => {
    setSelectedSubstance(substance)
    setSolutionPh(substance.ph)
    setTestedSubstances(prev => new Set([...prev, substance.id]))
  }

  const handleReset = () => {
    setSelectedSubstance(null)
    setSolutionPh(7)
  }

  const handleComplete = async () => {
    const finalScore = Math.min(100, (testedSubstances.size / substances.length) * 100)
    setScore(finalScore)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: mission } = await supabase
        .from('missions')
        .select('id, xp_reward')
        .eq('simulation_type', 'ph-scale')
        .single()

      if (mission) {
        await supabase.from('mission_progress').upsert({
          student_id: user.id,
          mission_id: mission.id,
          status: 'completed',
          score: finalScore,
          attempts: 1,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'student_id,mission_id' })
        await supabase.rpc('add_xp', { user_id: user.id, xp_amount: mission.xp_reward || 100 })
      }
    }

    setShowComplete(true)
  }

  if (showBriefing) {
    return (
      <MissionBriefing
        title="pH Scale Lab"
        titleHi="pH स्केल प्रयोगशाला"
        description="Learn about acids and bases by testing different substances on the pH scale."
        descriptionHi="pH स्केल पर विभिन्न पदार्थों का परीक्षण करके अम्ल और क्षार के बारे में जानें।"
        instructions="Click on different substances to add them to the beaker and observe their pH levels."
        instructionsHi="विभिन्न पदार्थों पर क्लिक करके उन्हें बीकर में डालें और उनके pH स्तर देखें।"
        xpReward={180}
        difficulty="Intermediate"
        subject="Chemistry"
        onStart={() => setShowBriefing(false)}
      />
    )
  }

  if (showComplete) {
    return (
      <SimulationComplete
        title="pH Scale Lab"
        xpEarned={180}
        score={score}
        maxScore={100}
        onPlayAgain={() => {
          setShowComplete(false)
          handleReset()
          setTestedSubstances(new Set())
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link href="/simulations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'वापस मिशनों पर' : 'Back to Missions'}</span>
          </Link>
          <LanguageToggle isHindi={isHindi} onToggle={toggleLanguage} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HolographicHUD missionActive color="blue">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {isHindi ? 'pH स्केल प्रयोगशाला' : 'pH Scale Lab'}
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isHindi ? 'रीसेट' : 'Reset'}
                  </Button>
                </div>
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: 400 }}
                  className="rounded-xl"
                />
              </div>
            </HolographicHUD>
          </div>

          <div className="space-y-6">
            <HolographicHUD color="blue">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {isHindi ? 'पदार्थ' : 'Substances'}
                </h3>
                <div className="space-y-2">
                  {substances.map((substance) => (
                    <button
                      key={substance.id}
                      onClick={() => handleSubstanceClick(substance)}
                      className={`
                        w-full p-3 rounded-xl border transition-all flex items-center gap-3
                        ${selectedSubstance?.id === substance.id
                          ? 'border-primary bg-primary/10'
                          : testedSubstances.has(substance.id)
                          ? 'border-chart-5/30 bg-chart-5/5'
                          : 'border-border/50 bg-card/30 hover:border-primary/50'
                        }
                      `}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-border/50"
                        style={{ backgroundColor: substance.color }}
                      />
                      <span className="text-sm text-foreground flex-1 text-left">
                        {isHindi ? substance.nameHi : substance.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        pH {substance.ph}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </HolographicHUD>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {isHindi ? 'प्रगति' : 'Progress'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {testedSubstances.size}/{substances.length} {isHindi ? 'पदार्थों का परीक्षण किया' : 'substances tested'}
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full glow-blue">
              {isHindi ? 'मिशन पूरा करें' : 'Complete Mission'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
