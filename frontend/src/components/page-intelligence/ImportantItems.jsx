import { useNavigate } from 'react-router-dom';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { Code2, List, AlertTriangle, Link as LinkIcon, ChevronRight } from 'lucide-react';

export default function ImportantItems() {
  const { importantItems } = usePageIntelligence();
  const navigate = useNavigate();

  if (!importantItems) return null;

  const items = [
    { key: 'codeBlocks', label: 'code blocks', icon: Code2, count: importantItems.codeBlocks, route: '/code-lens' },
    { key: 'steps', label: 'setup steps', icon: List, count: importantItems.steps, route: '/ask' },
    { key: 'warnings', label: 'warnings', icon: AlertTriangle, count: importantItems.warnings, route: '/summary' },
    { key: 'links', label: 'external links', icon: LinkIcon, count: importantItems.links, route: '/summary' },
  ].filter(i => i.count > 0);

  if (items.length === 0) return null;

  return (
    <div style={container}>
      <span style={label}>IMPORTANT ITEMS</span>
      
      <div style={listContainer}>
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.route)}
            style={itemBtn}
          >
            <div style={leftCol}>
              <item.icon size={14} color="var(--quantum-gold)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--quantum-ivory)' }}>
                {item.count} {item.label}
              </span>
            </div>
            <ChevronRight size={14} color="var(--quantum-text-muted)" />
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

const listContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const itemBtn = {
  background: 'transparent',
  border: 'none',
  padding: '8px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all var(--t-fast)',
  borderBottom: '1px solid var(--quantum-border-soft)'
};

const leftCol = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};
