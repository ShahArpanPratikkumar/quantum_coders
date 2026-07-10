import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './HowItWorks.css';

const STEPS = [
  { num: '01', title: 'Open any webpage', desc: 'Navigate to any article, blog, documentation, or Wikipedia page as you normally would.' },
  { num: '02', title: 'Launch Quantum', desc: 'Click the golden floating button — or press Alt+P. Quantum reads and understands the page instantly.' },
  { num: '03', title: 'Ask, listen, or summarize', desc: 'Type your question, speak it aloud, or tap a quick action. Quantum answers using only the page you\'re on.' },
  { num: '04', title: 'Continue browsing', desc: 'Close the panel anytime. Your context is saved for the session. No interruption to your natural browsing.' },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="pp-section pp-how" id="how-it-works" aria-label="How it works">
      <div className="pp-container">
        <motion.div
          ref={ref}
          className="pp-how__header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="pp-label-gold">The Process</span>
          <h2 className="pp-section-title">
            Four steps to<br />
            <em className="pp-ivory-italic">full understanding.</em>
          </h2>
        </motion.div>

        {/* Progress line */}
        <div className="pp-how__track" aria-hidden="true">
          <motion.div
            className="pp-how__track-fill"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="pp-how__steps" role="list">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} allInView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index, allInView }) {
  return (
    <motion.div
      className="pp-how__step"
      role="listitem"
      initial={{ opacity: 0, y: 20 }}
      animate={allInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pp-how__step-num pp-big-number">{step.num}</div>
      <div className="pp-how__step-content">
        <span className="pp-how__step-dot" aria-hidden="true" />
        <h3 className="pp-how__step-title pp-card-title">{step.title}</h3>
        <p className="pp-how__step-desc pp-editorial-sm">{step.desc}</p>
      </div>
    </motion.div>
  );
}
