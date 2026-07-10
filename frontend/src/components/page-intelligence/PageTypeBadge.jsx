import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { Tag } from 'lucide-react';

export default function PageTypeBadge() {
  const { pageType, pageTypeConfidence } = usePageIntelligence();

  if (!pageType) return null;

  return (
    <div style={container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Tag size={12} color="var(--quantum-gold)" />
        <span style={typeText}>{pageType}</span>
      </div>
      
      {pageTypeConfidence && (
        <span style={confidenceText}>
          {pageTypeConfidence}% estimated confidence
        </span>
      )}
    </div>
  );
}

const container = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(203, 162, 58, 0.05)',
  border: '1px solid var(--quantum-border-soft)',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)'
};

const typeText = {
  fontSize: '0.8rem',
  color: 'var(--quantum-ivory)',
  fontWeight: 600
};

const confidenceText = {
  fontSize: '0.65rem',
  color: 'var(--quantum-text-muted)'
};
