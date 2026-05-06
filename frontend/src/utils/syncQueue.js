const SYNC_QUEUE_KEY = 'offlineSyncQueue'

export const SYNC_TYPES = {
  MOOD: 'mood',
  JOURNAL: 'journal',
  BREATHING: 'breathing'
}

// Add operation to sync queue
export function addToSyncQueue(type, data, timestamp = new Date().toISOString()) {
  const queue = getSyncQueue()
  queue.push({
    id: Date.now(),
    type,
    data,
    timestamp,
    retryCount: 0
  })
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  console.log(`Added to sync queue: ${type}`)
}

// Get all pending sync operations
export function getSyncQueue() {
  return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]')
}

// Remove operation from queue
export function removeFromSyncQueue(id) {
  const queue = getSyncQueue()
  const updated = queue.filter(item => item.id !== id)
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated))
}

// Clear entire sync queue
export function clearSyncQueue() {
  localStorage.removeItem(SYNC_QUEUE_KEY)
}

// Get queue size
export function getQueueSize() {
  return getSyncQueue().length
}

// Increment retry count for failed sync
export function incrementRetry(id) {
  const queue = getSyncQueue()
  const item = queue.find(i => i.id === id)
  if (item) {
    item.retryCount++
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  }
}