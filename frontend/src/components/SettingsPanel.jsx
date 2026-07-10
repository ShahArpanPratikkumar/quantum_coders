import { useState } from 'react';
import './SettingsPanel.css';

const SETTING_DEFAULTS = {
  aiBackend: 'cloud',        // 'cloud' | 'local'
  voiceEnabled: true,
  saveHistory: false,
  language: 'en-US',
};

/**
 * SettingsPanel — AI backend, voice, and privacy preferences.
 */
export default function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState(SETTING_DEFAULTS);

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
  const setVal  = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div className="settings-panel panel-enter glass">
      <div className="settings-panel__header">
        <h2 className="settings-panel__title text-display">Settings</h2>
        <button className="settings-panel__close" onClick={onClose} aria-label="Close settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="settings-panel__body">
        {/* AI Backend */}
        <section className="settings-section">
          <h3 className="settings-section__label text-display">AI Backend</h3>
          <p className="settings-section__desc">Choose where Lumen processes your questions.</p>
          <div className="settings-toggle-group">
            <button
              className={`settings-backend-btn ${settings.aiBackend === 'cloud' ? 'active' : ''}`}
              onClick={() => setVal('aiBackend', 'cloud')}
              aria-pressed={settings.aiBackend === 'cloud'}
            >
              <span className="settings-backend-btn__icon">☁</span>
              <span>
                <strong>Cloud AI</strong>
                <small>Gemini / OpenAI · Faster, richer</small>
              </span>
            </button>
            <button
              className={`settings-backend-btn ${settings.aiBackend === 'local' ? 'active active--violet' : ''}`}
              onClick={() => setVal('aiBackend', 'local')}
              aria-pressed={settings.aiBackend === 'local'}
            >
              <span className="settings-backend-btn__icon">⊞</span>
              <span>
                <strong>Local AI (Ollama)</strong>
                <small>Private · Runs on your device</small>
              </span>
            </button>
          </div>
        </section>

        {/* Voice */}
        <section className="settings-section">
          <div className="settings-row">
            <div>
              <h3 className="settings-section__label text-display">Voice responses</h3>
              <p className="settings-section__desc">Lumen reads its answers aloud.</p>
            </div>
            <ToggleSwitch
              checked={settings.voiceEnabled}
              onChange={() => toggle('voiceEnabled')}
              color="cyan"
              aria-label="Toggle voice responses"
            />
          </div>
        </section>

        {/* History */}
        <section className="settings-section">
          <div className="settings-row">
            <div>
              <h3 className="settings-section__label text-display">Save conversation history</h3>
              <p className="settings-section__desc">Off by default. Conversations are not stored unless you enable this.</p>
            </div>
            <ToggleSwitch
              checked={settings.saveHistory}
              onChange={() => toggle('saveHistory')}
              color="violet"
              aria-label="Toggle save history"
            />
          </div>
        </section>

        {/* Privacy notice */}
        <div className="settings-privacy-notice">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Lumen only processes the page you're currently viewing. No browsing history is collected.</span>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, color = 'cyan', ...rest }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`toggle-switch toggle-switch--${color} ${checked ? 'toggle-switch--on' : ''}`}
      onClick={onChange}
      {...rest}
    >
      <span className="toggle-switch__thumb" />
      <span className="sr-only">{checked ? 'On' : 'Off'}</span>
    </button>
  );
}
