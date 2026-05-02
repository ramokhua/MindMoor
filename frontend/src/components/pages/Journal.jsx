import { useState, useEffect } from 'react'
import './Journal.css'

export default function Journal() {
  const [entries, setEntries] = useState(() =>
    JSON.parse(localStorage.getItem('journal') || '[]')
  )
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)

  const saveEntry = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const entry = { id: Date.now(), date: new Date().toISOString(), text: text.trim() }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('journal', JSON.stringify(updated))
    setText('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    localStorage.setItem('journal', JSON.stringify(updated))
  }

  const filtered = entries.filter(e =>
    e.text.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container journal-page">
      <h1 className="page-title">Journal</h1>
      <p className="page-subtitle">Your private space to reflect, process, and grow.</p>

      {/* Write */}
      <form className="card journal-form" onSubmit={saveEntry}>
        <h2>New Entry</h2>
        <textarea
          className="input journal-textarea"
          placeholder="What's on your mind today…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
        />
        <div className="journal-actions">
          <span className="char-count text-muted">{text.length} characters</span>
          <div className="flex gap-1">
            <button type="button" className="btn btn-ghost" onClick={() => setText('')}>Clear</button>
            <button type="submit" className="btn btn-primary">
              {saved ? '✓ Saved!' : 'Save Entry'}
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
            <p>Your journal is empty. Write your first entry above.</p>
          </div>
        )}
        {filtered.map(entry => (
          <div key={entry.id} className="journal-entry card fade-up">
            <div className="entry-header">
              <time className="entry-date text-muted">
                {new Date(entry.date).toLocaleString('en', {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </time>
              <button
                className="delete-btn"
                onClick={() => {
                  if (window.confirm('Delete this entry?')) deleteEntry(entry.id)
                }}
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