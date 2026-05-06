export const LEVELS = [
  { level: 1, minXP: 0, title: 'Newcomer', color: '#a6dcef' },
  { level: 2, minXP: 100, title: 'Seeker', color: '#5d93a6' },
  { level: 3, minXP: 250, title: 'Explorer', color: '#4a7a8a' },
  { level: 4, minXP: 500, title: 'Learner', color: '#3d6e82' },
  { level: 5, minXP: 1000, title: 'Practitioner', color: '#2a4e68' },
  { level: 6, minXP: 2000, title: 'Dedicated', color: '#1a3548' },
  { level: 7, minXP: 3500, title: 'Resilient', color: '#9b89b4' },
  { level: 8, minXP: 5500, title: 'Master', color: '#ff9e7d' },
  { level: 9, minXP: 8000, title: 'Sage', color: '#e07a55' },
  { level: 10, minXP: 12000, title: 'MindMoor Legend', color: '#f6c90e' }
]

export const XP_REWARDS = {
  JOURNAL_ENTRY: 10,
  MOOD_LOG: 5,
  BREATHING_SESSION: 15,
  QUIZ_COMPLETE: 25,
  DAILY_STREAK_BONUS: 50,
  SAVE_AFFIRMATION: 2,
  BADGE_EARNED: 100
}

export function calculateLevel(xp) {
  let level = LEVELS[0]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      level = LEVELS[i]
      break
    }
  }
  const nextLevel = LEVELS[Math.min(level.level, LEVELS.length - 1)]
  const xpForNext = nextLevel.minXP - xp
  const xpNeeded = nextLevel.minXP - level.minXP
  const progress = ((xp - level.minXP) / xpNeeded) * 100
  
  return { ...level, progress, xpForNext, xpNeeded }
}