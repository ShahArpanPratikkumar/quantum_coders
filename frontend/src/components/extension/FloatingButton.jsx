import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useQuantum } from '../../context/QuantumContext';
import './FloatingButton.css';

export default function FloatingButton() {
  const { togglePanel, isPanelOpen, status } = useQuantum();
  
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'thinking';
  const isExtracting = status === 'extracting';

  return (
    <div className="pp-fab-container">
      {/* Tooltip */}
      <AnimatePresence>
        {!isPanelOpen && (
          <motion.div
            className="pp-fab-tooltip pp-ui-text"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            Ask Quantum
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`pp-fab ${isPanelOpen ? 'pp-fab--open' : ''}`}
        onClick={togglePanel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle Quantum"
        aria-expanded={isPanelOpen}
      >
        {/* Glow rings */}
        <div className={`pp-fab__ring ${isListening ? 'pp-fab__ring--listening' : ''}`} aria-hidden="true" />
        <div className={`pp-fab__ring-2 ${isSpeaking ? 'pp-fab__ring-2--speaking' : ''}`} aria-hidden="true" />
        
        {/* Center icon */}
        <div className="pp-fab__inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={isPanelOpen ? 'open' : 'closed'}
              initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {isPanelOpen ? (
                <MessageSquare size={22} color="var(--pp-ivory)" strokeWidth={1.5} />
              ) : (
                <Sparkles size={22} color="var(--pp-gold)" strokeWidth={1.5} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status indicator dot */}
        {(isThinking || isExtracting) && (
          <span className="pp-fab__status-dot" aria-hidden="true" />
        )}
      </motion.button>
    </div>
  );
}
