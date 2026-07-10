import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTree, Search, ChevronDown, ChevronUp, Copy, Download, Bookmark } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import GoldButton from '../components/ui/GoldButton';
import { useToast } from '../context/ToastContext';

const MOCK_RESEARCH_DATA = [
  {
    id: 'topic',
    title: 'Main Topic & Summary',
    content: 'The page discusses React Router v6, focusing on its architectural changes, specifically the move to `<Routes>`, nested layouts with `<Outlet>`, and new data fetching APIs like loaders and actions.'
  },
  {
    id: 'claims',
    title: 'Key Claims',
    content: '1. React Router v6 is significantly faster than v5.\n2. Nested routing reduces unnecessary re-renders of layout components.\n3. Data loading at the route level prevents waterfall network requests.'
  },
  {
    id: 'entities',
    title: 'Mentioned Entities',
    content: 'People: Michael Jackson (Creator), Ryan Florence (Creator)\nOrganizations: Remix, React Training\nTechnologies: React, React Router, JavaScript, Express'
  },
  {
    id: 'bias',
    title: 'Possible Bias',
    content: 'The article is written from the perspective of the library creators or advocates, meaning it heavily emphasizes the positive benefits without detailing potential migration pain points.'
  },
  {
    id: 'questions',
    title: 'Questions Not Answered',
    content: '1. How difficult is the migration from v5 to v6 for large enterprise apps?\n2. What are the fallback strategies if a route loader fails entirely?'
  }
];

export default function ResearchPage() {
  const { addToast } = useToast();
  
  const [isAnalysed, setIsAnalysed] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ topic: true, claims: true });

  const handleAnalyse = () => {
    setIsAnalysing(true);
    setTimeout(() => {
      setIsAnalysing(false);
      setIsAnalysed(true);
      addToast({ title: 'Analysis Complete', type: 'success' });
    }, 2500);
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copySection = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied section', type: 'success' });
  };

  const copyAll = () => {
    const fullText = MOCK_RESEARCH_DATA.map(s => `## ${s.title}\n${s.content}\n`).join('\n');
    navigator.clipboard.writeText(fullText);
    addToast({ title: 'Copied full report', type: 'success' });
  };

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Research Mode" 
        description="Extract structured intelligence, entities, and claims from this page."
        icon={ListTree}
      />

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {!isAnalysed ? (
          <div style={{
            background: 'var(--quantum-black-deep)',
            border: '1px solid var(--quantum-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '64px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Search size={48} color="var(--quantum-gold)" style={{ opacity: 0.5, marginBottom: '24px' }} />
            <h2 className="pp-hero-title" style={{ fontSize: '2rem', marginBottom: '16px' }}>Begin Deep Analysis</h2>
            <p className="pp-editorial" style={{ color: 'var(--quantum-text-muted)', marginBottom: '32px', maxWidth: '400px' }}>
              Quantum will scan the page for key claims, entities, statistics, and potential biases to generate a structured research report.
            </p>
            <GoldButton variant="primary" size="lg" onClick={handleAnalyse} disabled={isAnalysing}>
              {isAnalysing ? 'Analyzing Page Content...' : 'Analyze Page'}
            </GoldButton>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--quantum-text-muted)' }}>
                <span style={{ color: 'var(--quantum-gold)' }}>AI-assisted interpretation</span> · Found on page
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <GoldButton variant="outline" onClick={copyAll}><Copy size={14} style={{ marginRight: '8px' }} /> Copy All</GoldButton>
                <GoldButton variant="outline"><Bookmark size={14} style={{ marginRight: '8px' }} /> Save Report</GoldButton>
                <GoldButton variant="outline"><Download size={14} style={{ marginRight: '8px' }} /> Export</GoldButton>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {MOCK_RESEARCH_DATA.map((section) => (
                <div key={section.id} style={{
                  background: 'var(--quantum-glass)',
                  border: '1px solid var(--quantum-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <div 
                    onClick={() => toggleSection(section.id)}
                    style={{
                      padding: '16px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: expandedSections[section.id] ? 'var(--quantum-gold-muted)' : 'transparent',
                      borderBottom: expandedSections[section.id] ? '1px solid var(--quantum-border)' : 'none',
                      transition: 'background var(--t-fast)'
                    }}
                  >
                    <span className="pp-ui-text" style={{ 
                      color: expandedSections[section.id] ? 'var(--quantum-gold)' : 'var(--quantum-ivory)', 
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {section.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {expandedSections[section.id] && (
                        <button onClick={(e) => copySection(e, section.content)} style={miniBtn} title="Copy section">
                          <Copy size={14} />
                        </button>
                      )}
                      {expandedSections[section.id] ? <ChevronUp size={20} color="var(--quantum-text-muted)" /> : <ChevronDown size={20} color="var(--quantum-text-muted)" />}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections[section.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="pp-editorial" style={{
                          padding: '24px',
                          color: 'var(--quantum-ivory)',
                          fontSize: '1.1rem',
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </PageTransition>
  );
}

const miniBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '28px', height: '28px', borderRadius: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer'
};
