// contentScript.js
// Message listener for the extension

console.log('Quantum AI Content Script loaded.');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ success: true, url: window.location.href, title: document.title });
  } else if (request.type === 'EXTRACT_PAGE' || request.type === 'EXTRACT_CONTENT') {
    if (window.quantumExtraction) {
      const data = window.quantumExtraction.runExtraction();
      sendResponse(data);
    } else {
      console.error('Quantum extraction logic not loaded.');
      sendResponse({ success: false, error: 'Extraction logic missing.' });
    }
  } else if (request.type === 'GET_SELECTION') {
    const selectedText = window.getSelection().toString();
    sendResponse({ success: true, selectedText });
  }
  return true; // Keep message channel open for async response
});
