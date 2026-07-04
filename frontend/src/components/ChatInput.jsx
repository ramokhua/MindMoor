import { useState } from 'react'
import './ChatInput.css'

function ChatInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        className="chat-input"
      />
      <button type="submit" disabled={disabled || !input.trim()} className="send-button">
        {disabled ? '...' : 'Send'}
      </button>
    </form>
  )
}

export default ChatInput