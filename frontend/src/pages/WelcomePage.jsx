import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GoldButton from '../components/ui/GoldButton';
import '../components/landing/HeroSection.css'; // Reusing hero styles
import './WelcomePage.css';

const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [isEntering, setIsEntering] = useState(false);
  
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const handleEnterQuantum = () => {
    setIsEntering(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 800); // 800ms transition
  };

  return (
    <motion.div 
      className="pp-welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: isEntering ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <section className="pp-hero pp-grain" ref={sectionRef} aria-label="Welcome to Quantum AI">
        {/* Background ambient glow */}
        <div className="pp-hero__glow" aria-hidden="true" />

        {/* Parallax oversized text */}
        <motion.div
          className="pp-hero__bg-word"
          style={{ y: bgY }}
          aria-hidden="true"
        >
          QUANTUM
        </motion.div>

        {/* Content */}
        <motion.div
          className="pp-container pp-hero__content"
          style={{ opacity }}
          variants={STAGGER}
          initial="hidden"
          animate="show"
        >
          {/* Label */}
          <motion.div variants={FADE_UP} className="pp-hero__label">
            <span className="pp-logo" style={{ fontSize: '2.5rem', color: 'var(--quantum-gold)' }}>Quantum AI</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={FADE_UP} className="pp-hero__heading pp-hero-title">
            <span className="pp-gold-text">Enter a smarter</span>
            <br />
            <em className="pp-hero__italic">way to browse.</em>
          </motion.h1>

          {/* Editorial sub */}
          <motion.p variants={FADE_UP} className="pp-hero__description pp-editorial">
            Quantum AI understands the page in front of you, explains difficult ideas, answers your questions, and speaks with you without breaking your browsing flow.
          </motion.p>

          {/* Current Page Detection Block */}
          <motion.div variants={FADE_UP} className="pp-welcome__detection-block pp-glass">
            <div className="pp-welcome__detection-col">
              <span className="pp-welcome__detection-label">CURRENT PAGE</span>
              <span className="pp-welcome__detection-value truncate">React Documentation</span>
            </div>
            <div className="pp-welcome__detection-col">
              <span className="pp-welcome__detection-label">STATUS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pp-fab__status-dot" style={{ position: 'relative', top: 0, right: 0 }} />
                <span className="pp-welcome__detection-value" style={{ color: 'var(--quantum-success)' }}>Ready to understand</span>
              </div>
            </div>
          </motion.div>

          {/* CTA row */}
          <motion.div variants={FADE_UP} className="pp-hero__ctas">
            <GoldButton variant="primary" size="lg" onClick={handleEnterQuantum}>
              Enter Quantum
            </GoldButton>
            <GoldButton variant="outline" size="lg">
              Quick Demo
            </GoldButton>
          </motion.div>

          {/* Shortcut Hint */}
          <motion.p variants={FADE_UP} className="pp-welcome__shortcut">
            Press <kbd>Ctrl + Q</kbd> to open Quantum AI
          </motion.p>
        </motion.div>
      </section>

      {/* Transition Line */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            className="pp-welcome__transition-line"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
