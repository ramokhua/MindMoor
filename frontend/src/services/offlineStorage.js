import { addToSyncQueue, SYNC_TYPES } from '../utils/syncQueue'

// Save mood with offline support
export function saveMoodOffline(moodEntry) {
  try {
    const existing = JSON.parse(localStorage.getItem('moodHistory') || '[]')
    const updated = [moodEntry, ...existing]
    localStorage.setItem('moodHistory', JSON.stringify(updated))
    
    // Add to sync queue if offline
    if (!navigator.onLine) {
      addToSyncQueue(SYNC_TYPES.MOOD, moodEntry)
    }
    
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to save mood offline:', error)
    return { success: false, error: error.message }
  }
}

// Save journal entry with offline support
export function saveJournalOffline(journalEntry) {
  try {
    const existing = JSON.parse(localStorage.getItem('journal') || '[]')
    const updated = [journalEntry, ...existing]
    localStorage.setItem('journal', JSON.stringify(updated))
    
    if (!navigator.onLine) {
      addToSyncQueue(SYNC_TYPES.JOURNAL, journalEntry)
    }
    
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to save journal offline:', error)
    return { success: false, error: error.message }
  }
}

// Save breathing session with offline support
export function saveBreathingOffline(sessionData) {
  try {
    const current = parseInt(localStorage.getItem('breathingSessions') || '0')
    const updated = current + 1
    localStorage.setItem('breathingSessions', updated.toString())
    
    if (!navigator.onLine) {
      addToSyncQueue(SYNC_TYPES.BREATHING, { count: updated, ...sessionData })
    }
    
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to save breathing session offline:', error)
    return { success: false, error: error.message }
  }
}

// Get stored data (works offline)
export function getAllData() {
  return {
    moodHistory: JSON.parse(localStorage.getItem('moodHistory') || '[]'),
    journal: JSON.parse(localStorage.getItem('journal') || '[]'),
    breathingSessions: parseInt(localStorage.getItem('breathingSessions') || '0'),
    streak: parseInt(localStorage.getItem('streak') || '0'),
    earnedBadges: JSON.parse(localStorage.getItem('earnedBadges') || '[]'),
    userXP: parseInt(localStorage.getItem('userXP') || '0')
  }
}