import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings2, Square, AlertCircle, Pause, Play } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import WaveformBars from '../components/WaveformBars';
import { useToast } from '../context/ToastContext';
import { usePageContext } from '../context/PageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function VoicePage() {
  const { addToast } = useToast();
  const { pageContext, isDev, extractionStatus } = usePageContext();
  
  const [pageState, setPageState] = useState('idle'); // idle | listening | processing | speaking | error
  const [assistantText, setAssistantText] = useState('');
  
  const { speak, pause, resume, stop: stopTTS, isSpeaking, isPaused } = useSpeechSynthesis();

  const {
    isListening, voiceStatus, transcript, consumeTranscript,
    startListening, stopListening, error: micError
  } = useSpeechRecognition();

  // Reflect mic errors as page state
  useEffect(() => {
    if (micError === 'unsupported') {
      addToast({ title: 'Speech recognition not supported in this browser.', type: 'error' });
      setPageState('error');
    } else if (micError === 'permission-denied') {
      addToast({ title: 'Microphone access denied. Please allow mic in browser settings.', type: 'error' });
      setPageState('error');
    } else if (micError === 'no-speech') {
      addToast({ title: 'No speech detected. Try speaking louder.', type: 'warning' });
      setPageState('idle');
    } else if (micError) {
      setPageState('idle');
    }
  }, [micError, addToast]);

  // When transcript arrives after stopListening
  useEffect(() => {
    if (transcript && !isListening && pageState === 'listening') {
      const text = consumeTranscript();
      if (text) handleUserStopSpeaking(text);
      else setPageState('idle');
    }
  }, [transcript, isListening, pageState]); // eslint-disable-line

  // Sync isSpeaking → pageState
  useEffect(() => {
    if (isSpeaking) setPageState('speaking');
    else if (pageState === 'speaking') setPageState('idle');
  }, [isSpeaking]); // eslint-disable-line

  useEffect(() => {
    return () => {
      stopListening();
      stopTTS();
    };
  }, [stopListening, stopTTS]);

  const toggleListening = () => {
    if (micError === 'unsupported' || micError === 'permission-denied') return;
    
    // Cancel any ongoing speech before mic starts
    stopTTS();

    if (isListening) {
      stopListening();
      // transcript effect will handle sending
    } else {
      setAssistantText('');
      setPageState('listening');
      startListening();
    }
  };

  const handleUserStopSpeaking = async (text) => {
    if (!text.trim()) {
      setPageState('idle');
      return;
    }
    
    setPageState('processing');
    
    try {
      const { askQuantumAPI } = await import('../services/quantumApi.js');
      const result = await askQuantumAPI({
        question: text,
        pageContext: pageContext || {},
        conversationHistory: [],
        language: 'auto'
      });
      
      setAssistantText(result.answer);
      speak(result.answer); // shared hook → sets isSpeaking → pageState 'speaking'
    } catch (err) {
      console.error(err);
      let errorMsg = "Sorry, I encountered an error.";
      if (err.code === 'OLLAMA_OFFLINE') errorMsg = "Ollama is not running. Please start the local server.";
      if (err.code === 'BACKEND_OFFLINE') errorMsg = "My backend server is offline.";
      setAssistantText(errorMsg);
      speak(errorMsg);
    }
  };

  const stopSpeaking = () => {
    stopTTS();
    setPageState('idle');
  };

  const state = pageState; // alias so JSX below stays clean

  return (
    <PageTransition style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader 
        title="Voice Assistant" 
        description="Talk naturally to Quantum AI about the current page."
        icon={Volume2}
        actions={
          <button style={{
            background: 'var(--quantum-black-deep)', border: '1px solid var(--quantum-border)',
            color: 'var(--quantum-text-muted)', padding: '8px', borderRadius: '8px', cursor: 'pointer'
          }}>
            <Settings2 size={16} />
          </button>
        }
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: '64px' }}>
        
        {isDev && (
          <div style={{ background: 'rgba(203, 162, 58, 0.1)', border: '1px solid var(--quantum-gold)', color: 'var(--quantum-gold)', padding: '8px 16px', borderRadius: '8px', position: 'absolute', top: 0, fontSize: '0.85rem' }}>
            <strong>DEV PREVIEW:</strong> Quantum doesn't have real page context. It will answer from general knowledge.
          </div>
        )}

        {extractionStatus === 'protected' && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--quantum-error)', color: 'var(--quantum-error)', padding: '8px 16px', borderRadius: '8px', position: 'absolute', top: 0, fontSize: '0.85rem' }}>
            <strong>Protected Page:</strong> Chrome blocks extensions here. I will answer from general knowledge.
          </div>
        )}
        
        {/* Animated Mic Ring Area */}
        <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            {state === 'listening' && (
              <>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 2] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--quantum-gold)' }}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.3, 0], scale: [1, 1.3, 1.8] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                  style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--quantum-gold)' }}
                />
              </>
            )}
          </AnimatePresence>

          <button
            onClick={state === 'speaking' ? stopSpeaking : toggleListening}
            disabled={state === 'error' || state === 'processing'}
            style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: state === 'listening' ? 'var(--quantum-gold)' : 'var(--quantum-glass)',
              border: `2px solid ${state === 'listening' ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
              color: state === 'listening' ? 'var(--quantum-black-deep)' : (state === 'error' ? 'var(--quantum-text-muted)' : 'var(--quantum-gold)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (state === 'error' || state === 'processing') ? 'not-allowed' : 'pointer', 
              zIndex: 10,
              boxShadow: state === 'listening' ? '0 0 40px rgba(203, 162, 58, 0.4)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            {state === 'speaking' ? (
              <Square size={48} fill="currentColor" />
            ) : state === 'listening' ? (
              <Mic size={48} />
            ) : state === 'error' ? (
              <AlertCircle size={48} />
            ) : (
              <MicOff size={48} />
            )}
          </button>
        </div>

        {/* State Label */}
        <div style={{ marginTop: '32px', textAlign: 'center', height: '40px' }}>
          <span className="pp-ui-text" style={{ color: 'var(--quantum-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {state === 'idle' && 'Tap to speak'}
            {state === 'listening' && 'Listening...'}
            {state === 'processing' && 'Thinking...'}
            {state === 'speaking' && 'Quantum is speaking'}
            {state === 'error' && 'Mic Unavailable'}
          </span>
        </div>

        {/* Waveform for Speaking State */}
        <div style={{ height: '60px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            {state === 'speaking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WaveformBars isPlaying={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transcripts Area */}
        <div style={{
          width: '100%', maxWidth: '600px', marginTop: '48px',
          display: 'flex', flexDirection: 'column', gap: '24px'
        }}>
          <AnimatePresence>
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'right' }}
              >
                <div style={{
                  display: 'inline-block', padding: '16px 24px',
                  background: 'var(--quantum-gold-muted)', border: '1px solid var(--quantum-gold)',
                  color: 'var(--quantum-gold)', borderRadius: '16px', borderBottomRightRadius: '4px',
                  maxWidth: '90%', fontSize: '1.1rem', lineHeight: 1.5
                }}>
                  "{transcript}"
                </div>
              </motion.div>
            )}

            {assistantText && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'left' }}
              >
                <div className="pp-editorial" style={{
                  display: 'inline-block', padding: '16px 24px',
                  background: 'var(--quantum-glass)', border: '1px solid var(--quantum-border)',
                  color: 'var(--quantum-ivory)', borderRadius: '16px', borderBottomLeftRadius: '4px',
                  maxWidth: '90%', fontSize: '1.2rem', lineHeight: 1.6
                }}>
                  {assistantText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </PageTransition>
  );
}
