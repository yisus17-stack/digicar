'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useAccessibility } from '@/hooks/use-accessibility';
import {
  Contrast,
  CircleSlash,
  ZoomIn,
  Sparkles,
  Underline,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';

const AccessibilityToolbar = () => {
  const {
    grayscale,
    toggleGrayscale,
    contrast,
    toggleContrast,
    fontSizeStep,
    cycleFontSize,
    highlightTitles,
    toggleHighlightTitles,
    underlineLinks,
    toggleUnderlineLinks,
    hideImages,
    toggleHideImages,
    resetAccessibility,
  } = useAccessibility();

  const isMounted = useMounted();

  if (!isMounted) {
    return null;
  }
  
  const fontSizeIndicator = (
    <div className="flex items-end justify-center gap-0.5 h-3">
      <div className={cn('w-1 h-1 rounded-full', fontSizeStep >= 0 ? 'bg-current' : 'bg-gray-400')}></div>
      <div className={cn('w-1 h-2 rounded-full', fontSizeStep >= 1 ? 'bg-current' : 'bg-gray-400')}></div>
      <div className={cn('w-1 h-3 rounded-full', fontSizeStep >= 2 ? 'bg-current' : 'bg-gray-400')}></div>
    </div>
  );

  const toolbarContent = (
    <div className="fixed bottom-4 left-4 z-[100] accessibility-panel-wrapper">
      <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-2 shadow-lg">
        <button
          onClick={toggleGrayscale}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center',
            grayscale ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          <CircleSlash className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">Monocromático</span>
        </button>
        <button
          onClick={toggleContrast}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center',
            contrast ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          <Contrast className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">Alto Contraste</span>
        </button>
        <button
          onClick={cycleFontSize}
          className="flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center hover:bg-muted"
        >
          <ZoomIn className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">Tamaño Texto</span>
          {fontSizeIndicator}
        </button>
        <button
          onClick={toggleHighlightTitles}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center',
            highlightTitles ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          <Sparkles className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">Resaltar Títulos</span>
        </button>
        <button
          onClick={toggleUnderlineLinks}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center',
            underlineLinks ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          <Underline className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">Subrayar Enlaces</span>
        </button>
        <button
          onClick={toggleHideImages}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center',
            hideImages ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          <EyeOff className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">Ocultar Imágenes</span>
        </button>
        <button
          onClick={resetAccessibility}
          className="flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center hover:bg-muted"
        >
          <RefreshCw className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">Restablecer</span>
        </button>
      </div>
    </div>
  );

  const portalContainer = typeof window !== 'undefined' && document.getElementById('accessibility-portal');
  return portalContainer ? createPortal(toolbarContent, portalContainer) : null;
};

export default AccessibilityToolbar;