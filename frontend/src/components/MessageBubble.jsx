import AuroraRing from './AuroraRing';
import './MessageBubble.css';

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * MessageBubble — single chat message, user or Lumen.
 * @param {object} message - { id, role, text, quote, timestamp }
 */
export default function MessageBubble({ message }) {
  const { role, text, quote, timestamp } = message;
  const isUser = role === 'user';

  return (
    <div className={`msg-bubble msg-bubble--${role} animate-enter`}>
      {!isUser && (
        <div className="msg-bubble__avatar">
          <AuroraRing state="idle" size="sm" />
        </div>
      )}

      <div className="msg-bubble__content">
        <div className={`msg-bubble__card glass ${isUser ? 'msg-bubble__card--user' : 'msg-bubble__card--lumen'}`}>
          <p className="msg-bubble__text">{text}</p>

          {quote && (
            <blockquote className="msg-bubble__quote">
              <span className="msg-bubble__quote-icon" aria-hidden="true">❝</span>
              <span className="msg-bubble__quote-text text-mono">{quote}</span>
            </blockquote>
          )}
        </div>

        {timestamp && (
          <time className="msg-bubble__time" dateTime={new Date(timestamp).toISOString()}>
            {formatTime(timestamp)}
          </time>
        )}
      </div>
    </div>
  );
}
