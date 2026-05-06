import { useState, useEffect } from 'react'

export function useAccessibility() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(() => 
    localStorage.getItem('highContrast') === 'true'
  )
  const [fontSize, setFontSize] = useState(() => 
    parseInt(localStorage.getItem('fontSize') || '100')
  )

  // Check system preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
    localStorage.setItem('highContrast', highContrast)
  }, [highContrast])

  // Apply font size scaling
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
    localStorage.setItem('fontSize', fontSize.toString())
  }, [fontSize])

  const increaseFontSize = () => {
    if (fontSize < 150) {
      setFontSize(prev => Math.min(prev + 10, 150))
    }
  }

  const decreaseFontSize = () => {
    if (fontSize > 70) {
      setFontSize(prev => Math.max(prev - 10, 70))
    }
  }

  const resetFontSize = () => setFontSize(100)

  return {
    prefersReducedMotion,
    highContrast,
    setHighContrast,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize
  }
}