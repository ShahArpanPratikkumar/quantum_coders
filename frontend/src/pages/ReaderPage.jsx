import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Pause, Square, SkipForward, SkipBack, Settings2, FileText, Type } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { usePageContext } from '../context/PageContext';

export default function ReaderPage() {
  const { settings } = useSettings();
  const { addToast } = useToast();
  const { content, title, isDev, extractionStatus } = usePageContext();
  
  const [sourceMode, setSourceMode] = useState('page'); // 'page' | 'manual'
  const [manualText, setManualText] = useState('');
  
  const activeContent = sourceMode === 'page' ? content : manualText;

  const articleChunks = useMemo(() => {
    if (!activeContent || activeContent.trim().length === 0) return [];
    
    // Chunking logic: split by paragraphs
    const paragraphs = activeContent.split(/\n\s*\n/).filter(p => p.trim());
    const chunks = [];
    
    if (sourceMode === 'page' && title) {
      chunks.push({ id: 0, type: 'h1', text: title });
    }
    
    paragraphs.forEach((p, i) => {
      chunks.push({ id: i + 1, type: 'p', text: p.trim() });
    });
    
    return chunks;
  }, [activeContent, sourceMode, title]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speed, setSpeed] = useState(1);
  
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        // Prefer English voices
        const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  useEffect(() => {
    // Restore progress
    const savedIdx = localStorage.getItem(`quantum-reading-progress-${sourceMode}`);
    if (savedIdx !== null && parseInt(savedIdx, 10) < articleChunks.length) {
      setActiveIdx(parseInt(savedIdx, 10));
    } else {
      setActiveIdx(0);
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [sourceMode, articleChunks.length]);

  const saveProgress = (idx) => {
    setActiveIdx(idx);
    localStorage.setItem(`quantum-reading-progress-${sourceMode}`, idx.toString());
  };

  const speakSection = (idx) => {
    if (!synthRef.current || articleChunks.length === 0 || idx >= articleChunks.length) return;
    synthRef.current.cancel();

    // Clean text for speech
    let text = articleChunks[idx].text;
    text = text.replace(/[*#_`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    utterance.rate = speed;
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    
    utterance.onend = () => {
      if (idx < articleChunks.length - 1) {
        saveProgress(idx + 1);
        speakSection(idx + 1);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
      }
    };
    
    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        console.error('Speech error:', e);
        setIsPlaying(false);
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const togglePlay = () => {
    if (!synthRef.current) {
      addToast({ title: 'Speech not supported in this browser', type: 'error' });
      return;
    }
    if (articleChunks.length === 0) return;

    if (isPlaying) {
      if (isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
      } else {
        synthRef.current.pause();
        setIsPaused(true);
      }
    } else {
      speakSection(activeIdx);
    }
  };

  const stop = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const next = () => {
    if (activeIdx < articleChunks.length - 1) {
      const nextIdx = activeIdx + 1;
      saveProgress(nextIdx);
      if (isPlaying) speakSection(nextIdx);
    }
  };

  const prev = () => {
    if (activeIdx > 0) {
      const prevIdx = activeIdx - 1;
      saveProgress(prevIdx);
      if (isPlaying) speakSection(prevIdx);
    }
  };

  // Stats
  const wordCount = useMemo(() => activeContent ? activeContent.split(/\s+/).filter(w=>w).length : 0, [activeContent]);
  const estimatedTime = Math.ceil(wordCount / 200);

  return (
    <PageTransition style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader 
        title="Smart Reader" 
        description="Listen to the current page or paste custom text while Quantum highlights the active section."
        icon={BookOpen}
        actions={
          <button style={ctrlBtn} title="Reader Settings">
            <Settings2 size={16} />
          </button>
        }
      />

      <div style={{ flex: 1, display: 'flex', gap: '32px', minHeight: 0, paddingBottom: '32px' }}>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Source Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => { setSourceMode('page'); stop(); }}
              style={{ ...tabBtn, ...(sourceMode === 'page' ? activeTabBtn : {}) }}
            >
              <FileText size={16} /> Current Page
            </button>
            <button 
              onClick={() => { setSourceMode('manual'); stop(); }}
              style={{ ...tabBtn, ...(sourceMode === 'manual' ? activeTabBtn : {}) }}
            >
              <Type size={16} /> Manual Text
            </button>
          </div>

          <div style={{
            flex: 1,
            background: 'var(--quantum-black-deep)',
            border: '1px solid var(--quantum-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {sourceMode === 'manual' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste or type any text you want Quantum AI to read..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px dashed var(--quantum-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: 'var(--quantum-ivory)',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'var(--quantum-text-muted)' }}>
                  <span>{wordCount} words • ~{estimatedTime} min read</span>
                  <button onClick={() => setManualText('')} style={{ background: 'none', border: 'none', color: 'var(--quantum-gold)', cursor: 'pointer' }}>Clear</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '48px', overflowY: 'auto', flex: 1, position: 'relative' }}>
                
                {isDev && (
                  <div style={{ background: 'rgba(203, 162, 58, 0.1)', border: '1px solid var(--quantum-gold)', color: 'var(--quantum-gold)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem' }}>
                    <strong>DEV PREVIEW:</strong> Using dummy content in standalone mode. Use the extension for live pages.
                  </div>
                )}
                {extractionStatus === 'protected' && (
                  <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--quantum-error)', color: 'var(--quantum-error)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem' }}>
                    <strong>Protected Page:</strong> Chrome blocks extensions from reading this internal page.
                  </div>
                )}
                
                {articleChunks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--quantum-text-muted)', marginTop: '40px' }}>
                    No content available on this page. Switch to "Manual Text" to paste your own.
                  </div>
                ) : (
                  articleChunks.map((section, idx) => {
                    const isActive = activeIdx === idx;
                    const isHeading = section.type.startsWith('h');
                    
                    return (
                      <motion.div
                        key={`${sourceMode}-${idx}`}
                        onClick={() => {
                          saveProgress(idx);
                          if (isPlaying) speakSection(idx);
                        }}
                        animate={{
                          color: isActive ? 'var(--quantum-gold)' : (isHeading ? 'var(--quantum-ivory)' : 'var(--quantum-text-muted)'),
                          scale: isActive && !isHeading ? 1.02 : 1,
                          x: isActive ? 8 : 0
                        }}
                        style={{
                          cursor: 'pointer',
                          marginBottom: isHeading ? '16px' : '24px',
                          marginTop: isHeading && idx !== 0 ? '48px' : '0',
                          paddingLeft: isActive ? '16px' : '0',
                          borderLeft: isActive ? '2px solid var(--quantum-gold)' : '2px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isHeading ? (
                          <h2 className="pp-hero-title" style={{ fontSize: section.type === 'h1' ? '2.5rem' : '1.8rem', margin: 0 }}>
                            {section.text}
                          </h2>
                        ) : (
                          <p className="pp-editorial" style={{ fontSize: '1.2rem', lineHeight: 1.8, margin: 0 }}>
                            {section.text}
                          </p>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Playback Controls Panel */}
        <div style={{
          width: '300px',
          background: 'var(--quantum-glass)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <h3 className="pp-ui-text" style={{ color: 'var(--quantum-ivory)', margin: 0 }}>Playback Controls</h3>
          
          {/* Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--quantum-text-muted)', marginBottom: '8px' }}>
              <span>Progress</span>
              <span>{Math.round((activeIdx / (articleChunks.length - 1 || 1)) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--quantum-border)', borderRadius: '2px' }}>
              <motion.div 
                animate={{ width: `${(activeIdx / (articleChunks.length - 1 || 1)) * 100}%` }}
                style={{ height: '100%', background: 'var(--quantum-gold)', borderRadius: '2px' }} 
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={prev} style={navBtn} disabled={activeIdx === 0 || articleChunks.length === 0}>
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={togglePlay} 
              disabled={articleChunks.length === 0 || (sourceMode === 'manual' && !manualText.trim())}
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: articleChunks.length === 0 ? 'var(--quantum-surface)' : 'var(--quantum-gold)', 
                color: articleChunks.length === 0 ? 'var(--quantum-text-muted)' : 'var(--quantum-black-deep)',
                border: 'none', cursor: articleChunks.length === 0 ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s'
              }}
            >
              {isPlaying && !isPaused ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
            </button>

            <button onClick={next} style={navBtn} disabled={activeIdx === articleChunks.length - 1 || articleChunks.length === 0}>
              <SkipForward size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={stop} style={navBtn} disabled={!isPlaying}>
              <Square size={16} fill="currentColor" /> <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>Stop</span>
            </button>
          </div>

          {/* Settings */}
          <div style={{ borderTop: '1px solid var(--quantum-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--quantum-text-muted)', marginBottom: '4px' }}>Speed ({speed}x)</label>
              <input 
                type="range" min="0.5" max="2" step="0.25" value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--quantum-gold)' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--quantum-text-muted)', marginBottom: '4px' }}>Voice</label>
              <select 
                value={selectedVoice || ''} 
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{ 
                  width: '100%', background: 'var(--quantum-black-deep)', color: 'var(--quantum-ivory)', 
                  border: '1px solid var(--quantum-border)', padding: '8px', borderRadius: '4px', outline: 'none' 
                }}
              >
                {voices.map((v, i) => (
                  <option key={i} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

const tabBtn = {
  background: 'var(--quantum-glass)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'flex', alignItems: 'center', gap: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '0.9rem'
};

const activeTabBtn = {
  background: 'var(--quantum-gold-muted)',
  border: '1px solid var(--quantum-gold)',
  color: 'var(--quantum-gold)'
};

const ctrlBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  padding: '8px',
  borderRadius: '8px',
  cursor: 'pointer'
};

const navBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-ivory)',
  width: '40px', height: '40px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: 1
};
