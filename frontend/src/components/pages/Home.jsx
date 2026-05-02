import { Link } from 'react-router-dom'
import './Home.css'

const FEATURES = [
  { icon: '📊', title: 'Mood Tracker',        desc: 'Visualize emotional patterns over time with interactive charts.',       to: '/mood',      cta: 'Track Mood' },
  { icon: '📝', title: 'Digital Journal',      desc: 'Write freely in your private, locally-stored journal.',                 to: '/journal',   cta: 'Start Writing' },
  { icon: '🌬️', title: 'Breathing Exercises',  desc: 'Guided 4-7-8, Box, and Relaxing Breath patterns with live animation.', to: '/breathing', cta: 'Practice Now' },
  { icon: '🧘', title: 'Therapy Exercises',    desc: 'CBT-based tools for anxiety, stress, and negative thought patterns.',   to: '/exercises', cta: 'Explore' },
  { icon: '📚', title: 'Self-Help Resources',  desc: 'Free CBT workbooks and evidence-based reading materials.',              to: '/resources', cta: 'Browse' },
  { icon: '💬', title: 'Chat with Moira',      desc: 'Your 24/7 AI companion — always ready to listen and support you.',     to: '/moira',     cta: 'Talk to Moira' },
]

const TESTIMONIALS = [
  { quote: "MindMoor helped me recognise mood patterns I'd never noticed before. The journal became my daily check-in.", author: "Sarah K." },
  { quote: "The breathing exercises genuinely help me manage daily stress. Simple, accessible, and effective.", author: "Michael T." },
]

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content fade-up">
          <span className="hero-pill">Your Mental Wellness Platform</span>
          <h1 className="hero-title">Your Safe Harbor<br />for Mental Wellness</h1>
          <p className="hero-sub">Science-backed tools to support your mental health journey — free, private, and always available.</p>
          <div className="hero-actions">
            <Link to="/mood" className="btn btn-accent btn-lg">Start Your Journey</Link>
            <Link to="/moira" className="btn btn-outline-white">Talk to Moira →</Link>
          </div>
        </div>
        <div className="hero-waves">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--light)"/></svg>
        </div>
      </section>

      {/* About */}
      <section className="about-section page-container">
        <h2>About MindMoor</h2>
        <p>MindMoor is a comprehensive mental wellness platform designed to help you navigate life's challenges with science-backed tools. Our mission is to make mental health support <strong>accessible, intuitive, and effective</strong> for everyone.</p>
      </section>

      {/* Features Grid */}
      <section className="features-section page-container" style={{ maxWidth: 1100 }}>
        <h2 className="section-title">Everything You Need</h2>
        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc, to, cta }) => (
            <div key={to} className="feature-card card fade-up">
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link to={to} className="btn btn-outline mt-2">{cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section page-container">
        <h2 className="section-title">What Users Say</h2>
        <div className="grid-2">
          {TESTIMONIALS.map(({ quote, author }) => (
            <blockquote key={author} className="testimonial card">
              <p>"{quote}"</p>
              <footer>— {author}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Why section */}
      <section className="why-section">
        <div className="page-container">
          <h2 className="section-title">Why MindMoor?</h2>
          <div className="why-grid">
            {[
              { icon: '🧠', label: 'Science-Backed', desc: 'Built on CBT and mindfulness research.' },
              { icon: '🔒', label: 'Private by Default', desc: 'Your data stays on your device — never sold.' },
              { icon: '💸', label: 'Completely Free', desc: 'Core features are free, always.' },
              { icon: '📱', label: 'Works Everywhere', desc: 'Responsive on any device, anytime.' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="why-card">
                <span className="why-icon">{icon}</span>
                <strong>{label}</strong>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}