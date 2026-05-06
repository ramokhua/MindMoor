import { useState, useEffect } from 'react'
import { useToast } from '../../hooks/useToast'
import { exportAllData, importData } from '../../utils/exportData'
import './Privacy.css'

export default function Privacy() {
  const { addToast } = useToast()
  const [dataSize, setDataSize] = useState(0)
  const [dataCounts, setDataCounts] = useState({
    moods: 0,
    journals: 0,
    streak: 0,
    breathing: 0
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    calculateDataStats()
  }, [])

  const calculateDataStats = () => {
    const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]')
    const journals = JSON.parse(localStorage.getItem('journal') || '[]')
    const streak = parseInt(localStorage.getItem('streak') || '0')
    const breathing = parseInt(localStorage.getItem('breathingSessions') || '0')
    
    setDataCounts({ moods: moods.length, journals: journals.length, streak, breathing })
    
    const exportData = exportAllData()
    const jsonStr = JSON.stringify(exportData)
    setDataSize((jsonStr.length / 1024).toFixed(1))
  }

  const handleExport = () => {
    exportAllData()
    addToast('Data exported successfully!', 'success')
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = importData(e.target.result)
      if (result.success) {
        addToast(result.message, 'success')
        calculateDataStats()
        window.location.reload()
      } else {
        addToast(result.message, 'error')
      }
    }
    reader.readAsText(file)
  }

  const handleDeleteAll = () => {
    localStorage.clear()
    addToast('All data deleted. Redirecting to home...', 'info')
    setTimeout(() => {
      window.location.href = '/'
    }, 1500)
  }

  return (
    <div className="page-container privacy-page">
      <h1 className="page-title">Privacy Dashboard</h1>
      <p className="page-subtitle">Your data, your control. See what's stored and manage your privacy.</p>

      {/* Data Summary */}
      <div className="card">
        <h2>📊 Your Data Summary</h2>
        <div className="data-summary">
          <div className="data-item">
            <span className="data-label">Mood Entries:</span>
            <span className="data-value">{dataCounts.moods}</span>
          </div>
          <div className="data-item">
            <span className="data-label">Journal Entries:</span>
            <span className="data-value">{dataCounts.journals}</span>
          </div>
          <div className="data-item">
            <span className="data-label">Current Streak:</span>
            <span className="data-value">{dataCounts.streak} days</span>
          </div>
          <div className="data-item">
            <span className="data-label">Breathing Sessions:</span>
            <span className="data-value">{dataCounts.breathing}</span>
          </div>
          <div className="data-item">
            <span className="data-label">Total Storage:</span>
            <span className="data-value">{dataSize} KB</span>
          </div>
        </div>
      </div>

      {/* Privacy Promise */}
      <div className="card privacy-promise">
        <h2>🔒 Our Privacy Promise</h2>
        <ul>
          <li>✓ Your data never leaves your device</li>
          <li>✓ No tracking, no analytics, no third parties</li>
          <li>✓ You can export or delete all your data anytime</li>
          <li>✓ No account required — you stay anonymous</li>
          <li>✓ Open source — everything is verifiable</li>
        </ul>
      </div>

      {/* Data Actions */}
      <div className="card">
        <h2>📁 Data Management</h2>
        
        <div className="action-group">
          <h3>Export Your Data</h3>
          <p className="text-muted">Download all your data as a JSON file. Keep a backup or transfer to another device.</p>
          <button className="btn btn-primary" onClick={handleExport}>
            📥 Export All Data
          </button>
        </div>

        <div className="action-group">
          <h3>Import Saved Data</h3>
          <p className="text-muted">Restore from a previously exported backup file.</p>
          <label className="btn btn-outline file-input-label">
            📂 Choose Backup File
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>

        <div className="action-group danger-zone">
          <h3>⚠️ Delete All Data</h3>
          <p className="text-muted">Permanently remove all your mood history, journal entries, and settings. This cannot be undone.</p>
          {!showDeleteConfirm ? (
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              🗑️ Delete All Data
            </button>
          ) : (
            <div className="confirm-box">
              <p>Are you absolutely sure? This action is permanent.</p>
              <div className="flex gap-1">
                <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteAll}>Yes, Delete Everything</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About Data Storage */}
      <div className="card">
        <h2>💾 How Your Data Is Stored</h2>
        <p>MindMoor uses your browser's local storage to save data. This means:</p>
        <ul>
          <li>📱 Data stays on your device — never uploaded to any server</li>
          <li>🌐 Works offline — no internet connection needed</li>
          <li>🔐 No account needed — complete anonymity</li>
          <li>⚠️ Clearing browser cache will remove your data — export a backup!</li>
        </ul>
      </div>
    </div>
  )
}