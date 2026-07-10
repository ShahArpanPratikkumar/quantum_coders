import './QuickActionChip.css';

const CHIP_CONFIG = {
  summarize:  { icon: '⚡', label: 'Summarize', color: 'cyan' },
  readAloud:  { icon: '▶', label: 'Read aloud', color: 'violet' },
  explain:    { icon: '✦', label: 'Explain simply', color: 'coral' },
  keyPoints:  { icon: '◈', label: 'Key points', color: 'cyan' },
  tldr:       { icon: '◷', label: '2-min summary', color: 'violet' },
};

/**
 * QuickActionChip — single action shortcut button.
 */
function QuickActionChip({ type, onAction, disabled = false }) {
  const config = CHIP_CONFIG[type] || { icon: '?', label: type, color: 'cyan' };

  return (
    <button
      className={`quick-chip quick-chip--${config.color}`}
      onClick={() => onAction && onAction(type, config.label)}
      disabled={disabled}
      aria-label={config.label}
    >
      <span className="quick-chip__icon" aria-hidden="true">{config.icon}</span>
      <span className="quick-chip__label">{config.label}</span>
    </button>
  );
}

/**
 * QuickActionChips — row of quick-action shortcuts.
 */
export default function QuickActionChips({ onAction, disabled = false, chips = ['summarize', 'readAloud', 'explain', 'keyPoints'] }) {
  return (
    <div className="quick-chips" role="group" aria-label="Quick actions">
      {chips.map(type => (
        <QuickActionChip
          key={type}
          type={type}
          onAction={onAction}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
