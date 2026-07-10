import { createBrowserRouter } from 'react-router-dom';
import WelcomeLayout from '../layouts/WelcomeLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import WelcomePage from '../pages/WelcomePage';
import DashboardPage from '../pages/DashboardPage';
import AskPage from '../pages/AskPage';
import SummaryPage from '../pages/SummaryPage';
import ReaderPage from '../pages/ReaderPage';
import VoicePage from '../pages/VoicePage';
import SelectionPage from '../pages/SelectionPage';
import CodeLensPage from '../pages/CodeLensPage';
import TranslatePage from '../pages/TranslatePage';
import ResearchPage from '../pages/ResearchPage';
import FocusPage from '../pages/FocusPage';
import SavedPage from '../pages/SavedPage';
import HistoryPage from '../pages/HistoryPage';
import SettingsPage from '../pages/SettingsPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import RouteErrorPage from '../pages/RouteErrorPage';
import NotFoundPage from '../pages/NotFoundPage';

// Icons for placeholders
import { 
  MessageSquare, FileText, BookOpen, Volume2, 
  Highlighter, Code2, Languages, List, Focus, 
  Bookmark, History, Settings 
} from 'lucide-react';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomeLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <WelcomePage /> }
    ]
  },
  {
    element: <DashboardLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/ask', element: <AskPage /> },
      { path: '/summary', element: <SummaryPage /> },
      { path: '/reader', element: <ReaderPage /> },
      { path: '/voice', element: <VoicePage /> },
      { path: '/selection', element: <SelectionPage /> },
      { path: '/code-lens', element: <CodeLensPage /> },
      { path: '/translate', element: <TranslatePage /> },
      { path: '/research', element: <ResearchPage /> },
      { path: '/focus', element: <FocusPage /> },
      { path: '/saved', element: <SavedPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
