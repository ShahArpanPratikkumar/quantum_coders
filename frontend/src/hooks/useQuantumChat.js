/**
 * useQuantumChat — Real AI chat hook
 * Calls real backend. No mock responses. No setTimeout simulation.
 * Supports: abort, retry, local commands, page context, selected text.
 */
import { useState, useRef, useCallback } from 'react';
import { askQuantumAPI } from '../services/quantumApi.js';
import { usePageContext } from '../context/PageContext.jsx';
import { useActiveTab } from './useActiveTab.js';

// Local commands handled without AI
const LOCAL_COMMANDS = {
  patterns: [
    /^(stop|pause|resume|quiet|silence)\s*(speaking|reading|talking)?$/i,
    /^clear\s*(chat|conversation|history)?$/i,
    /^(repeat|say that again)$/i
  ],
  detect(text) {
    return this.patterns.some(p => p.test(text.trim()));
  }
};

export const useQuantumChat = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const { pageContext, selectedText, isDev } = usePageContext();
  const activeTab = useActiveTab();

  const handleUserQuery = useCallback(async (userText, options = {}) => {
    const trimmedText = userText.trim();
    if (!trimmedText || isTyping) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setError(null);

    // Handle local commands without AI
    if (LOCAL_COMMANDS.detect(trimmedText)) {
      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmedText,
        status: 'complete',
        createdAt: new Date().toISOString()
      };
      const localMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Command received.',
        status: 'complete',
        sourceMode: 'local-command',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg, localMsg]);
      return;
    }

    abortControllerRef.current = new AbortController();

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedText,
      status: 'complete',
      createdAt: new Date().toISOString()
    };

    const typingId = 'typing-' + Date.now();
    const typingMessage = {
      id: typingId,
      role: 'assistant',
      content: '',
      status: 'sending',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setIsTyping(true);

    try {
      // Get recent conversation history (last 10 messages, excluding typing)
      const history = messages
        .filter(m => m.status === 'complete' && m.role !== undefined)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const payload = {
        question: trimmedText,
        tabId: activeTab?.id,
        pageContext: pageContext || {},
        conversationHistory: history,
        selectedText: selectedText || options.selectedText || '',
        language: 'auto'
      };

      const result = await askQuantumAPI(payload, abortControllerRef.current.signal);

      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.answer,
        status: 'complete',
        sourceMode: result.sourceMode || 'general',
        detectedIntent: result.detectedIntent,
        usedFallback: result.usedFallback || false,
        fallbackLabel: result.fallbackLabel,
        createdAt: new Date().toISOString()
      };

      setMessages(prev =>
        prev.map(msg => msg.id === typingId ? assistantMessage : msg)
      );
    } catch (err) {
      let errorContent = '';

      if (err.code === 'CANCELLED') {
        errorContent = 'Request cancelled.';
      } else if (err.code === 'BACKEND_OFFLINE') {
        errorContent = '⚠️ Backend is offline. Start the server: npm run server';
      } else if (err.code === 'OLLAMA_OFFLINE') {
        errorContent = '⚠️ Ollama is not running. Run: ollama serve';
      } else if (err.code === 'MODEL_NOT_INSTALLED') {
        errorContent = `⚠️ ${err.message}`;
      } else if (err.code === 'TIMEOUT') {
        errorContent = '⏱️ Request timed out. The model may still be loading. Try again.';
      } else {
        errorContent = `Error: ${err.message}`;
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingId
            ? { ...msg, content: errorContent, status: err.code === 'CANCELLED' ? 'cancelled' : 'error', id: Date.now().toString() }
            : msg
        )
      );
      if (err.code !== 'CANCELLED') setError(err.message);
    } finally {
      setIsTyping(false);
    }
  }, [messages, pageContext, selectedText, activeTab, isTyping]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
  }, []);

  const retryLast = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      setMessages(prev => prev.slice(0, -1)); // Remove last assistant message
      handleUserQuery(lastUser.content);
    }
  }, [messages, handleUserQuery]);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setMessages([]);
    setError(null);
    setIsTyping(false);
  }, []);

  return {
    messages,
    isTyping,
    error,
    isDev,
    handleUserQuery,
    stopGeneration,
    retryLast,
    clearChat
  };
};
