/**
 * PageContext — Real page content extraction
 * NO hardcoded fallback data. NO React Router mock content.
 * In extension mode: extracts real content from the active tab.
 * In dev mode: shows a clearly labelled DEV PREVIEW state.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isExtensionEnvironment, getSelectedText } from '../services/chromeService';
import { usePageExtraction } from '../hooks/usePageExtraction';

const PageContext = createContext(null);

export function PageProvider({ children }) {
  const [aiState, setAiState] = useState('ready');
  const [aiStateMessage, setAiStateMessage] = useState('');
  
  const { extractionState, setExtractionState, loadTab, retryExtraction } = usePageExtraction();

  // Initial load
  useEffect(() => {
    loadTab();
  }, [loadTab]);

  // Listen for tab changes (extension only)
  useEffect(() => {
    if (!isExtensionEnvironment) return;
    
    const handleTabUpdate = (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        loadTab();
      }
    };

    const handleTabActivated = () => {
      loadTab();
    };

    try {
      chrome.tabs.onUpdated.addListener(handleTabUpdate);
      chrome.tabs.onActivated.addListener(handleTabActivated);
      return () => {
        chrome.tabs.onUpdated.removeListener(handleTabUpdate);
        chrome.tabs.onActivated.removeListener(handleTabActivated);
      };
    } catch (e) {
      // Ignore
    }
  }, [loadTab]);

  const refreshPageContext = useCallback(async () => {
    setAiState('extracting');
    await loadTab();
    setAiState('ready');
  }, [loadTab]);

  const updateSelectedText = useCallback(async () => {
    if (!extractionState.tabId) return;
    const text = await getSelectedText(extractionState.tabId);
    if (text) {
      setExtractionState(prev => ({ ...prev, selectedText: text }));
    }
  }, [extractionState.tabId, setExtractionState]);

  const value = {
    ...extractionState,
    isDev: !isExtensionEnvironment,
    aiState,
    setAiState,
    aiStateMessage,
    setAiStateMessage,
    refreshPageContext,
    updateSelectedText,
    retryExtraction,
    // Convenience: the full context object to send to backend
    pageContext: {
      title: extractionState.title,
      url: extractionState.url,
      domain: extractionState.domain,
      content: extractionState.content,
      excerpt: extractionState.excerpt,
      wordCount: extractionState.wordCount,
      readingTime: extractionState.readingTime,
      pageType: extractionState.pageType,
      headings: extractionState.headings
    }
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error('usePageContext must be used within PageProvider');
  return ctx;
}
