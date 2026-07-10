import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Focus, Type, ArrowLeft, Volume2, Moon, Sun, Settings2, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { usePageContext } from '../context/PageContext';

export default function FocusPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { pageContext, title, domain, readingTime, isDev, extractionStatus } = usePageContext();
  
  const [theme, setTheme] = useState('dark'); // dark, warm
  const [fontSize, setFontSize] = useState(1.2);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [width, setWidth] = useState(800);
  const [showControls, setShowControls] = useState(false);
  
  const synthRef = useRef(window.speechSynthesis);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const activeContent = pageContext.content || '';

  const articleChunks = useMemo(() => {
    if (!activeContent || activeContent.trim().length === 0) return [];
    return activeContent.split(/\n\s*\n/).filter(p => p.trim());
  }, [activeContent]);

  useEffect(() => {
    const prefs = localStorage.getItem('quantum-focus-prefs');
    if (prefs) {
      const p = JSON.parse(prefs);
      setTheme(p.theme || 'dark');
      setFontSize(p.fontSize || 1.2);
      setLineHeight(p.lineHeight || 1.8);
      setWidth(p.width || 800);
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('quantum-focus-prefs', JSON.stringify({ theme, fontSize, lineHeight, width }));
  }, [theme, fontSize, lineHeight, width]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight > clientHeight) {
      const p = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setProgress(p || 0);
    } else {
      setProgress(100);
    }
  };

  const readAloud = () => {
    if (!synthRef.current || !activeContent) return;
    synthRef.current.cancel();
    
    // Quick simple TTS for the whole thing (use ReaderPage for granular control)
    const utterance = new SpeechSynthesisUtterance(activeContent.slice(0, 5000) + (activeContent.length > 5000 ? "... content truncated for quick audio." : ""));
    synthRef.current.speak(utterance);
    addToast({ title: 'Playing audio (quick read)...', type: 'info' });
  };

  const bgColor = theme === 'dark' ? '#080806' : '#f5f0e7';
  const textColor = theme === 'dark' ? 'var(--quantum-ivory)' : '#1a1a1a';
  const mutedColor = theme === 'dark' ? 'var(--quantum-text-muted)' : '#666';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: bgColor, color: textColor,
        display: 'flex', flexDirection: 'column',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Top Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ ...iconBtn, color: textColor }} title="Exit Focus Mode">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="pp-ui-text" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>{title || 'Unknown Page'}</h1>
            <span style={{ fontSize: '0.8rem', color: mutedColor }}>
              {domain || 'local'} • {readingTime || '~'} min read
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={readAloud} style={{ ...iconBtn, color: textColor }} title="Quick Read Aloud">
            <Volume2 size={20} />
          </button>
          <button onClick={() => setShowControls(!showControls)} style={{ ...iconBtn, color: textColor, background: showControls ? (theme === 'dark' ? '#333' : '#ddd') : 'transparent' }} title="Appearance">
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '3px', background: theme === 'dark' ? '#222' : '#ddd' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--quantum-gold)' }} />
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div style={{
          position: 'absolute', top: '70px', right: '24px',
          background: theme === 'dark' ? 'var(--quantum-black-deep)' : '#fff',
          border: `1px solid ${theme === 'dark' ? 'var(--quantum-border)' : '#ccc'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', gap: '20px',
          width: '280px',
          zIndex: 10
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '8px' }}>Theme</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: theme === 'dark' ? 'var(--quantum-gold-muted)' : 'transparent', border: `1px solid ${theme === 'dark' ? 'var(--quantum-gold)' : (theme === 'dark' ? '#333' : '#ccc')}`, color: textColor, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                <Moon size={18} />
              </button>
              <button onClick={() => setTheme('warm')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: theme === 'warm' ? '#e6d8b8' : 'transparent', border: `1px solid ${theme === 'warm' ? '#cba23a' : (theme === 'dark' ? '#333' : '#ccc')}`, color: textColor, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                <Sun size={18} />
              </button>
            </div>
          </div>
          
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '8px' }}>Font Size</span>
            <input type="range" min="0.9" max="1.8" step="0.1" value={fontSize} onChange={e => setFontSize(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--quantum-gold)' }} />
          </div>
          
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '8px' }}>Line Height</span>
            <input type="range" min="1.4" max="2.2" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--quantum-gold)' }} />
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '8px' }}>Reading Width</span>
            <input type="range" min="500" max="1000" step="50" value={width} onChange={e => setWidth(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--quantum-gold)' }} />
          </div>
        </div>
      )}

      {/* Reader Body */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ 
          flex: 1, overflowY: 'auto', padding: '64px 24px',
          display: 'flex', justifyContent: 'center'
        }}
      >
        <div className="pp-editorial" style={{ 
          maxWidth: `${width}px`, width: '100%',
          fontSize: `${fontSize}rem`, lineHeight: lineHeight,
          transition: 'all 0.3s ease'
        }}>
          {isDev && (
            <div style={{ background: 'rgba(203, 162, 58, 0.1)', border: `1px solid ${theme === 'dark' ? 'var(--quantum-gold)' : '#cba23a'}`, color: theme === 'dark' ? 'var(--quantum-gold)' : '#cba23a', padding: '12px', borderRadius: '8px', marginBottom: '40px', fontSize: '0.85rem' }}>
              <strong>DEV PREVIEW:</strong> Using dev data. Load this inside the extension for live content.
            </div>
          )}

          {extractionStatus === 'protected' && (
            <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid #ff3b30', color: '#ff3b30', padding: '12px', borderRadius: '8px', marginBottom: '40px', fontSize: '0.85rem' }}>
              <strong>Protected Page:</strong> Chrome blocks extensions from reading this internal page.
            </div>
          )}

          {articleChunks.length === 0 && extractionStatus !== 'protected' ? (
            <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '20vh' }}>No readable content found on this page.</p>
          ) : (
            articleChunks.map((para, i) => {
              // Very basic heuristic to detect headings if no markdown is provided
              const isShort = para.length < 80;
              const hasNoPunctuation = !/[.?!]$/.test(para.trim());
              const isHeading = isShort && hasNoPunctuation;
              
              if (isHeading) {
                return <h2 key={i} style={{ marginTop: '2em', marginBottom: '1em', fontSize: '1.4em', fontWeight: 600 }}>{para}</h2>;
              }
              return <p key={i} style={{ marginBottom: '1.5em' }}>{para}</p>;
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}

const iconBtn = {
  background: 'transparent',
  border: 'none',
  padding: '8px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s'
};
