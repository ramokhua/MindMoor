import { useState } from 'react'
import './AffirmationCard.css'

export default function AffirmationCard({ affirmation, isFavorite, onToggleFavorite, onNext, size = 'normal' }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affirmation.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`affirmation-card card ${size === 'large' ? 'affirmation-large' : ''}`}>
      <div className="affirmation-icon">✨</div>
      <p className="affirmation-text">"{affirmation.text}"</p>
      <div className="affirmation-meta">
        <span className="affirmation-category">{affirmation.category}</span>
      </div>
      <div className="affirmation-actions">
        <button className="btn-ghost" onClick={() => onToggleFavorite(affirmation.text)}>
          {isFavorite ? '★ Favorited' : '☆ Save'}
        </button>
        <button className="btn-ghost" onClick={copyToClipboard}>
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        {onNext && (
          <button className="btn-ghost" onClick={onNext}>
            Next →
          </button>
        )}
      </div>
    </div>
  )
}