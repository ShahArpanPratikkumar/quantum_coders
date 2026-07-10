import { ChevronLeft, Info, Activity } from 'lucide-react';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';

export default function CollapsedIntelligenceBar({ onExpand }) {
  const { aiState } = usePageIntelligence();
  const isWorking = ['extracting', 'thinking', 'listening', 'speaking'].includes(aiState);

  return (
    <div 
      className="pp-collapsed-intelligence"
      onClick={onExpand}
      title="Expand Page Intelligence"
    >
      <div style={topSection}>
        <ChevronLeft size={16} color="var(--quantum-text-muted)" />
      </div>
      
      <div style={centerSection}>
        <span style={verticalText}>INTELLIGENCE</span>
        <div style={divider} />
        <Info size={16} color="var(--quantum-gold)" />
      </div>
      
      <div style={bottomSection}>
        {isWorking ? (
          <Activity size={16} color="var(--quantum-gold)" className="pp-pulse" />
        ) : (
          <div style={dot} />
        )}
      </div>
    </div>
  );
}

const topSection = {
  padding: '16px 0',
  display: 'flex',
  justifyContent: 'center'
};

const centerSection = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
  justifyContent: 'center'
};

const verticalText = {
  writingMode: 'vertical-rl',
  textOrientation: 'mixed',
  fontSize: '0.7rem',
  letterSpacing: '0.2em',
  color: 'var(--quantum-text-muted)',
  fontWeight: 600
};

const divider = {
  width: '1px',
  height: '24px',
  background: 'var(--quantum-border)'
};

const bottomSection = {
  padding: '24px 0',
  display: 'flex',
  justifyContent: 'center'
};

const dot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--quantum-success)'
};
