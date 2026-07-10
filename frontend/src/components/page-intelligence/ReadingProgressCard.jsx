import { useNavigate } from 'react-router-dom';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { BookOpen } from 'lucide-react';

export default function ReadingProgressCard() {
  const { progress, estimatedTimeLeft } = useReadingProgress();
  const { sections, selectedSection } = usePageIntelligence();
  const navigate = useNavigate();

  const currentSectionIdx = selectedSection && sections 
    ? sections.indexOf(selectedSection) + 1 
    : Math.max(1, Math.ceil((progress / 100) * (sections?.length || 1)));

  return (
    <div style={container}>
      <span style={label}>READING PROGRESS</span>
      
      <div style={card}>
        <div style={topRow}>
          <div style={progressCircleWrap}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="var(--quantum-black-deep)" strokeWidth="4" />
              <circle 
                cx="20" cy="20" r="16" fill="none" 
                stroke="var(--quantum-gold)" strokeWidth="4" 
                strokeDasharray="100.5" 
                strokeDashoffset={100.5 - (100.5 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 20 20)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <span style={progressText}>{progress}%</span>
          </div>
          
          <div style={infoCol}>
            {sections && sections.length > 0 && (
              <span style={sectionText}>Section {currentSectionIdx} of {sections.length}</span>
            )}
            <span style={timeText}>{estimatedTimeLeft}</span>
          </div>
        </div>
        
        <button onClick={() => navigate('/reader')} style={continueBtn}>
          <BookOpen size={14} />
          Continue Reading
        </button>
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

const card = {
  background: 'var(--quantum-glass)',
  border: '1px solid var(--quantum-border-soft)',
  padding: '16px',
  borderRadius: 'var(--radius-md)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const topRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const progressCircleWrap = {
  position: 'relative',
  width: '40px',
  height: '40px'
};

const progressText = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--quantum-ivory)'
};

const infoCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const sectionText = {
  fontSize: '0.85rem',
  color: 'var(--quantum-ivory)',
  fontWeight: 500
};

const timeText = {
  fontSize: '0.75rem',
  color: 'var(--quantum-text-muted)'
};

const continueBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-gold-muted)',
  color: 'var(--quantum-gold)',
  width: '100%',
  padding: '10px',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  transition: 'all var(--t-fast)'
};
