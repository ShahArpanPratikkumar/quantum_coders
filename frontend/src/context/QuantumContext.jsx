/**
 * QuantumContext — Global app state
 * currentPage comes from PageContext, not hardcoded mock data.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { useQuantumChat } from '../hooks/useQuantumChat';

const QuantumContext = createContext(null);

export function QuantumProvider({ children }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [status, setStatus] = useState('ready');
  const [amplitude, setAmplitude] = useState(0);
  const [partialTranscript, setPartialTranscript] = useState('');
  
  const chatState = useQuantumChat();

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => { setIsPanelOpen(false); setIsSettingsOpen(false); }, []);
  const togglePanel = useCallback(() => setIsPanelOpen(p => !p), []);

  const value = {
    isPanelOpen, openPanel, closePanel, togglePanel,
    isSettingsOpen, setIsSettingsOpen,
    status, setStatus,
    amplitude, setAmplitude,
    partialTranscript, setPartialTranscript,
    ...chatState
  };

  return (
    <QuantumContext.Provider value={value}>
      {children}
    </QuantumContext.Provider>
  );
}

export function useQuantum() {
  const ctx = useContext(QuantumContext);
  if (!ctx) throw new Error('useQuantum must be inside QuantumProvider');
  return ctx;
}
