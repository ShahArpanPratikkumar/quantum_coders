// extraction.js
// Handles cleaning and extracting webpage content

function cleanDocument(doc) {
  // Remove unwanted tags completely
  const tagsToRemove = [
    'script', 'style', 'noscript', 'iframe', 'nav', 'footer', 'header', 'aside', 
    'form', 'button', 'input', 'select', 'textarea', 'canvas', 'svg', 'video', 'audio', 'picture', 'dialog'
  ];
  
  tagsToRemove.forEach(tag => {
    const elements = doc.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });

  // Keywords that usually indicate non-content or distracting areas
  const keywords = ['ad', 'ads', 'advertisement', 'banner', 'cookie', 'popup', 'modal', 'newsletter', 'sidebar', 'social', 'share', 'sponsor', 'promotion', 'related', 'recommended', 'comments'];
  
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    const className = (el.className || '').toString().toLowerCase();
    const idName = (el.id || '').toString().toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();
    
    if (keywords.some(k => className.includes(k) || idName.includes(k) || role.includes(k))) {
      // Protect core structural elements from being removed just because of a matching class
      if (!['article', 'main', 'p', 'h1', 'h2', 'h3', 'code', 'pre'].includes(el.tagName.toLowerCase())) {
        el.remove();
      }
    }
  });

  return doc;
}

function runExtraction() {
  try {
    const documentClone = document.cloneNode(true);
    
    let article = null;
    
    // Use Mozilla Readability if injected (Pass the raw clone, Readability is smart enough to clean ads)
    if (typeof Readability !== 'undefined') {
      try {
        const reader = new Readability(documentClone);
        article = reader.parse();
      } catch (e) {
        console.warn('Readability failed to parse, falling back...', e);
      }
    }
    
    // Fallback extraction
    if (!article) {
      // Aggressive manual cleaning only for fallback
      const cleanedDoc = cleanDocument(document.cloneNode(true));
      const mainContent = cleanedDoc.querySelector('article') || 
                          cleanedDoc.querySelector('main') || 
                          cleanedDoc.querySelector('[role="main"]') || 
                          cleanedDoc.querySelector('#mw-content-text') || // Wikipedia specific
                          cleanedDoc.body;
                          
      const textContent = mainContent ? mainContent.textContent : document.body.textContent;
      
      article = {
        title: document.title,
        textContent: textContent,
        content: mainContent ? mainContent.innerHTML : document.body.innerHTML,
        excerpt: textContent.substring(0, 300) + '...',
        byline: ''
      };
    }

    // Clean up empty lines and normalize whitespace
    const cleanText = article.textContent.replace(/\n\s*\n/g, '\n').trim();
    const wordCount = cleanText.split(/\s+/).filter(w => w.length > 0).length;
    
    return {
      success: true,
      title: article.title || document.title,
      url: window.location.href,
      domain: window.location.hostname,
      favicon: document.querySelector("link[rel~='icon']")?.href || '/favicon.ico',
      author: article.byline || '',
      excerpt: article.excerpt || '',
      content: cleanText,
      html: article.content,
      wordCount: wordCount,
      readingTime: Math.ceil(wordCount / 200), // 200 WPM
      pageType: 'Webpage'
    };
  } catch (error) {
    console.error('Quantum AI Extraction Error:', error);
    // Ultimate final fallback (textContent instead of innerText for detached node)
    return {
      success: true,
      title: document.title,
      url: window.location.href,
      domain: window.location.hostname,
      content: document.body.textContent,
      wordCount: (document.body.textContent || '').split(/\s+/).length,
      readingTime: Math.ceil((document.body.textContent || '').split(/\s+/).length / 200)
    };
  }
}

// Make it available globally so contentScript.js can use it
window.quantumExtraction = { runExtraction };
