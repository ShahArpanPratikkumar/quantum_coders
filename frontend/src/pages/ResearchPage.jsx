import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTree, Search, ChevronDown, ChevronUp, Copy, Download, Bookmark, AlertCircle } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import GoldButton from '../components/ui/GoldButton';
import { useToast } from '../context/ToastContext';
import { usePageContext } from '../context/PageContext';

export default function ResearchPage() {
  const { addToast } = useToast();
  const { pageContext, isDev, extractionStatus } = usePageContext();
  
  const [isAnalysed, setIsAnalysed] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [researchData, setResearchData] = useState([]);
  const [error, setError] = useState(null);
  const [fallbackLabel, setFallbackLabel] = useState(null);

  const parseResearchReport = (text) => {
    // Expected format: ## Section Title\nContent
    const lines = text.split('\n');
    const sections = [];
    let currentSection = null;

    for (const line of lines) {
      if (line.trim().startsWith('##')) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          id: 'sec-' + Math.random().toString(36).substr(2, 9),
          title: line.replace('##', '').trim(),
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    if (currentSection) sections.push(currentSection);
    
    // Trim content
    sections.forEach(s => { s.content = s.content.trim(); });
    
    return sections;
  };

  const handleAnalyse = async () => {
    if (!pageContext.content || pageContext.content.length < 100) {
      setError("No readable page content available to analyze. Please navigate to a text-heavy page.");
      return;
    }

    setIsAnalysing(true);
    setError(null);
    setFallbackLabel(null);

    try {
      const { researchPageAPI } = await import('../services/quantumApi.js');
      const response = await researchPageAPI({ pageContext });
      
      const parsed = parseResearchReport(response.research);
      if (parsed.length === 0) {
        throw new Error("Failed to parse research report. The AI returned an unexpected format.");
      }
      
      setResearchData(parsed);
      
      // Expand first two sections by default
      const initialExpand = {};
      if (parsed[0]) initialExpand[parsed[0].id] = true;
      if (parsed[1]) initialExpand[parsed[1].id] = true;
      setExpandedSections(initialExpand);
      
      setFallbackLabel(response.fallbackLabel);
      setIsAnalysed(true);
      addToast({ title: 'Analysis Complete', type: 'success' });
    } catch (err) {
      setError(err.message);
      addToast({ title: 'Analysis failed', type: 'error' });
    } finally {
      setIsAnalysing(false);
    }
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
    const fullText = researchData.map(s => `## ${s.title}\n${s.content}\n`).join('\n');
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

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '64px' }}>
        
        {isDev && (
          <div style={{ background: 'rgba(203, 162, 58, 0.1)', border: '1px solid var(--quantum-gold)', color: 'var(--quantum-gold)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <strong>DEV PREVIEW:</strong> In standalone mode, Quantum does not have access to a real browser tab.
          </div>
        )}

        {extractionStatus === 'protected' && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--quantum-error)', color: 'var(--quantum-error)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <strong>Protected Page:</strong> Chrome blocks extensions from reading this internal page.
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--quantum-error)', background: 'rgba(255,59,48,0.1)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

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
            <GoldButton variant="primary" size="lg" onClick={handleAnalyse} disabled={isAnalysing || extractionStatus === 'protected'}>
              {isAnalysing ? 'Analyzing Page Content...' : 'Analyze Page'}
            </GoldButton>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--quantum-text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--quantum-gold)' }}>AI-assisted interpretation</span> · Found on page
                {fallbackLabel && <span style={{ background: 'var(--quantum-gold)', color: 'var(--quantum-black-deep)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{fallbackLabel}</span>}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <GoldButton variant="outline" onClick={copyAll}><Copy size={14} style={{ marginRight: '8px' }} /> Copy All</GoldButton>
                <GoldButton variant="outline"><Bookmark size={14} style={{ marginRight: '8px' }} /> Save Report</GoldButton>
                <GoldButton variant="outline"><Download size={14} style={{ marginRight: '8px' }} /> Export</GoldButton>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {researchData.map((section) => (
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
