import { useState, useEffect } from 'react'
import { getQueueSize } from '../utils/syncQueue'

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const updateQueueCount = () => {
      setPendingSyncCount(getQueueSize())
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Check queue count periodically
    const interval = setInterval(updateQueueCount, 1000)
    updateQueueCount()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, pendingSyncCount }
}