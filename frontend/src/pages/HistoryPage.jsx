import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Trash2, ExternalLink, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';
import GoldButton from '../components/ui/GoldButton';

const MOCK_HISTORY = [
  { id: '1', title: 'React Router v6 Architecture', domain: 'reactrouter.com', date: 'Just now', feature: 'Smart Reader', progress: 45, path: '/reader' },
  { id: '2', title: 'Understanding Context API', domain: 'react.dev', date: '2 hours ago', feature: 'Ask Quantum', progress: 100, path: '/ask' },
  { id: '3', title: 'Server Components Deep Dive', domain: 'nextjs.org', date: 'Yesterday', feature: 'Research Mode', progress: 10, path: '/research' },
  { id: '4', title: 'JavaScript Promises Explained', domain: 'mdn.org', date: 'Yesterday', feature: 'Code Lens', progress: 80, path: '/code-lens' },
];

export default function HistoryPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('quantum-reading-history');
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(MOCK_HISTORY);
      localStorage.setItem('quantum-reading-history', JSON.stringify(MOCK_HISTORY));
    }
  }, []);

  const saveToStorage = (newItems) => {
    setItems(newItems);
    localStorage.setItem('quantum-reading-history', JSON.stringify(newItems));
  };

  const handleDelete = (id) => {
    saveToStorage(items.filter(item => item.id !== id));
    addToast({ title: 'History item removed', type: 'info' });
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your reading history?")) {
      saveToStorage([]);
      addToast({ title: 'History cleared', type: 'info' });
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Reading History" 
        description="Pick up exactly where you left off across all your analyzed pages."
        icon={History}
        actions={
          <GoldButton variant="outline" onClick={handleClearAll} disabled={items.length === 0}>
            <Trash2 size={16} /> Clear All
          </GoldButton>
        }
      />

      <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Search */}
        <div style={{
          background: 'var(--quantum-black-deep)',
          border: '1px solid var(--quantum-border)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          maxWidth: '400px'
        }}>
          <Search size={18} color="var(--quantum-text-muted)" />
          <input 
            type="text" 
            placeholder="Search history..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--quantum-ivory)', padding: '12px', outline: 'none'
            }}
          />
        </div>

        {/* List */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--quantum-text-muted)' }}>
            <History size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p className="pp-editorial" style={{ fontSize: '1.2rem' }}>Your reading history is empty.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--quantum-glass)',
                    border: '1px solid var(--quantum-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    display: 'flex', alignItems: 'center', gap: '24px',
                    transition: 'border-color var(--t-fast)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--quantum-border-soft)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--quantum-border)'}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'var(--quantum-black-deep)', border: '1px solid var(--quantum-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--quantum-gold)'
                  }}>
                    <Globe size={20} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="pp-ui-text truncate" style={{ color: 'var(--quantum-ivory)', margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 600 }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--quantum-text-muted)', fontSize: '0.8rem' }}>
                      <span>{item.domain}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--quantum-gold)' }}>{item.feature}</span>
                    </div>
                  </div>

                  <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--quantum-text-muted)' }}>
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'var(--quantum-black-deep)', borderRadius: '2px' }}>
                      <div style={{ width: `${item.progress}%`, height: '100%', background: 'var(--quantum-gold)', borderRadius: '2px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginLeft: '12px' }}>
                    <GoldButton variant="primary" onClick={() => navigate(item.path)} style={{ padding: '8px 16px' }}>
                      Continue
                    </GoldButton>
                    <button onClick={() => handleDelete(item.id)} style={miniBtn} title="Remove">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--quantum-text-muted)' }}>
            Quantum AI only saves history locally on your device to protect your privacy.
          </span>
        </div>
      </div>
    </PageTransition>
  );
}

const miniBtn = {
  background: 'transparent',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '36px', height: '36px', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'color 0.2s'
};
