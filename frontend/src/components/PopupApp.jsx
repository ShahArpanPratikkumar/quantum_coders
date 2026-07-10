import { useState } from 'react';
import AuroraRing from './AuroraRing';
import SettingsPanel from './SettingsPanel';
import './PopupApp.css';

const RECENT_PAGES = [
  { title: 'Understanding Transformer Architecture', domain: 'medium.com',   status: 'summarized' },
  { title: 'Chrome Extension Manifest V3 Guide',    domain: 'developer.chrome.com', status: 'read' },
  { title: 'React 19: What Changed and Why',        domain: 'dev.to',        status: 'explained' },
];

const STATUS_COLORS = {
  summarized: 'var(--cyan)',
  read:       'var(--violet)',
  explained:  'var(--coral)',
};

/**
 * PopupApp — the compact toolbar popup entry point (380px wide).
 */
export default function PopupApp({ onOpenOverlay }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="popup-app glass">
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* ── Hero ── */}
      <div className="popup-hero">
        <div className="popup-hero__ring">
          <AuroraRing state="idle" size="md" />
        </div>

        <div className="popup-hero__copy">
          <h1 className="popup-hero__wordmark text-display">Lumen</h1>
          <p className="popup-hero__tagline">Your AI reading companion.<br />Any page. Any question. Right here.</p>
        </div>

        <button
          className="popup-hero__settings-btn"
          onClick={() => setShowSettings(s => !s)}
          aria-label="Open settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* ── CTA ── */}
      <div className="popup-cta">
        <button
          className="popup-cta__btn"
          onClick={onOpenOverlay}
          aria-label="Open Lumen on this page"
          id="popup-open-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          Open on this page
        </button>
        <p className="popup-cta__hint">Lumen will read and understand the current tab.</p>
      </div>

      {/* ── Recent pages ── */}
      <div className="popup-recents">
        <h2 className="popup-recents__heading text-display">Recent</h2>
        <ul className="popup-recents__list" aria-label="Recently assisted pages">
          {RECENT_PAGES.map((page, i) => (
            <li key={i} className="popup-recents__item glass">
              <div className="popup-recents__item-dot" style={{ background: STATUS_COLORS[page.status] }} aria-hidden="true" />
              <div className="popup-recents__item-info">
                <span className="popup-recents__item-title truncate">{page.title}</span>
                <span className="popup-recents__item-domain text-mono">{page.domain}</span>
              </div>
              <span
                className="popup-recents__item-status text-mono"
                style={{ color: STATUS_COLORS[page.status] }}
              >
                {page.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
