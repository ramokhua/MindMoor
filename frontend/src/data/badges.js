export const BADGES = [
  // Journaling Badges
  { id: 'journal_first', name: 'First Words', description: 'Wrote your first journal entry', icon: '📝', category: 'journal', requirement: { type: 'journal_count', value: 1 } },
  { id: 'journal_5', name: 'Consistent Writer', description: 'Wrote 5 journal entries', icon: '📖', category: 'journal', requirement: { type: 'journal_count', value: 5 } },
  { id: 'journal_25', name: 'Dedicated Author', description: 'Wrote 25 journal entries', icon: '📚', category: 'journal', requirement: { type: 'journal_count', value: 25 } },
  { id: 'journal_100', name: 'Master Scribe', description: 'Wrote 100 journal entries', icon: '🏆', category: 'journal', requirement: { type: 'journal_count', value: 100 } },
  
  // Mood Tracking Badges
  { id: 'mood_first', name: 'Mood Tracker', description: 'Logged your first mood', icon: '😊', category: 'mood', requirement: { type: 'mood_count', value: 1 } },
  { id: 'mood_7', name: 'Week of Awareness', description: 'Logged mood for 7 days', icon: '📊', category: 'mood', requirement: { type: 'mood_count', value: 7 } },
  { id: 'mood_30', name: 'Month of Mindfulness', description: 'Logged mood for 30 days', icon: '🌟', category: 'mood', requirement: { type: 'mood_count', value: 30 } },
  { id: 'mood_all', name: 'Emotion Explorer', description: 'Logged all 6 mood types', icon: '🌈', category: 'mood', requirement: { type: 'mood_variety', value: 6 } },
  
  // Streak Badges
  { id: 'streak_3', name: 'Getting Started', description: 'Maintained a 3-day streak', icon: '🔥', category: 'streak', requirement: { type: 'streak', value: 3 } },
  { id: 'streak_7', name: 'One Week Strong', description: 'Maintained a 7-day streak', icon: '⚡', category: 'streak', requirement: { type: 'streak', value: 7 } },
  { id: 'streak_30', name: 'Monthly Champion', description: 'Maintained a 30-day streak', icon: '🏅', category: 'streak', requirement: { type: 'streak', value: 30 } },
  
  // Breathing Badges
  { id: 'breath_first', name: 'First Breath', description: 'Completed first breathing session', icon: '🌬️', category: 'breathing', requirement: { type: 'breathing_count', value: 1 } },
  { id: 'breath_10', name: 'Calm Seeker', description: 'Completed 10 breathing sessions', icon: '🍃', category: 'breathing', requirement: { type: 'breathing_count', value: 10 } },
  { id: 'breath_50', name: 'Zen Master', description: 'Completed 50 breathing sessions', icon: '🧘', category: 'breathing', requirement: { type: 'breathing_count', value: 50 } },
  
  // Quiz Badges
  { id: 'quiz_first', name: 'Self-Aware', description: 'Completed your first self-assessment', icon: '📋', category: 'quiz', requirement: { type: 'quiz_count', value: 1 } },
  { id: 'quiz_both', name: 'Health Check', description: 'Completed both PHQ-9 and GAD-7', icon: '💪', category: 'quiz', requirement: { type: 'quiz_complete_both', value: true } },
  
  // Affirmation Badges
  { id: 'affirmation_first', name: 'Positive Mindset', description: 'Saved your first affirmation', icon: '✨', category: 'affirmation', requirement: { type: 'affirmation_count', value: 1 } },
  { id: 'affirmation_10', name: 'Optimist', description: 'Saved 10 affirmations', icon: '⭐', category: 'affirmation', requirement: { type: 'affirmation_count', value: 10 } },
  
  // Master Badge
  { id: 'master', name: 'MindMoor Master', description: 'Earned 10+ badges', icon: '👑', category: 'master', requirement: { type: 'total_badges', value: 10 } }
]

export function checkBadgeEarned(badge, userStats) {
  switch (badge.requirement.type) {
    case 'journal_count':
      return userStats.journalCount >= badge.requirement.value
    case 'mood_count':
      return userStats.moodCount >= badge.requirement.value
    case 'mood_variety':
      return userStats.uniqueMoods >= badge.requirement.value
    case 'streak':
      return userStats.currentStreak >= badge.requirement.value
    case 'breathing_count':
      return userStats.breathingCount >= badge.requirement.value
    case 'quiz_count':
      return userStats.quizCount >= badge.requirement.value
    case 'quiz_complete_both':
      return userStats.quizBothComplete
    case 'affirmation_count':
      return userStats.affirmationCount >= badge.requirement.value
    case 'total_badges':
      return userStats.earnedBadges >= badge.requirement.value
    default:
      return false
  }
}