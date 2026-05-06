import { useState, useEffect } from 'react'
import { BADGES, checkBadgeEarned } from '../data/badges'
import { XP_REWARDS, calculateLevel } from '../data/levels'

export function useGamification() {
  const [xp, setXP] = useState(() => parseInt(localStorage.getItem('userXP') || '0'))
  const [earnedBadges, setEarnedBadges] = useState(() => 
    JSON.parse(localStorage.getItem('earnedBadges') || '[]')
  )
  const [recentBadge, setRecentBadge] = useState(null)
  const [levelUp, setLevelUp] = useState(null)

  const levelData = calculateLevel(xp)

  const addXP = (amount, source) => {
    const newXP = xp + amount
    setXP(newXP)
    localStorage.setItem('userXP', newXP.toString())
    
    const newLevel = calculateLevel(newXP)
    if (newLevel.level > levelData.level) {
      setLevelUp(newLevel)
      setTimeout(() => setLevelUp(null), 5000)
    }
    
    return newXP
  }

  const checkAndAwardBadges = (userStats) => {
    const newBadges = []
    for (const badge of BADGES) {
      if (!earnedBadges.includes(badge.id) && checkBadgeEarned(badge, userStats)) {
        newBadges.push(badge.id)
        setRecentBadge(badge)
        addXP(XP_REWARDS.BADGE_EARNED, `badge:${badge.id}`)
        setTimeout(() => setRecentBadge(null), 5000)
      }
    }
    
    if (newBadges.length > 0) {
      const updated = [...earnedBadges, ...newBadges]
      setEarnedBadges(updated)
      localStorage.setItem('earnedBadges', JSON.stringify(updated))
    }
    
    return newBadges
  }

  const getUserStats = () => {
    const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]')
    const journals = JSON.parse(localStorage.getItem('journal') || '[]')
    const breathing = parseInt(localStorage.getItem('breathingSessions') || '0')
    const quizzes = JSON.parse(localStorage.getItem('quizHistory') || '[]')
    const affirmations = JSON.parse(localStorage.getItem('favoriteAffirmations') || '[]')
    const streak = parseInt(localStorage.getItem('streak') || '0')
    
    const uniqueMoods = new Set(moods.map(m => m.key)).size
    const quizBothComplete = quizzes.some(q => q.quiz === 'PHQ-9 (Depression)') && 
                              quizzes.some(q => q.quiz === 'GAD-7 (Anxiety)')
    
    return {
      journalCount: journals.length,
      moodCount: moods.length,
      uniqueMoods,
      currentStreak: streak,
      breathingCount: breathing,
      quizCount: quizzes.length,
      quizBothComplete,
      affirmationCount: affirmations.length,
      earnedBadges: earnedBadges.length
    }
  }

  const syncAndCheck = () => {
    const stats = getUserStats()
    const newBadges = checkAndAwardBadges(stats)
    return { stats, newBadges }
  }

  const recordAction = (action, extraXP = 0) => {
    let xpGain = 0
    switch (action) {
      case 'journal':
        xpGain = XP_REWARDS.JOURNAL_ENTRY
        break
      case 'mood':
        xpGain = XP_REWARDS.MOOD_LOG
        break
      case 'breathing':
        xpGain = XP_REWARDS.BREATHING_SESSION
        break
      case 'quiz':
        xpGain = XP_REWARDS.QUIZ_COMPLETE
        break
      case 'affirmation':
        xpGain = XP_REWARDS.SAVE_AFFIRMATION
        break
    }
    xpGain += extraXP
    addXP(xpGain, action)
    return syncAndCheck()
  }

  return {
    xp,
    level: levelData,
    earnedBadges,
    recentBadge,
    levelUp,
    recordAction,
    syncAndCheck,
    getUserStats,
    allBadges: BADGES
  }
}