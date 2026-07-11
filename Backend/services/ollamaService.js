/**
 * Ollama Local AI Service
 * Uses /api/chat endpoint (Ollama v0.2+)
 * Model: gemma3:4b (configurable via OLLAMA_MODEL env)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '120000', 10);

/**
 * Check if Ollama is running and if the configured model is available.
 * Returns { online, modelAvailable, availableModels, error }
 */
export const checkOllamaStatus = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { online: false, modelAvailable: false, error: 'Ollama returned non-OK status' };
    }

    const data = await response.json();
    const models = data.models || [];
    const availableModelNames = models.map(m => m.name);

    // Check if configured model is available (handle name:tag format)
    const modelAvailable = availableModelNames.some(name => {
      const baseName = name.split(':')[0];
      const configBase = OLLAMA_MODEL.split(':')[0];
      return name === OLLAMA_MODEL || baseName === configBase;
    });

    return {
      online: true,
      modelAvailable,
      availableModels: availableModelNames,
      configuredModel: OLLAMA_MODEL
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { online: false, modelAvailable: false, error: 'Ollama connection timed out. Run: ollama serve' };
    }
    return { online: false, modelAvailable: false, error: 'Ollama is not running. Run: ollama serve' };
  }
};

/**
 * Generate a response using the Ollama /api/chat endpoint.
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User message
 * @param {number} temperature - Sampling temperature (0-1)
 * @param {AbortSignal} signal - Optional AbortSignal for cancellation
 * @returns {Promise<string>} - The AI response text
 */
export const generateWithOllama = async (systemPrompt, userPrompt, temperature = 0.35, signal = null) => {
  // First check if Ollama is available
  const status = await checkOllamaStatus();

  if (!status.online) {
    const err = new Error(status.error || 'Ollama is not running. Run: ollama serve');
    err.code = 'OLLAMA_OFFLINE';
    throw err;
  }

  if (!status.modelAvailable) {
    const err = new Error(
      `Model "${OLLAMA_MODEL}" is not installed. Run: ollama pull ${OLLAMA_MODEL}`
    );
    err.code = 'MODEL_NOT_INSTALLED';
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Combine external signal with timeout
  const combinedSignal = signal
    ? AbortSignal.any
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal
    : controller.signal;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: temperature,
          num_predict: 2048
        }
      }),
      signal: combinedSignal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    const content = data?.message?.content;
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new Error('Ollama returned an empty response. Try a different question.');
    }

    return content.trim();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      if (signal?.aborted) {
        const cancelled = new Error('Request cancelled by user.');
        cancelled.code = 'CANCELLED';
        throw cancelled;
      }
      const timeout = new Error('Request timed out. The model may be loading. Try again.');
      timeout.code = 'TIMEOUT';
      throw timeout;
    }
    throw err;
  }
};
