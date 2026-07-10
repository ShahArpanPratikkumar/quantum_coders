import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Bookmark, Volume2, RefreshCw, Download, Check, Sparkles, AlertCircle, Pause, Play, Square, RotateCcw } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import GoldButton from '../components/ui/GoldButton';
import { useToast } from '../context/ToastContext';
import { usePageContext } from '../context/PageContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';

const SUMMARY_MODES = [
  { id: 'quick', label: 'Quick Summary', desc: 'A short 2-3 sentence overview.' },
  { id: 'detailed', label: 'Detailed', desc: 'In-depth analysis with all key points.' },
  { id: 'key_points', label: 'Key Points', desc: 'Bullet points of the main takeaways.' },
  { id: 'beginner', label: 'Explain like I am 5', desc: 'Extremely simple terms.' },
  { id: 'action', label: 'Action Items', desc: 'What you need to do next.' },
];

export default function SummaryPage() {
  const { pageContext, isDev, extractionStatus } = usePageContext();
  const { addToast } = useToast();
  const { speak, pause, resume, stop: stopSpeaking, replay, isSpeaking, isPaused } = useSpeechSynthesis();
  
  const [activeMode, setActiveMode] = useState('quick');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!pageContext.content || pageContext.content.length < 50) {
      setError("No readable page content available to summarize. Ensure you are on a text-heavy page.");
      return;
    }

    setIsGenerating(true);
    setSummary(null);
    setError(null);
    
    try {
      const { summarizePageAPI } = await import('../services/quantumApi.js');
      const response = await summarizePageAPI({ 
        pageContext, 
        mode: activeMode 
      });
      
      setSummary({
        text: response.summary,
        wordCount: response.summary.split(/\s+/).length,
        readTime: '~ ' + Math.ceil(response.summary.split(/\s+/).length / 200) + ' min',
        fallbackLabel: response.fallbackLabel
      });
    } catch (err) {
      setError(err.message);
      addToast({ title: 'Error generating summary', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
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

  const readAloud = () => {
    if (!summary) return;
    speak(summary.text);
  };

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Page Summary" 
        description="Extract the core essence of the current page in various formats."
        icon={FileText}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '64px' }}>
        
        {isDev && (
          <div style={{ background: 'rgba(203, 162, 58, 0.1)', border: '1px solid var(--quantum-gold)', color: 'var(--quantum-gold)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem' }}>
            <strong>DEV PREVIEW:</strong> In standalone mode, Quantum does not have access to a real browser tab. Test this inside the Chrome Extension.
          </div>
        )}

        {extractionStatus === 'protected' && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--quantum-error)', color: 'var(--quantum-error)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem' }}>
            <strong>Protected Page:</strong> Chrome blocks extensions from reading this internal page. Please navigate to a normal website.
          </div>
        )}

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
          disabled={isGenerating || extractionStatus === 'protected'}
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

        {error && (
          <div style={{ color: 'var(--quantum-error)', background: 'rgba(255,59,48,0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

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
              {summary.fallbackLabel && (
                <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--quantum-gold)', color: 'var(--quantum-black-deep)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {summary.fallbackLabel}
                </div>
              )}
              
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
                  <button onClick={readAloud} style={iconBtn} title="Read Aloud" disabled={isSpeaking}><Volume2 size={16} /></button>
                  {isSpeaking && (
                    <button onClick={isPaused ? resume : pause} style={iconBtn} title={isPaused ? 'Resume' : 'Pause'}>
                      {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                  )}
                  {isSpeaking && (
                    <button onClick={stopSpeaking} style={iconBtn} title="Stop"><Square size={16} fill="currentColor" /></button>
                  )}
                  <button onClick={replay} style={iconBtn} title="Replay"><RotateCcw size={16} /></button>
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
