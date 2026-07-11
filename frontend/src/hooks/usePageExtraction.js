import { useState, useCallback, useRef } from 'react';
import { getActiveTabInfo, extractPageContent } from '../services/chromeService';

const INITIAL_EXTRACTION_STATE = {
  tabId: null,
  tabUrl: null,
  title: '',
  url: '',
  domain: '',
  favicon: '',
  isProtected: false,

  content: '',
  excerpt: '',
  author: '',
  wordCount: 0,
  readingTime: 0,
  pageType: '',
  headings: [],
  codeBlocks: [],

  extractionStatus: 'idle', // idle | extracting | success | error | protected | no-content
  extractionError: null,
};

export function usePageExtraction() {
  const [state, setState] = useState(INITIAL_EXTRACTION_STATE);
  const currentTabRef = useRef(null);

  const extractTabContent = useCallback(async (tabInfo) => {
    if (!tabInfo || tabInfo.isProtected) return;

    setState(prev => ({ ...prev, extractionStatus: 'extracting', extractionError: null }));

    const data = await extractPageContent(tabInfo.id);

    if (!data) {
      setState(prev => ({
        ...prev,
        extractionStatus: 'error',
        extractionError: 'Could not extract page content. The page may be protected or not yet loaded.',
        content: ''
      }));
      return;
    }

    if (!data.content || data.content.trim().length < 20) {
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
      content: data.content || '',
      excerpt: data.excerpt || '',
      author: data.author || '',
      wordCount: data.wordCount || 0,
      readingTime: data.readingTime || 0,
      pageType: data.pageType || 'Page',
      headings: data.headings || [],
      codeBlocks: data.codeBlocks || [],
      extractionStatus: 'success',
      extractionError: null
    }));
  }, []);

  const loadTab = useCallback(async () => {
    const tabInfo = await getActiveTabInfo();

    if (!tabInfo) {
      setState(prev => ({
        ...INITIAL_EXTRACTION_STATE,
        extractionStatus: 'idle',
      }));
      return null;
    }

    // Check if it's a new tab to clear stale context
    const isNewTab = currentTabRef.current?.id !== tabInfo.id || currentTabRef.current?.url !== tabInfo.url;
    
    if (isNewTab) {
      currentTabRef.current = { id: tabInfo.id, url: tabInfo.url };
      
      setState(prev => ({
        ...INITIAL_EXTRACTION_STATE,
        tabId: tabInfo.id,
        tabUrl: tabInfo.url,
        title: tabInfo.title,
        url: tabInfo.url,
        domain: tabInfo.domain,
        favicon: tabInfo.favicon,
        isProtected: tabInfo.isProtected,
        extractionStatus: tabInfo.isProtected ? 'protected' : 'idle'
      }));

      if (!tabInfo.isProtected) {
        await extractTabContent(tabInfo);
      }
    }
    
    return tabInfo;
  }, [extractTabContent]);

  const retryExtraction = useCallback(async () => {
    if (state.tabId && !state.isProtected) {
      await extractTabContent({ id: state.tabId });
    } else {
      await loadTab();
    }
  }, [state.tabId, state.isProtected, extractTabContent, loadTab]);

  return {
    extractionState: state,
    setExtractionState: setState,
    loadTab,
    retryExtraction
  };
}
