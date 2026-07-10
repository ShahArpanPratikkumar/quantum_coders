import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useQuantum } from '../../context/QuantumContext';
import GoldButton from '../ui/GoldButton';
import './FinalCTA.css';

export default function FinalCTA() {
  const { openPanel } = useQuantum();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="pp-section pp-cta pp-grain" aria-label="Call to action">
      {/* Glow */}
      <div className="pp-cta__glow" aria-hidden="true" />

      <div className="pp-container" ref={ref}>
        <motion.div
          className="pp-cta__inner"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="pp-label-gold">Get started</span>

          <h2 className="pp-cta__heading pp-section-title">
            The next page you open<br />
            <em className="pp-ivory-italic">should be easier to understand.</em>
          </h2>

          <div className="pp-cta__actions">
            <GoldButton variant="primary" size="lg" onClick={openPanel}>
              Launch Quantum
            </GoldButton>
            <GoldButton
              variant="outline"
              size="lg"
              onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Live Demo
            </GoldButton>
          </div>

          <motion.p
            className="pp-cta__handwritten pp-logo"
            style={{ fontSize: '2.5rem', marginTop: 12, opacity: 0.7 }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 0.7 } : {}}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Browse smarter.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
