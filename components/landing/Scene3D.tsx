"use client"

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ---------- Particle Field ----------
function ParticleField({ count = 2000 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const actualCount = isMobile ? Math.floor(count / 3) : count

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(actualCount * 3)
    const col = new Float32Array(actualCount * 3)
    
    for (let i = 0; i < actualCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 5 + Math.random() * 20

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      const colorChoice = Math.random()
      if (colorChoice < 0.4) {
        col[i * 3] = 0; col[i * 3 + 1] = 0.83; col[i * 3 + 2] = 1
      } else if (colorChoice < 0.7) {
        col[i * 3] = 0.4; col[i * 3 + 1] = 0.2; col[i * 3 + 2] = 1
      } else {
        col[i * 3] = 0; col[i * 3 + 1] = 1; col[i * 3 + 2] = 0.7
      }
    }
    return { positions: pos, colors: col }
  }, [actualCount])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ---------- Atom Model (BIGGER, BRIGHTER) ----------
function AtomModel() {
  const groupRef = useRef<THREE.Group>(null)
  const nucleusRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    if (nucleusRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08
      nucleusRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Nucleus - LARGE glowing core */}
        <mesh ref={nucleusRef}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial 
            color="#00d4ff" 
            emissive="#00d4ff" 
            emissiveIntensity={3}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        
        {/* Inner glow shell */}
        <mesh>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.12} />
        </mesh>
        
        {/* Outer glow shell */}
        <mesh>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.05} />
        </mesh>

        {/* Electron orbits — BIGGER radius */}
        {[0, 1, 2].map((i) => {
          const rotation = new THREE.Euler(
            (i * Math.PI) / 3,
            (i * Math.PI) / 4,
            0
          )
          return (
            <group key={i} rotation={rotation}>
              <mesh>
                <torusGeometry args={[3.5, 0.015, 8, 100]} />
                <meshBasicMaterial color="#00d4ff" transparent opacity={0.4} />
              </mesh>
              <ElectronOnOrbit radius={3.5} speed={0.8 + i * 0.4} offset={i * 2} />
            </group>
          )
        })}
      </group>
    </Float>
  )
}

function ElectronOnOrbit({ radius, speed, offset }: { radius: number; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed + offset
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.y = Math.sin(t) * radius
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial 
        color="#a855f7" 
        emissive="#a855f7" 
        emissiveIntensity={4}
        roughness={0}
        metalness={1}
      />
    </mesh>
  )
}

// ---------- Connecting Lines ----------
function NeuralLinks({ count = 25 }: { count?: number }) {
  const linesRef = useRef<THREE.Group>(null)

  const lines = useMemo(() => {
    return Array.from({ length: count }, () => {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12
      )
      const end = new THREE.Vector3(
        start.x + (Math.random() - 0.5) * 5,
        start.y + (Math.random() - 0.5) * 5,
        start.z + (Math.random() - 0.5) * 5
      )
      return [start, end]
    })
  }, [count])

  useFrame((state) => {
    if (!linesRef.current) return
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.008
  })

  return (
    <group ref={linesRef}>
      {lines.map(([start, end], i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00d4ff" transparent opacity={0.1} />
        </line>
      ))}
    </group>
  )
}

// ---------- Scroll Camera Controller ----------
function ScrollCamera() {
  const { camera } = useThree()
  const scrollRef = useRef({ progress: 0 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
          scrollRef.current.progress = self.progress
        }
      })
    })

    return () => ctx.revert()
  }, [])

  useFrame(() => {
    const p = scrollRef.current.progress

    // Camera starts close, pulls back and orbits as user scrolls
    const baseX = Math.sin(p * Math.PI * 2) * 4
    const baseY = 1.5 - p * 4
    const baseZ = 10 - p * 6

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, baseX, 0.03)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, baseY, 0.03)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.03)
    
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ---------- Main Scene3D Component ----------
export function Scene3D() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handle = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1.5, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        frameloop={visible ? 'always' : 'never'}
      >
        <AdaptiveDpr pixelated />
        
        {/* Stronger lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#00d4ff" />
        <pointLight position={[-5, -3, 3]} intensity={1} color="#a855f7" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#00e5ff" />

        {/* Scene Objects */}
        <AtomModel />
        <ParticleField count={2000} />
        <NeuralLinks count={25} />

        {/* Scroll-Driven Camera */}
        <ScrollCamera />

        {/* Postprocessing */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            intensity={2.0}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
