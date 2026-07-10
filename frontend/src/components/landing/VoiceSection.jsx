import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Square, Play, Pause } from 'lucide-react';
import './VoiceSection.css';

export default function VoiceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [playing, setPlaying] = useState(false);

  return (
    <section className="pp-section pp-voice pp-grain" id="voice" aria-label="Voice interactions">
      <div className="pp-container pp-voice__inner" ref={ref}>
        {/* Content */}
        <motion.div
          className="pp-voice__content"
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="pp-label-gold">Audio Intelligence</span>
          <h2 className="pp-section-title">
            Speak naturally.<br />
            <em className="pp-ivory-italic">Quantum listens.</em>
          </h2>
          <div className="pp-divider" style={{ margin: '24px 0' }} />
          <p className="pp-editorial" style={{ fontStyle: 'normal' }}>
            Don't type if you don't want to. Ask complex questions about long documents just by speaking. When you're tired of reading, have Quantum read the page aloud to you with natural, human-like narration.
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div
          className="pp-voice__demo pp-glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pp-voice__demo-top">
            <span className="pp-label-gold">Live narration</span>
            <div className="pp-voice__waves">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className={`pp-voice__wave ${playing ? 'pp-voice__wave--active' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
          </div>
          
          <div className="pp-voice__controls">
            <button
              className="pp-voice__btn pp-voice__btn--primary"
              onClick={() => setPlaying(p => !p)}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button className="pp-voice__btn" aria-label="Stop">
              <Square size={20} fill="currentColor" />
            </button>
            <button className="pp-voice__btn" style={{ marginLeft: 'auto' }} aria-label="Microphone">
              <Mic size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
