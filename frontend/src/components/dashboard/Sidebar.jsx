import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, MessageSquare, FileText, BookOpen, Volume2, 
  Highlighter, Code2, Languages, List, Focus, 
  Bookmark, History, Settings, ChevronLeft, LogOut 
} from 'lucide-react';
import './Sidebar.css';

const LINKS = [
  { label: 'Home', icon: Home, route: '/dashboard' },
  { label: 'Ask Quantum', icon: MessageSquare, route: '/ask' },
  { label: 'Page Summary', icon: FileText, route: '/summary' },
  { label: 'Smart Reader', icon: BookOpen, route: '/reader' },
  { label: 'Voice Assistant', icon: Volume2, route: '/voice' },
  { label: 'Selected Text', icon: Highlighter, route: '/selection' },
  { label: 'Code Lens', icon: Code2, route: '/code-lens' },
  { label: 'Translate', icon: Languages, route: '/translate' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="pp-sidebar">
      <div className="pp-sidebar__brand">
        <span className="pp-logo" style={{ fontSize: '1.6rem', color: 'var(--quantum-gold)' }}>Quantum</span>
      </div>

      <nav className="pp-sidebar__nav pp-scroll">
        {LINKS.map(link => (
          <NavLink 
            key={link.route} 
            to={link.route}
            end={link.route === '/dashboard'}
            className={({ isActive }) => `pp-sidebar__link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={16} strokeWidth={1.8} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="pp-sidebar__bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="pp-sidebar__collapse" onClick={() => navigate('/')}>
          <LogOut size={16} />
          Exit to Interface
        </button>
        <button className="pp-sidebar__collapse">
          <ChevronLeft size={16} />
          Collapse
        </button>
      </div>
    </aside>
  );
}
