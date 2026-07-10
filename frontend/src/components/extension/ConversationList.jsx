import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuantum } from '../../context/QuantumContext';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import MessageCard from './MessageCard';
import './ConversationList.css';

export default function ConversationList() {
  const { messages, status } = useQuantum();
  const { bottomRef, containerRef } = useAutoScroll([messages], 120);

  return (
    <div className="pp-conv" ref={containerRef} role="log" aria-live="polite" aria-label="Conversation">
      <div className="pp-conv__inner">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <MessageCard message={msg} />
          </motion.div>
        ))}

        {/* Thinking indicator */}
        {status === 'thinking' && (
          <motion.div
            className="pp-conv__thinking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="pp-conv__thinking-line" aria-hidden="true" />
            <div className="pp-conv__thinking-body">
              <div className="pp-logo-sm" style={{ fontSize: '0.85rem' }}>Quantum</div>
              <div className="pp-thinking-dots" role="status" aria-label="Thinking">
                <div className="pp-thinking-dot" />
                <div className="pp-thinking-dot" />
                <div className="pp-thinking-dot" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
