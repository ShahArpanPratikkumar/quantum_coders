import AuroraRing from './AuroraRing';
import QuickActionChips from './QuickActionChip';
import './EmptyState.css';

/**
 * EmptyState — shown when panel first opens, no conversation yet.
 */
export default function EmptyState({ onAction, state = 'idle', amplitude = 0 }) {
  return (
    <div className="empty-state animate-enter">
      <div className="empty-state__ring">
        <AuroraRing state={state} amplitude={amplitude} size="lg" />
      </div>

      <div className="empty-state__copy">
        <h2 className="empty-state__title text-display">
          Ready to help you read smarter.
        </h2>
        <p className="empty-state__body">
          Lumen has scanned this page and is ready to answer questions, summarize, read aloud, or explain anything you're curious about.
        </p>
      </div>

      <QuickActionChips onAction={onAction} chips={['summarize', 'readAloud', 'explain', 'keyPoints', 'tldr']} />
    </div>
  );
}
