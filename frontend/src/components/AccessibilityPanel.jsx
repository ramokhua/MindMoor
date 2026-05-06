import { useState, useEffect, useRef } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import './AccessibilityPanel.css'

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { highContrast, setHighContrast, fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility()
  const panelRef = useRef(null)

  // Trap focus when panel is open
  useEffect(() => {
    if (!isOpen) return
    
    const focusableElements = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements?.[0]
    const lastElement = focusableElements?.[focusableElements.length - 1]

    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      {/* Accessibility Button */}
      <button
        className="accessibility-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open accessibility settings"
        aria-expanded={isOpen}
        title="Accessibility Options"
      >
        <span className="accessibility-icon" aria-hidden="true">♿</span>
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div 
          className="accessibility-panel card"
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility Settings"
          aria-modal="true"
        >
          <div className="accessibility-header">
            <h3>Accessibility Settings</h3>
            <button 
              className="close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
            >
              ✕
            </button>
          </div>

          <div className="accessibility-section">
            <label className="toggle-switch-accessibility">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                aria-label="Enable high contrast mode"
              />
              <span className="toggle-slider-accessibility"></span>
              <span className="toggle-label">High Contrast Mode</span>
            </label>
          </div>

          <div className="accessibility-section">
            <label className="font-size-label">Font Size: {fontSize}%</label>
            <div className="font-size-controls">
              <button 
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
                disabled={fontSize <= 70}
              >
                A-
              </button>
              <button 
                onClick={resetFontSize}
                aria-label="Reset font size to default"
              >
                Reset
              </button>
              <button 
                onClick={increaseFontSize}
                aria-label="Increase font size"
                disabled={fontSize >= 150}
              >
                A+
              </button>
            </div>
          </div>

          <div className="accessibility-note">
            <small>Press <kbd>Esc</kbd> to close. <kbd>Tab</kbd> to navigate.</small>
          </div>
        </div>
      )}
    </>
  )
}