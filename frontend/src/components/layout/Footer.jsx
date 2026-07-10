import './Footer.css';

export default function Footer() {
  return (
    <footer className="pp-footer" role="contentinfo">
      <div className="pp-footer__top-border" aria-hidden="true" />
      <div className="pp-container pp-footer__inner">
        <div className="pp-footer__brand">
          <span className="pp-logo" style={{ fontSize: '1.8rem' }}>Quantum</span>
          <p className="pp-ui-text" style={{ maxWidth: 260, lineHeight: 1.6 }}>
            An AI companion that understands every webpage you visit — without interrupting how you browse.
          </p>
        </div>

        <nav className="pp-footer__links" aria-label="Footer navigation">
          <div className="pp-footer__col">
            <p className="pp-label-gold" style={{ marginBottom: 14 }}>Product</p>
            {['Features', 'How It Works', 'Privacy', 'Demo'].map(l => (
              <a key={l} className="pp-footer__link pp-ui-text">{l}</a>
            ))}
          </div>
          <div className="pp-footer__col">
            <p className="pp-label-gold" style={{ marginBottom: 14 }}>Team</p>
            {['GitHub', 'Hackathon', 'Coding-Gita'].map(l => (
              <a key={l} className="pp-footer__link pp-ui-text">{l}</a>
            ))}
          </div>
        </nav>
      </div>

      <div className="pp-container pp-footer__bottom">
        <p className="pp-ui-text" style={{ color: 'var(--pp-muted-dark)', fontSize: '0.75rem' }}>
          © 2025 Quantum AI · Built for Coding-Gita Hackathon · quantum_coders
        </p>
        <p className="pp-logo-sm" style={{ fontSize: '1.1rem', opacity: 0.4 }}>Quantum</p>
      </div>
    </footer>
  );
}
