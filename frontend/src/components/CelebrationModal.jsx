import { useEffect } from 'react'
import './CelebrationModal.css'

const CELEBRATION_MESSAGES = {
  3: { title: '🔥 3 Day Streak!', message: 'You\'re building a great habit! Keep going!', emoji: '🎉' },
  5: { title: '🌟 5 Day Streak!', message: 'Amazing consistency! You\'re doing great!', emoji: '⭐' },
  7: { title: '💪 1 Week Streak!', message: '7 days of self-care! You should be proud!', emoji: '🏆' },
  14: { title: '✨ 2 Weeks!', message: '14 days of showing up for yourself. Incredible!', emoji: '🌈' },
  21: { title: '🚀 3 Weeks!', message: 'You\'ve built an unshakeable habit!', emoji: '🚀' },
  30: { title: '🏅 30 Days!', message: 'One month of consistency. You\'re unstoppable!', emoji: '🏅' },
}

export default function CelebrationModal({ streak, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const celebration = CELEBRATION_MESSAGES[streak] || 
    (streak % 7 === 0 ? { 
      title: `🎯 ${streak} Day Streak!`, 
      message: `${streak} days of showing up for yourself!`, 
      emoji: '🎯' 
    } : null)

  if (!celebration) return null

  return (
    <div className="celebration-overlay" onClick={onClose}>
      <div className="celebration-modal fade-up">
        <div className="celebration-emoji">{celebration.emoji}</div>
        <h2>{celebration.title}</h2>
        <p>{celebration.message}</p>
        <button className="btn btn-primary" onClick={onClose}>Continue →</button>
      </div>
    </div>
  )
}