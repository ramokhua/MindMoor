import { useState, useEffect } from 'react'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { getSyncQueue, clearSyncQueue } from '../utils/syncQueue'
import './ConnectionStatus.css'

export default function ConnectionStatus() {
  const { isOnline, pendingSyncCount } = useConnectionStatus()
  const [showDetails, setShowDetails] = useState(false)

  if (isOnline && pendingSyncCount === 0) return null

  return (
    <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
      <div className="connection-indicator" onClick={() => setShowDetails(!showDetails)}>
        <span className="connection-icon" aria-hidden="true">
          {isOnline ? '📡' : '📴'}
        </span>
        <span className="connection-text">
          {isOnline ? `${pendingSyncCount} pending sync` : 'Offline Mode'}
        </span>
      </div>
      
      {showDetails && (
        <div className="connection-details card">
          {isOnline ? (
            <>
              <p>✓ Connected to internet</p>
              <p>📤 {pendingSyncCount} items waiting to sync</p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => window.dispatchEvent(new Event('manual-sync'))}
              >
                Sync Now
              </button>
            </>
          ) : (
            <>
              <p>⚠️ You are offline</p>
              <p>💾 Your data is being saved locally</p>
              <p>🔄 Will sync automatically when connection returns</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}