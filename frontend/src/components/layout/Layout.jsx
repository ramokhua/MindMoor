import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import './Layout.css'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/mood', label: 'Mood Tracker' },
  { to: '/journal', label: 'Journal' },
  { to: '/breathing', label: 'Breathing' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/resources', label: 'Resources' },
  { to: '/moira', label: 'Chat with Moira' },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDark, toggle } = useTheme()

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <div className="brand-text">
              <span className="brand-name">MindMoor</span>
              <span className="brand-tagline">Anchor Your Thoughts, Steady Your Soul</span>
            </div>
          </Link>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={toggle}
              className="theme-toggle"
              aria-label="Toggle dark mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <button
              className={`menu-toggle ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>

          <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>© 2025 MindMoor. All rights reserved.</p>
          <p className="footer-crisis">
            In crisis? Contact your local helpline or call <strong>988</strong> (US Suicide &amp; Crisis Lifeline).
          </p>
        </div>
      </footer>
    </div>
  )
}