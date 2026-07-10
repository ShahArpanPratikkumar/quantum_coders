import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import GoldButton from '../components/ui/GoldButton';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'var(--quantum-glass)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '64px',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px'
        }}
      >
        <div style={{
          color: 'var(--quantum-gold-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Compass size={64} strokeWidth={1} color="var(--quantum-gold)" />
        </div>

        <div>
          <h1 className="pp-hero-title pp-gold-text" style={{ fontSize: '4rem', lineHeight: 1 }}>
            404
          </h1>
          <p className="pp-editorial" style={{ color: 'var(--quantum-ivory)', marginTop: '16px', fontSize: '1.2rem' }}>
            This Quantum workspace does not exist.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <GoldButton variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </GoldButton>
          <GoldButton variant="primary" onClick={() => navigate('/dashboard')}>
            <Home size={16} /> Dashboard
          </GoldButton>
        </div>
      </motion.div>
    </div>
  );
}
