import { useReminders } from '../../hooks/useReminders'
import './Reminders.css'

export default function RemindersSettings() {
  const { settings, permission, enableReminders, disableReminders, updateSettings } = useReminders()

  return (
    <div className="page-container reminders-page">
      <h1 className="page-title">Gentle Reminders</h1>
      <p className="page-subtitle">Optional notifications to support your wellness routine</p>

      {permission === 'default' && (
        <div className="card permission-card">
          <p>🔔 MindMoor can send you gentle reminders to check in with yourself.</p>
          <button className="btn btn-primary" onClick={enableReminders}>
            Enable Notifications
          </button>
        </div>
      )}

      {permission === 'granted' && (
        <>
          <div className="card">
            <div className="reminder-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => e.target.checked ? enableReminders() : disableReminders()}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">Enable all reminders</span>
            </div>
          </div>

          {settings.enabled && (
            <>
              <div className="card">
                <h2>📝 Journal Reminder</h2>
                <p className="text-muted">Get reminded to write in your journal</p>
                <div className="time-selector">
                  <input
                    type="time"
                    className="input"
                    value={settings.journalTime || ''}
                    onChange={(e) => updateSettings({ journalTime: e.target.value })}
                  />
                  {settings.journalTime && (
                    <button className="btn btn-ghost" onClick={() => updateSettings({ journalTime: null })}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="card">
                <h2>😊 Mood Check-In</h2>
                <p className="text-muted">Get reminded to log your mood</p>
                <div className="time-selector">
                  <input
                    type="time"
                    className="input"
                    value={settings.moodTime || ''}
                    onChange={(e) => updateSettings({ moodTime: e.target.value })}
                  />
                  {settings.moodTime && (
                    <button className="btn btn-ghost" onClick={() => updateSettings({ moodTime: null })}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="card">
                <h2>🌬️ Breathing Exercise</h2>
                <p className="text-muted">Get reminded to practice breathing</p>
                <div className="time-selector">
                  <input
                    type="time"
                    className="input"
                    value={settings.breathingTime || ''}
                    onChange={(e) => updateSettings({ breathingTime: e.target.value })}
                  />
                  {settings.breathingTime && (
                    <button className="btn btn-ghost" onClick={() => updateSettings({ breathingTime: null })}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {permission === 'denied' && (
        <div className="card permission-card warning">
          <p>🔕 Notifications are blocked. Please enable them in your browser settings to receive reminders.</p>
        </div>
      )}
    </div>
  )
}