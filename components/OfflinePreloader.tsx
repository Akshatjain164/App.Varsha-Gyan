"use client"

import { useEffect } from 'react'

export const routesToPrefetch = [
  '/',
  '/simulations',
  '/simulations/chemical-reactions',
  '/simulations/em-induction',
  '/simulations/friction-lab',
  '/simulations/heat-transfer',
  '/simulations/light-shadows',
  '/simulations/number-line-basic',
  '/simulations/ohms-law',
  '/simulations/osmosis-diffusion',
  '/simulations/ph-scale',
  '/simulations/plant-cell',
  '/simulations/projectile-motion',
  '/simulations/semiconductors',
  '/simulations/vector-operations',
  '/simulations/wave-optics'
]

export function OfflinePreloader() {
  useEffect(() => {
    // Only run this in the browser, after everything has mounted
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      
      const prefetchAll = () => {
        // We delay it slightly so it doesn't interrupt the initial PWA rendering and 3D bloom
        setTimeout(() => {
          console.log('[PWA] Starting aggressive offline precaching...')
          
          routesToPrefetch.forEach(route => {
            // 1. Fetch the Next.js RSC payload
            fetch(route, {
              headers: { 
                'Next-Router-Prefetch': '1',
                'RSC': '1'
              }
            }).catch(() => {})

            // 2. Fetch the raw HTML exactly as the browser would on a hard refresh
            fetch(route).catch(() => {})
          })
          
        }, 3000)
      }

      // Check if document is already loaded
      if (document.readyState === 'complete') {
        prefetchAll()
      } else {
        window.addEventListener('load', prefetchAll)
        return () => window.removeEventListener('load', prefetchAll)
      }
    }
  }, [])

  return null
}
