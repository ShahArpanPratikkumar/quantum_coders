import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings2, Square } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import WaveformBars from '../components/WaveformBars';
import { useToast } from '../context/ToastContext';

export default function VoicePage() {
  const { addToast } = useToast();
  
  const [state, setState] = useState('idle'); // idle, listening, processing, speaking
  const [transcript, setTranscript] = useState('');
  const [assistantText, setAssistantText] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize Speech Recognition if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => setState('listening');
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(prev => finalTranscript ? prev + ' ' + finalTranscript : prev + interimTranscript);
        
        // Mock sending final result to AI
        if (finalTranscript) {
          handleUserStopSpeaking(finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
          console.error('Speech recognition error', event.error);
          setState('idle');
          addToast({ title: `Microphone error: ${event.error}`, type: 'error' });
        }
      };
      
      recognition.onend = () => {
        if (state === 'listening') setState('idle');
      };
      
      recognitionRef.current = recognition;
    } else {
      addToast({ title: 'Speech recognition not supported in this browser.', type: 'error' });
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [addToast, state]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addToast({ title: 'Speech recognition unavailable', type: 'error' });
      return;
    }
    
    if (synthRef.current) synthRef.current.cancel();

    if (state === 'listening') {
      recognitionRef.current.stop();
      setState('idle');
    } else {
      setTranscript('');
      setAssistantText('');
      recognitionRef.current.start();
    }
  };

  const handleUserStopSpeaking = (text) => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setState('processing');
    
    // Simulate AI response
    setTimeout(() => {
      const mockResponse = `I heard you say: "${text}". As an AI assistant, I can help you understand this page by summarizing its content or answering specific questions.`;
      setAssistantText(mockResponse);
      setState('speaking');
      
      const utterance = new SpeechSynthesisUtterance(mockResponse);
      utterance.onend = () => setState('idle');
      if (synthRef.current) synthRef.current.speak(utterance);
    }, 1500);
  };

  const stopSpeaking = () => {
    if (synthRef.current) synthRef.current.cancel();
    setState('idle');
  };

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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
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
            style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: state === 'listening' ? 'var(--quantum-gold)' : 'var(--quantum-glass)',
              border: `2px solid ${state === 'listening' ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
              color: state === 'listening' ? 'var(--quantum-black-deep)' : 'var(--quantum-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10,
              boxShadow: state === 'listening' ? '0 0 40px rgba(203, 162, 58, 0.4)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            {state === 'speaking' ? (
              <Square size={48} fill="currentColor" />
            ) : state === 'listening' ? (
              <Mic size={48} />
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
