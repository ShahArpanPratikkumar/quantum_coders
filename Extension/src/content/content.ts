import { Readability } from '@mozilla/readability';
import { ExtensionRequest, ExtensionResponse, ExtractedPageData } from '../types';

// Listen for messages from the popup or background scripts
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
chrome.runtime.onMessage.addListener((
  request: ExtensionRequest,
  sender,
  sendResponse: (response: ExtensionResponse<ExtractedPageData>) => void
) => {
  if (request.type === 'GET_CONTENT') {
    try {
      // 1. Capture user text selection if any (Highly requested UX feature!)
      const selectedText = window.getSelection() ? window.getSelection()!.toString().trim() : '';

      // 2. Clone the document to prevent Readability or cleanups from altering the active DOM
      const documentClone = document.cloneNode(true) as Document;

      // 3. Pre-clean the DOM to strip out absolute noise (cookie banners, sidebars, nav headers, footers, social share widgets)
      // This increases Readability parsing quality and reduces context-token waste immensely!
      const noiseSelectors = [
        'script', 'style', 'noscript', 'svg', 'iframe', 'canvas', 'video', 'audio',
        'header', 'footer', 'nav', 'aside',
        '.nav', '.navbar', '.menu', '.sidebar', '.footer', '.header', '.comments', '.comment',
        '.ad', '.ads', '.share', '.social', '.cookie', '.banner', '#cookie', '#banner',
        '[role="banner"]', '[role="navigation"]', '[role="contentinfo"]'
      ];

      noiseSelectors.forEach(selector => {
        try {
          const elements = documentClone.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        } catch (e) {
          // Ignore invalid selector errors
        }
      });

      // 4. Run Readability on the pre-cleaned document
      let parsedArticle: any = null;
      try {
        const reader = new Readability(documentClone);
        parsedArticle = reader.parse();
      } catch (err) {
        console.warn('[Quantum AI] Readability parsing failed, falling back to custom DOM extraction:', err);
      }

      // 5. Build intelligent DOM extraction fallback in case Readability fails, is blocked, or returns tiny text
      let fallbackContent = '';
      
      // Look for common main article or content containers
      const contentContainers = [
        'article', '[role="main"]', 'main', '#main-content', '#content', 
        '.post', '.article-content', '.entry-content', '.markdown-body', '.page-content'
      ];
      
      let mainContainer: Element | null = null;
      for (const containerSelector of contentContainers) {
        try {
          const found = documentClone.querySelector(containerSelector);
          if (found) {
            mainContainer = found;
            break;
          }
        } catch (e) {}
      }

      const targetRoot = mainContainer || documentClone.body || documentClone;

      if (targetRoot) {
        // Collect text from headings, paragraphs, lists, pre/code blocks, table cells
        const textElements = targetRoot.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, pre, code, td, th');
        const paragraphsList: string[] = [];
        
        textElements.forEach(el => {
          const text = (el as HTMLElement).innerText || el.textContent || '';
          const trimmed = text.trim();
          if (trimmed.length > 5) {
            // Avoid adding header navigation links or tiny fragments
            paragraphsList.push(trimmed);
          }
        });
        
        fallbackContent = paragraphsList.join('\n\n');
      }

      // 6. Assemble best extracted content
      let finalContent = '';
      let excerpt = '';
      let byline = '';
      let title = documentClone.title || document.title || 'Untitled Page';

      if (parsedArticle && parsedArticle.textContent && parsedArticle.textContent.trim().length > 150) {
        finalContent = parsedArticle.textContent.trim();
        excerpt = parsedArticle.excerpt || '';
        byline = parsedArticle.byline || '';
        if (parsedArticle.title) {
          title = parsedArticle.title;
        }
      } else {
        finalContent = fallbackContent || (document.body ? document.body.innerText.trim() : '');
      }

      // Clean consecutive whitespaces and double newlines for immaculate typography & layout
      finalContent = finalContent
        .replace(/[ \t]+/g, ' ')             // collapse spaces/tabs
        .replace(/\n\s*\n\s*\n+/g, '\n\n')    // limit triple newlines to double newlines
        .trim();

      // 7. Inject text selection indicator if user had highlighted text on screen
      let finalComposedText = finalContent;
      if (selectedText.length > 0) {
        finalComposedText = `=== HIGHLIGHTED SELECTED TEXT ===\n` +
          `The user explicitly highlighted/selected this section of the page:\n` +
          `"${selectedText}"\n` +
          `================================\n\n` +
          `=== FULL PAGE CONTEXT ===\n` +
          `${finalContent}`;
      }

      sendResponse({
        success: true,
        data: {
          title: title,
          url: window.location.href,
          excerpt: excerpt || (selectedText ? `[Selection] ${selectedText.substring(0, 120)}...` : ''),
          content: finalComposedText,
          byline: byline || '',
          length: finalComposedText.length
        }
      });

    } catch (error: any) {
      console.error('[Quantum AI] Content extraction error:', error);
      // Absolute fallback to raw innerText of active page body
      try {
        const rawText = document.body ? document.body.innerText.trim() : '';
        sendResponse({
          success: true,
          data: {
            title: document.title || 'Untitled Page',
            url: window.location.href,
            excerpt: '',
            content: rawText,
            byline: '',
            length: rawText.length
          }
        });
      } catch (innerError: any) {
        sendResponse({
          success: false,
          error: error.message || 'Failed to extract content'
        });
      }
    }
  }
  return true; // Keep the message channel open for asynchronous responses
});
}

// Programmatically Inject a Sleek Glassy Floating Button on Bottom Right of Every Website
function injectQuantumTriggerButton() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  // Prevent duplicate insertion
  if (document.getElementById('quantum-ai-sidebar-trigger')) return;

  function createButton() {
    if (document.getElementById('quantum-ai-sidebar-trigger')) return;

    const button = document.createElement('div');
    button.id = 'quantum-ai-sidebar-trigger';
    
    // Style with beautiful premium Obsidian black & Gold glassy effect matching the extension theme
    button.style.cssText = `
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 54px !important;
      height: 54px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(35, 28, 12, 0.95) 100%) !important;
      backdrop-filter: blur(12px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
      border: 1.5px solid rgba(245, 158, 11, 0.6) !important;
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
      cursor: grab !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease !important;
      user-select: none !important;
      touch-action: none !important;
    `;

    // Elegant Gold/Amber Quantum AI icon (overlapping glowing orbits)
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); transition: transform 0.3s ease;">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#F59E0B" opacity="0.3"/>
        <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#F59E0B" opacity="0.6"/>
        <circle cx="12" cy="12" r="2.5" fill="#F59E0B" />
        <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
      </svg>
      <div id="quantum-tooltip" style="
        position: absolute !important;
        right: 64px !important;
        background: rgba(15, 23, 42, 0.95) !important;
        color: #F59E0B !important;
        padding: 6px 12px !important;
        border-radius: 8px !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        letter-spacing: 0.025em !important;
        white-space: nowrap !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.25) !important;
        border: 1px solid rgba(245,158,11,0.3) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transform: translateX(10px) !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        pointer-events: none !important;
      ">Open Quantum AI Sidebar</div>
    `;

    // Mini "×" close button to dismiss trigger for the current tab session
    const closeBtn = document.createElement('div');
    closeBtn.id = 'quantum-close-trigger';
    closeBtn.style.cssText = `
      position: absolute !important;
      top: -3px !important;
      right: -3px !important;
      width: 16px !important;
      height: 16px !important;
      border-radius: 50% !important;
      background: rgba(30, 41, 59, 0.95) !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
      color: #F59E0B !important;
      font-family: system-ui, sans-serif !important;
      font-size: 10px !important;
      font-weight: bold !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    `;
    closeBtn.innerText = '×';
    button.appendChild(closeBtn);

    // Smooth hover transitions
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.08) translateY(-2px)';
      button.style.boxShadow = '0 15px 30px -5px rgba(245, 158, 11, 0.45), 0 10px 15px -6px rgba(245, 158, 11, 0.2)';
      closeBtn.style.opacity = '1';
      closeBtn.style.visibility = 'visible';
      const tooltip = button.querySelector('#quantum-tooltip') as HTMLElement;
      if (tooltip) {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.transform = 'translateX(0)';
      }
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1) translateY(0)';
      button.style.boxShadow = '0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.5)';
      closeBtn.style.opacity = '0';
      closeBtn.style.visibility = 'hidden';
      const tooltip = button.querySelector('#quantum-tooltip') as HTMLElement;
      if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        tooltip.style.transform = 'translateX(10px)';
      }
    });

    // IMPLEMENT DRAGGABLE BUTTON LOGIC
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let buttonStartX = 0;
    let buttonStartY = 0;
    let dragThresholdMoved = false;

    const rectWidth = 54;
    const rectHeight = 54;

    const getCoords = (event: MouseEvent | TouchEvent) => {
      if ('touches' in event && event.touches.length > 0) {
        return {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      }
      return {
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY
      };
    };

    const onDragStart = (e: MouseEvent | TouchEvent) => {
      if (e.target === closeBtn) return; // Don't drag when trying to close
      
      const coords = getCoords(e);
      startX = coords.x;
      startY = coords.y;

      const rect = button.getBoundingClientRect();
      buttonStartX = rect.left;
      buttonStartY = rect.top;

      isDragging = true;
      dragThresholdMoved = false;
      button.style.cursor = 'grabbing';
      button.style.transition = 'none';

      document.addEventListener('mousemove', onDragMove, { passive: false });
      document.addEventListener('mouseup', onDragEnd);
      document.addEventListener('touchmove', onDragMove, { passive: false });
      document.addEventListener('touchend', onDragEnd);
    };

    const onDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const coords = getCoords(e);
      const deltaX = coords.x - startX;
      const deltaY = coords.y - startY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragThresholdMoved = true;
      }

      let newLeft = buttonStartX + deltaX;
      let newTop = buttonStartY + deltaY;

      const padding = 5;
      const maxLeft = window.innerWidth - rectWidth;
      const maxTop = window.innerHeight - rectHeight;

      newLeft = Math.max(padding, Math.min(newLeft, maxLeft));
      newTop = Math.max(padding, Math.min(newTop, maxTop));

      button.style.bottom = 'auto';
      button.style.right = 'auto';
      button.style.left = `${newLeft}px`;
      button.style.top = `${newTop}px`;

      e.preventDefault(); // Prevent page scroll on touch-move
    };

    const onDragEnd = () => {
      isDragging = false;
      button.style.cursor = 'grab';
      button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease';

      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
    };

    button.addEventListener('mousedown', onDragStart);
    button.addEventListener('touchstart', onDragStart, { passive: true });

    // Tap/Click handler
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (dragThresholdMoved) {
        return;
      }

      if (e.target === closeBtn) {
        button.style.opacity = '0';
        button.style.transform = 'scale(0.8) translateY(10px)';
        setTimeout(() => button.remove(), 300);
        return;
      }

      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }, (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn('[Quantum AI] open_side_panel failed:', chrome.runtime.lastError.message);
          }
        });
      } else {
        console.log('[Quantum AI] chrome.runtime.sendMessage is not available. (Web Sandbox Mode)');
      }
    });

    document.body.appendChild(button);
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get('showFloatingButton', (res) => {
      if (res.showFloatingButton === false) {
        return;
      }
      createButton();
    });
  } else {
    createButton();
  }
}

// Listen for live setting changes to add/remove button reactively
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.showFloatingButton) {
      const show = changes.showFloatingButton.newValue;
      const existing = document.getElementById('quantum-ai-sidebar-trigger');
      if (show === false && existing) {
        existing.remove();
      } else if (show !== false && !existing) {
        injectQuantumTriggerButton();
      }
    }
  });
}

// Fire injection
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  injectQuantumTriggerButton();
} else {
  window.addEventListener('DOMContentLoaded', injectQuantumTriggerButton);
}

// ==========================================
// FEATURE 1: ADVANCED LIVE PAGE CONTEXT TRACKING
// ==========================================
(function() {
  let lastUrl = window.location.href;
  let lastScrollPercent = 0;

  function safeSendMessage(message: any) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage(message, () => {
          // Ignore runtime.lastError to prevent console errors if popup is closed
          const err = chrome.runtime.lastError;
        });
      }
    } catch (e) {
      // Catch extension context invalidated errors gracefully
    }
  }

  // Detect SPA URL changes by wrapping pushState/replaceState
  const wrapHistory = (type: 'pushState' | 'replaceState') => {
    const original = (window.history as any)[type];
    if (typeof original === 'function') {
      (window.history as any)[type] = function(...args: any[]) {
        const result = original.apply(this, args);
        setTimeout(checkUrlChange, 100);
        return result;
      };
    }
  };

  wrapHistory('pushState');
  wrapHistory('replaceState');

  function checkUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      safeSendMessage({
        type: 'PAGE_CONTEXT_UPDATED',
        payload: {
          url: currentUrl,
          reason: 'url_change',
          title: document.title
        }
      });
    }
  }

  // Listen to popstate and hashchange events
  window.addEventListener('popstate', checkUrlChange);
  window.addEventListener('hashchange', checkUrlChange);

  // Monitor SPA URL changes periodically as an ultimate fallback
  setInterval(checkUrlChange, 2000);

  // Debounced scroll listener to trigger automatic context refreshes
  let scrollTimeout: any = null;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const h = document.documentElement;
      const b = document.body;
      const st = 'scrollTop';
      const sh = 'scrollHeight';
      const percent = Math.round((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100);
      
      // Notify only on significant 15% scroll jumps
      if (Math.abs(percent - lastScrollPercent) >= 15) {
        lastScrollPercent = percent;
        safeSendMessage({
          type: 'PAGE_CONTEXT_UPDATED',
          payload: {
            url: window.location.href,
            reason: 'scroll',
            scrollPercent: percent,
            title: document.title
          }
        });
      }
    }, 1500);
  }, { passive: true });
})();

