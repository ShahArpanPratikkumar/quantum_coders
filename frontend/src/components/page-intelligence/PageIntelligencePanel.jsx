import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import './PageIntelligencePanel.css';

// Subcomponents
import CurrentPageHeader from './CurrentPageHeader';
import QuickPageSummary from './QuickPageSummary';
import QuickPageActions from './QuickPageActions';
import PageTypeBadge from './PageTypeBadge';
import TopicChips from './TopicChips';
import PageMap from './PageMap';
import ReadingProgressCard from './ReadingProgressCard';
import SmartSuggestions from './SmartSuggestions';
import ImportantItems from './ImportantItems';
import AIStatusCard from './AIStatusCard';
import CollapsedIntelligenceBar from './CollapsedIntelligenceBar';

export default function PageIntelligencePanel() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('quantum-page-intelligence-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('quantum-page-intelligence-collapsed', isCollapsed);
  }, [isCollapsed]);

  if (isCollapsed) {
    return (
      <aside className="pp-page-intelligence collapsed">
        <CollapsedIntelligenceBar onExpand={() => setIsCollapsed(false)} />
      </aside>
    );
  }

  return (
    <aside className="pp-page-intelligence">
      <div className="pp-pi-header">
        <span className="pp-label-gold">Page Intelligence</span>
        <button 
          onClick={() => setIsCollapsed(true)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--quantum-text-muted)', cursor: 'pointer', padding: 4 }}
          title="Collapse Panel (Ctrl+B)"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="pp-pi-content">
        <CurrentPageHeader />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PageTypeBadge />
          <QuickPageSummary />
          <QuickPageActions />
        </div>

        <TopicChips />
        <PageMap />
        <ReadingProgressCard />
        <SmartSuggestions />
        <ImportantItems />
        <AIStatusCard />
      </div>
    </aside>
  );
}
