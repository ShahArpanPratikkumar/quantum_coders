import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Volume2, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { useToast } from '../../context/ToastContext';

export default function QuickPageSummary() {
  const { summary } = usePageIntelligence();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!summary) {
    return (
      <div style={container}>
        <span style={label}>QUICK SUMMARY</span>
        <p style={{ ...textStyle, fontStyle: 'italic', color: 'var(--quantum-text-muted)' }}>
          Summary is not available yet. Analyse the current page to generate one.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    addToast({ title: 'Summary copied', type: 'success' });
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(summary);
      window.speechSynthesis.speak(utterance);
      addToast({ title: 'Reading summary...', type: 'info' });
    }
  };

  return (
    <div style={container}>
      <span style={label}>QUICK SUMMARY</span>
      
      <div style={contentBox}>
        <p style={{ ...textStyle, WebkitLineClamp: expanded ? 'unset' : 3 }} className={expanded ? '' : 'pp-truncate-3'}>
          {summary}
        </p>
        
        <div style={actionsRow}>
          <button onClick={() => setExpanded(!expanded)} style={actionBtn}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={handleCopy} style={iconBtn} title="Copy"><Copy size={12} /></button>
            <button onClick={handleReadAloud} style={iconBtn} title="Read Aloud"><Volume2 size={12} /></button>
            <button onClick={() => navigate('/summary')} style={iconBtn} title="Full Summary"><Maximize2 size={12} /></button>
          </div>
        </div>
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

const contentBox = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  borderRadius: 'var(--radius-md)',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const textStyle = {
  fontSize: '0.85rem',
  lineHeight: 1.6,
  color: 'var(--quantum-ivory)',
  margin: 0
};

const actionsRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid var(--quantum-border)',
  paddingTop: '8px'
};

const actionBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--quantum-gold)',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  padding: '4px 0'
};

const iconBtn = {
  background: 'var(--quantum-glass)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};
