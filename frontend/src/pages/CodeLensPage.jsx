import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Zap, Bug, List, RefreshCw, Copy, GitMerge } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';

const MOCK_CODE_BLOCKS = [
  {
    id: 'block1',
    lang: 'javascript',
    title: 'auth/validateToken.js',
    code: `async function validateToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}`
  },
  {
    id: 'block2',
    lang: 'jsx',
    title: 'components/UserProfile.jsx',
    code: `export default function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <Loading />;
  return <div>{user.name}</div>;
}`
  }
];

const MOCK_LENS_RESULTS = {
  explain: "This function is an Express.js middleware used for authentication. It checks if an HTTP request has an Authorization header containing a Bearer token. If the token exists, it verifies it using a secret key (JWT_SECRET). If valid, it attaches the decoded user data to the request object and allows the request to proceed by calling next(). If anything fails, it returns a 401 or 403 error.",
  lineByLine: "1. async function validateToken... -> Declares an async Express middleware.\n2. try { -> Starts error handling block.\n3. const token = ... -> Extracts the token from the 'Bearer <token>' string.\n4. if (!token) ... -> Returns 401 if token is missing.\n5. const decoded = jwt.verify... -> Synchronously verifies the JWT.\n6. req.user = decoded; -> Attaches payload to request.\n7. next(); -> Passes control to next middleware.\n8. catch (err) -> Catches invalid/expired token errors.\n9. return res.status(403)... -> Returns forbidden error.",
  bugs: "Potential Bugs / Improvements:\n1. Missing dependency: jwt is not imported or passed in, which will throw a ReferenceError.\n2. process.env.JWT_SECRET could be undefined, causing jwt.verify to throw an error.\n3. The token split assumes the header is exactly 'Bearer <token>'. If the header is malformed, split(' ')[1] could be undefined.",
  simplify: "You could extract the token extraction into a helper function, or use a library like passport-jwt which handles these edge cases automatically."
};

export default function CodeLensPage() {
  const { addToast } = useToast();
  const [activeBlockId, setActiveBlockId] = useState(MOCK_CODE_BLOCKS[0].id);
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeBlock = MOCK_CODE_BLOCKS.find(b => b.id === activeBlockId);

  const handleAction = (actionKey) => {
    setActiveAction(actionKey);
    setIsLoading(true);
    setResult(null);
    
    setTimeout(() => {
      setResult(MOCK_LENS_RESULTS[actionKey] || MOCK_LENS_RESULTS.explain);
      setIsLoading(false);
    }, 1500);
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
        
        {/* Code Selector */}
        <div>
          <h3 className="pp-ui-text" style={{ color: 'var(--quantum-ivory)', marginBottom: '16px' }}>
            Detected Code Blocks
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {MOCK_CODE_BLOCKS.map(block => (
              <button
                key={block.id}
                onClick={() => {
                  setActiveBlockId(block.id);
                  setResult(null);
                  setActiveAction(null);
                }}
                style={{
                  background: activeBlockId === block.id ? 'var(--quantum-gold-muted)' : 'var(--quantum-black-deep)',
                  border: `1px solid ${activeBlockId === block.id ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
                  color: activeBlockId === block.id ? 'var(--quantum-gold)' : 'var(--quantum-text-muted)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.8rem',
                  transition: 'all var(--t-fast)'
                }}
              >
                {block.title}
              </button>
            ))}
          </div>
        </div>

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
                {activeBlock.lang}
              </span>
              <button onClick={() => copyText(activeBlock.code)} style={miniBtn}>
                <Copy size={14} />
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '24px', overflowX: 'auto',
              fontFamily: 'var(--font-code)', fontSize: '0.9rem', lineHeight: 1.6,
              color: 'var(--quantum-ivory)'
            }}>
              <code>{activeBlock.code}</code>
            </pre>
          </div>

          {/* Right: Actions & Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ActionButton icon={Zap} label="Explain" active={activeAction === 'explain'} onClick={() => handleAction('explain')} />
              <ActionButton icon={List} label="Line by Line" active={activeAction === 'lineByLine'} onClick={() => handleAction('lineByLine')} />
              <ActionButton icon={Bug} label="Find Bugs" active={activeAction === 'bugs'} onClick={() => handleAction('bugs')} />
              <ActionButton icon={GitMerge} label="Simplify" active={activeAction === 'simplify'} onClick={() => handleAction('simplify')} />
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

function ActionButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--quantum-gold)' : 'var(--quantum-black-deep)',
        color: active ? 'var(--quantum-black-deep)' : 'var(--quantum-ivory)',
        border: `1px solid ${active ? 'var(--quantum-gold)' : 'var(--quantum-border)'}`,
        padding: '8px 16px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
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
