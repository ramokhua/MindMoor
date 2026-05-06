import { useGamification } from '../../hooks/useGamification'
import './Achievements.css'

export default function Achievements() {
  const { xp, level, earnedBadges, allBadges, getUserStats } = useGamification()
  const stats = getUserStats()

  const earnedCount = earnedBadges.length
  const totalCount = allBadges.length

  return (
    <div className="page-container achievements-page">
      <h1 className="page-title">Achievements</h1>
      <p className="page-subtitle">Track your progress and earn badges</p>

      {/* Level Card */}
      <div className="card level-card">
        <div className="level-header">
          <div className="level-badge">
            <span className="level-number">{level.level}</span>
          </div>
          <div>
            <h2>{level.title}</h2>
            <p className="text-muted">{xp} XP total</p>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${level.progress}%`, backgroundColor: level.color }}></div>
        </div>
        <p className="text-muted">{level.xpForNext} XP until next level</p>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-emoji">📝</span>
          <span className="stat-value">{stats.journalCount}</span>
          <span className="stat-label">Journal Entries</span>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">😊</span>
          <span className="stat-value">{stats.moodCount}</span>
          <span className="stat-label">Moods Logged</span>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">🌬️</span>
          <span className="stat-value">{stats.breathingCount}</span>
          <span className="stat-label">Breathing Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">🏆</span>
          <span className="stat-value">{earnedCount}/{totalCount}</span>
          <span className="stat-label">Badges Earned</span>
        </div>
      </div>

      {/* Badges Grid */}
      <h2 className="section-title">All Badges</h2>
      <div className="badges-grid">
        {allBadges.map(badge => {
          const earned = earnedBadges.includes(badge.id)
          return (
            <div key={badge.id} className={`badge-card ${earned ? 'earned' : 'locked'}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-info">
                <h3>{badge.name}</h3>
                <p className="badge-description">{badge.description}</p>
              </div>
              {earned ? (
                <span className="badge-status earned">✓ Earned</span>
              ) : (
                <span className="badge-status locked">🔒 Locked</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}