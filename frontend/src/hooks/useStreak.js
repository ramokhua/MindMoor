import { useState, useEffect } from 'react'

export function useStreak() {
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [lastActivity, setLastActivity] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    const savedStreak = localStorage.getItem('streak')
    const savedBest = localStorage.getItem('bestStreak')
    const savedLast = localStorage.getItem('lastActivity')
    
    if (savedStreak) setStreak(parseInt(savedStreak))
    if (savedBest) setBestStreak(parseInt(savedBest))
    if (savedLast) setLastActivity(savedLast)
  }, [])

  const updateStreak = () => {
    const today = new Date().toDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    let newStreak = streak
    let showCeleb = false
    
    if (lastActivity === today) {
      // Already logged today, do nothing
      return { streak, bestStreak, showCelebration: false }
    }
    
    if (lastActivity === yesterday.toDateString()) {
      // Consecutive day
      newStreak = streak + 1
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
        localStorage.setItem('bestStreak', newStreak.toString())
      }
      if (newStreak % 7 === 0 || newStreak === 3 || newStreak === 5) {
        showCeleb = true
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 5000)
      }
    } else if (lastActivity !== today) {
      // Broke streak, start over
      newStreak = 1
    }
    
    setStreak(newStreak)
    setLastActivity(today)
    localStorage.setItem('streak', newStreak.toString())
    localStorage.setItem('lastActivity', today)
    
    return { streak: newStreak, bestStreak, showCelebration: showCeleb }
  }

  const resetCelebration = () => setShowCelebration(false)

  return { streak, bestStreak, updateStreak, showCelebration, resetCelebration }
}