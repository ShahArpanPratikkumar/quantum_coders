import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlighter, BookOpen, Volume2, Copy, Eraser, Languages, RefreshCw, Zap } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';

const DEFAULT_SELECTION = "React Router v6 introduces a completely rewritten architecture. The primary change is the shift away from <Switch> in favor of <Routes>. Furthermore, it heavily promotes nested routing where parent layout components use an <Outlet /> to render child routes.";

const MOCK_RESULTS = {
  explain: "This text is explaining that in the newest version of React Router (v6), the way developers set up page navigation has changed significantly. They removed a component called `<Switch>` and replaced it with `<Routes>`. More importantly, they now encourage a 'nested' approach, which means you can have a main page layout (like a dashboard with a sidebar) that stays on the screen, while only the content inside (the `<Outlet />`) changes when you click a link.",
  simplify: "The new React Router v6 changed how page links work. Instead of `<Switch>`, you use `<Routes>`. It also makes it easier to keep your menus and sidebars visible while only the main page content changes.",
  summarize: "React Router v6 replaces Switch with Routes and focuses on nested routing via the Outlet component for persistent layouts.",
  translate: {
    hi: "React Router v6 ने पूरी तरह से नया आर्किटेक्चर पेश किया है। मुख्य बदलाव <Switch> को हटाकर <Routes> का उपयोग करना है। इसके अलावा, यह नेस्टेड राउटिंग को बढ़ावा देता है जहां पैरेंट लेआउट चाइल्ड राउट्स को रेंडर करने के लिए <Outlet /> का उपयोग करते हैं।",
    gu: "React Router v6 સંપૂર્ણપણે નવું આર્કિટેક્ચર રજૂ કરે છે. મુખ્ય ફેરફાર <Switch> ને બદલે <Routes> નો ઉપયોગ કરવાનો છે. વધુમાં, તે નેસ્ટેડ રાઉટિંગને પ્રોત્સાહન આપે છે જ્યાં પેરેન્ટ લેઆઉટ ચાઇલ્ડ રાઉટ્સ રેન્ડર કરવા માટે <Outlet /> નો ઉપયોગ કરે છે."
  }
};

export default function SelectionPage() {
  const { addToast } = useToast();
  const synthRef = useRef(window.speechSynthesis);
  
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const handleAction = (actionKey) => {
    setActiveAction(actionKey);
    setIsLoading(true);
    setResult(null);
    
    setTimeout(() => {
      if (actionKey === 'translate_hi') {
        setResult(MOCK_RESULTS.translate.hi);
      } else if (actionKey === 'translate_gu') {
        setResult(MOCK_RESULTS.translate.gu);
      } else {
        setResult(MOCK_RESULTS[actionKey]);
      }
      setIsLoading(false);
    }, 1200);
  };

  const readAloud = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    synthRef.current.speak(utterance);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied to clipboard', type: 'success' });
  };

  const clearSelection = () => {
    setSelection('');
    setResult(null);
    setActiveAction(null);
  };

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Selected Text" 
        description="Analyze, translate, or explain any text you highlight on the page."
        icon={Highlighter}
        actions={
          <button onClick={clearSelection} style={iconBtn} title="Clear Selection">
            <Eraser size={16} />
          </button>
        }
      />

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Selection Card */}
        <div style={{
          background: 'var(--quantum-black-deep)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--quantum-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Selection
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => readAloud(selection)} style={miniBtn}><Volume2 size={14} /></button>
              <button onClick={() => copyText(selection)} style={miniBtn}><Copy size={14} /></button>
            </div>
          </div>
          
          {selection ? (
            <p className="pp-editorial" style={{ fontSize: '1.2rem', color: 'var(--quantum-ivory)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "{selection}"
            </p>
          ) : (
            <p style={{ color: 'var(--quantum-text-muted)', fontStyle: 'italic', margin: 0 }}>
              No text selected. Highlight text on any page to see it here.
            </p>
          )}
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <ActionButton icon={Zap} label="Explain" active={activeAction === 'explain'} onClick={() => handleAction('explain')} disabled={!selection} />
          <ActionButton icon={BookOpen} label="Simplify" active={activeAction === 'simplify'} onClick={() => handleAction('simplify')} disabled={!selection} />
          <ActionButton icon={Highlighter} label="Summarize" active={activeAction === 'summarize'} onClick={() => handleAction('summarize')} disabled={!selection} />
          <ActionButton icon={Languages} label="Hindi" active={activeAction === 'translate_hi'} onClick={() => handleAction('translate_hi')} disabled={!selection} />
          <ActionButton icon={Languages} label="Gujarati" active={activeAction === 'translate_gu'} onClick={() => handleAction('translate_gu')} disabled={!selection} />
        </div>

        {/* Result Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '48px', display: 'flex', justifyContent: 'center', color: 'var(--quantum-gold)' }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw size={24} />
              </motion.div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--quantum-glass)',
                border: '1px solid var(--quantum-border-soft)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => readAloud(result)} style={miniBtn}><Volume2 size={14} /></button>
                <button onClick={() => copyText(result)} style={miniBtn}><Copy size={14} /></button>
              </div>
              <p className="pp-editorial" style={{ fontSize: '1.1rem', color: 'var(--quantum-ivory)', lineHeight: 1.8, margin: 0 }}>
                {result}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

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
        padding: '16px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--t-fast)'
      }}
    >
      <Icon size={24} />
      <span className="pp-ui-text" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
    </button>
  );
}

const iconBtn = {
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '32px', height: '32px', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer'
};

const miniBtn = {
  ...iconBtn,
  width: '28px', height: '28px', borderRadius: '6px'
};
