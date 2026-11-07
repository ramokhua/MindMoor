import './ChatMessage.css'

function ChatMessage({ message }) {
  return (
    <div className={`message message-${message.sender}`}>
      <div className="message-content">
        {message.text}
      </div>
    </div>
  )
}

export default ChatMessage