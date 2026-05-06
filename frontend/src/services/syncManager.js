import { getSyncQueue, removeFromSyncQueue, incrementRetry, clearSyncQueue } from '../utils/syncQueue'

let isSyncing = false

// Simulate API call - replace with actual backend endpoint
async function syncToServer(item) {
  // This would be a real API call in production
  console.log(`Syncing ${item.type}:`, item.data)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simulate occasional failure for retry testing
  if (Math.random() < 0.1) {
    throw new Error('Simulated network error')
  }
  
  return { success: true }
}

// Process sync queue
export async function processSyncQueue() {
  if (!navigator.onLine || isSyncing) return
  
  const queue = getSyncQueue()
  if (queue.length === 0) return
  
  isSyncing = true
  console.log(`Processing ${queue.length} items...`)
  
  for (const item of queue) {
    try {
      await syncToServer(item)
      removeFromSyncQueue(item.id)
      console.log(`Synced: ${item.type} (${item.id})`)
    } catch (error) {
      console.error(`Failed to sync ${item.type}:`, error)
      incrementRetry(item.id)
      
      // Remove if retried too many times
      if (item.retryCount >= 5) {
        console.warn(`Removing failed item after 5 retries:`, item.id)
        removeFromSyncQueue(item.id)
      }
    }
  }
  
  isSyncing = false
  
  // Dispatch event for UI updates
  window.dispatchEvent(new Event('sync-complete'))
}

// Manual sync trigger
export function manualSync() {
  if (navigator.onLine) {
    processSyncQueue()
  }
}

// Setup auto-sync listeners
export function setupAutoSync() {
  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('Back online, syncing...')
    processSyncQueue()
  })
  
  // Manual sync event
  window.addEventListener('manual-sync', () => {
    manualSync()
  })
  
  // Periodic sync (every 5 minutes)
  setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue()
    }
  }, 5 * 60 * 1000)
  
  // Initial sync
  processSyncQueue()
}