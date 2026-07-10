import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Search, Trash2, Copy, Filter, FileText, MessageSquare, BookOpen, Highlighter, ListTree } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';
import GoldButton from '../components/ui/GoldButton';

const MOCK_SAVED = [
  { id: '1', type: 'Summary', title: 'React Router v6 Architecture', domain: 'medium.com', date: 'Just now', content: 'React Router v6 introduced <Routes> replacing <Switch>.' },
  { id: '2', type: 'Chat', title: 'Context API vs Redux', domain: 'react.dev', date: '2 hours ago', content: 'Context API is best for UI state like themes and auth...' },
  { id: '3', type: 'Research', title: 'Deep Analysis of Server Components', domain: 'nextjs.org', date: 'Yesterday', content: 'Server components allow rendering React on the server without shipping JS.' },
  { id: '4', type: 'Text', title: 'Important quote', domain: 'github.com', date: 'Yesterday', content: '"Simplicity is the ultimate sophistication."' },
];

const ICONS = {
  Summary: <FileText size={16} />,
  Chat: <MessageSquare size={16} />,
  Research: <ListTree size={16} />,
  Text: <Highlighter size={16} />,
  Reading: <BookOpen size={16} />
};

export default function SavedPage() {
  const { addToast } = useToast();
  
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const stored = localStorage.getItem('quantum-saved-insights');
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(MOCK_SAVED);
      localStorage.setItem('quantum-saved-insights', JSON.stringify(MOCK_SAVED));
    }
  }, []);

  const saveToStorage = (newItems) => {
    setItems(newItems);
    localStorage.setItem('quantum-saved-insights', JSON.stringify(newItems));
  };

  const handleDelete = (id) => {
    saveToStorage(items.filter(item => item.id !== id));
    addToast({ title: 'Item deleted', type: 'info' });
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all saved insights?")) {
      saveToStorage([]);
      addToast({ title: 'All items deleted', type: 'info' });
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    addToast({ title: 'Copied to clipboard', type: 'success' });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <PageTransition style={{ height: '100%', overflowY: 'auto' }}>
      <PageHeader 
        title="Saved Insights" 
        description="Your personal library of summaries, chats, and research."
        icon={Bookmark}
        actions={
          <GoldButton variant="outline" onClick={handleClearAll} disabled={items.length === 0}>
            <Trash2 size={16} /> Clear All
          </GoldButton>
        }
      />

      <div style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: '250px',
            background: 'var(--quantum-black-deep)',
            border: '1px solid var(--quantum-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', padding: '0 16px'
          }}>
            <Search size={18} color="var(--quantum-text-muted)" />
            <input 
              type="text" 
              placeholder="Search saved items..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: 'var(--quantum-ivory)', padding: '12px', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', 'Summary', 'Chat', 'Research', 'Text'].map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                style={{
                  background: activeFilter === type ? 'var(--quantum-gold-muted)' : 'var(--quantum-black-deep)',
                  border: `1px solid ${activeFilter === type ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
                  color: activeFilter === type ? 'var(--quantum-gold)' : 'var(--quantum-text-muted)',
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all var(--t-fast)'
                }}
              >
                {type !== 'All' && ICONS[type]}
                <span className="pp-ui-text" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--quantum-text-muted)' }}>
            <Bookmark size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p className="pp-editorial" style={{ fontSize: '1.2rem' }}>No saved insights found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--quantum-glass)',
                    border: '1px solid var(--quantum-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    display: 'flex', flexDirection: 'column', gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--quantum-gold)', marginBottom: '8px' }}>
                        {ICONS[item.type]}
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</span>
                      </div>
                      <h3 className="pp-ui-text" style={{ color: 'var(--quantum-ivory)', margin: 0, fontSize: '1rem', lineHeight: 1.4 }}>
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p className="pp-editorial pp-truncate-3" style={{ color: 'var(--quantum-text-muted)', margin: 0, fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>
                    {item.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--quantum-border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--quantum-text-muted)' }}>{item.domain} • {item.date}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleCopy(item.content)} style={miniBtn} title="Copy"><Copy size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} style={miniBtn} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

const miniBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--quantum-text-muted)',
  width: '28px', height: '28px', borderRadius: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'color 0.2s'
};
