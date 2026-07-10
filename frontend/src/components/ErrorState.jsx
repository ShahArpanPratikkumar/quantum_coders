import './ErrorState.css';

/**
 * ErrorState — calm, clear failure with retry option.
 */
export default function ErrorState({ message = '', onRetry }) {
  const displayMsg = message || "Lumen couldn't extract clean content from this page. Some sites use dynamic rendering that makes content extraction difficult. You can still ask questions directly, or try a different page.";

  return (
    <div className="error-state animate-enter">
      <div className="error-state__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div className="error-state__copy">
        <h3 className="error-state__title text-display">Page couldn't be read</h3>
        <p className="error-state__body">{displayMsg}</p>
      </div>

      <div className="error-state__actions">
        {onRetry && (
          <button className="error-state__retry-btn" onClick={onRetry}>
            Try again
          </button>
        )}
        <p className="error-state__hint">
          You can still type a question below — Lumen will do its best without the full page context.
        </p>
      </div>
    </div>
  );
}
