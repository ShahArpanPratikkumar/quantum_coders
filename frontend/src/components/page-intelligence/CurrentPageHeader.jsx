import { RefreshCw, ShieldCheck } from 'lucide-react';
import { usePageIntelligence } from '../../hooks/usePageIntelligence';
import { useToast } from '../../context/ToastContext';

export default function CurrentPageHeader() {
  const { pageTitle, domain, favicon, refreshPageContext, isDemo } = usePageIntelligence();
  const { addToast } = useToast();

  const handleRefresh = async () => {
    await refreshPageContext();
    addToast({ title: 'Context updated successfully', type: 'success' });
  };

  return (
    <div style={container}>
      <div style={headerRow}>
        <span style={label}>CURRENT PAGE</span>
      </div>
      
      <div style={mainInfo}>
        <div style={iconBox}>
          {favicon.startsWith('http') ? (
            <img src={favicon} alt="Site icon" style={{ width: 16, height: 16 }} />
          ) : (
            <span>{favicon}</span>
          )}
        </div>
        
        <div style={textCol}>
          <h2 className="pp-ui-text" style={titleStyle} title={pageTitle}>
            {pageTitle}
          </h2>
          <div style={domainRow}>
            <ShieldCheck size={12} color="var(--quantum-success)" />
            <span style={domainText}>{domain}</span>
          </div>
        </div>

        <button onClick={handleRefresh} style={refreshBtn} title="Refresh Context">
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
}

const container = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--quantum-border)'
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const label = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'var(--quantum-text-muted)',
  textTransform: 'uppercase'
};

const demoBadge = {
  fontSize: '0.65rem',
  color: 'var(--quantum-gold)',
  border: '1px solid var(--quantum-gold-muted)',
  padding: '2px 6px',
  borderRadius: '4px',
  background: 'rgba(203, 162, 58, 0.1)'
};

const mainInfo = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const iconBox = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'var(--quantum-black-deep)',
  border: '1px solid var(--quantum-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const textCol = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0
};

const titleStyle = {
  fontSize: '0.95rem',
  color: 'var(--quantum-ivory)',
  fontWeight: 600,
  margin: '0 0 2px 0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const domainRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const domainText = {
  fontSize: '0.75rem',
  color: 'var(--quantum-text-muted)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const refreshBtn = {
  background: 'transparent',
  border: '1px solid var(--quantum-border)',
  color: 'var(--quantum-text-muted)',
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all var(--t-fast)'
};
