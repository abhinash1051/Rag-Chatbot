import React, { useEffect, useRef } from 'react';
import '../styles/ChatMessage.scss';

const ChatMessage = ({ message, isTyping = false }) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  const messageRef = useRef(null);

  // ✅ Safe timestamp fallback
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
    : 'Just now';

  useEffect(() => {
    if (messageRef.current && !isTyping) {
      // Add a slight delay to create a nicer animation sequence
      const timer = setTimeout(() => {
        messageRef.current.classList.add('message-visible');
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  return (
    <div 
      ref={messageRef}
      className={`message ${isUser ? 'user-message' : 'bot-message'} ${isTyping ? 'typing-message' : ''}`}
    >
      {isUser && <div className="message-avatar user-avatar">👤</div>}
      {!isUser && <div className="message-avatar bot-avatar">🤖</div>}
      <div className="message-content-wrapper">
        <div className="message-content">{content}</div>
        <div className="message-time">{formattedTime}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
