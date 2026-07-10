import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ConversationThread.css';

/**
 * ConversationThread — scrollable list of message bubbles.
 */
export default function ConversationThread({ messages = [], isThinking = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="conv-thread" role="log" aria-live="polite" aria-label="Conversation history">
      <div className="conv-thread__inner">
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}

        {isThinking && (
          <div className="conv-thread__thinking animate-enter" aria-label="Lumen is thinking">
            <div className="conv-thread__thinking-dot" />
            <div className="conv-thread__thinking-dot" />
            <div className="conv-thread__thinking-dot" />
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
