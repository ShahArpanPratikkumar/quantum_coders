import { Clock, BookOpen, CheckCircle } from 'lucide-react';
import { usePageContext } from '../../context/PageContext';
import './PageContextCard.css';

export default function PageContextCard() {
  const { data: currentPage, aiState } = usePageContext();
  if (!currentPage) return null;

  const isExtracting = aiState === 'extracting';

  return (
    <div className="pp-page-card" aria-label="Current page info">
      {/* Gold accent line */}
      <div className="pp-page-card__accent" aria-hidden="true" />

      <div className="pp-page-card__main">
        {/* Favicon + domain */}
        <div className="pp-page-card__site">
          <span className="pp-page-card__favicon" aria-hidden="true">{currentPage.favicon || '📄'}</span>
          <span className="pp-ui-text" style={{ color: 'var(--pp-muted)', fontSize: '0.72rem' }}>
            {currentPage.domain || 'localhost'}
          </span>
        </div>

        {/* Title */}
        <p className="pp-page-card__title truncate" title={currentPage.pageTitle || currentPage.title || 'Current Webpage'}>
          {currentPage.pageTitle || currentPage.title || 'Current Webpage'}
        </p>

        {/* Stats */}
        <div className="pp-page-card__stats">
          <div className="pp-page-card__stat">
            <BookOpen size={11} color="var(--pp-muted)" strokeWidth={1.5} aria-hidden="true" />
            <span className="pp-ui-text" style={{ fontSize: '0.72rem' }}>
              {(currentPage.wordCount || 0).toLocaleString()} words
            </span>
          </div>
          <span className="pp-page-card__sep" aria-hidden="true">·</span>
          <div className="pp-page-card__stat">
            <Clock size={11} color="var(--pp-muted)" strokeWidth={1.5} aria-hidden="true" />
            <span className="pp-ui-text" style={{ fontSize: '0.72rem' }}>{currentPage.readTime || '1 min'} read</span>
          </div>
          <span className="pp-page-card__sep" aria-hidden="true">·</span>
          <div className="pp-page-card__stat">
            {isExtracting ? (
              <div className="pp-thinking-dots">
                <div className="pp-thinking-dot" /><div className="pp-thinking-dot" /><div className="pp-thinking-dot" />
              </div>
            ) : (
              <>
                <CheckCircle size={11} color="var(--pp-success)" strokeWidth={1.5} aria-hidden="true" />
                <span style={{ color: 'var(--pp-success)', fontSize: '0.72rem', fontFamily: 'var(--font-interface)' }}>Extracted</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
