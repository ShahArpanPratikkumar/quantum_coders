import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, FileText, Volume2, Highlighter, 
  Mic, Code2, Languages, Focus, List, BookOpen 
} from 'lucide-react';
import './DashboardPage.css';

const FEATURES = [
  { id: 'ask', name: 'Ask Anything', desc: 'Converse with the page context.', icon: MessageSquare, size: 'large', route: '/ask' },
  { id: 'summary', name: 'Summarize Page', desc: 'Extract key insights instantly.', icon: FileText, size: 'medium', route: '/summary' },
  { id: 'reader', name: 'Read Aloud', desc: 'High-quality voice narration.', icon: Volume2, size: 'medium', route: '/reader' },
  { id: 'selection', name: 'Explain Selection', desc: 'Highlight text for deep context.', icon: Highlighter, size: 'small', route: '/selection' },
  { id: 'voice', name: 'Voice Conversation', desc: 'Hands-free audio mode.', icon: Mic, size: 'small', route: '/voice' },
  { id: 'code', name: 'Explain Code', desc: 'Analyze and simplify code blocks.', icon: Code2, size: 'small', route: '/code-lens' },
  { id: 'translate', name: 'Translate Page', desc: 'Read in your native language.', icon: Languages, size: 'small', route: '/translate' },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="pp-dash-page">
      <div className="pp-dash-page__header">
        <h1 className="pp-hero-title pp-dash-page__title">
          <span className="pp-gold-text">What would you like</span><br />
          <em className="pp-hero__italic" style={{ fontSize: '3.5rem' }}>to understand today?</em>
        </h1>
        <p className="pp-editorial pp-dash-page__subtitle">Select a workspace below to begin interacting with the current page.</p>
      </div>

      <div className="pp-dash-page__grid">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.id}
            className={`pp-dash-card pp-dash-card--${feature.size} pp-glass`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate(feature.route)}
            whileHover={{ y: -4, borderColor: 'rgba(203,162,58,0.5)' }}
            role="button"
            tabIndex={0}
          >
            <div className="pp-dash-card__top">
              <span className="pp-dash-card__num pp-big-number">{(index + 1).toString().padStart(2, '0')}</span>
              <feature.icon className="pp-dash-card__icon" size={24} />
            </div>
            <div className="pp-dash-card__content">
              <h3 className="pp-card-title">{feature.name}</h3>
              <p className="pp-editorial-sm">{feature.desc}</p>
            </div>
            <div className="pp-dash-card__border-reveal" aria-hidden="true" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
