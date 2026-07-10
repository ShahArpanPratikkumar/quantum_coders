import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Bookmark, Volume2, RefreshCw, Download, Check, Sparkles } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import GoldButton from '../components/ui/GoldButton';
import { useToast } from '../context/ToastContext';
import { useQuantum } from '../context/QuantumContext';

const SUMMARY_MODES = [
  { id: 'quick', label: 'Quick Summary', desc: 'A short 2-3 sentence overview.' },
  { id: 'detailed', label: 'Detailed', desc: 'In-depth analysis with all key points.' },
  { id: 'key_points', label: 'Key Points', desc: 'Bullet points of the main takeaways.' },
  { id: 'beginner', label: 'Explain like I am 5', desc: 'Extremely simple terms.' },
  { id: 'action', label: 'Action Items', desc: 'What you need to do next.' },
];

const MOCK_SUMMARIES = {
  quick: "This page explains the fundamental concepts of React Router v6. It covers nested routing, layout routes, and the new data APIs.",
  detailed: "React Router v6 introduces a completely rewritten architecture. The primary change is the shift away from `<Switch>` in favor of `<Routes>`. Furthermore, it heavily promotes nested routing where parent layout components use an `<Outlet />` to render child routes. This allows for persistent UI elements like sidebars and headers that do not unmount during navigation.",
  key_points: "• React Router v6 replaced Switch with Routes.\n• Nested layouts use the Outlet component.\n• Data APIs allow loaders and actions directly on routes.\n• It is highly recommended for all modern React applications.",
  beginner: "Imagine your website is a big house. React Router is the map that helps you walk from the living room to the kitchen without having to leave the house and come back in through the front door!",
  action: "1. Upgrade your package.json to react-router-dom@6.\n2. Replace all <Switch> tags with <Routes>.\n3. Update <Route component={...}> to <Route element={<...>} />."
};

export default function SummaryPage() {
  const { currentPage } = useQuantum();
  const { addToast } = useToast();
  
  const [activeMode, setActiveMode] = useState('quick');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setSummary(null);
    
    // Simulate AI generation
    setTimeout(() => {
      setSummary({
        text: MOCK_SUMMARIES[activeMode] || MOCK_SUMMARIES.quick,
        wordCount: Math.floor(Math.random() * 100) + 20,
        readTime: '< 1 min'
      });
      setIsGenerating(false);
    }, 1800);
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.text);
      addToast({ title: 'Summary copied', type: 'success' });
    }
  };

  const handleSave = () => {
    addToast({ title: 'Saved to insights', type: 'success' });
  };

  const handleExport = () => {
    if (!summary) return;
    const blob = new Blob([summary.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${activeMode}.txt`;
    a.click();
    addToast({ title: 'Exported as TXT', type: 'success' });
  };

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Page Summary" 
        description="Extract the core essence of the current page in various formats."
        icon={FileText}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '64px' }}>
        <h3 className="pp-ui-text" style={{ color: 'var(--quantum-ivory)', marginBottom: '16px' }}>
          Select Summary Mode
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          {SUMMARY_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              style={{
                background: activeMode === mode.id ? 'var(--quantum-gold-muted)' : 'var(--quantum-glass)',
                border: `1px solid ${activeMode === mode.id ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--t-fast)'
              }}
            >
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' 
              }}>
                <span className="pp-ui-text" style={{ 
                  color: activeMode === mode.id ? 'var(--quantum-gold)' : 'var(--quantum-ivory)',
                  fontWeight: 600
                }}>
                  {mode.label}
                </span>
                {activeMode === mode.id && <Check size={16} color="var(--quantum-gold)" />}
              </div>
              <p style={{ 
                margin: 0, fontSize: '0.8rem', 
                color: activeMode === mode.id ? 'var(--quantum-ivory)' : 'var(--quantum-text-muted)' 
              }}>
                {mode.desc}
              </p>
            </button>
          ))}
        </div>

        <GoldButton 
          variant="primary" 
          size="lg" 
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{ width: '100%', marginBottom: '48px', display: 'flex', justifyContent: 'center' }}
        >
          {isGenerating ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw size={18} />
              </motion.div>
              Generating Summary...
            </>
          ) : (
            <>
              <Sparkles size={18} /> Generate {SUMMARY_MODES.find(m => m.id === activeMode)?.label}
            </>
          )}
        </GoldButton>

        <AnimatePresence mode="wait">
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'var(--quantum-glass)',
                border: '1px solid var(--quantum-border-soft)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                position: 'relative'
              }}
            >
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--quantum-border)' 
              }}>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--quantum-text-muted)', fontSize: '0.85rem' }}>
                  <span>{summary.wordCount} words</span>
                  <span>{summary.readTime} read</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCopy} style={iconBtn} title="Copy"><Copy size={16} /></button>
                  <button onClick={handleSave} style={iconBtn} title="Save to Insights"><Bookmark size={16} /></button>
                  <button style={iconBtn} title="Read Aloud"><Volume2 size={16} /></button>
                  <button onClick={handleExport} style={iconBtn} title="Export Text"><Download size={16} /></button>
                </div>
              </div>

              <div className="pp-editorial" style={{ 
                color: 'var(--quantum-ivory)', 
                fontSize: '1.1rem', 
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap' 
              }}>
                {summary.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

const iconBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all var(--t-fast)'
};
