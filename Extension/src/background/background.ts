import { ExtensionRequest, ExtensionResponse } from '../types';

// Listen for messages from popup or page contexts
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
chrome.runtime.onMessage.addListener((
  request: ExtensionRequest,
  sender,
  sendResponse: (response: ExtensionResponse) => void
) => {
  const ollamaUrl = request.payload?.url?.replace(/\/$/, '') || 'http://localhost:11434';

  if (request.type === 'CHECK_OLLAMA_STATUS') {
    fetch(ollamaUrl)
      .then((res) => {
        // Ollama usually returns "Ollama is running" text on root URL with 200 OK
        if (res.ok || res.status === 200) {
          sendResponse({ success: true, data: { status: 'running' } });
        } else {
          sendResponse({ success: false, error: `Ollama returned status ${res.status}` });
        }
      })
      .catch((error: any) => {
        sendResponse({
          success: false,
          error: `Unable to connect to Ollama. Make sure it is running locally on port 11434. (${error.message})`
        });
      });
    return true; // Keep message channel open for asynchronous sendResponse
  }

  if (request.type === 'GET_MODELS') {
    fetch(`${ollamaUrl}/api/tags`)
      .then(async (res) => {
        if (res.ok) {
          const body = await res.json();
          sendResponse({ success: true, data: body.models || [] });
        } else {
          sendResponse({ success: false, error: `Ollama returned status ${res.status}` });
        }
      })
      .catch((error: any) => {
        sendResponse({
          success: false,
          error: `Failed to retrieve Ollama models. (${error.message})`
        });
      });
    return true; // Keep message channel open for asynchronous sendResponse
  }

  if (request.type === 'OLLAMA_CHAT') {
    const { model, messages, systemPrompt } = request.payload;

    // Prepend the system prompt if present
    const formattedMessages = [...messages];
    if (systemPrompt) {
      formattedMessages.unshift({
        role: 'system',
        content: systemPrompt
      });
    }

    fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama3.2',
        messages: formattedMessages,
        stream: false, // Return complete response to bypass stream chunk overhead in extension
        options: {
          temperature: 0.2, // Keep temperature low for grounding tasks
          num_predict: 500, // Limit responses to prevent timeout
        }
      })
    })
      .then(async (res) => {
        if (res.ok) {
          const body = await res.json();
          const responseText = body.message?.content || '';
          sendResponse({ success: true, data: responseText });
        } else {
          const errorMsg = await res.text();
          sendResponse({ success: false, error: `Ollama returned error (${res.status}): ${errorMsg}` });
        }
      })
      .catch((error: any) => {
        sendResponse({
          success: false,
          error: `Error querying local Ollama instance: ${error.message}`
        });
      });
    return true; // Keep message channel open for asynchronous sendResponse
  }

  if (request.type === 'OPEN_SIDE_PANEL') {
    if (sender.tab && sender.tab.id !== undefined) {
      chrome.sidePanel.open({ tabId: sender.tab.id })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error: any) => {
          console.error('[Quantum AI] chrome.sidePanel.open failed:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep message channel open
    } else {
      sendResponse({ success: false, error: 'No active tab' });
    }
  }

  return false;
});
}

// Configure Side Panel to open on Extension Toolbar Icon click
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.warn('[Quantum AI] Failed to set sidePanel behavior:', err));
}

