"use client"

import { useState, useEffect, useCallback } from 'react'

const LANGUAGE_KEY = 'varsha-gyan-language'

export type Language = 'en' | 'hi'

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved)
    }
    setIsLoaded(true)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_KEY, lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'hi' : 'en'
    setLanguage(newLang)
  }, [language, setLanguage])

  const isHindi = language === 'hi'

  return {
    language,
    setLanguage,
    toggleLanguage,
    isHindi,
    isLoaded,
  }
}
