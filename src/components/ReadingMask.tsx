
'use client';

import { useState, useEffect } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility.tsx';
import { cn } from '@/lib/utils';

export function ReadingMask() {
  const { readingMask } = useAccessibility();
  const [y, setY] = useState(-1000);
  const maskHeight = 200; // Height of the readable area in pixels

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
  
  const gradient = `linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.75) calc(${y - maskHeight / 2}px),
    transparent calc(${y - maskHeight / 2}px),
    transparent calc(${y + maskHeight / 2}px),
    rgba(0, 0, 0, 0.75) calc(${y + maskHeight / 2}px),
    rgba(0, 0, 0, 0.75) 100%
  )`;

  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{
        background: gradient,
      }}
    />
  );
}
