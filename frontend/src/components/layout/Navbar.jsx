import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useQuantum } from '../../context/QuantumContext';
import GoldButton from '../ui/GoldButton';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Voice', href: '#voice' },
  { label: 'Privacy', href: '#privacy' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openPanel } = useQuantum();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        className={`pp-nav ${scrolled ? 'pp-nav--scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="pp-nav__inner pp-container">
          {/* Logo */}
          <a className="pp-nav__logo pp-logo" href="/" aria-label="Quantum AI home">
            Quantum
          </a>

          {/* Desktop links */}
          <ul className="pp-nav__links" role="list">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <button
                  className="pp-nav__link pp-label"
                  onClick={() => handleNav(link.href)}
                  aria-label={`Navigate to ${link.label}`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="pp-nav__cta">
            <GoldButton variant="outline" size="sm" onClick={openPanel}>
              Open Companion
            </GoldButton>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="pp-nav__mobile-toggle"
            onClick={() => setMobileOpen(m => !m)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="pp-mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="pp-mobile-menu__inner">
              <span className="pp-logo pp-mobile-menu__logo">Quantum</span>
              <ul role="list">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button
                      className="pp-mobile-menu__link"
                      onClick={() => handleNav(link.href)}
                    >
                      {link.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
              <GoldButton variant="primary" size="md" onClick={() => { openPanel(); setMobileOpen(false); }}>
                Open Companion
              </GoldButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
