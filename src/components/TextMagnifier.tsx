'use client';

import { useState, useEffect } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility.tsx';
import { cn } from '@/lib/utils';

export function TextMagnifier() {
  const { textMagnifier } = useAccessibility();
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!textMagnifier) {
      setVisible(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let targetText = '';

      // Check if the target or its parents have text content
      if (target.textContent) {
        // Prioritize text from specific elements like p, span, h, a, button
        if (['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'LABEL', 'LI'].includes(target.tagName)) {
           targetText = target.textContent.trim();
        } else {
            // Fallback for text in other elements, but avoid grabbing huge chunks
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

      if (cleanText.length > 0 && cleanText.length < 150) { // Limit length
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

  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-[9999] pointer-events-none transform -translate-x-1/2',
        'p-4 bg-background border-2 border-primary rounded-lg shadow-2xl',
        'max-w-md w-max'
      )}
      style={{
        top: `${position.y + 20}px`,
        left: `${position.x}px`,
        transition: 'opacity 0.1s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <p className="text-2xl font-bold text-foreground m-0">{text}</p>
    </div>
  );
}
