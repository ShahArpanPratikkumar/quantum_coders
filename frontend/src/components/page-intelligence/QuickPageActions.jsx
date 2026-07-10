import { useNavigate } from 'react-router-dom';
import { MessageSquare, FileText, Volume2, Sparkles, Code2, Languages } from 'lucide-react';

const ACTIONS = [
  { label: 'Ask About Page', icon: MessageSquare, route: '/ask' },
  { label: 'Summarize', icon: FileText, route: '/summary' },
  { label: 'Read Aloud', icon: Volume2, route: '/reader' },
  { label: 'Explain Simply', icon: Sparkles, route: '/ask', state: { prefilledQuestion: 'Explain this page in simple language.' } },
  { label: 'Code Lens', icon: Code2, route: '/code-lens' },
  { label: 'Translate', icon: Languages, route: '/translate' },
];

export default function QuickPageActions() {
  const navigate = useNavigate();

  return (
    <div style={container}>
      <span style={label}>QUICK ACTIONS</span>
      
      <div style={grid}>
        {ACTIONS.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.route, { state: action.state })}
            style={actionBtn}
          >
            <action.icon size={14} style={{ marginBottom: '6px', color: 'var(--quantum-gold)' }} />
            <span style={{ fontSize: '0.7rem' }}>{action.label}</span>
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

const label = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'var(--quantum-text-muted)',
  textTransform: 'uppercase'
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '8px'
};

const actionBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '12px 4px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--quantum-ivory)',
  cursor: 'pointer',
  transition: 'all var(--t-fast)',
  textAlign: 'center',
  lineHeight: 1.2
};
