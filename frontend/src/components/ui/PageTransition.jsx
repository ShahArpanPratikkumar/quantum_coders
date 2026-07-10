import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

export default function PageTransition({ children, className = '', ...props }) {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        padding: '40px 48px',
        boxSizing: 'border-box',
        ...(props.style || {})
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
