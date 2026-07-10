import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlighter, BookOpen, Volume2, Copy, Eraser, Languages, RefreshCw, Zap } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';
import { usePageContext } from '../context/PageContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';

const DEFAULT_SELECTION = "";

export default function SelectionPage() {
  const { addToast } = useToast();
  const { content } = usePageContext();
  const { speak } = useSpeechSynthesis();
  
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const handleAction = async (actionKey) => {
    setActiveAction(actionKey);
    setIsLoading(true);
    setResult(null);
    
    try {
      const { explainTextAPI, translateTextAPI, summarizePageAPI } = await import('../services/quantumApi.js');
      let responseText = "";
      
      if (actionKey === 'translate_hi' || actionKey === 'translate_gu') {
        const lang = actionKey === 'translate_hi' ? 'Hindi' : 'Gujarati';
        const res = await translateTextAPI({ text: selection, targetLanguage: lang });
        responseText = res.translation;
      } else if (actionKey === 'summarize') {
        const res = await summarizePageAPI({ pageContext: { title: 'Selection', content: selection }, mode: 'quick' });
        responseText = res.summary;
      } else {
        const modeDesc = actionKey === 'simplify' ? 'Explain this in extremely simple terms for a beginner' : 'Explain this text in detail';
        const res = await explainTextAPI({ text: selection, context: content || '' });
        responseText = res.explanation;
      }
      
      setResult(responseText);
    } catch (err) {
      let errMsg = err.message;
      if (errMsg === 'Failed to fetch' || errMsg.includes('fetch')) errMsg = 'Backend offline. Run npm run server';
      setResult(`Error: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const readAloud = (text) => {
    speak(text);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied to clipboard', type: 'success' });
  };

  const clearSelection = () => {
    setSelection('');
    setResult(null);
    setActiveAction(null);
  };

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Selected Text" 
        description="Analyze, translate, or explain any text you highlight on the page."
        icon={Highlighter}
        actions={
          <button onClick={clearSelection} style={iconBtn} title="Clear Selection">
            <Eraser size={16} />
          </button>
        }
      />

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Selection Card */}
        <div style={{
          background: 'var(--quantum-black-deep)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--quantum-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Selection
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => readAloud(selection)} style={miniBtn}><Volume2 size={14} /></button>
              <button onClick={() => copyText(selection)} style={miniBtn}><Copy size={14} /></button>
            </div>
          </div>
          
          {selection ? (
            <textarea
              className="pp-editorial"
              value={selection}
              onChange={(e) => setSelection(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '120px', 
                background: 'transparent', 
                border: '1px solid var(--quantum-border-soft)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '1.1rem', 
                color: 'var(--quantum-ivory)', 
                lineHeight: 1.6, 
                resize: 'vertical',
                outline: 'none'
              }}
            />
          ) : (
            <textarea
              placeholder="Paste or type text here..."
              value={selection}
              onChange={(e) => setSelection(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '120px', 
                background: 'transparent', 
                border: '1px dashed var(--quantum-border)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '1rem', 
                color: 'var(--quantum-text-muted)', 
                resize: 'vertical',
                outline: 'none'
              }}
            />
          )}
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <ActionButton icon={Zap} label="Explain" active={activeAction === 'explain'} onClick={() => handleAction('explain')} disabled={!selection} />
          <ActionButton icon={BookOpen} label="Simplify" active={activeAction === 'simplify'} onClick={() => handleAction('simplify')} disabled={!selection} />
          <ActionButton icon={Highlighter} label="Summarize" active={activeAction === 'summarize'} onClick={() => handleAction('summarize')} disabled={!selection} />
          <ActionButton icon={Languages} label="Hindi" active={activeAction === 'translate_hi'} onClick={() => handleAction('translate_hi')} disabled={!selection} />
          <ActionButton icon={Languages} label="Gujarati" active={activeAction === 'translate_gu'} onClick={() => handleAction('translate_gu')} disabled={!selection} />
        </div>

        {/* Result Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '48px', display: 'flex', justifyContent: 'center', color: 'var(--quantum-gold)' }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw size={24} />
              </motion.div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--quantum-glass)',
                border: '1px solid var(--quantum-border-soft)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => readAloud(result)} style={miniBtn}><Volume2 size={14} /></button>
                <button onClick={() => copyText(result)} style={miniBtn}><Copy size={14} /></button>
              </div>
              <p className="pp-editorial" style={{ fontSize: '1.1rem', color: 'var(--quantum-ivory)', lineHeight: 1.8, margin: 0 }}>
                {result}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}

function ActionButton({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: active ? 'var(--quantum-gold)' : 'var(--quantum-black-deep)',
        color: active ? 'var(--quantum-black-deep)' : 'var(--quantum-ivory)',
        border: `1px solid ${active ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
        padding: '16px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--t-fast)'
      }}
    >
      <Icon size={24} />
      <span className="pp-ui-text" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
    </button>
  );
}

const iconBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '32px', height: '32px', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer'
};

const miniBtn = {
  ...iconBtn,
  width: '28px', height: '28px', borderRadius: '6px'
};
