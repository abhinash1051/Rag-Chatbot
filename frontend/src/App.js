import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatMessage from './components/ChatMessage';
import './styles/App.scss';
import { FaPaperPlane, FaTrash, FaSpinner, FaNewspaper } from 'react-icons/fa';

// Use API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8119/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  useEffect(() => {
    // Check backend connection
    checkBackendConnection();
    
    // Set up session
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      fetchChatHistory(storedSessionId);
    } else {
      const newSessionId = Date.now().toString();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
    }
  }, []);

  const checkBackendConnection = async () => {
    try {
      console.log('Attempting to connect to:', API_URL);
      const response = await axios.get(`${API_URL}/health`);
      console.log('Backend connection successful:', response.status);
      setIsConnected(response.status === 200);
    } catch (error) {
      console.error('Backend connection error:', error.message);
      console.log('Error details:', error);
      setIsConnected(false);
      // Try again after a delay
      setTimeout(checkBackendConnection, 5000);
    }
  }

  const fetchChatHistory = async (sid) => {
    try {
      const response = await axios.get(`${API_URL}/history/${sid}`);
      if (response.data.history) {
        setMessages(response.data.history);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const simulateTyping = (text) => {
    setIsTyping(true);
    setTypingText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setTypingText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'model', // ✅ Match backend
          content: text,
          timestamp: Date.now()
        }]);
        setTypingText('');
      }
    }, 30);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/message`, {
        message: input,
        sessionId
      });

      setLoading(false);
      simulateTyping(response.data.reply); // ✅ Fixed key name
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
      simulateTyping('Sorry, I encountered an error. Please try again.');
    }
  };

  const resetSession = () => {
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    localStorage.setItem('chatSessionId', newSessionId);
    setMessages([]);
    setTypingText('');
    setIsTyping(false);
  };

  return (
    <div className={`chat-container ${isConnected ? 'connected' : 'disconnected'}`} ref={chatContainerRef}>
      <div className="chat-header">
        <div className="header-left">
          <div className="app-logo">
            <FaNewspaper size={24} className="logo-icon" />
          </div>
          <h1 className="app-title">NewsChat <span className="subtitle">AI</span></h1>
          <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="connection-dot"></span>
            <span className="connection-text">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        <button 
          className="reset-button"
          onClick={resetSession}
          title="Clear chat history"
        >
          <FaTrash size={18} />
          <span className="reset-text">Clear</span>
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 && !isTyping && (
          <div className="welcome-message">
            <div className="welcome-icon">👋</div>
            <h3>Welcome to NewsChat AI</h3>
            <p>Ask me anything about the latest news!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} isTyping={false} />
        ))}

        {isTyping && (
          <ChatMessage 
            message={{ 
              role: 'model', 
              content: typingText, 
              timestamp: Date.now() 
            }} 
            isTyping={true} 
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={sendMessage}>
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading || isTyping || !isConnected}
            className="message-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={loading || isTyping || !input.trim() || !isConnected}
            className="send-button"
            title="Send message"
          >
            {loading ? (
              <FaSpinner size={18} className="spinner-icon" />
            ) : (
              <FaPaperPlane size={18} />
            )}
          </button>
        </div>
        {!isConnected && (
          <div className="connection-status">
            <span className="status-indicator"></span>
            <span className="status-text">Connecting to server...</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
