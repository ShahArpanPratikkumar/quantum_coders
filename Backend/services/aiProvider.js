/**
 * AI Provider Router
 * Strict Mode: Ollama (local, no API key needed)
 * No fallback APIs. Returns real errors to the UI.
 */
import { generateWithOllama, checkOllamaStatus } from './ollamaService.js';

/**
 * Generate a response using strictly the Ollama provider.
 * Throws errors directly so the UI can show real error messages.
 */
export const generateResponse = async ({ systemPrompt, userPrompt, temperature, signal }) => {
  return await generateWithOllama(systemPrompt, userPrompt, temperature, signal);
};

