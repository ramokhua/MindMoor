import { useState, useEffect } from 'react'

const AFFIRMATIONS = [
  { text: "I am worthy of love and respect.", category: "self-worth" },
  { text: "I have the power to create change.", category: "empowerment" },
  { text: "I am proud of myself for showing up today.", category: "self-compassion" },
  { text: "My feelings are valid and important.", category: "emotional" },
  { text: "I am exactly where I need to be right now.", category: "acceptance" },
  { text: "I choose to focus on what I can control.", category: "mindfulness" },
  { text: "I am stronger than I think.", category: "strength" },
  { text: "Today, I will be kind to myself.", category: "self-compassion" },
  { text: "I release what no longer serves me.", category: "letting-go" },
  { text: "I am capable of handling anything that comes my way.", category: "resilience" },
  { text: "My past does not define my future.", category: "growth" },
  { text: "I deserve to take up space.", category: "self-worth" },
  { text: "I trust my intuition.", category: "trust" },
  { text: "Rest is productive and necessary.", category: "self-care" },
  { text: "I am not my thoughts; I am the observer of my thoughts.", category: "mindfulness" },
  { text: "I give myself permission to feel all my emotions.", category: "emotional" },
  { text: "I am constantly growing and evolving.", category: "growth" },
  { text: "I attract positive energy and opportunities.", category: "optimism" },
  { text: "I am enough — exactly as I am.", category: "self-worth" },
  { text: "Every day is a new beginning.", category: "hope" },
  { text: "I choose peace over perfection.", category: "acceptance" },
  { text: "My voice matters.", category: "empowerment" },
  { text: "I am safe and protected.", category: "safety" },
  { text: "I forgive myself for past mistakes.", category: "forgiveness" },
  { text: "I am worthy of happiness.", category: "self-worth" },
]

export function useAffirmation() {
  const [affirmation, setAffirmation] = useState(null)
  const [favorites, setFavorites] = useState(() => 
    JSON.parse(localStorage.getItem('favoriteAffirmations') || '[]')
  )

  useEffect(() => {
    // Get today's affirmation based on date (same for all users on same day)
    const today = new Date().toDateString()
    const saved = localStorage.getItem('dailyAffirmation')
    
    if (saved && JSON.parse(saved).date === today) {
      setAffirmation(JSON.parse(saved).affirmation)
    } else {
      // Use date to pick a deterministic affirmation
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
      const newAffirmation = AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length]
      setAffirmation(newAffirmation)
      localStorage.setItem('dailyAffirmation', JSON.stringify({ date: today, affirmation: newAffirmation }))
    }
  }, [])

  const toggleFavorite = (affirmationText) => {
    let newFavorites
    if (favorites.includes(affirmationText)) {
      newFavorites = favorites.filter(f => f !== affirmationText)
    } else {
      newFavorites = [...favorites, affirmationText]
    }
    setFavorites(newFavorites)
    localStorage.setItem('favoriteAffirmations', JSON.stringify(newFavorites))
  }

  const getRandomAffirmation = () => {
    return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]
  }

  return { affirmation, favorites, toggleFavorite, getRandomAffirmation, allAffirmations: AFFIRMATIONS }
}