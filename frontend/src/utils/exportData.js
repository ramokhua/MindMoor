export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    appVersion: '1.0.0',
    moodHistory: JSON.parse(localStorage.getItem('moodHistory') || '[]'),
    journalEntries: JSON.parse(localStorage.getItem('journal') || '[]'),
    streak: {
      current: parseInt(localStorage.getItem('streak') || '0'),
      best: parseInt(localStorage.getItem('bestStreak') || '0'),
      lastActivity: localStorage.getItem('lastActivity')
    },
    breathingSessions: parseInt(localStorage.getItem('breathingSessions') || '0'),
    settings: {
      theme: localStorage.getItem('theme') || 'light',
      journalWordGoal: parseInt(localStorage.getItem('journalWordGoal') || '100')
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mindmoor-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  return data
}

export function importData(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    
    if (data.moodHistory) localStorage.setItem('moodHistory', JSON.stringify(data.moodHistory))
    if (data.journalEntries) localStorage.setItem('journal', JSON.stringify(data.journalEntries))
    if (data.streak) {
      localStorage.setItem('streak', data.streak.current.toString())
      localStorage.setItem('bestStreak', data.streak.best.toString())
      if (data.streak.lastActivity) localStorage.setItem('lastActivity', data.streak.lastActivity)
    }
    if (data.breathingSessions) localStorage.setItem('breathingSessions', data.breathingSessions.toString())
    if (data.settings) {
      if (data.settings.theme) localStorage.setItem('theme', data.settings.theme)
      if (data.settings.journalWordGoal) localStorage.setItem('journalWordGoal', data.settings.journalWordGoal.toString())
    }
    
    return { success: true, message: 'Data imported successfully!' }
  } catch (error) {
    return { success: false, message: 'Invalid data file' }
  }
}