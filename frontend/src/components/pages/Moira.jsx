import { useState, useRef, useEffect } from 'react'
import './Moira.css'

const API_URL = '/api/chat'

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it all', 'self harm', 'want to die', 'want to end it', 'better off dead']

const CRISIS_RESPONSE = `I'm really concerned about what you've shared. Please reach out for immediate support:

• **US Suicide & Crisis Lifeline:** Call or text **988**
• **Crisis Text Line:** Text HOME to **741741**
• **International:** [findahelpline.com](https://findahelpline.com)

You are not alone and your life matters. 💙`

const SUGGESTED_PROMPTS = [
  "I'm feeling anxious",
  "I can't sleep",
  "I feel overwhelmed",
  "I had a bad day",
  "I need motivation",
  "Tell me a breathing exercise",
]

function Message({ msg }) {
  return (
    <div className={`message message-${msg.role}`}>
      {msg.role === 'assistant' && (
        <div className="avatar">M</div>
      )}
      <div className="bubble">
        <div
          className="bubble-text"
          dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
        <time className="bubble-time">{msg.time}</time>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="message message-assistant">
      <div className="avatar">M</div>
      <div className="bubble typing">
        <span /><span /><span />
      </div>
    </div>
  )
}

export default function Moira() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Moira, your mental wellness companion. I'm here to listen and support you. How are you feeling today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const isCrisis = (text) =>
    CRISIS_KEYWORDS.some(k => text.toLowerCase().includes(k))

  const send = async (textOverride = null) => {
    const text = (textOverride || input).trim()
    if (!text || loading) return

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Crisis check — local, no API call
    if (isCrisis(text)) {
      await new Promise(r => setTimeout(r, 600))
      setLoading(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: CRISIS_RESPONSE,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
      return
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || "I'm here. Could you tell me more?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container moira-page">
      <div className="moira-header">
        <div className="moira-avatar-lg">M</div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Moira</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Your 24/7 mental wellness companion</p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="suggested-prompts" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem',
        justifyContent: 'center'
      }}>
        {SUGGESTED_PROMPTS.map(prompt => (
          <button
            key={prompt}
            className="prompt-chip"
            onClick={() => send(prompt)}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all var(--transition)',
              color: 'var(--text)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-window card">
        <div className="messages-area">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div className="input-row">
          <input
            className="input chat-input"
            placeholder="How are you feeling…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button className="btn btn-primary send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
            {loading ? '…' : '↑'}
          </button>
        </div>
      </div>

      <p className="moira-disclaimer text-muted">
        Moira is an AI and not a substitute for professional mental health care.
        In an emergency, please contact a crisis line or emergency services.
      </p>
    </div>
  )
}