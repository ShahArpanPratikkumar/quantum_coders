import { useNavigate } from 'react-router-dom';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { MessageSquare, RefreshCw } from 'lucide-react';

export default function SmartSuggestions() {
  const { suggestedQuestions } = usePageIntelligence();
  const navigate = useNavigate();

  if (!suggestedQuestions || suggestedQuestions.length === 0) return null;

  const handleSuggestionClick = (q) => {
    navigate('/ask', { state: { prefilledQuestion: q } });
  };

  return (
    <div style={container}>
      <div style={headerRow}>
        <span style={label}>SMART SUGGESTIONS</span>
        <button style={refreshBtn} title="Refresh Suggestions">
          <RefreshCw size={12} />
        </button>
      </div>
      
      <div style={listContainer}>
        {suggestedQuestions.slice(0, 3).map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(q)}
            style={suggestionBtn}
          >
            <MessageSquare size={14} color="var(--quantum-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ textAlign: 'left' }}>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const container = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const label = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'var(--quantum-text-muted)',
  textTransform: 'uppercase'
};

const refreshBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--quantum-text-muted)',
  cursor: 'pointer',
  padding: '4px'
};

const listContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const suggestionBtn = {
  background: 'var(--quantum-glass)',
  border: '1px solid var(--quantum-border-soft)',
  padding: '12px',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  color: 'var(--quantum-ivory)',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'border-color var(--t-fast)'
};
