import { Settings, Sliders, Volume2, Shield, Eye, Trash2, RotateCcw } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import GoldButton from '../components/ui/GoldButton';

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { addToast } = useToast();

  const handleReset = () => {
    resetSettings();
    addToast({ title: 'Settings reset to defaults', type: 'info' });
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to permanently clear all local data? This includes your history and saved insights.")) {
      localStorage.clear();
      addToast({ title: 'All local data cleared', type: 'success' });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Settings" 
        description="Configure your Quantum AI browser companion."
        icon={Settings}
      />

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '64px' }}>
        
        {/* Appearance Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Eye size={20} color="var(--quantum-gold)" />
            <h3 className="pp-ui-text" style={{ fontSize: '1.2rem', color: 'var(--quantum-ivory)', margin: 0 }}>Appearance</h3>
          </div>
          
          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Theme</div>
              <div style={settingDescStyle}>Select the visual theme for Quantum AI.</div>
            </div>
            <select 
              value={settings.theme} 
              onChange={e => { updateSetting('theme', e.target.value); addToast({ title: 'Theme updated', type: 'success' }); }}
              style={selectStyle}
            >
              <option value="dark">Deep Luxury Dark</option>
              <option value="warm">Warm Ivory Reading</option>
            </select>
          </div>

          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Enable Animations</div>
              <div style={settingDescStyle}>Smooth transitions and glowing effects.</div>
            </div>
            <Toggle 
              checked={settings.animations} 
              onChange={val => { updateSetting('animations', val); addToast({ title: 'Animation settings updated', type: 'success' }); }} 
            />
          </div>
        </section>

        {/* AI Engine Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Sliders size={20} color="var(--quantum-gold)" />
            <h3 className="pp-ui-text" style={{ fontSize: '1.2rem', color: 'var(--quantum-ivory)', margin: 0 }}>AI Engine</h3>
          </div>
          
          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Default Provider</div>
              <div style={settingDescStyle}>The underlying language model used for processing.</div>
            </div>
            <select 
              value={settings.provider} 
              onChange={e => { updateSetting('provider', e.target.value); addToast({ title: 'Provider updated', type: 'success' }); }}
              style={selectStyle}
            >
              <option value="quantum-core">Quantum Core (Recommended)</option>
              <option value="local-ollama">Local Node (Ollama)</option>
              <option value="openai">OpenAI API Key</option>
            </select>
          </div>
        </section>

        {/* Voice Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Volume2 size={20} color="var(--quantum-gold)" />
            <h3 className="pp-ui-text" style={{ fontSize: '1.2rem', color: 'var(--quantum-ivory)', margin: 0 }}>Voice & Speech</h3>
          </div>
          
          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Voice Speed</div>
              <div style={settingDescStyle}>Adjust the reading speed of the assistant. ({settings.voiceSpeed}x)</div>
            </div>
            <input 
              type="range" min="0.5" max="2" step="0.1" 
              value={settings.voiceSpeed} 
              onChange={e => updateSetting('voiceSpeed', parseFloat(e.target.value))}
              onMouseUp={() => addToast({ title: 'Voice speed updated', type: 'success' })}
              style={{ width: '150px' }}
            />
          </div>

          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Auto-read Responses</div>
              <div style={settingDescStyle}>Automatically speak chat responses aloud.</div>
            </div>
            <Toggle 
              checked={settings.autoRead} 
              onChange={val => { updateSetting('autoRead', val); addToast({ title: 'Auto-read updated', type: 'success' }); }} 
            />
          </div>
        </section>

        {/* Privacy & Data Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Shield size={20} color="var(--quantum-gold)" />
            <h3 className="pp-ui-text" style={{ fontSize: '1.2rem', color: 'var(--quantum-ivory)', margin: 0 }}>Privacy & Data</h3>
          </div>
          
          <div style={{ padding: '24px' }}>
            <p className="pp-editorial" style={{ color: 'var(--quantum-text-muted)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Quantum AI respects your privacy. All your reading history, saved insights, and preferences are stored locally in this browser. We do not track your browsing activity across sites.
            </p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <GoldButton variant="outline" onClick={handleReset}>
                <RotateCcw size={16} /> Reset Settings
              </GoldButton>
              <button 
                onClick={handleClearData}
                style={{
                  background: 'transparent', border: '1px solid var(--quantum-error)', color: 'var(--quantum-error)',
                  padding: '8px 24px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
                }}
              >
                <Trash2 size={16} /> Clear Local Data
              </button>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}

// Subcomponents
function Toggle({ checked, onChange }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{
        width: '44px', height: '24px',
        background: checked ? 'var(--quantum-gold)' : 'var(--quantum-black-deep)',
        border: `1px solid ${checked ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
        borderRadius: '12px',
        position: 'relative', cursor: 'pointer',
        transition: 'all 0.3s'
      }}
    >
      <div style={{
        width: '18px', height: '18px',
        background: checked ? 'var(--quantum-black-deep)' : 'var(--quantum-text-muted)',
        borderRadius: '50%',
        position: 'absolute', top: '2px',
        left: checked ? '22px' : '2px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} />
    </div>
  );
}

const sectionStyle = {
  background: 'var(--quantum-glass)',
  border: '1px solid var(--quantum-border)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden'
};

const sectionHeaderStyle = {
  padding: '20px 24px',
  background: 'rgba(0,0,0,0.2)',
  borderBottom: '1px solid var(--quantum-border)',
  display: 'flex', alignItems: 'center', gap: '12px'
};

const settingRowStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid var(--quantum-border)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px'
};

const settingLabelStyle = {
  color: 'var(--quantum-ivory)',
  fontSize: '1.05rem',
  fontWeight: 500,
  marginBottom: '4px',
  fontFamily: 'var(--font-interface)'
};

const settingDescStyle = {
  color: 'var(--quantum-text-muted)',
  fontSize: '0.85rem'
};

const selectStyle = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-ivory)',
  padding: '10px 16px',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-interface)',
  outline: 'none',
  cursor: 'pointer'
};
