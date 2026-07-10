import { motion } from 'framer-motion';
import { useQuantum } from '../../context/QuantumContext';
import GoldButton from '../ui/GoldButton';
import './EmptyState.css';

export default function EmptyState() {
  const { sendMessage } = useQuantum();

  const SUGGESTIONS = [
    'Summarize this page',
    'Explain the main idea',
    'Read important points',
    'Give me a two-minute summary',
  ];

  return (
    <motion.div
      className="pp-empty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Empty state — no conversation yet"
    >
      {/* Logo watermark */}
      <div className="pp-empty__watermark pp-logo" aria-hidden="true">P</div>

      <div className="pp-empty__content">
        <h2 className="pp-empty__title pp-card-title" style={{ fontSize: '1.3rem' }}>
          Ready when you are.
        </h2>
        <p className="pp-editorial-sm" style={{ fontStyle: 'normal', fontSize: '0.85rem' }}>
          Quantum has read this page and is ready to answer questions, summarize content, or read it aloud.
        </p>
      </div>

      <div className="pp-empty__suggestions" role="list" aria-label="Suggested questions">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={i}
            className="pp-empty__suggestion"
            onClick={() => sendMessage(s)}
            role="listitem"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            whileHover={{ x: 4 }}
          >
            <span className="pp-empty__suggestion-arrow" aria-hidden="true">→</span>
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
