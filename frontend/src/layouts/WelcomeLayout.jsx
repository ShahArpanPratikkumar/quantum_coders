import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export default function WelcomeLayout() {
  return (
    <div className="pp-welcome-layout">
      {/* We only render the Outlet here as the welcome screen is cinematic and fullscreen */}
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
    </div>
  );
}
