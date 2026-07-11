import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square, Plus, X, Image as ImageIcon, Code, File as FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantum } from '../../context/QuantumContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import './ChatInput.css';

export default function ChatInput() {
  const [text, setText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { status, setStatus, handleUserQuery } = useQuantum();
  const {
    isListening, transcript, consumeTranscript,
    startListening, stopListening, error: micError
  } = useSpeechRecognition();

  const busy = ['thinking', 'extracting'].includes(status);
  const speaking = status === 'speaking';

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [text]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('extracting'); // Show UI as busy while parsing

    try {
      const isText = file.type.startsWith('text/') || file.name.match(/\.(js|jsx|ts|tsx|json|html|css|py|cpp|java|md|csv)$/i);
      const isPdf = file.name.toLowerCase().endsWith('.pdf');

      let fileContent = '';
      let isReadable = false;

      if (isPdf) {
        // Dynamically import the PDF parser only when needed
        const { extractTextFromPDF } = await import('../../utils/pdfParser.js');
        fileContent = await extractTextFromPDF(file);
        isReadable = true;
      } else if (isText) {
        fileContent = await file.text();
        isReadable = true;
      } else {
        // Fallback for images or unsupported binary files
        const reader = new FileReader();
        fileContent = await new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(file);
        });
      }

      setAttachedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        content: fileContent,
        isText: isReadable // Indicates to the backend if the content is raw text
      });
    } catch (err) {
      console.error('File parsing error:', err);
      alert('Failed to parse file: ' + err.message);
    } finally {
      setStatus('ready');
    }
  };

  const clearFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    const msg = text.trim();
    if ((!msg && !attachedFile) || busy) return;
    
    setText('');
    
    let finalQuery = msg;
    if (attachedFile) {
      if (attachedFile.isText) {
        finalQuery = `[Attached File: ${attachedFile.name}]\n${attachedFile.content}\n\n${msg}`;
      } else {
        finalQuery = `[Attached File: ${attachedFile.name}]\n(Note: This is a binary/image file. Content is not fully text-readable by the current model)\n\n${msg}`;
      }
      clearFile();
    }
    
    await handleUserQuery(finalQuery);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // When transcript arrives from hook
  useEffect(() => {
    if (transcript && !isListening) {
      const captured = consumeTranscript();
      if (captured) {
        setText(captured);
        requestAnimationFrame(() => {
          handleUserQuery(captured);
          setText('');
        });
      }
      setStatus('ready');
    }
  }, [transcript, isListening, consumeTranscript, handleUserQuery, setStatus]);

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      window.speechSynthesis?.cancel(); // stop current speech before listening
      setStatus('listening');
      startListening();
    }
  };

  const stopSpeaking = () => setStatus('ready');

  return (
    <div className="pp-ci" role="form" aria-label="Chat input">
      <div className="pp-ci__top-line" aria-hidden="true" />

      {/* Listening state */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="pp-ci__listening"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="status"
            aria-live="polite"
          >
            <div className="pp-ci__wave-bars" aria-hidden="true">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="pp-ci__wave-bar"
                  style={{ animationDelay: `${i * 0.07}s` }}
                />
              ))}
            </div>
            <span className="pp-ui-text" style={{ color: 'var(--pp-gold)', fontSize: '0.78rem', fontStyle: 'italic' }}>
              Listening…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaking interrupt */}
      <AnimatePresence>
        {speaking && (
          <motion.div
            className="pp-ci__speaking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pp-ci__wave-bars" aria-hidden="true">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="pp-ci__wave-bar pp-ci__wave-bar--speaking" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className="pp-ui-text" style={{ color: 'var(--pp-muted)', fontSize: '0.78rem' }}>Speaking…</span>
            <button className="pp-ci__stop-btn" onClick={stopSpeaking} aria-label="Stop speaking">
              <Square size={12} fill="currentColor" /> Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Chip UI */}
      <AnimatePresence>
        {attachedFile && (
          <motion.div
            className="pp-ci__file-chip"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="pp-ci__file-icon">
              {attachedFile.type.startsWith('image/') ? <ImageIcon size={14} /> : 
               attachedFile.isText ? <Code size={14} /> : 
               <FileIcon size={14} />}
            </div>
            <span className="pp-ci__file-name" title={attachedFile.name}>{attachedFile.name}</span>
            <button className="pp-ci__file-remove" onClick={clearFile} aria-label="Remove file">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="pp-ci__row">
        {/* Attachment Button */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,image/*,.js,.ts,.jsx,.tsx,.html,.css,.json,.py,.cpp,.java,.md,.csv"
        />
        <button 
          className="pp-ci__attach"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy || speaking}
          aria-label="Attach file"
          title="Attach file"
        >
          <Plus size={20} strokeWidth={2} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="pp-ci__input"
          placeholder="Ask anything about this page…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={busy || speaking}
          rows={1}
          aria-label="Type your question"
          aria-multiline="true"
        />

        <div className="pp-ci__actions">
          {/* Mic */}
          <button
            className={`pp-ci__mic ${isListening ? 'pp-ci__mic--active' : ''}`}
            onClick={toggleMic}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            aria-pressed={isListening}
            disabled={busy || speaking}
            title="Voice input (Alt+M)"
          >
            {isListening ? <MicOff size={16} strokeWidth={1.5} /> : <Mic size={16} strokeWidth={1.5} />}
            {isListening && <span className="pp-ci__mic-ring" aria-hidden="true" />}
          </button>

          {/* Send */}
          <button
            className="pp-ci__send"
            onClick={handleSend}
            disabled={(!text.trim() && !attachedFile) || busy}
            aria-label="Send message"
            title="Send (Enter)"
          >
            <Send size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <p className="pp-ci__hint pp-label" style={{ color: 'var(--pp-muted-dark)', textAlign: 'center', paddingBottom: 4 }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
