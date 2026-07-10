/**
 * PageContext — Real page content extraction
 * NO hardcoded fallback data. NO React Router mock content.
 * In extension mode: extracts real content from the active tab.
 * In dev mode: shows a clearly labelled DEV PREVIEW state.
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { isExtensionEnvironment, getActiveTabInfo, extractPageContent, getSelectedText } from '../services/chromeService';

const PageContext = createContext(null);

const INITIAL_STATE = {
  // Tab info
  tabId: null,
  tabUrl: null,
  title: '',
  url: '',
  domain: '',
  favicon: '',
  isProtected: false,

  // Extracted content
  content: '',
  excerpt: '',
  author: '',
  wordCount: 0,
  readingTime: 0,
  pageType: '',
  headings: [],
  codeBlocks: [],
  selectedText: '',

  // Status
  extractionStatus: 'idle', // idle | extracting | success | error | protected | no-content
  extractionError: null,
  isDemo: false,
  isDev: !isExtensionEnvironment
};

export function PageProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [aiState, setAiState] = useState('ready');
  const [aiStateMessage, setAiStateMessage] = useState('');
  const currentTabRef = useRef(null);

  const extractContent = useCallback(async (tabId) => {
    if (!tabId) return;
    
    setState(prev => ({ ...prev, extractionStatus: 'extracting' }));

    const content = await extractPageContent(tabId);

    if (!content) {
      setState(prev => ({
        ...prev,
        extractionStatus: 'error',
        extractionError: 'Could not extract page content. The page may be protected or not yet loaded.',
        content: ''
      }));
      return;
    }

    if (!content.content || content.content.trim().length < 20) {
      setState(prev => ({
        ...prev,
        extractionStatus: 'no-content',
        extractionError: 'This page has no readable text content.',
        content: ''
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      content: content.content || '',
      excerpt: content.excerpt || '',
      author: content.author || '',
      wordCount: content.wordCount || 0,
      readingTime: content.readingTime || 0,
      pageType: content.pageType || 'Page',
      headings: content.headings || [],
      codeBlocks: content.codeBlocks || [],
      extractionStatus: 'success',
      extractionError: null
    }));
  }, []);

  const loadTab = useCallback(async () => {
    const tabInfo = await getActiveTabInfo();

    // Dev mode — no real tab available
    if (!tabInfo) {
      setState(prev => ({
        ...INITIAL_STATE,
        isDev: true,
        isDemo: true,
        extractionStatus: 'idle',
        aiStateMessage: '⚠️ Development Preview — not live page data'
      }));
      return;
    }

    // Tab changed — reset content
    const isNewTab = currentTabRef.current?.id !== tabInfo.id || currentTabRef.current?.url !== tabInfo.url;
    if (isNewTab) {
      currentTabRef.current = { id: tabInfo.id, url: tabInfo.url };
      
      setState(prev => ({
        ...INITIAL_STATE,
        tabId: tabInfo.id,
        tabUrl: tabInfo.url,
        title: tabInfo.title,
        url: tabInfo.url,
        domain: tabInfo.domain,
        favicon: tabInfo.favicon,
        isProtected: tabInfo.isProtected,
        isDev: false,
        isDemo: false,
        extractionStatus: tabInfo.isProtected ? 'protected' : 'extracting'
      }));

      if (!tabInfo.isProtected) {
        await extractContent(tabInfo.id);
      }
    }
  }, [extractContent]);

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
    if (!state.tabId) return;
    const text = await getSelectedText(state.tabId);
    if (text) {
      setState(prev => ({ ...prev, selectedText: text }));
    }
  }, [state.tabId]);

  const value = {
    ...state,
    aiState,
    setAiState,
    aiStateMessage,
    setAiStateMessage,
    refreshPageContext,
    updateSelectedText,
    // Convenience: the full context object to send to backend
    pageContext: {
      title: state.title,
      url: state.url,
      domain: state.domain,
      content: state.content,
      excerpt: state.excerpt,
      wordCount: state.wordCount,
      readingTime: state.readingTime,
      pageType: state.pageType,
      headings: state.headings
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
