import { useEffect, useRef } from 'react';
import './AuroraRing.css';

/**
 * AuroraRing — the signature animated status indicator.
 * Visually adapts to every operational state.
 *
 * @param {string} state   - idle | extracting | thinking | listening | speaking | error
 * @param {number} amplitude - 0–1, used for listening/speaking states
 * @param {string} size    - 'sm' | 'md' | 'lg'
 */
export default function AuroraRing({ state = 'idle', amplitude = 0, size = 'md' }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const timeRef = useRef(0);

  const sizeMap = { sm: 64, md: 100, lg: 140 };
  const px = sizeMap[size] ?? 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = px * dpr;
    canvas.height = px * dpr;
    canvas.style.width = `${px}px`;
    canvas.style.height = `${px}px`;
    ctx.scale(dpr, dpr);

    const cx = px / 2;
    const cy = px / 2;
    const outerR = px * 0.42;
    const innerR = px * 0.30;

    // Color palette
    const CYAN   = [34,  211, 238];
    const VIOLET = [167, 139, 250];
    const CORAL  = [251, 113, 133];
    const RED    = [248, 113, 113];

    function lerp(a, b, t) { return a + (b - a) * t; }
    function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

    function drawRing(t) {
      ctx.clearRect(0, 0, px, px);

      // ── Background center glow ──
      const cgRadius = innerR * 0.9;
      let cgColor;
      switch (state) {
        case 'thinking':  cgColor = rgba(VIOLET, 0.08 + 0.06 * Math.sin(t * 5.2)); break;
        case 'listening': cgColor = rgba(CORAL,  0.08 + 0.08 * Math.sin(t * 8));   break;
        case 'speaking':  cgColor = rgba(CYAN,   0.08 + amplitude * 0.12);          break;
        case 'error':     cgColor = rgba(RED,    0.06);                             break;
        default:          cgColor = rgba(CYAN,   0.05);
      }
      const cgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cgRadius);
      cgGrad.addColorStop(0, cgColor);
      cgGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, cgRadius, 0, Math.PI * 2);
      ctx.fillStyle = cgGrad;
      ctx.fill();

      // ── The ring ──
      const trackWidth = px * 0.055;

      // Track (background ring)
      ctx.beginPath();
      ctx.arc(cx, cy, (outerR + innerR) / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = trackWidth + 2;
      ctx.stroke();

      // Animated arc segments
      const numSegments = getSegments(state, t, amplitude);
      numSegments.forEach(seg => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, (outerR + innerR) / 2, seg.start, seg.end);
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = trackWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = seg.shadowColor;
        ctx.shadowBlur = seg.shadowBlur;
        ctx.stroke();
        ctx.restore();
      });

      // ── Ripple rings (listening state) ──
      if (state === 'listening' && amplitude > 0.1) {
        for (let i = 1; i <= 2; i++) {
          const rippleR = outerR + i * 12 * amplitude;
          const rippleOpacity = Math.max(0, 0.25 - i * 0.10) * amplitude;
          ctx.beginPath();
          ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(CORAL, rippleOpacity);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // ── Lumen wordmark center dot ──
      const dotR = px * 0.045;
      let dotColor, dotGlow;
      switch (state) {
        case 'thinking':  dotColor = rgba(VIOLET, 0.9); dotGlow = rgba(VIOLET, 0.5); break;
        case 'listening': dotColor = rgba(CORAL,  0.9); dotGlow = rgba(CORAL,  0.5); break;
        case 'speaking':  dotColor = rgba(CYAN,   0.9); dotGlow = rgba(CYAN,   0.5); break;
        case 'error':     dotColor = rgba(RED,    0.8); dotGlow = rgba(RED,    0.4); break;
        default:          dotColor = rgba(CYAN,   0.7); dotGlow = rgba(CYAN,   0.3);
      }
      ctx.save();
      ctx.shadowColor = dotGlow;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.restore();
    }

    function getSegments(st, t, amp) {
      const TWO_PI = Math.PI * 2;
      switch (st) {
        case 'idle': {
          // Slow gentle rotation, cyan-dominant
          const offset = t * 0.4;
          const breath = 0.6 + 0.25 * Math.sin(t * 1.57);
          return [
            { start: offset, end: offset + TWO_PI * 0.75, color: rgba(CYAN, breath * 0.7), shadowColor: rgba(CYAN, 0.4), shadowBlur: 8 },
            { start: offset + TWO_PI * 0.75, end: offset + TWO_PI * 0.90, color: rgba(VIOLET, breath * 0.4), shadowColor: rgba(VIOLET, 0.3), shadowBlur: 6 },
          ];
        }
        case 'extracting': {
          // Fast shimmer sweep
          const sweep = (t * 2.5) % TWO_PI;
          return [
            { start: sweep, end: sweep + TWO_PI * 0.4, color: rgba(CYAN, 0.9), shadowColor: rgba(CYAN, 0.6), shadowBlur: 16 },
            { start: sweep + TWO_PI * 0.5, end: sweep + TWO_PI * 0.65, color: rgba(CYAN, 0.3), shadowColor: rgba(CYAN, 0.2), shadowBlur: 8 },
          ];
        }
        case 'thinking': {
          // Violet inward pulse
          const pulse = 0.5 + 0.5 * Math.sin(t * 5.2);
          return [
            { start: -Math.PI / 2, end: -Math.PI / 2 + TWO_PI * (0.5 + pulse * 0.5), color: rgba(VIOLET, 0.4 + pulse * 0.5), shadowColor: rgba(VIOLET, 0.5), shadowBlur: 14 + pulse * 8 },
          ];
        }
        case 'listening': {
          // Coral ripples
          const wave = 0.5 + 0.5 * Math.sin(t * 8);
          const coverage = 0.4 + amp * 0.6;
          return [
            { start: -Math.PI / 2, end: -Math.PI / 2 + TWO_PI * coverage, color: rgba(CORAL, 0.6 + wave * 0.4), shadowColor: rgba(CORAL, 0.5), shadowBlur: 16 + amp * 12 },
            { start: -Math.PI / 2 + TWO_PI * (coverage + 0.05), end: -Math.PI / 2 + TWO_PI * (coverage + 0.15), color: rgba(CORAL, 0.2), shadowColor: 'transparent', shadowBlur: 0 },
          ];
        }
        case 'speaking': {
          // All three colors chasing
          const chase = t * 1.4;
          return [
            { start: chase, end: chase + TWO_PI * 0.40, color: rgba(CYAN,   0.75 + amp * 0.25), shadowColor: rgba(CYAN,   0.5), shadowBlur: 14 },
            { start: chase + TWO_PI * 0.40, end: chase + TWO_PI * 0.68, color: rgba(VIOLET, 0.6  + amp * 0.3),  shadowColor: rgba(VIOLET, 0.4), shadowBlur: 10 },
            { start: chase + TWO_PI * 0.68, end: chase + TWO_PI * 0.90, color: rgba(CORAL,  0.5  + amp * 0.35), shadowColor: rgba(CORAL,  0.4), shadowBlur: 10 },
          ];
        }
        case 'error': {
          const pulse = 0.3 + 0.4 * Math.abs(Math.sin(t * 1.5));
          return [
            { start: -Math.PI / 2, end: -Math.PI / 2 + TWO_PI * pulse, color: rgba(RED, 0.5), shadowColor: rgba(RED, 0.3), shadowBlur: 8 },
          ];
        }
        default:
          return [];
      }
    }

    let lastTime = 0;
    const animate = (timestamp) => {
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      timeRef.current += dt;
      drawRing(timeRef.current);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [state, amplitude, px]);

  return (
    <div className={`aurora-ring aurora-ring--${state} aurora-ring--${size}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
