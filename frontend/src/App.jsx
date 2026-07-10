import { RouterProvider } from 'react-router-dom';
import { QuantumProvider } from './context/QuantumContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { PageProvider } from './context/PageContext';
import { router } from './app/router';
import FloatingButton from './components/extension/FloatingButton';
import AssistantPanel from './components/extension/AssistantPanel';
import './App.css';

export default function App() {
  return (
    <SettingsProvider>
      <PageProvider>
        <QuantumProvider>
          <ToastProvider>
            <RouterProvider router={router} />
            
            {/* The extension overlay stays mounted outside the main router */}
            <FloatingButton />
            <AssistantPanel />
          </ToastProvider>
        </QuantumProvider>
      </PageProvider>
    </SettingsProvider>
  );
}
