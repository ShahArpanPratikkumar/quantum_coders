import { motion } from 'framer-motion';

export default function PlaceholderPage({ title, icon: Icon }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '48px',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--quantum-glass)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '500px'
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--quantum-gold-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--quantum-gold)'
        }}>
          {Icon && <Icon size={32} strokeWidth={1.5} />}
        </div>
        
        <div>
          <h2 className="pp-hero-title pp-gold-text" style={{ fontSize: '2rem', marginBottom: '12px' }}>
            {title}
          </h2>
          <p className="pp-editorial" style={{ color: 'var(--quantum-text-muted)' }}>
            This workspace is currently under construction for the next phase of the hackathon. 
            Check back soon!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
