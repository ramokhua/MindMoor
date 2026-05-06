import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import AccessibilityPanel from '../AccessibilityPanel'
import ConnectionStatus from '../ConnectionStatus'
import './Layout.css'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      {/* Skip to Content Link - for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Hamburger Menu Button (Mobile Only) */}
      <header className="site-header">
        <div className="site-nav">
          <button 
            className="hamburger-menu" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
          <Link to="/" className="brand mobile-brand" onClick={() => setSidebarOpen(false)}>
            <span className="brand-icon" aria-hidden="true">🧠</span>
            <span className="brand-name">MindMoor</span>
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content with ID for skip link */}
      <main className="site-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer (mobile only, desktop has crisis in sidebar) */}
      <footer className="site-footer mobile-only">
        <div className="footer-inner">
          <p>© 2025 MindMoor. All rights reserved.</p>
          <p className="footer-crisis">
            In crisis? Call <strong>988</strong>
          </p>
        </div>
      </footer>

      {/* Accessibility Panel */}
      <AccessibilityPanel />
    </div>
  )
}