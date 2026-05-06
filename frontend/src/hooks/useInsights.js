import { useState, useEffect } from 'react'

export function useInsights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateInsights()
  }, [])

  const generateInsights = () => {
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]')
    const journalEntries = JSON.parse(localStorage.getItem('journal') || '[]')
    const newInsights = []

    // Mood trend insight
    if (moodHistory.length >= 7) {
      const lastWeek = moodHistory.slice(-7)
      const weekBefore = moodHistory.slice(-14, -7)
      const avgLastWeek = lastWeek.reduce((a, b) => a + b.value, 0) / 7
      const avgWeekBefore = weekBefore.length ? weekBefore.reduce((a, b) => a + b.value, 0) / 7 : avgLastWeek
      
      if (avgLastWeek > avgWeekBefore + 0.5) {
        newInsights.push({
          id: 'mood_improving',
          type: 'positive',
          icon: '📈',
          title: 'Mood is improving!',
          message: `Your average mood this week (${avgLastWeek.toFixed(1)}/5) is up from last week (${avgWeekBefore.toFixed(1)}/5). Keep up the great work!`
        })
      } else if (avgLastWeek < avgWeekBefore - 0.5) {
        newInsights.push({
          id: 'mood_declining',
          type: 'warning',
          icon: '📉',
          title: 'Mood trend alert',
          message: `Your mood has decreased this week. Consider trying breathing exercises or journaling more often.`
        })
      }
    }

    // Journal activity insight
    if (journalEntries.length >= 5) {
      const recentEntries = journalEntries.slice(0, 7)
      const avgWordCount = recentEntries.reduce((a, b) => a + (b.wordCount || 0), 0) / recentEntries.length
      
      if (avgWordCount > 100) {
        newInsights.push({
          id: 'journal_streak',
          type: 'positive',
          icon: '✍️',
          title: 'You\'re writing consistently!',
          message: `You've been averaging ${Math.round(avgWordCount)} words per entry. This level of reflection is great for mental wellness.`
        })
      }
    }

    // Sleep correlation (if tracked via mood notes)
    const sleepPatterns = moodHistory.filter(e => e.note && e.note.toLowerCase().includes('sleep'))
    if (sleepPatterns.length >= 3) {
      const sleepMoodAvg = sleepPatterns.reduce((a, b) => a + b.value, 0) / sleepPatterns.length
      const overallAvg = moodHistory.reduce((a, b) => a + b.value, 0) / moodHistory.length
      
      if (sleepMoodAvg < overallAvg - 0.5) {
        newInsights.push({
          id: 'sleep_impact',
          type: 'info',
          icon: '😴',
          title: 'Sleep affects your mood',
          message: `You tend to report lower mood on days with sleep concerns. Try the breathing exercises before bed.`
        })
      }
    }

    // Breathing exercise impact
    const breathingSessions = parseInt(localStorage.getItem('breathingSessions') || '0')
    if (breathingSessions >= 3 && moodHistory.length >= 7) {
      newInsights.push({
        id: 'breathing_helpful',
        type: 'positive',
        icon: '🌬️',
        title: 'Breathing exercises helping!',
        message: `You've completed ${breathingSessions} breathing sessions. Regular practice can significantly reduce anxiety.`
      })
    }

    // Streak insight
    const streak = parseInt(localStorage.getItem('streak') || '0')
    if (streak >= 5) {
      newInsights.push({
        id: 'streak_proud',
        type: 'celebration',
        icon: '🎯',
        title: `${streak} day streak!`,
        message: `You've been consistent for ${streak} days. This habit of self-care makes a real difference.`
      })
    }

    setInsights(newInsights.slice(0, 3)) // Show top 3 insights
    setLoading(false)
  }

  return { insights, loading, refresh: generateInsights }
}