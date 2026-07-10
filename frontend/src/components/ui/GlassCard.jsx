import { motion } from 'framer-motion';
import './GlassCard.css';

export default function GlassCard({ children, className = '', hover = true, onClick, style }) {
  return (
    <motion.div
      className={`pp-glass-card ${className}`}
      style={style}
      onClick={onClick}
      whileHover={hover ? { y: -3, borderColor: 'rgba(203,162,58,0.45)' } : {}}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
