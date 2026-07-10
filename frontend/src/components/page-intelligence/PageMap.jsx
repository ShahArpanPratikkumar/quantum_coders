import { useState } from 'react';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PageMap() {
  const { sections, selectedSection, setSelectedSection } = usePageIntelligence();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!sections || sections.length === 0) {
    return (
      <div style={container}>
        <span style={label}>PAGE MAP</span>
        <p style={{ fontSize: '0.8rem', color: 'var(--quantum-text-muted)', fontStyle: 'italic', margin: 0 }}>
          No clear page sections detected.
        </p>
      </div>
    );
  }

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    // In a real app, this would scroll the DOM. For demo, we just update state.
  };

  return (
    <div style={container}>
      <div style={headerRow}>
        <span style={label}>PAGE MAP</span>
        <button onClick={() => setIsCollapsed(!isCollapsed)} style={collapseBtn}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      
      {!isCollapsed && (
        <div style={mapContainer}>
          <div style={mapTrack} />
          {sections.map((section, idx) => {
            const isActive = selectedSection === section;
            return (
              <div 
                key={idx}
                onClick={() => handleSectionClick(section)}
                style={sectionItem}
              >
                <div style={{
                  ...indicator,
                  background: isActive ? 'var(--quantum-gold)' : 'var(--quantum-black-deep)',
                  borderColor: isActive ? 'var(--quantum-gold)' : 'var(--quantum-border)'
                }} />
                <span style={{
                  fontSize: '0.8rem',
                  color: isActive ? 'var(--quantum-gold)' : 'var(--quantum-text-muted)',
                  transition: 'color var(--t-fast)'
                }}>
                  {String(idx + 1).padStart(2, '0')} {section}
                </span>
              </div>
            );
          })}
        </div>
      )}
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

const collapseBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--quantum-text-muted)',
  cursor: 'pointer',
  padding: 0
};

const mapContainer = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingLeft: '6px'
};

const mapTrack = {
  position: 'absolute',
  left: '9px',
  top: '8px',
  bottom: '8px',
  width: '1px',
  background: 'var(--quantum-border)'
};

const sectionItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  cursor: 'pointer',
  position: 'relative',
  zIndex: 2
};

const indicator = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  border: '1px solid',
  transition: 'all var(--t-fast)'
};
