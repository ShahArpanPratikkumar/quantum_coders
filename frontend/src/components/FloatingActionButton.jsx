import { useState, useRef, useCallback } from 'react';
import AuroraRing from './AuroraRing';
import './FloatingActionButton.css';

/**
 * FloatingActionButton — the draggable FAB injected on every page.
 * Snaps to nearest vertical edge on release.
 */
export default function FloatingActionButton({ state = 'idle', amplitude = 0, onClick }) {
  const [pos, setPos] = useState({ x: window.innerWidth - 80, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const fabRef = useRef(null);
  const wasDragged = useRef(false);

  const onMouseDown = useCallback((e) => {
    setIsDragging(true);
    wasDragged.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };

    const onMouseMove = (me) => {
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) wasDragged.current = true;
      const newX = Math.max(8, Math.min(window.innerWidth - 60, dragRef.current.origX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - 60, dragRef.current.origY + dy));
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = (me) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);

      // Snap to nearest edge
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      const finalX = Math.max(8, Math.min(window.innerWidth - 60, dragRef.current.origX + dx));
      const finalY = Math.max(8, Math.min(window.innerHeight - 60, dragRef.current.origY + dy));

      const snapX = finalX < window.innerWidth / 2 ? 12 : window.innerWidth - 60;
      setPos({ x: snapX, y: finalY });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [pos]);

  const handleClick = () => {
    if (!wasDragged.current && onClick) onClick();
  };

  return (
    <button
      ref={fabRef}
      className={`fab glow-cyan ${isDragging ? 'fab--dragging' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      aria-label="Open Lumen assistant"
      title="Open Lumen"
      id="lumen-fab"
    >
      <div className="fab__ring">
        <AuroraRing state={state} amplitude={amplitude} size="sm" />
      </div>
      <span className="fab__letter text-display" aria-hidden="true">L</span>
    </button>
  );
}
