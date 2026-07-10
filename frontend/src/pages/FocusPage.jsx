import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Focus, Type, ArrowLeft, Volume2, Moon, Sun, Settings2, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const MOCK_ARTICLE = `React Router v6 is a major update that brings many new features and simplifications to routing in React applications.

One of the biggest changes is the replacement of the Switch component with the Routes component. This isn't just a simple rename; Routes comes with relative routing and linking, automatic route ranking, and nested routes.

Nested routes are perhaps the most powerful feature. They allow you to define persistent layouts that wrap around child routes. When a user navigates from one child route to another, the layout component doesn't unmount or re-render unnecessarily, preserving its state (like a scroll position in a sidebar) and improving performance.

Furthermore, React Router v6 introduces new data fetching APIs. By defining loaders directly on your routes, React Router can begin fetching data in parallel as soon as the user clicks a link, preventing waterfall requests and significantly speeding up page load times.`;

export default function FocusPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [theme, setTheme] = useState('dark'); // dark, warm
  const [fontSize, setFontSize] = useState(1.2);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [width, setWidth] = useState(800);
  const [showControls, setShowControls] = useState(false);
  
  const synthRef = useRef(window.speechSynthesis);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load prefs
    const prefs = localStorage.getItem('quantum-focus-prefs');
    if (prefs) {
      const p = JSON.parse(prefs);
      setTheme(p.theme || 'dark');
      setFontSize(p.fontSize || 1.2);
      setLineHeight(p.lineHeight || 1.8);
      setWidth(p.width || 800);
    }
  }, []);

  useEffect(() => {
    // Save prefs
    localStorage.setItem('quantum-focus-prefs', JSON.stringify({ theme, fontSize, lineHeight, width }));
  }, [theme, fontSize, lineHeight, width]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const p = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setProgress(p || 0);
  };

  const readAloud = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(MOCK_ARTICLE);
    synthRef.current.speak(utterance);
    addToast({ title: 'Playing audio...', type: 'info' });
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
            <h1 className="pp-ui-text" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>React Router v6 Overview</h1>
            <span style={{ fontSize: '0.8rem', color: mutedColor }}>medium.com • 3 min read</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={readAloud} style={{ ...iconBtn, color: textColor }} title="Read Aloud">
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
            <input type="range" min="0.9" max="1.8" step="0.1" value={fontSize} onChange={e => setFontSize(parseFloat(e.target.value))} style={{ width: '100%' }} />
          </div>
          
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '8px' }}>Line Height</span>
            <input type="range" min="1.4" max="2.2" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '8px' }}>Reading Width</span>
            <input type="range" min="500" max="1000" step="50" value={width} onChange={e => setWidth(parseInt(e.target.value))} style={{ width: '100%' }} />
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
          {MOCK_ARTICLE.split('\n\n').map((para, i) => (
            <p key={i} style={{ marginBottom: '1.5em' }}>{para}</p>
          ))}
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
