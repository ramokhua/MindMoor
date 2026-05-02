import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
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
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem('moodHistory') || '[]')
  )
  const [selected, setSelected] = useState(null)
  const [tip, setTip] = useState('')

  const logMood = (mood) => {
    const entry = { date: new Date().toISOString(), ...mood }
    const updated = [...history, entry]
    setHistory(updated)
    localStorage.setItem('moodHistory', JSON.stringify(updated))
    setSelected(mood.key)
    setTip(TIPS[mood.key])
  }

  const clearHistory = () => {
    if (window.confirm('Clear all mood history?')) {
      setHistory([])
      localStorage.removeItem('moodHistory')
      setSelected(null)
      setTip('')
    }
  }

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const recent = history.slice(-14)
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
              className={`mood-btn ${selected === mood.key ? 'selected' : ''}`}
              style={{ '--mood-color': mood.color }}
              onClick={() => logMood(mood)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>

        {tip && (
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
            <button className="btn btn-ghost" onClick={clearHistory}>Clear History</button>
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
          {[
            'Identify emotional triggers and patterns',
            'Recognise improvements over time',
            'Communicate better with healthcare providers',
            'Develop personalised coping strategies',
          ].map(tip => <li key={tip}>{tip}</li>)}
        </ul>
      </div>
    </div>
  )
}