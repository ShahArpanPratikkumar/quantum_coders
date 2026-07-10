import { motion } from 'framer-motion';

export default function PageHeader({ title, description, icon: Icon, actions }) {
  return (
    <div className="pp-page-header" style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '24px',
      paddingBottom: '32px',
      borderBottom: '1px solid var(--quantum-border)',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {Icon && (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--quantum-gold-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--quantum-gold)',
            flexShrink: 0
          }}>
            <Icon size={24} strokeWidth={1.5} />
          </div>
        )}
        
        <div>
          <h1 className="pp-hero-title pp-ivory-text" style={{ fontSize: '2rem', marginBottom: '8px', lineHeight: 1.1 }}>
            {title}
          </h1>
          {description && (
            <p className="pp-editorial" style={{ color: 'var(--quantum-text-muted)', fontSize: '1.1rem', margin: 0 }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
