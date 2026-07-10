import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { RefreshCw } from 'lucide-react';

export default function AIStatusCard() {
  const { aiState, aiStateMessage, lastUpdated, refreshPageContext } = usePageIntelligence();

  const isError = aiState === 'error';
  const isWorking = ['extracting', 'thinking', 'listening', 'speaking'].includes(aiState);
  
  let dotColor = 'var(--quantum-success)';
  if (isError) dotColor = 'var(--quantum-error)';
  else if (isWorking) dotColor = 'var(--quantum-gold)';

  return (
    <div style={container}>
      <span style={label}>AI STATE</span>
      
      <div style={card(isError)}>
        <div style={topRow}>
          <div style={statusWrapper}>
            <span 
              className={isWorking ? 'pp-fab__status-dot' : ''} 
              style={{ 
                width: 8, height: 8, borderRadius: '50%', background: dotColor,
                boxShadow: isWorking ? `0 0 8px ${dotColor}` : 'none'
              }} 
            />
            <span style={statusText}>
              {aiState.charAt(0).toUpperCase() + aiState.slice(1)}
            </span>
          </div>
          
          {isError && (
            <button onClick={refreshPageContext} style={retryBtn}>
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
        
        <p style={messageText}>{aiStateMessage}</p>
        
        {lastUpdated && (
          <span style={timeText}>
            Updated just now
          </span>
        )}
      </div>
    </div>
  );
}

const container = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const label = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'var(--quantum-text-muted)',
  textTransform: 'uppercase'
};

const card = (isError) => ({
  background: isError ? 'rgba(239, 68, 68, 0.05)' : 'var(--quantum-black-deep)',
  border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.3)' : 'var(--quantum-border)'}`,
  borderRadius: 'var(--radius-md)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
});

const topRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const statusWrapper = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const statusText = {
  fontSize: '0.85rem',
  color: 'var(--quantum-ivory)',
  fontWeight: 600
};

const messageText = {
  fontSize: '0.8rem',
  color: 'var(--quantum-text-muted)',
  margin: 0,
  lineHeight: 1.4
};

const timeText = {
  fontSize: '0.65rem',
  color: 'var(--quantum-gold-muted)',
  marginTop: '4px'
};

const retryBtn = {
  background: 'transparent',
  border: '1px solid var(--quantum-error)',
  color: 'var(--quantum-error)',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer'
};
