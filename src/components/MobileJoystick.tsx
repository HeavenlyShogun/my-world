import React, { useState, useRef, useEffect, useCallback } from 'react';

interface MobileJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const MobileJoystick: React.FC<MobileJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const radius = 45; // Max radius distance of joystick knob

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdRef.current === null || !containerRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = touch.clientX - centerX;
        const deltaY = touch.clientY - centerY;
        const dist = Math.hypot(deltaX, deltaY);

        let finalX = deltaX;
        let finalY = deltaY;

        if (dist > radius) {
          finalX = (deltaX / dist) * radius;
          finalY = (deltaY / dist) * radius;
        }

        setKnobPos({ x: finalX, y: finalY });
        onMove(finalX / radius, -(finalY / radius)); // Invert Y for forward = up
        break;
      }
    }
  };

  const reset = useCallback(() => {
    touchIdRef.current = null;
    setActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  useEffect(() => {
    const handleTouchEndGlobal = (e: TouchEvent) => {
      if (touchIdRef.current !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchIdRef.current) {
            reset();
            break;
          }
        }
      }
    };

    window.addEventListener('touchend', handleTouchEndGlobal);
    window.addEventListener('touchcancel', handleTouchEndGlobal);
    return () => {
      window.removeEventListener('touchend', handleTouchEndGlobal);
      window.removeEventListener('touchcancel', handleTouchEndGlobal);
    };
  }, [reset]);

  return (
    <div className="fixed bottom-24 left-6 z-30 select-none md:hidden">
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={reset}
        onTouchCancel={reset}
        className={`w-28 h-28 rounded-full border flex items-center justify-center transition-colors ${
          active
            ? 'bg-cyan-950/40 border-cyan-400'
            : 'bg-slate-900/40 border-slate-700/80'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Outer Guide Ring */}
        <div className="w-16 h-16 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center pointer-events-none" />

        {/* Inner Knob */}
        <div
          className={`absolute w-12 h-12 rounded-full border pointer-events-none transition-transform duration-75 ${
            active
              ? 'bg-cyan-400 border-white shadow-lg shadow-cyan-500/50'
              : 'bg-slate-700/80 border-slate-500'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>
      <div className="text-[10px] font-mono text-center text-slate-500 mt-1 pointer-events-none">
        漫遊搖桿 (Move)
      </div>
    </div>
  );
};
