import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import './Sidebar.css'

const NAV_SECTIONS = [
  {
    title: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: '📊' },
      { to: '/achievements', label: 'Achievements', icon: '🏆' },
      { to: '/reminders', label: 'Reminders', icon: '🔔' },
    ]
  },
  {
    title: 'Track',
    links: [
      { to: '/mood', label: 'Mood Tracker', icon: '😊' },
      { to: '/journal', label: 'Journal', icon: '📝' },
      { to: '/breathing', label: 'Breathing', icon: '🌬️' },
    ]
  },
  {
    title: 'Learn',
    links: [
      { to: '/exercises', label: 'Exercises', icon: '🧘' },
      { to: '/quizzes', label: 'Quizzes', icon: '📋' },
      { to: '/videos', label: 'Videos', icon: '🎥' },
      { to: '/articles', label: 'Articles', icon: '📚' },
    ]
  },
  {
    title: 'Support',
    links: [
      { to: '/moira', label: 'Chat with Moira', icon: '💬' },
      { to: '/resources', label: 'Resources', icon: '📖' },
      { to: '/safety-plan', label: 'Safety Plan', icon: '🛡️' },
      { to: '/privacy', label: 'Privacy', icon: '🔒' },
    ]
  }
]

export default function Sidebar({ isOpen, onClose }) {
  const { isDark, toggle } = useTheme()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Main navigation"
        aria-hidden={!isOpen && window.innerWidth < 768 ? 'true' : 'false'}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon" aria-hidden="true">🧠</span>
            <span className="brand-name">MindMoor</span>
          </div>
          <button 
            className="sidebar-close" 
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-theme">
          <button 
            className="theme-toggle-sidebar" 
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation sections">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-link-sidebar ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon" aria-hidden="true">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-crisis">
            <span aria-hidden="true">⚠️</span> In crisis?<br />
            <strong>Call 988</strong>
          </div>
          <p className="sidebar-version">v1.0.0</p>
        </div>
      </aside>
    </>
  )
}