import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './ProblemSection.css';

const PROBLEMS = [
  { num: '01', title: 'Long articles take time.', desc: 'You want the key insights, not to spend 20 minutes reading filler.' },
  { num: '02', title: 'Difficult language creates confusion.', desc: 'Academic papers and technical docs often assume prior knowledge.' },
  { num: '03', title: 'Copy-pasting breaks flow.', desc: 'Switching tabs to paste text into a chatbot takes you out of the zone.' },
  { num: '04', title: 'Hidden information.', desc: 'Important facts are often buried deep within cluttered layouts.' },
];

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="pp-section pp-problem" id="problems" aria-label="The Problem">
      <div className="pp-container" ref={ref}>
        <motion.div
          className="pp-problem__header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="pp-label-gold">The Challenge</span>
          <h2 className="pp-section-title">
            The web gives us information.<br />
            <em className="pp-ivory-italic">Quantum gives us understanding.</em>
          </h2>
        </motion.div>

        <div className="pp-problem__grid" role="list">
          {PROBLEMS.map((prob, i) => (
            <motion.div
              key={prob.num}
              className="pp-problem__item"
              role="listitem"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="pp-problem__num pp-big-number">{prob.num}</div>
              <div className="pp-problem__content">
                <h3 className="pp-card-title" style={{ fontSize: '1.2rem', marginBottom: 8 }}>{prob.title}</h3>
                <p className="pp-editorial-sm">{prob.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
