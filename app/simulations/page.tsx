"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Sun, Hash, Flame, Leaf, FlaskConical, Beaker, Rocket, TestTubes, 
  Zap, Droplets, ArrowRightLeft, Magnet, Waves, Cpu, ArrowLeft 
} from "lucide-react"
import { cn } from "@/lib/utils"

const missions = [
  // Class 6
  { id: "light-shadows", title_en: "Light & Shadows", title_hi: "प्रकाश और छाया", class: 6, subject: "Physics", icon: Sun, color: "#00d4ff", href: "/simulations/light-shadows" },
  { id: "number-line-basic", title_en: "Number Line Explorer", title_hi: "संख्या रेखा अन्वेषक", class: 6, subject: "Math", icon: Hash, color: "#00d4ff", href: "/simulations/number-line-basic" },
  // Class 7
  { id: "heat-transfer", title_en: "Heat Transfer Lab", title_hi: "ऊष्मा स्थानांतरण प्रयोगशाला", class: 7, subject: "Physics", icon: Flame, color: "#00d4ff", href: "/simulations/heat-transfer" },
  { id: "plant-cell", title_en: "Plant Cell Explorer", title_hi: "पादप कोशिका अन्वेषक", class: 7, subject: "Biology", icon: Leaf, color: "#00d4ff", href: "/simulations/plant-cell" },
  // Class 8
  { id: "friction-lab", title_en: "Friction Lab", title_hi: "घर्षण प्रयोगशाला", class: 8, subject: "Physics", icon: FlaskConical, color: "#3b82f6", href: "/simulations/friction-lab" },
  { id: "chemical-reactions", title_en: "Chemical Reactions", title_hi: "रासायनिक अभिक्रियाएं", class: 8, subject: "Chemistry", icon: Beaker, color: "#3b82f6", href: "/simulations/chemical-reactions" },
  // Class 9
  { id: "projectile-motion", title_en: "Projectile Motion", title_hi: "प्रक्षेप्य गति", class: 9, subject: "Physics", icon: Rocket, color: "#3b82f6", href: "/simulations/projectile-motion" },
  { id: "ph-scale", title_en: "pH Scale Lab", title_hi: "pH स्केल प्रयोगशाला", class: 9, subject: "Chemistry", icon: TestTubes, color: "#3b82f6", href: "/simulations/ph-scale" },
  // Class 10
  { id: "ohms-law", title_en: "Ohm's Law Circuit", title_hi: "ओम का नियम सर्किट", class: 10, subject: "Physics", icon: Zap, color: "#a855f7", href: "/simulations/ohms-law" },
  { id: "osmosis-diffusion", title_en: "Osmosis & Diffusion", title_hi: "परासरण और विसरण", class: 10, subject: "Biology", icon: Droplets, color: "#a855f7", href: "/simulations/osmosis-diffusion" },
  // Class 11
  { id: "vector-operations", title_en: "Vector Operations", title_hi: "सदिश संक्रियाएं", class: 11, subject: "Physics", icon: ArrowRightLeft, color: "#a855f7", href: "/simulations/vector-operations" },
  { id: "em-induction", title_en: "EM Induction", title_hi: "विद्युत चुम्बकीय प्रेरण", class: 11, subject: "Physics", icon: Magnet, color: "#a855f7", href: "/simulations/em-induction" },
  // Class 12
  { id: "wave-optics", title_en: "Wave Optics", title_hi: "तरंग प्रकाशिकी", class: 12, subject: "Physics", icon: Waves, color: "#f59e0b", href: "/simulations/wave-optics" },
  { id: "semiconductors", title_en: "Semiconductor Physics", title_hi: "अर्धचालक भौतिकी", class: 12, subject: "Physics", icon: Cpu, color: "#f59e0b", href: "/simulations/semiconductors" },
]

export default function SimulationsPage() {
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [selectedClass, setSelectedClass] = useState<number | null>(null)

  const filteredMissions = selectedClass 
    ? missions.filter(m => m.class === selectedClass)
    : missions

  const classColors: Record<number, string> = {
    6: "#00d4ff",
    7: "#00d4ff",
    8: "#3b82f6",
    9: "#3b82f6",
    10: "#a855f7",
    11: "#a855f7",
    12: "#f59e0b"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {language === "en" ? "Back" : "वापस"}
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {language === "en" ? "All Simulations" : "सभी सिमुलेशन"}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="border-white/20"
          >
            {language === "en" ? "हिंदी" : "English"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Class Filter */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            {language === "en" ? "Filter by Class" : "कक्षा द्वारा फ़िल्टर करें"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedClass === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedClass(null)}
              className={cn(selectedClass === null && "bg-cyan-600")}
            >
              {language === "en" ? "All" : "सभी"}
            </Button>
            {[6, 7, 8, 9, 10, 11, 12].map(cls => (
              <Button
                key={cls}
                variant={selectedClass === cls ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClass(cls)}
                style={{ 
                  backgroundColor: selectedClass === cls ? classColors[cls] : undefined,
                  borderColor: classColors[cls]
                }}
              >
                {language === "en" ? `Class ${cls}` : `कक्षा ${cls}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMissions.map(mission => {
            const Icon = mission.icon
            return (
              <Link key={mission.id} href={mission.href}>
                <div 
                  className="group relative p-4 rounded-xl border border-white/10 bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 hover:scale-[1.02] hover:border-opacity-50"
                  style={{ borderColor: `${mission.color}40` }}
                >
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ 
                      background: `radial-gradient(circle at 50% 50%, ${mission.color}10, transparent 70%)` 
                    }}
                  />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${mission.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: mission.color }} />
                      </div>
                      <span 
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${mission.color}20`, color: mission.color }}
                      >
                        {language === "en" ? `Class ${mission.class}` : `कक्षा ${mission.class}`}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold mb-1">
                      {language === "en" ? mission.title_en : mission.title_hi}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {mission.subject}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
