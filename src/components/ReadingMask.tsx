
'use client';

import { useState, useEffect } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility.tsx';
import { cn } from '@/lib/utils';

export function ReadingMask() {
  const { readingMask } = useAccessibility();
  const [y, setY] = useState(-1000);
  const maskHeight = 150; // Height of the readable area in pixels

  useEffect(() => {
    if (!readingMask) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [readingMask]);

  if (!readingMask) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Top Overlay */}
      <div
        className="absolute left-0 right-0 bg-black/70"
        style={{
          top: 0,
          height: `calc(${y}px - ${maskHeight / 2}px)`,
        }}
      />
      {/* Bottom Overlay */}
      <div
        className="absolute left-0 right-0 bg-black/70"
        style={{
          top: `calc(${y}px + ${maskHeight / 2}px)`,
          bottom: 0,
        }}
      />
    </div>
  );
}
