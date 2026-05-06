import { useState, useEffect } from 'react'
import { useToast } from '../../hooks/useToast'
import { useGamification } from '../../hooks/useGamification'
import { saveJournalOffline } from '../../services/offlineStorage'
import './Journal.css'

const GUIDED_PROMPTS = [
  "What went well today?",
  "What challenged you today?",
  "What are you grateful for?",
  "How are you feeling right now?",
  "What's on your mind?",
  "Describe a moment of peace today",
  "What would you tell your future self?",
  "What's one small win you had today?",
]

export default function Journal() {
  const { addToast } = useToast()
  const [entries, setEntries] = useState(() =>
    JSON.parse(localStorage.getItem('journal') || '[]')
  )
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [wordGoal, setWordGoal] = useState(() =>
    parseInt(localStorage.getItem('journalWordGoal') || '100')
  )
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState('')

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length
  const wordProgress = Math.min((wordCount / wordGoal) * 100, 100)

  const { recordAction, syncAndCheck } = useGamification()

  const saveEntry = (e) => {
    e.preventDefault()
    if (!text.trim()) {
      addToast('Please write something before saving', 'error')
      return
    }
    
    const entry = { 
      id: Date.now(), 
      date: new Date().toISOString(), 
      text: text.trim(),
      wordCount: wordCount,
      prompt: selectedPrompt || null
    }
    
    // Use offline storage
    const result = saveJournalOffline(entry)
    
    if (result.success) {
      setEntries(result.data)
      setText('')
      setSelectedPrompt('')
      recordAction('journal')
      syncAndCheck()
      addToast(`Entry saved! (${wordCount} words)`, 'success')
    } else {
      addToast('Failed to save entry. Please try again.', 'error')
    }
  }

  const deleteEntry = (id) => {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      const updated = entries.filter(e => e.id !== id)
      setEntries(updated)
      localStorage.setItem('journal', JSON.stringify(updated))
      addToast('Entry deleted', 'info')
    }
  }

  const usePrompt = (prompt) => {
    setSelectedPrompt(prompt)
    setText(prompt + '\n\n')
  }

  const updateWordGoal = () => {
    localStorage.setItem('journalWordGoal', wordGoal.toString())
    setShowGoalModal(false)
    addToast(`Word goal set to ${wordGoal} words`, 'success')
  }

  const filtered = entries.filter(e =>
    e.text.toLowerCase().includes(search.toLowerCase())
  )

  const wordCountColor = () => {
    if (wordCount >= wordGoal) return '#10b981'
    if (wordCount >= wordGoal * 0.7) return '#f6c90e'
    return 'var(--text-muted)'
  }

  return (
    <div className="page-container journal-page">
      <div className="journal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-subtitle">Your private space to reflect, process, and grow.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowGoalModal(true)}>
          🎯 Goal: {wordGoal} words
        </button>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)} style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ maxWidth: '300px', textAlign: 'center' }}>
            <h3>Daily Word Goal</h3>
            <input
              type="number"
              className="input"
              value={wordGoal}
              onChange={e => setWordGoal(Math.max(10, parseInt(e.target.value) || 50))}
              min="10"
              max="1000"
              step="10"
              style={{ textAlign: 'center', fontSize: '1.5rem', margin: '1rem 0' }}
            />
            <p className="text-muted">words per entry</p>
            <div className="flex gap-1" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowGoalModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateWordGoal}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Write */}
      <form className="card journal-form" onSubmit={saveEntry}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>New Entry</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {wordCount}/{wordGoal} words
            </span>
            <div style={{ 
              width: '60px', 
              height: '4px', 
              background: 'var(--border)', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${wordProgress}%`, 
                height: '100%', 
                background: wordCountColor(),
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>

        {/* Guided prompts */}
        <div className="prompts-row" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="text-muted" style={{ fontSize: '0.8rem', alignSelf: 'center' }}>✨ Try:</span>
          {GUIDED_PROMPTS.slice(0, 4).map(prompt => (
            <button
              key={prompt}
              type="button"
              className="prompt-chip"
              onClick={() => usePrompt(prompt)}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                background: 'var(--light)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {prompt}
            </button>
          ))}
          <details style={{ position: 'relative' }}>
            <summary style={{ 
              padding: '0.25rem 0.75rem', 
              borderRadius: '50px', 
              background: 'var(--light)', 
              border: '1px solid var(--border)', 
              fontSize: '0.75rem', 
              cursor: 'pointer',
              display: 'inline-block'
            }}>
              More prompts →
            </summary>
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '0.5rem',
              zIndex: 10,
              width: '200px'
            }}>
              {GUIDED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => usePrompt(prompt)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </details>
        </div>

        <textarea
          className="input journal-textarea"
          placeholder="What's on your mind today…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
        />
        
        <div className="journal-actions">
          <span className="char-count text-muted">{text.length} characters</span>
          <div className="flex gap-1">
            <button type="button" className="btn btn-ghost" onClick={() => {
              setText('')
              setSelectedPrompt('')
            }}>Clear</button>
            <button type="submit" className="btn btn-primary">
              Save Entry
            </button>
          </div>
        </div>
      </form>

      {/* Search */}
      {entries.length > 2 && (
        <div className="mt-2">
          <input
            className="input"
            placeholder="🔍 Search entries…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Entries */}
      <div className="journal-entries mt-3">
        {filtered.length === 0 && entries.length > 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No entries match your search.</p>
        )}
        {filtered.length === 0 && entries.length === 0 && (
          <div className="journal-empty card">
            <span>📝</span>
            <p>Your journal is empty. Try one of the prompts above!</p>
          </div>
        )}
        {filtered.map(entry => (
          <div key={entry.id} className="journal-entry card fade-up">
            <div className="entry-header">
              <div>
                <time className="entry-date text-muted">
                  {new Date(entry.date).toLocaleString('en', {
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </time>
                {entry.wordCount && (
                  <span className="entry-wordcount text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                    📝 {entry.wordCount} words
                  </span>
                )}
                {entry.prompt && (
                  <span className="entry-prompt text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontStyle: 'italic' }}>
                    via: "{entry.prompt.substring(0, 30)}"
                  </span>
                )}
              </div>
              <button
                className="delete-btn"
                onClick={() => deleteEntry(entry.id)}
                aria-label="Delete entry"
              >✕</button>
            </div>
            <p className="entry-text">{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}