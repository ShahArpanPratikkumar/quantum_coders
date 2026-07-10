/**
 * useSpeechRecognition — Production-grade speech recognition hook
 *
 * States: idle | requesting-permission | listening | processing | error
 * Errors: unsupported | permission-denied | no-speech | aborted | network | unknown
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = () => {
  const [voiceStatus, setVoiceStatus] = useState(
    SpeechRecognitionAPI ? 'idle' : 'unsupported'
  );
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const submittedRef = useRef(false); // prevent duplicate submissions

  // Initialize recognition instance once
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceStatus('listening');
      setError(null);
      submittedRef.current = false;
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalChunk) {
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + finalChunk).trim();
        setTranscript(finalTranscriptRef.current);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      // 'aborted' fires when we call .stop()/.abort() — not a real error
      if (event.error === 'aborted') return;

      const errorMap = {
        'not-allowed': 'permission-denied',
        'permission-denied': 'permission-denied',
        'no-speech': 'no-speech',
        'network': 'network',
        'audio-capture': 'no-microphone',
      };
      const mappedError = errorMap[event.error] || 'unknown';
      setError(mappedError);
      setVoiceStatus('error');
      shouldRestartRef.current = false;
    };

    recognition.onend = () => {
      // Auto-restart in continuous mode if still supposed to be listening
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setVoiceStatus('idle');
          shouldRestartRef.current = false;
        }
      } else {
        setVoiceStatus('idle');
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      try { recognition.abort(); } catch (e) {}
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!SpeechRecognitionAPI) {
      setError('unsupported');
      setVoiceStatus('unsupported');
      return;
    }

    // Cancel any ongoing speech synthesis before mic starts
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Reset state
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    submittedRef.current = false;

    // Request mic permission explicitly first (gives clear error if denied)
    try {
      setVoiceStatus('requesting-permission');
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permErr) {
      setError('permission-denied');
      setVoiceStatus('error');
      return;
    }

    shouldRestartRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started — ignore
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    setInterimTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceStatus('idle');
  }, []);

  // Allow pages to consume and clear transcript after use (prevents duplicate submissions)
  const consumeTranscript = useCallback(() => {
    const t = finalTranscriptRef.current;
    finalTranscriptRef.current = '';
    setTranscript('');
    return t;
  }, []);

  const isListening = voiceStatus === 'listening';
  const isUnsupported = voiceStatus === 'unsupported';

  return {
    voiceStatus,
    isListening,
    isUnsupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    consumeTranscript,
    setTranscript, // kept for backward compat
  };
};
