import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useQuantum } from '../../context/QuantumContext';
import GoldButton from '../ui/GoldButton';
import './HeroSection.css';

const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

export default function HeroSection() {
  const { openPanel } = useQuantum();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section className="pp-hero pp-grain" ref={sectionRef} aria-label="Hero">
      {/* Background ambient glow */}
      <div className="pp-hero__glow" aria-hidden="true" />

      {/* Parallax oversized text */}
      <motion.div
        className="pp-hero__bg-word"
        style={{ y: bgY }}
        aria-hidden="true"
      >
        UNDERSTAND
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
          <span className="pp-label-gold">AI Browser Companion</span>
          <span className="pp-hero__label-line" aria-hidden="true" />
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={FADE_UP} className="pp-hero__heading pp-hero-title">
          <span className="pp-gold-text">Read less.</span>
          <br />
          <em className="pp-hero__italic">Understand more.</em>
        </motion.h1>

        {/* Editorial sub */}
        <motion.p variants={FADE_UP} className="pp-hero__description pp-editorial">
          Quantum turns complex webpages into clear answers, natural voice
          conversations, and useful summaries — without breaking your browsing flow.
        </motion.p>

        {/* CTA row */}
        <motion.div variants={FADE_UP} className="pp-hero__ctas">
          <GoldButton variant="primary" size="lg" onClick={openPanel}>
            Try Quantum
          </GoldButton>
          <GoldButton variant="outline" size="lg" onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
            Watch Demo
          </GoldButton>
        </motion.div>

        {/* Tagline */}
        <motion.p variants={FADE_UP} className="pp-hero__tagline">
          <span className="pp-logo-sm">Quantum AI</span>
          <span className="pp-hero__tagline-sep" aria-hidden="true">—</span>
          <span className="pp-ui-text">Understanding, delivered.</span>
        </motion.p>
      </motion.div>

      {/* Floating browser card preview */}
      <motion.div
        className="pp-hero__preview pp-glass"
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.9, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1000 }}
        aria-hidden="true"
      >
        <div className="pp-hero__preview-bar">
          <span className="pp-hero__preview-dot" />
          <span className="pp-hero__preview-dot" />
          <span className="pp-hero__preview-dot" />
          <span className="pp-hero__preview-url pp-ui-text">medium.com/ai-article</span>
        </div>
        <div className="pp-hero__preview-body">
          <div className="pp-hero__preview-article">
            <div className="pp-hero__preview-line pp-shimmer" style={{ width: '85%' }} />
            <div className="pp-hero__preview-line pp-shimmer" style={{ width: '70%' }} />
            <div className="pp-hero__preview-line pp-shimmer" style={{ width: '90%' }} />
            <div className="pp-hero__preview-highlight">
              <span className="pp-ui-text" style={{ color: 'var(--pp-gold)', fontSize: '0.7rem' }}>Selected text · Quantum is analysing…</span>
            </div>
            <div className="pp-hero__preview-line pp-shimmer" style={{ width: '65%' }} />
            <div className="pp-hero__preview-line pp-shimmer" style={{ width: '80%' }} />
          </div>
          <div className="pp-hero__preview-panel">
            <div className="pp-hero__preview-panel-header">
              <span className="pp-logo-sm" style={{ fontSize: '0.9rem' }}>Quantum</span>
              <StatusPip />
            </div>
            <div className="pp-hero__preview-panel-body">
              <div className="pp-hero__preview-line pp-shimmer" style={{ width: '90%', height: '8px' }} />
              <div className="pp-hero__preview-line pp-shimmer" style={{ width: '75%', height: '8px' }} />
              <div className="pp-hero__preview-line pp-shimmer" style={{ width: '85%', height: '8px' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#features"
        className="pp-hero__scroll"
        onClick={(e) => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        aria-label="Scroll to features"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} color="var(--pp-muted)" />
        </motion.div>
      </motion.a>
    </section>
  );
}

function StatusPip() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <motion.div
        style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--pp-gold)' }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      <span style={{ fontSize: '0.65rem', color: 'var(--pp-muted)', fontFamily: 'var(--font-interface)' }}>Ready</span>
    </div>
  );
}
