
'use client';

import { useState, useEffect } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility.tsx';
import { cn } from '@/lib/utils';

export function HighlightOnHover() {
  const { highlightOnHover } = useAccessibility();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!highlightOnHover) {
      setVisible(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let validTarget = null;
      
      const isMeaningfulElement = ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'LABEL', 'LI'].includes(target.tagName);
      const isBody = target.tagName === 'BODY';

      if (isMeaningfulElement && target.textContent?.trim() && !isBody) {
        validTarget = target;
      }
      
      if (validTarget) {
        setTargetRect(validTarget.getBoundingClientRect());
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    const handleMouseLeave = () => {
        setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      setVisible(false);
    };
  }, [highlightOnHover]);

  if (!highlightOnHover || !visible || !targetRect) {
    return null;
  }

  return (
    <div
      className="fixed z-[9997] pointer-events-none border-2 border-orange-500 rounded transition-all duration-100 ease-in-out"
      style={{
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
      }}
    />
  );
}
