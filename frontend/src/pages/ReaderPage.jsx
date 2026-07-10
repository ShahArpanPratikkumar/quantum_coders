import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Pause, Square, SkipForward, SkipBack, Settings2 } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

const MOCK_ARTICLE = [
  { id: 1, type: 'h1', text: 'React Router v6: A Complete Guide' },
  { id: 2, type: 'p', text: 'React Router is the standard routing library for React. In version 6, it underwent a major rewrite to embrace modern React features like Hooks and Suspense.' },
  { id: 3, type: 'h2', text: 'Nested Routes and Layouts' },
  { id: 4, type: 'p', text: 'One of the most powerful features of v6 is the ability to nest routes easily. By using an Outlet component, you can define a persistent layout that surrounds your child routes.' },
  { id: 5, type: 'p', text: 'This means your sidebar and navigation headers will not unmount or lose state when the user navigates between different pages in your application.' },
  { id: 6, type: 'h2', text: 'Data APIs' },
  { id: 7, type: 'p', text: 'With the introduction of createBrowserRouter, you can now define loaders and actions directly on your route objects, allowing React Router to fetch data before the component even renders.' }
];

export default function ReaderPage() {
  const { settings } = useSettings();
  const { addToast } = useToast();
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs for SpeechSynthesis
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    // Restore progress
    const savedIdx = localStorage.getItem('quantum-reading-progress');
    if (savedIdx !== null) setActiveIdx(parseInt(savedIdx, 10));

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const saveProgress = (idx) => {
    setActiveIdx(idx);
    localStorage.setItem('quantum-reading-progress', idx.toString());
  };

  const speakSection = (idx) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const text = MOCK_ARTICLE[idx].text;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    utterance.rate = settings.voiceSpeed || 1;
    
    utterance.onend = () => {
      if (idx < MOCK_ARTICLE.length - 1) {
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
    if (activeIdx < MOCK_ARTICLE.length - 1) {
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

  return (
    <PageTransition style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader 
        title="Smart Reader" 
        description="Listen to the current page while Quantum highlights the active section."
        icon={BookOpen}
        actions={
          <button style={ctrlBtn} title="Reader Settings">
            <Settings2 size={16} />
          </button>
        }
      />

      <div style={{ flex: 1, display: 'flex', gap: '32px', minHeight: 0 }}>
        {/* Article Area */}
        <div style={{
          flex: 1,
          background: 'var(--quantum-black-deep)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {MOCK_ARTICLE.map((section, idx) => {
            const isActive = activeIdx === idx;
            const isHeading = section.type.startsWith('h');
            
            return (
              <motion.div
                key={section.id}
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
          })}
        </div>

        {/* Playback Controls Panel */}
        <div style={{
          width: '280px',
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
              <span>{Math.round((activeIdx / (MOCK_ARTICLE.length - 1)) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--quantum-border)', borderRadius: '2px' }}>
              <motion.div 
                animate={{ width: `${(activeIdx / (MOCK_ARTICLE.length - 1)) * 100}%` }}
                style={{ height: '100%', background: 'var(--quantum-gold)', borderRadius: '2px' }} 
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={prev} style={navBtn} disabled={activeIdx === 0}>
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={togglePlay} 
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--quantum-gold)', color: 'var(--quantum-black-deep)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {isPlaying && !isPaused ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
            </button>

            <button onClick={next} style={navBtn} disabled={activeIdx === MOCK_ARTICLE.length - 1}>
              <SkipForward size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={stop} style={navBtn} disabled={!isPlaying}>
              <Square size={16} fill="currentColor" /> <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>Stop</span>
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

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
