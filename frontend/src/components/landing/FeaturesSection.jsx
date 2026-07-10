import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import './FeaturesSection.css';

const FEATURES = [
  { num: '01', title: 'Smart Page Summary', desc: 'Extracts the core ideas from any article — blogs, documentation, news — in seconds.', icon: '◈', size: 'large' },
  { num: '02', title: 'Ask Questions', desc: 'Ask anything. Quantum answers using only what\'s on the current page.', icon: '◎', size: 'medium' },
  { num: '03', title: 'Natural Voice', desc: 'Speak naturally. Quantum listens, understands, and responds without extra clicks.', icon: '◐', size: 'medium' },
  { num: '04', title: 'Explain Selected Text', desc: 'Highlight any paragraph. Get an instant contextual explanation right where you\'re reading.', icon: '◑', size: 'small' },
  { num: '05', title: 'Read Aloud', desc: 'High-quality voice narration follows your reading pace.', icon: '▷', size: 'small' },
  { num: '06', title: 'Translation', desc: 'Translate content into your preferred language before reading.', icon: '⟐', size: 'small' },
  { num: '07', title: 'Beginner Mode', desc: 'Complex concepts explained simply — like a patient teacher.', icon: '◇', size: 'small' },
  { num: '08', title: 'Code Explanation', desc: 'Technical code blocks explained in plain English, inline.', icon: '⌥', size: 'medium' },
  { num: '09', title: 'Privacy First', desc: 'Only the active page is processed. No history. No tracking. No storage.', icon: '⊕', size: 'small' },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={`pp-feature-card pp-feature-card--${feature.size} pp-glass`}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, borderColor: 'rgba(203,162,58,0.45)' }}
    >
      <div className="pp-feature-card__top">
        <span className="pp-feature-card__num pp-big-number">{feature.num}</span>
        <span className="pp-feature-card__icon" aria-hidden="true">{feature.icon}</span>
      </div>
      <h3 className="pp-feature-card__title pp-card-title">{feature.title}</h3>
      <p className="pp-feature-card__desc pp-editorial-sm">{feature.desc}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const titleRef = useRef(null);
  const inView = useInView(titleRef, { once: true, margin: '-100px' });

  return (
    <section className="pp-section" id="features" aria-label="Features">
      <div className="pp-container">
        <motion.div
          ref={titleRef}
          className="pp-features__header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="pp-label-gold">Capabilities</span>
          <h2 className="pp-section-title">
            An intelligent layer<br />
            <em className="pp-ivory-italic">for every page.</em>
          </h2>
          <div className="pp-divider" style={{ marginTop: 24 }} />
        </motion.div>

        <div className="pp-features__grid">
          {FEATURES.map((f, i) => <FeatureCard key={f.num} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  );
}
