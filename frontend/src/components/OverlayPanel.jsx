import { useState, useEffect } from 'react';
import Header from './Header';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import ConversationThread from './ConversationThread';
import ExtractionStatusStrip from './ExtractionStatusStrip';
import CommandBar from './CommandBar';
import QuickActionChips from './QuickActionChip';
import SettingsPanel from './SettingsPanel';
import AuroraRing from './AuroraRing';
import WaveformBars from './WaveformBars';
import { useAuroraState } from '../hooks/useAuroraState';
import { useMockExtraction } from '../hooks/useMockExtraction';
import { useMockConversation } from '../hooks/useMockConversation';
import { useSpeechMock } from '../hooks/useSpeechMock';
import './OverlayPanel.css';

/**
 * OverlayPanel — the main injected panel that sits on top of any webpage.
 * Manages the complete conversation lifecycle.
 */
export default function OverlayPanel({ onClose, forcedState }) {
  const [showSettings, setShowSettings] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { state, amplitude, statusText, transition } = useAuroraState(forcedState || 'idle');
  const extraction = useMockExtraction();
  const conversation = useMockConversation();
  const speech = useSpeechMock();

  // When forcedState changes (dev preview), sync it
  useEffect(() => {
    if (forcedState) {
      transition(forcedState);
      if (forcedState === 'conversation' || forcedState === 'thinking') {
        conversation.loadSeedConversation();
        setHasInteracted(true);
        extraction.extract();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedState]);

  // Auto-extract when panel first opens
  useEffect(() => {
    if (!forcedState) {
      runExtraction();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runExtraction() {
    transition('extracting');
    const result = await extraction.extract();
    if (result.success) {
      transition('idle');
    } else {
      transition('error');
    }
  }

  async function handleSend(text) {
    if (!hasInteracted) setHasInteracted(true);
    await conversation.sendMessage(text, transition);
  }

  function handleQuickAction(type, label) {
    if (!hasInteracted) setHasInteracted(true);
    const prompts = {
      summarize: 'Summarize this article for me.',
      readAloud: 'Read this page aloud.',
      explain:   "Explain this like I'm a complete beginner.",
      keyPoints: 'What are the key points of this page?',
      tldr:      'Give me a two-minute summary.',
    };
    handleSend(prompts[type] || label);
  }

  function handleMic() {
    transition('listening');
    speech.startListening((result) => {
      transition('idle');
      if (result) handleSend(result);
    });
  }

  function handleStopListening() {
    speech.stopListening();
    transition('idle');
  }

  function handleStopSpeaking() {
    speech.stopSpeaking();
    transition('idle');
  }

  const effectiveState = forcedState || state;
  const showError = effectiveState === 'error' || extraction.status === 'error';
  const showEmpty = !hasInteracted && !showError && effectiveState !== 'extracting';
  const showConversation = hasInteracted && !showError;

  return (
    <div className="overlay-panel glass panel-enter">
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <Header
        pageTitle={extraction.pageTitle}
        onClose={onClose}
        onSettings={() => setShowSettings(s => !s)}
      />

      {/* Thinking state banner */}
      {effectiveState === 'thinking' && (
        <div className="overlay-panel__thinking-banner animate-enter">
          <AuroraRing state="thinking" size="sm" />
          <span className="overlay-panel__thinking-text">{statusText}</span>
        </div>
      )}

      {/* Speaking state banner */}
      {effectiveState === 'speaking' && (
        <div className="overlay-panel__speaking-banner animate-enter">
          <WaveformBars amplitude={amplitude} color="cyan" bars={11} />
          <span className="overlay-panel__speaking-text">Reading aloud…</span>
        </div>
      )}

      {/* Extraction strip (always shown if extraction happened) */}
      {(extraction.status !== 'idle') && (
        <ExtractionStatusStrip
          status={extraction.status}
          wordCount={extraction.wordCount}
          error={extraction.errorMessage}
          onRetry={runExtraction}
        />
      )}

      {/* ── Main content area ── */}
      <div className="overlay-panel__body">
        {showError && (
          <ErrorState message={extraction.errorMessage} onRetry={runExtraction} />
        )}

        {!showError && showEmpty && (
          <EmptyState
            state={effectiveState}
            amplitude={amplitude}
            onAction={handleQuickAction}
          />
        )}

        {!showError && showConversation && (
          <ConversationThread
            messages={conversation.messages}
            isThinking={effectiveState === 'thinking'}
          />
        )}
      </div>

      {/* Quick chips when conversation is active */}
      {showConversation && effectiveState === 'idle' && (
        <QuickActionChips
          onAction={handleQuickAction}
          chips={['summarize', 'readAloud', 'explain']}
        />
      )}

      <CommandBar
        state={effectiveState}
        amplitude={amplitude}
        partialTranscript={speech.partialTranscript}
        onSend={handleSend}
        onStartListening={handleMic}
        onStopListening={handleStopListening}
        onStopSpeaking={handleStopSpeaking}
        disabled={showError}
      />
    </div>
  );
}
