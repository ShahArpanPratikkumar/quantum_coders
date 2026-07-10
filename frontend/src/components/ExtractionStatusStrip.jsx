import './ExtractionStatusStrip.css';

/**
 * ExtractionStatusStrip — shows extraction result or graceful failure.
 * @param {string}  status    - 'extracting' | 'done' | 'error'
 * @param {number}  wordCount - extracted word count
 * @param {string}  error     - error message if extraction failed
 * @param {Function} onRetry  - retry callback for error state
 */
export default function ExtractionStatusStrip({ status, wordCount = 0, error = '', onRetry }) {
  if (status === 'extracting') {
    return (
      <div className="extraction-strip extraction-strip--extracting">
        <div className="skeleton extraction-strip__skeleton-line" />
        <div className="skeleton extraction-strip__skeleton-line extraction-strip__skeleton-line--short" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="extraction-strip extraction-strip--error animate-enter">
        <div className="extraction-strip__error-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="extraction-strip__error-text">{error}</p>
        {onRetry && (
          <button className="extraction-strip__retry-btn" onClick={onRetry} aria-label="Retry extraction">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (status === 'done' && wordCount > 0) {
    return (
      <div className="extraction-strip extraction-strip--done animate-enter">
        <div className="extraction-strip__icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="extraction-strip__label text-mono">
          {wordCount.toLocaleString()} words extracted
        </span>
        <span className="extraction-strip__divider" aria-hidden="true">·</span>
        <span className="extraction-strip__sublabel">Ready to assist</span>
      </div>
    );
  }

  return null;
}
