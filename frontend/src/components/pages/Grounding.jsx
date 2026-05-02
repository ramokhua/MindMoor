import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Grounding.css'

const STEPS = [
  { count: 5, sense: 'See',   placeholder: 'Something you can see…',   emoji: '👁️' },
  { count: 4, sense: 'Touch', placeholder: 'Something you can touch…', emoji: '✋' },
  { count: 3, sense: 'Hear',  placeholder: 'Something you can hear…',  emoji: '👂' },
  { count: 2, sense: 'Smell', placeholder: 'Something you can smell…', emoji: '👃' },
  { count: 1, sense: 'Taste', placeholder: 'Something you can taste…', emoji: '👅' },
]

export default function Grounding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(STEPS.map(s => Array(s.count).fill('')))
  const [done, setDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const currentStep = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  const updateAnswer = (idx, val) => {
    setAnswers(prev => {
      const copy = prev.map(a => [...a])
      copy[step][idx] = val
      return copy
    })
  }

  const canAdvance = answers[step].every(a => a.trim())

  const advance = () => {
    if (!canAdvance) return
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else setDone(true)
  }

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (done) {
    return (
      <div className="page-container grounding-page">
        <div className="card completion-card">
          <div className="completion-emoji">🌿</div>
          <h1>Well done!</h1>
          <p>You completed the grounding exercise in <strong>{formatTime(elapsed)}</strong>.</p>
          <p className="text-muted mt-1">Notice how you feel now compared to when you started.</p>

          <div className="summary mt-3">
            {STEPS.map((s, i) => (
              <div key={i} className="summary-step">
                <span>{s.emoji} <strong>{s.count} things you can {s.sense.toLowerCase()}</strong></span>
                <ul>{answers[i].map((a, j) => <li key={j}>{a}</li>)}</ul>
              </div>
            ))}
          </div>

          <div className="completion-actions mt-3">
            <button className="btn btn-ghost" onClick={() => { setStep(0); setDone(false); setElapsed(0); setAnswers(STEPS.map(s => Array(s.count).fill(''))) }}>
              Start Over
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/mood')}>
              Log My Mood →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container grounding-page">
      <div className="grounding-header">
        <div>
          <h1 className="page-title">5-4-3-2-1 Grounding</h1>
          <p className="page-subtitle">Focus on your senses to anchor yourself in the present moment.</p>
        </div>
        <span className="timer text-muted">{formatTime(elapsed)}</span>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="step-label text-muted">Step {step + 1} of {STEPS.length}</p>

      <div className="card grounding-card fade-up" key={step}>
        <div className="grounding-step-header">
          <span className="sense-emoji">{currentStep.emoji}</span>
          <h2>{currentStep.count} Things You Can <span className="text-primary">{currentStep.sense}</span></h2>
        </div>

        <div className="grounding-inputs">
          {Array(currentStep.count).fill(0).map((_, i) => (
            <input
              key={i}
              className="input"
              placeholder={`${i + 1}. ${currentStep.placeholder}`}
              value={answers[step][i]}
              onChange={e => updateAnswer(i, e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAdvance && advance()}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <div className="grounding-nav mt-3">
          <button
            className="btn btn-ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={advance}
            disabled={!canAdvance}
          >
            {step === STEPS.length - 1 ? 'Complete ✓' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Step dots */}
      <div className="step-dots">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => i <= step && setStep(i)}
          >
            {i < step ? '✓' : s.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}