import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ArrowRightLeft, Volume2, Copy, Trash2, RefreshCw } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import GoldButton from '../components/ui/GoldButton';
import { useToast } from '../context/ToastContext';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'gu', name: 'Gujarati' }
];

const MOCK_TRANSLATIONS = {
  'en-hi': "यह पृष्ठ रिएक्ट राउटर v6 के लिए प्रलेखन है। यह नेविगेशन और नेस्टेड लेआउट को कॉन्फ़िगर करने का तरीका बताता है।",
  'en-gu': "આ પૃષ્ઠ રિએક્ટ રાઉટર v6 માટે દસ્તાવેજીકરણ છે. તે નેવિગેશન અને નેસ્ટેડ લેઆઉટને કેવી રીતે ગોઠવવું તે સમજાવે છે.",
  'hi-en': "This page is the documentation for React Router v6. It explains how to configure navigation and nested layouts.",
  'gu-en': "This page is the documentation for React Router v6. It explains how to configure navigation and nested layouts."
};

const DEFAULT_SOURCE = "This page is the documentation for React Router v6. It explains how to configure navigation and nested layouts.";

export default function TranslatePage() {
  const { addToast } = useToast();
  const synthRef = useRef(window.speechSynthesis);

  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [sourceText, setSourceText] = useState(DEFAULT_SOURCE);
  const [targetText, setTargetText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    setTimeout(() => {
      const key = `${sourceLang}-${targetLang}`;
      setTargetText(MOCK_TRANSLATIONS[key] || "Translation not available in mock data. Try English to Hindi.");
      setIsTranslating(false);
    }, 1200);
  };

  const speak = (text, langCode) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Simple heuristic for demo
    utterance.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'gu' ? 'gu-IN' : 'en-US';
    synthRef.current.speak(utterance);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied to clipboard', type: 'success' });
  };

  return (
    <PageTransition style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader 
        title="Translate" 
        description="Translate the entire page or selected passages instantly."
        icon={Languages}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
        
        {/* Language Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--quantum-black-deep)',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--quantum-border)'
        }}>
          <select 
            value={sourceLang} 
            onChange={e => setSourceLang(e.target.value)}
            style={selectStyle}
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>

          <button onClick={handleSwap} style={iconBtn} title="Swap Languages">
            <ArrowRightLeft size={18} />
          </button>

          <select 
            value={targetLang} 
            onChange={e => setTargetLang(e.target.value)}
            style={selectStyle}
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
          
          <GoldButton variant="primary" onClick={handleTranslate} disabled={isTranslating || !sourceText} style={{ marginLeft: 'auto' }}>
            {isTranslating ? <RefreshCw size={16} className="spin" /> : 'Translate'}
          </GoldButton>
        </div>

        {/* Translation Panes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1 }}>
          
          {/* Source Pane */}
          <div style={paneStyle}>
            <div style={paneHeaderStyle}>
              <span style={{ fontSize: '0.8rem', color: 'var(--quantum-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Source Text
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => speak(sourceText, sourceLang)} style={miniBtn} title="Read Aloud"><Volume2 size={14} /></button>
                <button onClick={() => copyToClipboard(sourceText)} style={miniBtn} title="Copy"><Copy size={14} /></button>
                <button onClick={() => { setSourceText(''); setTargetText(''); }} style={miniBtn} title="Clear"><Trash2 size={14} /></button>
              </div>
            </div>
            <textarea
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              style={textareaStyle}
            />
          </div>

          {/* Target Pane */}
          <div style={{...paneStyle, background: 'var(--quantum-glass)'}}>
            <div style={paneHeaderStyle}>
              <span style={{ fontSize: '0.8rem', color: 'var(--quantum-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Translation
              </span>
              {targetText && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => speak(targetText, targetLang)} style={miniBtn} title="Read Aloud"><Volume2 size={14} /></button>
                  <button onClick={() => copyToClipboard(targetText)} style={miniBtn} title="Copy"><Copy size={14} /></button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, padding: '24px', position: 'relative' }}>
              <AnimatePresence mode="wait">
                {isTranslating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--quantum-gold)' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <RefreshCw size={32} />
                    </motion.div>
                  </motion.div>
                ) : targetText ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="pp-editorial" style={{ margin: 0, color: 'var(--quantum-ivory)', fontSize: '1.2rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {targetText}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="empty" style={{ color: 'var(--quantum-text-muted)', fontStyle: 'italic', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Translation will appear here.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>
    </PageTransition>
  );
}

const selectStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--quantum-ivory)',
  fontSize: '1rem',
  fontFamily: 'var(--font-interface)',
  outline: 'none',
  cursor: 'pointer',
  padding: '8px'
};

const iconBtn = {
  background: 'var(--quantum-surface)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-ivory)',
  width: '40px', height: '40px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.2s'
};

const paneStyle = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden'
};

const paneHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px 16px', borderBottom: '1px solid var(--quantum-border)'
};

const textareaStyle = {
  flex: 1, background: 'transparent', border: 'none',
  color: 'var(--quantum-ivory)', fontSize: '1.1rem', fontFamily: 'var(--font-interface)',
  lineHeight: 1.6, padding: '24px', resize: 'none', outline: 'none'
};

const miniBtn = {
  background: 'transparent', border: 'none', color: 'var(--quantum-text-muted)',
  width: '28px', height: '28px', borderRadius: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};
