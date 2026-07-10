import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuantum } from '../../context/QuantumContext';
import './SettingsDrawer.css';

const AI_BACKENDS = ['Gemini', 'OpenAI GPT-4', 'Ollama (Local)', 'Llama'];
const VOICES = ['Default', 'Natural (en-US)', 'Calm (en-GB)', 'Warm (en-AU)'];
const SPEEDS = ['0.75×', '1×', '1.25×', '1.5×'];

export default function SettingsDrawer() {
  const { setIsSettingsOpen, clearMessages } = useQuantum();
  const [aiBackend, setAiBackend] = useState('Gemini');
  const [voice, setVoice] = useState('Natural (en-US)');
  const [speed, setSpeed] = useState('1×');
  const [autoRead, setAutoRead] = useState(false);
  const [saveHistory, setSaveHistory] = useState(false);

  return (
    <motion.aside
      className="pp-settings"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pp-settings__header">
        <h2 className="pp-settings__title pp-card-title" style={{ fontSize: '1rem' }}>Settings</h2>
        <button
          className="pp-settings__close"
          onClick={() => setIsSettingsOpen(false)}
          aria-label="Close settings"
        >
          <X size={15} strokeWidth={1.5} />
        </button>
      </div>

      <div className="pp-settings__body pp-scroll">
        <Section label="AI Provider">
          <div className="pp-settings__options" role="listbox" aria-label="AI provider">
            {AI_BACKENDS.map(b => (
              <button
                key={b}
                className={`pp-settings__option ${aiBackend === b ? 'active' : ''}`}
                onClick={() => setAiBackend(b)}
                role="option"
                aria-selected={aiBackend === b}
              >
                {b}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Voice">
          <select
            className="pp-settings__select"
            value={voice}
            onChange={e => setVoice(e.target.value)}
            aria-label="Select voice"
          >
            {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Section>

        <Section label="Reading Speed">
          <div className="pp-settings__options" role="listbox" aria-label="Reading speed">
            {SPEEDS.map(s => (
              <button
                key={s}
                className={`pp-settings__option ${speed === s ? 'active' : ''}`}
                onClick={() => setSpeed(s)}
                role="option"
                aria-selected={speed === s}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Preferences">
          <Toggle
            label="Auto-read responses"
            checked={autoRead}
            onChange={() => setAutoRead(p => !p)}
          />
          <Toggle
            label="Save conversation history"
            desc="Off by default · Conversations are not stored unless enabled"
            checked={saveHistory}
            onChange={() => setSaveHistory(p => !p)}
          />
        </Section>

        <Section label="Data">
          <button
            className="pp-settings__danger-btn"
            onClick={clearMessages}
          >
            Clear conversation
          </button>
        </Section>

        <div className="pp-settings__privacy">
          <p className="pp-ui-text" style={{ fontSize: '0.72rem', color: 'var(--pp-muted-dark)', lineHeight: 1.6 }}>
            Quantum only processes the page you are currently viewing. No browsing history is collected. Content is not stored permanently unless you enable history above.
          </p>
        </div>
      </div>
    </motion.aside>
  );
}

function Section({ label, children }) {
  return (
    <div className="pp-settings__section">
      <p className="pp-label-gold pp-settings__section-label">{label}</p>
      {children}
      <div className="pp-settings__divider" />
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="pp-settings__toggle-row">
      <div>
        <p className="pp-ui-text" style={{ color: 'var(--pp-ivory)', fontSize: '0.82rem' }}>{label}</p>
        {desc && <p className="pp-ui-text" style={{ fontSize: '0.7rem', marginTop: 2 }}>{desc}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        className={`pp-toggle ${checked ? 'pp-toggle--on' : ''}`}
        onClick={onChange}
      >
        <span className="pp-toggle__thumb" />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}
