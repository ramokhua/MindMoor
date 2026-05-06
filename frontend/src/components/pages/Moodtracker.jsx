import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { useToast } from '../../hooks/useToast'
import './MoodTracker.css'

Chart.register(...registerables)

const MOODS = [
  { key: 'happy',    label: 'Happy',    emoji: '😊', value: 5, color: '#f6c90e' },
  { key: 'calm',     label: 'Calm',     emoji: '😌', value: 4, color: '#5d93a6' },
  { key: 'anxious',  label: 'Anxious',  emoji: '😰', value: 2, color: '#ff9e7d' },
  { key: 'sad',      label: 'Sad',      emoji: '😢', value: 1, color: '#7b9ccf' },
  { key: 'angry',    label: 'Angry',    emoji: '😠', value: 2, color: '#e07a55' },
  { key: 'confused', label: 'Confused', emoji: '😕', value: 3, color: '#9b89b4' },
]

const TIPS = {
  happy:    "Wonderful! Consider journaling what's making you feel this way.",
  calm:     "That's a great state to be in. Use this energy for something creative.",
  anxious:  "Try a breathing exercise to ground yourself.",
  sad:      "It's okay to feel sad. Be gentle with yourself today.",
  angry:    "Take slow deep breaths. Count to 10 before responding to anything.",
  confused: "Jot down what's on your mind — it often helps to clarify things.",
}

export default function MoodTracker() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const { addToast } = useToast()
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem('moodHistory') || '[]')
  )
  const [selected, setSelected] = useState(null)
  const [tip, setTip] = useState('')
  const [note, setNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [pendingMood, setPendingMood] = useState(null)

  const logMood = (mood, moodNote = null) => {
    const entry = { 
      date: new Date().toISOString(), 
      ...mood, 
      note: moodNote || note.trim() || null 
    }
    const updated = [...history, entry]
    setHistory(updated)
    localStorage.setItem('moodHistory', JSON.stringify(updated))
    setSelected(mood.key)
    setTip(TIPS[mood.key])
    setNote('')
    setShowNoteInput(false)
    setPendingMood(null)
    addToast(`Mood logged: ${mood.label}`, 'success')
  }

  const handleMoodClick = (mood) => {
    setPendingMood(mood)
    setShowNoteInput(true)
  }

  const exportToCSV = () => {
    if (history.length === 0) {
      addToast('No mood data to export', 'info')
      return
    }
    const headers = ['Date', 'Mood', 'Value', 'Note']
    const rows = history.map(entry => [
      new Date(entry.date).toLocaleString(),
      entry.label,
      entry.value,
      (entry.note || '').replace(/,/g, ';')
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindmoor-mood-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Exported to CSV ✓', 'success')
  }

  const clearHistory = () => {
    if (window.confirm('Clear all mood history? This cannot be undone.')) {
      setHistory([])
      localStorage.removeItem('moodHistory')
      setSelected(null)
      setTip('')
      setShowNoteInput(false)
      setPendingMood(null)
      addToast('Mood history cleared', 'info')
    }
  }

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const recent = history.slice(-14)
    if (recent.length < 2) return

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: recent.map(e => new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Mood Level',
          data: recent.map(e => e.value),
          borderColor: '#5d93a6',
          backgroundColor: 'rgba(93,147,166,0.1)',
          pointBackgroundColor: recent.map(e => e.color),
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.35,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 0, max: 6,
            ticks: { callback: v => ['', 'Low', 'Low-Mid', 'Mid', 'Good', 'Great', ''][v] },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          x: { grid: { display: false } }
        }
      }
    })

    return () => chartInstance.current?.destroy()
  }, [history])

  return (
    <div className="page-container mood-page">
      <h1 className="page-title">Mood Tracker</h1>
      <p className="page-subtitle">Log your mood daily to reveal emotional patterns over time.</p>

      {/* Mood buttons */}
      <div className="card mood-picker">
        <h2>How are you feeling right now?</h2>
        <div className="mood-grid">
          {MOODS.map(mood => (
            <button
              key={mood.key}
              className={`mood-btn ${selected === mood.key && !showNoteInput ? 'selected' : ''}`}
              style={{ '--mood-color': mood.color }}
              onClick={() => handleMoodClick(mood)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>

        {showNoteInput && pendingMood && (
          <div className="mt-2 fade-up">
            <textarea
              className="input"
              placeholder="Add a note (optional)... What's on your mind?"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="flex gap-1 mt-1">
              <button className="btn btn-ghost" onClick={() => {
                setShowNoteInput(false)
                setNote('')
                setPendingMood(null)
              }}>
                Skip
              </button>
              <button className="btn btn-primary" onClick={() => logMood(pendingMood)}>
                Save with note
              </button>
            </div>
          </div>
        )}

        {tip && !showNoteInput && (
          <div className="mood-tip fade-up">
            <span>💡</span> {tip}
          </div>
        )}
      </div>

      {/* Chart */}
      {history.length > 1 && (
        <div className="card mt-3 mood-chart-card">
          <div className="chart-header">
            <h2>Your Mood Trend</h2>
            <div className="flex gap-1">
              <button className="btn btn-ghost" onClick={exportToCSV}>📥 Export CSV</button>
              <button className="btn btn-ghost" onClick={clearHistory}>Clear History</button>
            </div>
          </div>
          <canvas ref={chartRef} />
        </div>
      )}

      {/* History list */}
      {history.length > 0 && (
        <div className="card mt-3">
          <h2>Recent Entries</h2>
          <ul className="mood-history-list">
            {[...history].reverse().slice(0, 10).map((entry, i) => {
              const mood = MOODS.find(m => m.key === entry.key)
              return (
                <li key={i} className="mood-history-item">
                  <span className="history-emoji">{mood?.emoji || '•'}</span>
                  <span className="history-label">{entry.label || entry.key}</span>
                  {entry.note && <span className="history-note text-muted">📝 {entry.note.substring(0, 30)}</span>}
                  <span className="history-date text-muted">
                    {new Date(entry.date).toLocaleString()}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Tips section */}
      <div className="card mt-3 mood-tips">
        <h3>Why Track Your Mood?</h3>
        <ul>
          <li>Identify emotional triggers and patterns</li>
          <li>Recognise improvements over time</li>
          <li>Communicate better with healthcare providers</li>
          <li>Develop personalised coping strategies</li>
        </ul>
      </div>
    </div>
  )
}