/**
 * useSpeechSynthesis — Production-grade TTS hook
 *
 * Features:
 * - speak / pause / resume / stop / replay
 * - Speed control (0.5x – 2x)
 * - Voice selection (all system voices)
 * - Long text chunking (prevents Chrome TTS cutoff at ~32KB)
 * - Markdown stripping before speech
 * - Serialized utterance queue (no overlapping speech)
 */
import { useState, useCallback, useEffect, useRef } from 'react';

/** Remove markdown symbols so TTS reads cleanly */
function cleanForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, 'code block.')   // code blocks → "code block"
    .replace(/`[^`]*`/g, '')                      // inline code
    .replace(/#{1,6}\s/g, '')                     // headings
    .replace(/[*_~]/g, '')                         // bold/italic/strike
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')      // links → text only
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')          // images
    .replace(/>\s/g, '')                           // blockquotes
    .replace(/[-*+]\s/g, '')                       // list bullets
    .replace(/\n{2,}/g, '. ')                      // double newlines → pause
    .replace(/\n/g, ' ')
    .trim();
}

/** Split long text into chunks ≤ 200 words (safe for all browsers) */
function chunkText(text, maxWords = 200) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speed, setSpeed] = useState(1);

  const chunkQueueRef = useRef([]);
  const currentChunkRef = useRef(0);
  const lastTextRef = useRef('');         // for replay
  const isCancelledRef = useRef(false);

  // ── Load voices (Chrome fires voiceschanged asynchronously) ──
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;
      setVoices(available);
      if (!selectedVoice) {
        const preferred = available.find(v => v.lang.startsWith('en-')) || available[0];
        setSelectedVoice(preferred?.name ?? null);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Internal: speak a single chunk and chain to the next ──
  const speakChunk = useCallback((index) => {
    if (isCancelledRef.current) return;
    if (index >= chunkQueueRef.current.length) {
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunkQueueRef.current[index]);
    utterance.rate = speed;

    if (selectedVoice) {
      const voice = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      currentChunkRef.current = index;
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        speakChunk(index + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.error('[TTS] utterance error', e.error);
        setIsSpeaking(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [speed, selectedVoice]);

  // ── Public API ──

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    isCancelledRef.current = false;

    const clean = cleanForSpeech(text);
    lastTextRef.current = clean;
    chunkQueueRef.current = chunkText(clean);
    currentChunkRef.current = 0;

    setIsSpeaking(true);
    setIsPaused(false);
    speakChunk(0);
  }, [speakChunk]);

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const replay = useCallback(() => {
    if (lastTextRef.current) {
      speak(lastTextRef.current);
    }
  }, [speak]);

  return {
    speak,
    pause,
    resume,
    stop,
    replay,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    speed,
    setSpeed,
  };
};
