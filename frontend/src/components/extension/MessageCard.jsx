import ReactMarkdown from 'react-markdown';
import { Copy, RotateCcw, Volume2, Square, Play, Pause } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import './MessageCard.css';

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageCard({ message }) {
  const { role, content, timestamp, hasPageRef } = message;
  const isUser = role === 'user';
  const { speak, pause, resume, stop, isSpeaking, isPaused } = useSpeechSynthesis();

  const copyText = () => navigator.clipboard?.writeText(content).catch(() => {});

  return (
    <div className={`pp-msg pp-msg--${role}`} role="article" aria-label={isUser ? 'Your message' : 'Quantum response'}>
      {isUser ? (
        /* ── User bubble ── */
        <div className="pp-msg__user-bubble">
          <p className="pp-msg__user-text pp-ui-text">{content}</p>
          {timestamp && (
            <time className="pp-msg__time" dateTime={new Date(timestamp).toISOString()}>
              {formatTime(timestamp)}
            </time>
          )}
        </div>
      ) : (
        /* ── Assistant editorial layout ── */
        <div className="pp-msg__lumen">
          {/* Gold left line */}
          <div className="pp-msg__lumen-line" aria-hidden="true" />

          <div className="pp-msg__lumen-body">
            {/* Label row */}
            <div className="pp-msg__lumen-header">
              <span className="pp-logo-sm" style={{ fontSize: '0.85rem' }}>Quantum</span>
              {hasPageRef && (
                <span className="pp-msg__page-ref pp-label">Based on this page</span>
              )}
            </div>

            {/* Content */}
            <div className="pp-msg__lumen-content">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="pp-msg__para pp-editorial-sm" style={{ fontStyle: 'normal' }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ color: 'var(--pp-gold)', fontWeight: 600 }}>{children}</strong>,
                  h1: ({ children }) => <h1 className="pp-msg__h pp-card-title">{children}</h1>,
                  h2: ({ children }) => <h2 className="pp-msg__h pp-card-title" style={{ fontSize: '1.1rem' }}>{children}</h2>,
                  li: ({ children }) => <li className="pp-msg__li pp-ui-text">{children}</li>,
                  ul: ({ children }) => <ul className="pp-msg__ul">{children}</ul>,
                  code: ({ children }) => <code className="pp-msg__code">{children}</code>,
                  pre: ({ children }) => <pre className="pp-msg__pre">{children}</pre>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {/* Action row */}
            <div className="pp-msg__actions">
              {timestamp && (
                <time className="pp-msg__time" dateTime={new Date(timestamp).toISOString()}>
                  {formatTime(timestamp)}
                </time>
              )}
              <div className="pp-msg__action-btns">
                <button className="pp-msg__action-btn" onClick={copyText} aria-label="Copy response" title="Copy">
                  <Copy size={12} strokeWidth={1.5} />
                </button>
                <button className="pp-msg__action-btn" onClick={() => speak(content)} aria-label="Read aloud" title="Read aloud" disabled={isSpeaking}>
                  <Volume2 size={12} strokeWidth={1.5} />
                </button>
                {isSpeaking && (
                  <>
                    <button className="pp-msg__action-btn" onClick={isPaused ? resume : pause} aria-label={isPaused ? "Resume" : "Pause"} title={isPaused ? "Resume" : "Pause"}>
                      {isPaused ? <Play size={12} strokeWidth={1.5} /> : <Pause size={12} strokeWidth={1.5} />}
                    </button>
                    <button className="pp-msg__action-btn" onClick={stop} aria-label="Stop reading" title="Stop">
                      <Square size={12} fill="currentColor" />
                    </button>
                  </>
                )}
                {!isSpeaking && (
                  <button className="pp-msg__action-btn" onClick={() => speak(content)} aria-label="Replay response" title="Replay">
                    <RotateCcw size={12} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
