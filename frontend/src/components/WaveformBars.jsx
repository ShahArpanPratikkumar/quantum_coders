import './WaveformBars.css';

/**
 * WaveformBars — audio-reactive bars for listening/speaking states.
 * @param {number} amplitude - 0-1 overall amplitude level
 * @param {string} color     - 'cyan' | 'coral' | 'violet'
 * @param {number} bars      - number of bars to render
 */
export default function WaveformBars({ amplitude = 0, color = 'cyan', bars = 7 }) {
  return (
    <div className={`waveform-bars waveform-bars--${color}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        // Create a pseudo-random height based on index and amplitude
        const center = (bars - 1) / 2;
        const distFromCenter = Math.abs(i - center) / center;
        const baseH = 1 - distFromCenter * 0.6;
        const finalH = amplitude > 0.05 ? baseH * amplitude : 0.08;

        return (
          <div
            key={i}
            className="waveform-bar"
            style={{
              '--bar-height': finalH,
              '--bar-delay': `${i * 0.07}s`,
            }}
          />
        );
      })}
    </div>
  );
}
