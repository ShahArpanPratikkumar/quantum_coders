import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantum } from '../../context/QuantumContext';
import './ChatInput.css';

export default function ChatInput() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const { status, setStatus, handleUserQuery } = useQuantum();

  const busy = ['thinking', 'extracting'].includes(status);
  const speaking = status === 'speaking';

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [text]);

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || busy) return;
    setText('');
    await handleUserQuery(msg);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      setStatus('ready');
    } else {
      setIsListening(true);
      setStatus('listening');
      // Simulate: auto-stop after 4s
      setTimeout(() => {
        setIsListening(false);
        setStatus('ready');
        setText('Summarize this article for me.');
      }, 4000);
    }
  };

  const stopSpeaking = () => setStatus('ready');

  return (
    <div className="pp-ci" role="form" aria-label="Chat input">
      <div className="pp-ci__top-line" aria-hidden="true" />

      {/* Listening state */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="pp-ci__listening"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="status"
            aria-live="polite"
          >
            <div className="pp-ci__wave-bars" aria-hidden="true">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="pp-ci__wave-bar"
                  style={{ animationDelay: `${i * 0.07}s` }}
                />
              ))}
            </div>
            <span className="pp-ui-text" style={{ color: 'var(--pp-gold)', fontSize: '0.78rem', fontStyle: 'italic' }}>
              Listening…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaking interrupt */}
      <AnimatePresence>
        {speaking && (
          <motion.div
            className="pp-ci__speaking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pp-ci__wave-bars" aria-hidden="true">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="pp-ci__wave-bar pp-ci__wave-bar--speaking" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className="pp-ui-text" style={{ color: 'var(--pp-muted)', fontSize: '0.78rem' }}>Speaking…</span>
            <button className="pp-ci__stop-btn" onClick={stopSpeaking} aria-label="Stop speaking">
              <Square size={12} fill="currentColor" /> Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="pp-ci__row">
        {/* Mic */}
        <button
          className={`pp-ci__mic ${isListening ? 'pp-ci__mic--active' : ''}`}
          onClick={toggleMic}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          aria-pressed={isListening}
          disabled={busy || speaking}
          title="Voice input (Alt+M)"
        >
          {isListening ? <MicOff size={16} strokeWidth={1.5} /> : <Mic size={16} strokeWidth={1.5} />}
          {isListening && <span className="pp-ci__mic-ring" aria-hidden="true" />}
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="pp-ci__input"
          placeholder="Ask anything about this page…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={busy || speaking}
          rows={1}
          aria-label="Type your question"
          aria-multiline="true"
        />

        {/* Send */}
        <button
          className="pp-ci__send"
          onClick={handleSend}
          disabled={!text.trim() || busy}
          aria-label="Send message"
          title="Send (Enter)"
        >
          <Send size={15} strokeWidth={1.8} />
        </button>
      </div>

      <p className="pp-ci__hint pp-label" style={{ color: 'var(--pp-muted-dark)', textAlign: 'center', paddingBottom: 4 }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
