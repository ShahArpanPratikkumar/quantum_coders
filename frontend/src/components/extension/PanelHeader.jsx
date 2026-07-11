import { Settings, Minimize2, X, ExternalLink } from 'lucide-react';
import { useQuantum } from '../../context/QuantumContext';
import StatusDot from '../ui/StatusDot';
import './PanelHeader.css';

export default function PanelHeader() {
  const { closePanel, status, setIsSettingsOpen, isSettingsOpen } = useQuantum();

  return (
    <header className="pp-ph" role="banner">
      {/* Logo + status */}
      <div className="pp-ph__brand">
        <span className="pp-logo-sm">Quantum</span>
        <StatusDot status={status} showLabel={true} />
      </div>

      {/* Actions */}
      <div className="pp-ph__actions">
        <a
          href="https://quantum-ai1.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="pp-ph__btn"
          style={{ width: 'auto', padding: '0 8px', fontSize: '11px', fontWeight: '600', textDecoration: 'none', color: 'var(--text-secondary)' }}
          title="Link to Extension"
        >
          <ExternalLink size={13} strokeWidth={2} style={{ marginRight: '4px' }} />
          Extension
        </a>
        <button
          className="pp-ph__btn"
          onClick={() => setIsSettingsOpen(s => !s)}
          aria-label="Open settings"
          aria-pressed={isSettingsOpen}
          title="Settings"
        >
          <Settings size={15} strokeWidth={1.5} />
        </button>
        <button
          className="pp-ph__btn"
          onClick={closePanel}
          aria-label="Close Quantum"
          title="Close"
        >
          <X size={15} strokeWidth={1.5} />
        </button>
      </div>

      {/* Gold line */}
      <div className="pp-ph__line" aria-hidden="true" />
    </header>
  );
}
