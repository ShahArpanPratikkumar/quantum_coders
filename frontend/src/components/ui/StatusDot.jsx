import './StatusDot.css';

const STATUS_MAP = {
  ready:      { label: 'Ready',               color: 'gold' },
  extracting: { label: 'Reading current page', color: 'gold', pulse: true },
  listening:  { label: 'Listening',            color: 'coral', pulse: true },
  thinking:   { label: 'Thinking',             color: 'gold', pulse: true },
  speaking:   { label: 'Speaking',             color: 'success', pulse: true },
  paused:     { label: 'Paused',               color: 'muted' },
  error:      { label: 'Error',                color: 'error' },
};

export default function StatusDot({ status = 'ready', showLabel = true }) {
  const config = STATUS_MAP[status] || STATUS_MAP.ready;
  return (
    <div className="pp-status-dot-wrapper" role="status" aria-label={config.label}>
      <span className={`pp-status-dot pp-status-dot--${config.color} ${config.pulse ? 'pp-status-dot--pulse' : ''}`} />
      {showLabel && (
        <span className="pp-status-dot-label pp-ui-text">{config.label}</span>
      )}
    </div>
  );
}
