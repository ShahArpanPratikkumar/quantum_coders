/**
 * Quantum AI — Frontend API Service
 * All fetch requests go through this single module.
 * Never returns fake data. Shows real errors.
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function quantumFetch(endpoint, options = {}) {
  const { signal, ...fetchOptions } = options;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      signal,
      ...fetchOptions
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Backend returned non-JSON response (status ${response.status}). Is the backend running?`);
    }

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
      const err = new Error(message);
      err.code = data?.code;
      err.setupCommands = data?.setupCommands;
      err.status = response.status;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      const cancelled = new Error('Request cancelled.');
      cancelled.code = 'CANCELLED';
      throw cancelled;
    }

    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const offline = new Error('Cannot connect to backend. Make sure the server is running: npm run server');
      offline.code = 'BACKEND_OFFLINE';
      throw offline;
    }

    throw err;
  }
}

// ─── Health & Status ──────────────────────────────────────────────────────────

export const checkHealth = (signal) =>
  quantumFetch('/health', { signal });

export const checkOllamaStatus = (signal) =>
  quantumFetch('/ollama/status', { signal });

// ─── Main AI Endpoints ────────────────────────────────────────────────────────

export const askQuantumAPI = (payload, signal) =>
  quantumFetch('/quantum/ask', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal
  });

export const summarizePageAPI = (payload, signal) =>
  quantumFetch('/quantum/summarize', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal
  });

export const explainTextAPI = (payload, signal) =>
  quantumFetch('/quantum/explain', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal
  });

export const analyseCodeAPI = (payload, signal) =>
  quantumFetch('/quantum/code', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal
  });

export const translateTextAPI = (payload, signal) =>
  quantumFetch('/quantum/translate', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal
  });

export const researchPageAPI = (payload, signal) =>
  quantumFetch('/quantum/research', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal
  });
