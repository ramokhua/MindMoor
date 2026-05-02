import { useState, useEffect, useRef } from 'react'
import './Breathing.css'

const PATTERNS = {
  '478':  { name: '4-7-8 Breathing',     phases: [4, 7, 8, 0],  labels: ['Inhale', 'Hold', 'Exhale', ''] },
  'box':  { name: 'Box Breathing',        phases: [4, 4, 4, 4],  labels: ['Inhale', 'Hold', 'Exhale', 'Pause'] },
  'relax':{ name: 'Relaxing Breath',      phases: [4, 0, 8, 0],  labels: ['Inhale', '', 'Exhale', ''] },
  '246':  { name: '2-4-6 (Beginners)',    phases: [2, 4, 6, 0],  labels: ['Inhale', 'Hold', 'Exhale', ''] },
}

const PHASE_COLORS = ['#a6dcef', '#5d93a6', '#ff9e7d', '#9b89b4']

export default function Breathing() {
  const [isRunning, setIsRunning] = useState(false)
  const [patternKey, setPatternKey] = useState('478')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [cycles, setCycles] = useState(0)

  const intervalRef = useRef(null)
  const phaseStart = useRef(null)

  const pattern = PATTERNS[patternKey]
  const activePhaseDurations = pattern.phases.filter(p => p > 0)
  const activePhaseLabels = pattern.labels.filter((_, i) => pattern.phases[i] > 0)
  const activePhaseIndexes = pattern.phases.map((p, i) => p > 0 ? i : null).filter(i => i !== null)

  const stop = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setPhaseIdx(0)
    setCountdown(0)
    setCycles(0)
  }

  const start = () => {
    setIsRunning(true)
    let ci = 0            // active phase index (skipping zero-duration ones)
    let cycleCount = 0

    const getActivePhases = () => PATTERNS[patternKey].phases
      .map((dur, i) => ({ dur, i }))
      .filter(p => p.dur > 0)

    const activePhases = getActivePhases()
    let elapsed = 0

    setPhaseIdx(activePhases[0].i)
    setCountdown(activePhases[0].dur)

    intervalRef.current = setInterval(() => {
      elapsed += 0.1

      const currentPhase = activePhases[ci]
      const remaining = Math.ceil(currentPhase.dur - (elapsed % currentPhase.dur))
      setCountdown(remaining)

      if (elapsed >= currentPhase.dur) {
        elapsed = 0
        ci = (ci + 1) % activePhases.length
        if (ci === 0) cycleCount++
        setCycles(cycleCount)
        setPhaseIdx(activePhases[ci].i)
        setCountdown(activePhases[ci].dur)
      }
    }, 100)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const currentPhase = isRunning ? pattern.labels[phaseIdx] : 'Ready'
  const circleScale = isRunning
    ? phaseIdx === 0 ? 1.3
    : phaseIdx === 2 ? 1.0
    : 1.2
    : 1
  const circleColor = isRunning ? PHASE_COLORS[phaseIdx] : 'var(--primary)'

  return (
    <div className="page-container breathing-page">
      <h1 className="page-title">Breathing Exercises</h1>
      <p className="page-subtitle">Choose a pattern and follow the animation to calm your nervous system.</p>

      <div className="card breathing-card">
        {/* Pattern selector */}
        <div className="pattern-grid">
          {Object.entries(PATTERNS).map(([key, p]) => (
            <button
              key={key}
              className={`pattern-btn ${patternKey === key ? 'active' : ''}`}
              onClick={() => { if (!isRunning) setPatternKey(key) }}
              disabled={isRunning}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Circle */}
        <div className="circle-container">
          <div
            className="breath-circle"
            style={{
              transform: `scale(${circleScale})`,
              background: circleColor,
              transition: isRunning
                ? `transform ${pattern.phases[phaseIdx] || 1}s ease-in-out, background 0.5s`
                : 'all 0.4s',
            }}
          >
            <div className="circle-text">
              <span className="phase-label">{currentPhase}</span>
              {isRunning && <span className="countdown">{countdown}s</span>}
            </div>
          </div>

          {/* Ripples */}
          {isRunning && phaseIdx === 0 && (
            <>
              <div className="ripple ripple-1" />
              <div className="ripple ripple-2" />
            </>
          )}
        </div>

        {/* Cycle counter */}
        {isRunning && (
          <p className="cycle-counter text-muted">Cycle {cycles + 1}</p>
        )}

        {/* Controls */}
        <button
          className={`btn ${isRunning ? 'btn-ghost' : 'btn-primary'} btn-start`}
          onClick={isRunning ? stop : start}
        >
          {isRunning ? '⏹ Stop' : '▶ Start'}
        </button>

        {/* Phase guide */}
        <div className="phase-guide">
          {activePhaseIndexes.map((pi, idx) => (
            <div key={pi} className={`phase-step ${isRunning && phaseIdx === pi ? 'active' : ''}`}>
              <div className="phase-dot" style={{ background: PHASE_COLORS[pi] }} />
              <span>{pattern.labels[pi]}</span>
              <strong>{pattern.phases[pi]}s</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-3 breathing-tips">
        <h3>Tips for Best Results</h3>
        <ul>
          <li>Sit comfortably with your back straight</li>
          <li>Breathe through your nose during inhale phases</li>
          <li>Exhale through slightly parted lips</li>
          <li>Practice for at least 3–5 minutes daily</li>
        </ul>
      </div>
    </div>
  )
}