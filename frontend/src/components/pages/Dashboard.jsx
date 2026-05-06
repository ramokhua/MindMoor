import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStreak } from '../../hooks/useStreak'
import { useInsights } from '../../hooks/useInsights'
import CelebrationModal from '../../components/CelebrationModal'

const MOODS = [
  { key: 'happy', label: 'Happy', emoji: '😊', value: 5 },
  { key: 'calm', label: 'Calm', emoji: '😌', value: 4 },
  { key: 'anxious', label: 'Anxious', emoji: '😰', value: 2 },
  { key: 'sad', label: 'Sad', emoji: '😢', value: 1 },
  { key: 'angry', label: 'Angry', emoji: '😠', value: 2 },
  { key: 'confused', label: 'Confused', emoji: '😕', value: 3 },
]

export default function Dashboard() {
  const [moodHistory, setMoodHistory] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [breathingSessions, setBreathingSessions] = useState(0)
  const { streak, bestStreak, updateStreak, showCelebration, resetCelebration } = useStreak()
  const { insights, refresh: refreshInsights } = useInsights()

  useEffect(() => {
    loadData()
    // Update streak when dashboard loads
    updateStreak()
  }, [])

  const loadData = () => {
    const savedMoods = localStorage.getItem('moodHistory')
    const savedJournals = localStorage.getItem('journal')
    const savedBreathing = localStorage.getItem('breathingSessions')
    
    if (savedMoods) setMoodHistory(JSON.parse(savedMoods))
    if (savedJournals) setJournalEntries(JSON.parse(savedJournals))
    if (savedBreathing) setBreathingSessions(parseInt(savedBreathing))
    
    refreshInsights()
  }

  const currentStreak = () => streak

  const avgMood = () => {
    if (moodHistory.length === 0) return 0
    const sum = moodHistory.slice(-30).reduce((acc, e) => acc + e.value, 0)
    return (sum / Math.min(moodHistory.length, 30)).toFixed(1)
  }

  const mostCommonMood = () => {
    if (moodHistory.length === 0) return 'None yet'
    const counts = moodHistory.reduce((acc, e) => {
      acc[e.key] = (acc[e.key] || 0) + 1
      return acc
    }, {})
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    const mood = MOODS.find(m => m.key === top[0])
    return mood ? `${mood.emoji} ${mood.label}` : top[0]
  }

  return (
    <div className="page-container">
      {showCelebration && (
        <CelebrationModal streak={streak} onClose={resetCelebration} />
      )}

      <h1 className="page-title">Your Progress Dashboard</h1>
      <p className="page-subtitle">Track your wellness journey at a glance</p>

      {/* Streak Cards */}
      <div className="grid-3 mt-3">
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--dark) 100%)', color: 'white' }}>
          <div style={{ fontSize: '2rem' }}>🔥</div>
          <h3 style={{ color: 'white' }}>{currentStreak()} Day Streak</h3>
          <p style={{ opacity: 0.8 }}>Current streak</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>🏆</div>
          <h3>{bestStreak} Days</h3>
          <p className="text-muted">Best streak</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>📊</div>
          <h3>{avgMood()}/5</h3>
          <p className="text-muted">30-day average mood</p>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="card mt-3" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', color: 'white' }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>✨ Insights for You</h2>
          {insights.map(insight => (
            <div key={insight.id} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
                <div>
                  <strong>{insight.title}</strong>
                  <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0', opacity: 0.9 }}>{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid-2 mt-3">
        <div className="card">
          <h2>📝 Journal Activity</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {journalEntries.length}
          </p>
          <p>Total entries</p>
          <div style={{ marginTop: '0.5rem' }}>
            {journalEntries.length >= 3 && <span className="text-muted">✓ Consistent writer</span>}
          </div>
          <Link to="/journal" className="btn btn-outline mt-2">Write New Entry →</Link>
        </div>

        <div className="card">
          <h2>🌬️ Breathing Sessions</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {breathingSessions}
          </p>
          <p>Sessions completed</p>
          <div style={{ marginTop: '0.5rem' }}>
            {breathingSessions >= 5 && <span className="text-muted">✓ Regular practitioner</span>}
          </div>
          <Link to="/breathing" className="btn btn-outline mt-2">Practice Now →</Link>
        </div>
      </div>

      {/* Recent Mood Entries */}
      <div className="card mt-3">
        <h2>📌 Recent Mood Entries</h2>
        {moodHistory.slice(-5).reverse().map((entry, i) => {
          const mood = MOODS.find(m => m.key === entry.key)
          return (
            <div key={i} className="mood-history-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span className="history-emoji">{mood?.emoji || '•'}</span>
              <span className="history-label" style={{ flex: 1 }}>{entry.label}</span>
              {entry.note && <span className="history-note text-muted" style={{ fontSize: '0.75rem', marginRight: '0.5rem' }}>📝</span>}
              <span className="history-date text-muted">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
          )
        })}
        {moodHistory.length === 0 && (
          <p className="text-muted">No mood entries yet. Start tracking!</p>
        )}
      </div>

      {/* Suggested Next Steps */}
      <div className="card mt-3">
        <h3>🎯 Suggested Next Steps</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          {journalEntries.length < 3 && <li>📝 Add a journal entry — writing helps process emotions</li>}
          {breathingSessions < 5 && <li>🌬️ Try a breathing exercise to reduce stress</li>}
          {moodHistory.length < 7 && <li>📊 Log your mood daily to see patterns</li>}
          {journalEntries.length >= 3 && breathingSessions >= 5 && moodHistory.length >= 7 && (
            <li>🌟 You're doing great! Try the grounding exercise in Exercises →</li>
          )}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Link to="/mood" className="btn btn-primary">Log Mood</Link>
          <Link to="/journal" className="btn btn-outline">Write Journal</Link>
          <Link to="/breathing" className="btn btn-outline">Breathe</Link>
        </div>
      </div>
    </div>
  )
}