import { motion, AnimatePresence } from 'framer-motion';
import { useQuantum } from '../../context/QuantumContext';
import PanelHeader from './PanelHeader';
import PageContextCard from './PageContextCard';
import QuickActions from './QuickActions';
import ConversationList from './ConversationList';
import ChatInput from './ChatInput';
import SettingsDrawer from './SettingsDrawer';
import EmptyState from './EmptyState';
import './AssistantPanel.css';

export default function AssistantPanel() {
  const { isPanelOpen, isSettingsOpen, status, messages } = useQuantum();

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="pp-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            className="pp-panel"
            role="complementary"
            aria-label="Quantum AI Assistant"
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Corner decorations */}
            <span className="pp-corner pp-corner-tl" aria-hidden="true" />
            <span className="pp-corner pp-corner-tr" aria-hidden="true" />
            <span className="pp-corner pp-corner-bl" aria-hidden="true" />
            <span className="pp-corner pp-corner-br" aria-hidden="true" />

            {/* Gold glow */}
            <div className="pp-panel__inner-glow" aria-hidden="true" />

            <PanelHeader />

            <div className="pp-panel__body pp-scroll">
              <PageContextCard />
              <QuickActions />

              {messages.length === 0 ? (
                <EmptyState />
              ) : (
                <ConversationList />
              )}
            </div>

            <ChatInput />

            {/* Settings drawer */}
            <AnimatePresence>
              {isSettingsOpen && <SettingsDrawer />}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
