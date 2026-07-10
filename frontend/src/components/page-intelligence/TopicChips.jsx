import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';

export default function TopicChips() {
  const { topics, setSelectedTopic } = usePageIntelligence();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  if (!topics || topics.length === 0) {
    return (
      <div style={container}>
        <span style={label}>MAIN TOPICS</span>
        <p style={{ fontSize: '0.8rem', color: 'var(--quantum-text-muted)', fontStyle: 'italic', margin: 0 }}>
          No clear topics were detected.
        </p>
      </div>
    );
  }

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    navigate('/ask', { state: { prefilledQuestion: `Explain ${topic} from this page.` } });
  };

  const visibleTopics = showAll ? topics : topics.slice(0, 5);

  return (
    <div style={container}>
      <span style={label}>MAIN TOPICS</span>
      
      <div style={chipContainer}>
        {visibleTopics.map((topic, idx) => (
          <button
            key={idx}
            onClick={() => handleTopicClick(topic)}
            style={chipBtn}
          >
            {topic}
          </button>
        ))}
      </div>
      
      {topics.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} style={viewAllBtn}>
          {showAll ? 'Show less' : 'View all topics'}
        </button>
      )}
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

const chipContainer = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px'
};

const chipBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-ivory)',
  fontSize: '0.75rem',
  padding: '6px 12px',
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'all var(--t-fast)'
};

const viewAllBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--quantum-gold)',
  fontSize: '0.75rem',
  textAlign: 'left',
  cursor: 'pointer',
  padding: 0,
  alignSelf: 'flex-start'
};
