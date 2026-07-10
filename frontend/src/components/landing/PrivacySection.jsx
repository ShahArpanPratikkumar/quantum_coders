import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserX } from 'lucide-react';
import GoldButton from '../ui/GoldButton';
import { useQuantum } from '../../context/QuantumContext';
import './PrivacySection.css';

const POINTS = [
  { Icon: Eye,      title: 'Active page only',         desc: 'Only the page you\'re currently viewing is processed — nothing else.' },
  { Icon: Database, title: 'No permanent storage',      desc: 'Webpage content is never saved permanently unless you explicitly choose to.' },
  { Icon: UserX,    title: 'No browsing history',       desc: 'Quantum never collects your navigation history or browsing patterns.' },
  { Icon: Shield,   title: 'Transparent AI',            desc: 'AI-generated explanations are clearly labelled. Opinions are marked as such.' },
  { Icon: Lock,     title: 'You control everything',    desc: 'All data preferences are yours to set, adjust, or clear at any moment.' },
];

export default function PrivacySection() {
  const { openPanel } = useQuantum();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="pp-section pp-privacy" id="privacy" aria-label="Privacy">
      <div className="pp-container">
        <div className="pp-privacy__inner" ref={ref}>
          {/* Large lock icon */}
          <motion.div
            className="pp-privacy__icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            <Lock size={56} strokeWidth={0.8} color="var(--pp-gold)" />
          </motion.div>

          <motion.div
            className="pp-privacy__content"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="pp-label-gold">Privacy</span>
            <h2 className="pp-section-title">
              Your browsing<br />
              <em className="pp-ivory-italic">remains yours.</em>
            </h2>

            <div className="pp-privacy__points" role="list">
              {POINTS.map((pt, i) => (
                <motion.div
                  key={i}
                  className="pp-privacy__point"
                  role="listitem"
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <pt.Icon size={16} color="var(--pp-gold)" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <p className="pp-privacy__point-title pp-ui-text" style={{ color: 'var(--pp-ivory)', fontWeight: 500 }}>{pt.title}</p>
                    <p className="pp-privacy__point-desc pp-ui-text">{pt.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <GoldButton variant="outline" size="md" onClick={openPanel}>
              Try Quantum
            </GoldButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
