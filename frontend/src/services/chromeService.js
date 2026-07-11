/**
 * Chrome Service — Real tab info only
 * Dev fallback is clearly labelled as DEV PREVIEW, never shows as real data
 */

export const isExtensionEnvironment =
  typeof chrome !== 'undefined' && Boolean(chrome?.runtime?.id);

/**
 * Get real active tab info (extension only).
 * Returns null in dev mode — callers must handle null gracefully.
 */
export const getActiveTabInfo = async () => {
  if (isExtensionEnvironment) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        const tab = tabs[0];
        const url = tab.url || '';
        // Don't try to extract content from Chrome internal pages
        const isProtected = url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:');
        return {
          id: tab.id,
          title: tab.title || 'Unknown Page',
          url,
          favicon: tab.favIconUrl || '',
          domain: url && !isProtected ? (() => { try { return new URL(url).hostname; } catch { return ''; } })() : '',
          isProtected
        };
      }
    } catch (e) {
      console.error('[ChromeService] Failed to get active tab:', e);
    }
    return null;
  }

  // Dev mode — return null, NOT fake data
  return null;
};

/**
 * Extract page content via content script message.
 * Returns null if extension is not available or page is protected.
 */
export const extractPageContent = async (tabId) => {
  if (!isExtensionEnvironment || !tabId) return null;

  return new Promise((resolve) => {
    try {
      // First, attempt to ping the content script to see if it's there
      chrome.tabs.sendMessage(tabId, { type: 'PING' }, (pingResponse) => {
        const lastError = chrome.runtime.lastError;
        
        // If content script is NOT active, inject it dynamically
        if (lastError || !pingResponse?.success) {
          console.log('[ChromeService] Content script not found. Injecting dynamically...');
          
          chrome.scripting.executeScript({
            target: { tabId },
            files: ['readability.js', 'extraction.js', 'contentScript.js']
          }, () => {
            if (chrome.runtime.lastError) {
              console.warn('[ChromeService] Failed to inject scripts:', chrome.runtime.lastError.message);
              resolve(null);
              return;
            }
            // Give it a tiny bit of time to initialize, then send extract
            setTimeout(() => {
              sendExtractRequest(tabId, resolve);
            }, 100);
          });
        } else {
          // It's already there, just send the extract request
          sendExtractRequest(tabId, resolve);
        }
      });
    } catch (e) {
      console.error('[ChromeService] extractPageContent error:', e);
      resolve(null);
    }
  });
};

function sendExtractRequest(tabId, resolve) {
  chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_PAGE' }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('[ChromeService] Extract error:', chrome.runtime.lastError.message);
      resolve(null);
      return;
    }
    resolve(response && response.success ? response : null);
  });
}

/**
 * Get selected text from the active tab.
 */
export const getSelectedText = async (tabId) => {
  if (!isExtensionEnvironment || !tabId) return '';

  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, { type: 'GET_SELECTION' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve('');
          return;
        }
        resolve(response?.selectedText || '');
      });
    } catch (e) {
      resolve('');
    }
  });
};
