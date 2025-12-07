
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility.tsx';
import { cn } from '@/lib/utils';

export function TextMagnifier() {
  const { textMagnifier } = useAccessibility();
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const [showAbove, setShowAbove] = useState(false);


  useEffect(() => {
    if (!textMagnifier) {
      setVisible(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let targetText = '';

      if (target.textContent) {
        if (['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'LABEL', 'LI'].includes(target.tagName)) {
           targetText = target.textContent.trim();
        } else {
            const childText = Array.from(target.childNodes)
              .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
              .map(node => node.textContent?.trim())
              .join(' ');
              
            if(childText.length > 0 && childText.length < 150) {
                 targetText = childText;
            }
        }
      }
      
      const cleanText = targetText.trim();
      
      const isNearBottom = e.clientY > window.innerHeight / 2;
      setShowAbove(isNearBottom);


      if (cleanText.length > 0 && cleanText.length < 150) {
        setText(cleanText);
        setPosition({ x: e.clientX, y: e.clientY });
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [textMagnifier]);

  if (!textMagnifier || !visible) {
    return null;
  }
  
  const topPosition = showAbove ? position.y - (magnifierRef.current?.offsetHeight || 0) - 20 : position.y + 20;

  return (
    <div
      ref={magnifierRef}
      className={cn(
        'fixed z-[9999] pointer-events-none transform -translate-x-1/2',
        'p-3 bg-zinc-800 rounded-md shadow-2xl',
        'max-w-md w-max'
      )}
      style={{
        top: `${topPosition}px`,
        left: `${position.x}px`,
        transition: 'opacity 0.1s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <p className="text-xl font-medium text-white m-0">{text}</p>
    </div>
  );
}
