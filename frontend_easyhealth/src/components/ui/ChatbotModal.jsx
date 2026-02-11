import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, AlertTriangle, 
  Loader2, User, Bot, Clock 
} from 'lucide-react';
import PropTypes from 'prop-types';
import './ChatbotModal.css';

const ChatbotModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your MediNest Health Assistant. I can provide general health information and guide you to professional care when needed.\n\n⚠️ **Important:** I cannot diagnose conditions or prescribe medications. Please consult a healthcare professional for medical advice.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Prepare conversation history
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call backend API
      const response = await fetch('http://127.0.0.1:8000/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: history
        })
      });

      const data = await response.json();

      // Hide typing indicator
      setIsTyping(false);

      if (response.ok) {
        // Add assistant response
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          isEmergency: data.is_emergency
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle error
        const errorMessage = {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again or contact our support team for assistance.',
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please check your internet connection or try again later.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your MediNest Health Assistant. I can provide general health information and guide you to professional care when needed.\n\n⚠️ **Important:** I cannot diagnose conditions or prescribe medications. Please consult a healthcare professional for medical advice.',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="chatbot-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="chatbot-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={24} />
              </div>
              <div className="chatbot-title">
                <h3>Health Assistant</h3>
                <span className="chatbot-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button 
                className="chatbot-action-btn" 
                onClick={clearChat}
                title="Clear conversation"
              >
                <Clock size={18} />
              </button>
              <button 
                className="chatbot-action-btn" 
                onClick={onClose}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="chatbot-disclaimer-banner">
            <AlertTriangle size={16} />
            <span>This chatbot provides general health info only. Always consult healthcare professionals for medical advice.</span>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`message ${message.role} ${message.isEmergency ? 'emergency' : ''} ${message.isError ? 'error' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div 
                className="message assistant typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Type your health question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                className={`chatbot-send-btn ${!inputMessage.trim() || isLoading ? 'disabled' : ''}`}
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              </button>
            </div>
            <div className="chatbot-input-hint">
              Press Enter to send • Esc to close
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

ChatbotModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ChatbotModal;
