import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Mic, Trash2, Copy, Volume2, Square, Sparkles } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';
import { useQuantum } from '../context/QuantumContext';

const MOCK_SUGGESTIONS = [
  "Summarize this page",
  "What is the main idea?",
  "Explain this simply",
  "List the important points"
];

const MOCK_RESPONSES = [
  "Based on this page, the main concept is that React Router v6 introduced a nested routing architecture which allows layouts to persist while child routes change. This drastically improves performance and UX.",
  "That's a great question! The text suggests that using Context API is preferred for global UI state, whereas Redux or Zustand might be better for complex business logic.",
  "Here is a simple explanation: Think of a React component like a custom HTML tag that you can build yourself, and it can remember things using 'state'.",
  "The most important points are: \n1. Always use semantic HTML.\n2. Keep your components small and focused.\n3. Use CSS variables for theming."
];

export default function AskPage() {
  const { currentPage } = useQuantum();
  const { addToast } = useToast();
  const location = useLocation();
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('quantum-chat-history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('quantum-chat-history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (location.state?.prefilledQuestion) {
      setInputValue(location.state.prefilledQuestion);
      // optionally replace history state to prevent re-filling on refresh, but for now simple pre-fill is fine.
    }
  }, [location.state]);

  const handleSend = (text = inputValue) => {
    if (!text.trim() || isTyping) return;

    const newUserMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock AI thinking
    setTimeout(() => {
      const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      const newAiMsg = { id: Date.now() + 1, role: 'assistant', content: mockResponse };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem('quantum-chat-history');
    addToast({ title: 'Chat cleared', type: 'info' });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied to clipboard', type: 'success' });
  };

  return (
    <PageTransition className="pp-ask-workspace" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader 
        title="Ask Quantum" 
        description="Have a natural conversation about the content of this page."
        icon={MessageSquare}
        actions={
          <button 
            onClick={handleClear}
            className="pp-action-button" 
            title="Clear Chat"
            style={{ 
              background: 'none', border: '1px solid var(--quantum-border)', 
              color: 'var(--quantum-text-muted)', padding: '8px', borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={16} />
          </button>
        }
      />

      {/* Chat History Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--quantum-text-muted)', maxWidth: '400px' }}>
            <Sparkles size={48} color="var(--quantum-gold-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p className="pp-editorial" style={{ fontSize: '1.2rem', color: 'var(--quantum-ivory)', marginBottom: '8px' }}>
              What would you like to know?
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              I'm analyzing "{currentPage?.title}". You can ask me to summarize it, explain concepts, or find specific information.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
              {MOCK_SUGGESTIONS.map((sug, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(sug)}
                  style={{
                    background: 'var(--quantum-black-deep)',
                    border: '1px solid var(--quantum-border)',
                    color: 'var(--quantum-ivory)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--t-fast)'
                  }}
                  onMouseEnter={e => e.target.style.borderColor = 'var(--quantum-gold)'}
                  onMouseLeave={e => e.target.style.borderColor = 'var(--quantum-border)'}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  background: msg.role === 'user' ? 'var(--quantum-gold-muted)' : 'var(--quantum-glass)',
                  border: msg.role === 'user' ? '1px solid var(--quantum-gold)' : '1px solid var(--quantum-border)',
                  color: msg.role === 'user' ? 'var(--quantum-gold)' : 'var(--quantum-ivory)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                  lineHeight: 1.6,
                  position: 'relative',
                  group: 'true'
                }}>
                  {msg.content}
                  
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--quantum-border)' }}>
                      <button onClick={() => handleCopy(msg.content)} style={actionBtnStyle} title="Copy">
                        <Copy size={14} />
                      </button>
                      <button style={actionBtnStyle} title="Read Aloud">
                        <Volume2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'var(--quantum-glass)',
                  border: '1px solid var(--quantum-border)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  borderBottomLeftRadius: '4px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '6px', height: '6px', background: 'var(--quantum-gold)', borderRadius: '50%' }} />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: '6px', height: '6px', background: 'var(--quantum-gold)', borderRadius: '50%' }} />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: '6px', height: '6px', background: 'var(--quantum-gold)', borderRadius: '50%' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div style={{ marginTop: '24px' }}>
        <div style={{
          position: 'relative',
          background: 'var(--quantum-black-deep)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '12px',
          transition: 'border-color var(--t-fast)'
        }}>
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this page..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--quantum-ivory)',
              fontFamily: 'var(--font-interface)',
              fontSize: '1rem',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '200px',
              padding: '10px 12px',
              outline: 'none'
            }}
            rows={1}
          />
          <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
            {isTyping ? (
              <button 
                onClick={() => setIsTyping(false)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--quantum-error)', color: 'white',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <>
                <button style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'transparent', color: 'var(--quantum-text-muted)',
                  border: '1px solid var(--quantum-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Mic size={18} />
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim()}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: inputValue.trim() ? 'var(--quantum-gold)' : 'var(--quantum-surface)', 
                    color: inputValue.trim() ? 'var(--quantum-black-deep)' : 'var(--quantum-text-muted)',
                    border: 'none', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} />
                </button>
              </>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--quantum-text-muted)', fontFamily: 'var(--font-interface)' }}>
            Quantum AI can make mistakes. Consider verifying important information.
          </span>
        </div>
      </div>
    </PageTransition>
  );
}

const actionBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--quantum-text-muted)',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color var(--t-fast)'
};
