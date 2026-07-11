import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Zap, Bug, List, RefreshCw, Copy, GitMerge } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';


export default function CodeLensPage() {
  const { addToast } = useToast();
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userCode, setUserCode] = useState("");

  const handleAction = async (actionKey) => {
    setActiveAction(actionKey);
    setIsLoading(true);
    setResult(null);
    
    try {
      const { analyseCodeAPI } = await import('../services/quantumApi.js');
      const res = await analyseCodeAPI({ code: userCode, action: actionKey });
      setResult(res.analysis);
    } catch (err) {
      setResult(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied to clipboard', type: 'success' });
  };

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Code Lens" 
        description="Understand, debug, and simplify code blocks found on this page."
        icon={Code2}
      />

      <div style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        


        {/* Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Left: Code Viewer */}
          <div style={{
            background: '#0d0d0c',
            border: '1px solid var(--quantum-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderBottom: '1px solid var(--quantum-border)',
              background: 'var(--quantum-black-deep)'
            }}>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'var(--quantum-gold)' }}>
                Code Editor
              </span>
              <button onClick={() => copyText(userCode)} style={miniBtn}>
                <Copy size={14} />
              </button>
            </div>
            <textarea 
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Paste or type code here to analyze..."
              style={{
              margin: 0, padding: '24px', overflowX: 'auto',
              fontFamily: 'var(--font-code)', fontSize: '0.9rem', lineHeight: 1.6,
              color: 'var(--quantum-ivory)', background: 'transparent', border: 'none',
              width: '100%', height: '100%', resize: 'vertical', minHeight: '300px', outline: 'none'
            }} />
          </div>

          {/* Right: Actions & Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ActionButton icon={Zap} label="Explain" active={activeAction === 'explain'} onClick={() => handleAction('explain')} disabled={!userCode} />
              <ActionButton icon={List} label="Line by Line" active={activeAction === 'lineByLine'} onClick={() => handleAction('lineByLine')} disabled={!userCode} />
              <ActionButton icon={Bug} label="Find Bugs" active={activeAction === 'bugs'} onClick={() => handleAction('bugs')} disabled={!userCode} />
              <ActionButton icon={GitMerge} label="Simplify" active={activeAction === 'simplify'} onClick={() => handleAction('simplify')} disabled={!userCode} />
            </div>

            <div style={{
              flex: 1,
              background: 'var(--quantum-glass)',
              border: '1px solid var(--quantum-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              minHeight: '300px',
              position: 'relative'
            }}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--quantum-gold)' }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <RefreshCw size={24} />
                    </motion.div>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--quantum-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Analysis Output
                      </span>
                      <button onClick={() => copyText(result)} style={miniBtn}><Copy size={14} /></button>
                    </div>
                    <div className="pp-editorial" style={{
                      color: 'var(--quantum-ivory)',
                      fontSize: '1.05rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {result}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--quantum-text-muted)' }}>
                    Select an action to analyze the code block.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}

function ActionButton({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: active ? 'var(--quantum-gold)' : 'var(--quantum-black-deep)',
        color: active ? 'var(--quantum-black-deep)' : 'var(--quantum-ivory)',
        border: `1px solid ${active ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
        padding: '8px 16px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--t-fast)'
      }}
    >
      <Icon size={16} />
      <span className="pp-ui-text" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

const miniBtn = {
  background: 'transparent',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '28px', height: '28px', borderRadius: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer'
};
