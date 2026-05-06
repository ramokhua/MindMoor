import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      {/* Hamburger Menu Button (Mobile Only) */}
      <header className="site-header">
        <div className="site-nav">
          <button 
            className="hamburger-menu" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link to="/" className="brand mobile-brand" onClick={() => setSidebarOpen(false)}>
            <span className="brand-icon">🧠</span>
            <span className="brand-name">MindMoor</span>
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="site-main">
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
    </div>
  )
}