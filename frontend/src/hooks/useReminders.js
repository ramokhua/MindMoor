import { useState, useEffect } from 'react'
import { useToast } from './useToast'

export function useReminders() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState(() => 
    JSON.parse(localStorage.getItem('reminderSettings') || '{"enabled":false,"journalTime":null,"moodTime":null,"breathingTime":null}')
  )
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      scheduleReminders()
    }
  }, [settings, permission])

  const requestPermission = async () => {
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        addToast('Reminders enabled!', 'success')
      }
    }
  }

  const scheduleReminders = () => {
    const now = new Date()
    
    if (settings.journalTime) {
      const [hour, minute] = settings.journalTime.split(':')
      const reminderTime = new Date()
      reminderTime.setHours(parseInt(hour), parseInt(minute), 0)
      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime()
        setTimeout(() => {
          new Notification('📝 Journal Reminder', {
            body: 'Take a moment to reflect and write in your journal.',
            icon: '/favicon.ico'
          })
        }, delay)
      }
    }
    
    if (settings.moodTime) {
      const [hour, minute] = settings.moodTime.split(':')
      const reminderTime = new Date()
      reminderTime.setHours(parseInt(hour), parseInt(minute), 0)
      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime()
        setTimeout(() => {
          new Notification('😊 Mood Check-In', {
            body: 'How are you feeling right now? Track your mood.',
            icon: '/favicon.ico'
          })
        }, delay)
      }
    }
    
    if (settings.breathingTime) {
      const [hour, minute] = settings.breathingTime.split(':')
      const reminderTime = new Date()
      reminderTime.setHours(parseInt(hour), parseInt(minute), 0)
      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime()
        setTimeout(() => {
          new Notification('🌬️ Breathing Exercise', {
            body: 'Take 2 minutes to breathe and recenter.',
            icon: '/favicon.ico'
          })
        }, delay)
      }
    }
  }

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('reminderSettings', JSON.stringify(updated))
    addToast('Reminder settings saved!', 'success')
  }

  const enableReminders = async () => {
    await requestPermission()
    if (Notification.permission === 'granted') {
      updateSettings({ enabled: true })
    }
  }

  const disableReminders = () => {
    updateSettings({ enabled: false })
  }

  return {
    settings,
    permission,
    enableReminders,
    disableReminders,
    updateSettings,
    requestPermission
  }
}