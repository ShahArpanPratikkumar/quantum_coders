import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useQuantum } from '../../context/QuantumContext';
import GoldButton from '../ui/GoldButton';
import './ErrorState.css';

export default function ErrorState({ errorType = 'extraction' }) {
  const { setStatus } = useQuantum();

  const handleRetry = () => {
    setStatus('extracting');
    setTimeout(() => setStatus('ready'), 1500);
  };

  return (
    <motion.div
      className="pp-error-state"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="alert"
    >
      <div className="pp-error-state__icon">
        <AlertCircle size={32} strokeWidth={1.5} color="var(--pp-error)" />
      </div>

      <h3 className="pp-card-title" style={{ color: 'var(--pp-error)', fontSize: '1.2rem', marginTop: 12 }}>
        Extraction Failed
      </h3>

      <p className="pp-ui-text" style={{ textAlign: 'center', marginTop: 8, marginBottom: 20 }}>
        Quantum couldn't extract readable content from this specific page. You can still ask general questions, or try reloading the page.
      </p>

      <GoldButton variant="outline" size="md" onClick={handleRetry}>
        Try Again
      </GoldButton>
    </motion.div>
  );
}
