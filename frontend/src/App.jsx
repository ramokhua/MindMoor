import { useState, useRef, useEffect } from 'react'
import './App.css'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! I\'m MindMoor, your AI companion. How can I help you today?', sender: 'bot' }
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text) => {
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text,
      sender: 'user'
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })

      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()
      const botMessage = {
        id: messages.length + 2,
        text: data.response || 'Sorry, I couldn\'t generate a response.',
        sender: 'bot'
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, there was an error connecting to the server.',
        sender: 'bot'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="chat-wrapper">
        <div className="chat-header">
          <h1>MindMoor</h1>
          <p>Your AI Conversational Companion</p>
        </div>
        
        <div className="messages-container">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {loading && <div className="loading">MindMoor is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  )
}

export default App