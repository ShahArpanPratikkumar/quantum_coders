import { useRouteError, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import GoldButton from '../components/ui/GoldButton';

export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--quantum-dark-gradient)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--quantum-glass)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px',
          maxWidth: '560px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px'
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(196, 108, 97, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--quantum-error)'
        }}>
          <AlertCircle size={32} />
        </div>

        <div>
          <span className="pp-logo" style={{ fontSize: '1.4rem', color: 'var(--quantum-gold)' }}>Quantum AI</span>
          <h1 className="pp-hero-title pp-ivory-text" style={{ fontSize: '2.5rem', marginTop: '12px' }}>
            Something went wrong.
          </h1>
          <p className="pp-editorial" style={{ color: 'var(--quantum-text-muted)', marginTop: '16px', fontSize: '1.1rem' }}>
            The application encountered an unexpected error and could not load this workspace.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div style={{
            background: 'var(--quantum-black-deep)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            width: '100%',
            textAlign: 'left',
            fontFamily: 'var(--font-code)',
            fontSize: '0.75rem',
            color: 'var(--quantum-text-muted)',
            overflowX: 'auto'
          }}>
            <i>{error.statusText || error.message}</i>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <GoldButton variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </GoldButton>
          <GoldButton variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Retry
          </GoldButton>
          <GoldButton variant="outline" onClick={() => navigate('/dashboard')}>
            Dashboard
          </GoldButton>
        </div>
      </motion.div>
    </div>
  );
}
