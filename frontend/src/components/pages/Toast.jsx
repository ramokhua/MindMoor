import { useEffect } from 'react'
import './Toast.css'

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className={`toast toast-${type} fade-up`}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">✕</button>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}