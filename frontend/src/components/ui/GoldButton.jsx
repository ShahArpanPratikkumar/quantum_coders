import { motion } from 'framer-motion';
import './GoldButton.css';

/**
 * GoldButton — primary luxury button component.
 * variant: 'primary' | 'outline' | 'ghost'
 */
export default function GoldButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  icon = null,
  className = '',
  ...rest
}) {
  return (
    <motion.button
      type={type}
      className={`pp-btn pp-btn--${variant} pp-btn--${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {icon && <span className="pp-btn__icon" aria-hidden="true">{icon}</span>}
      <span className="pp-btn__label">{children}</span>
    </motion.button>
  );
}
