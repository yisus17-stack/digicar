'use client';

import React, { useState } from 'react';
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
  Accessibility as AccessibilityIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { AnimatePresence, motion } from 'framer-motion';

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

  const [isOpen, setIsOpen] = useState(false);
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

  const toolbarOptions = [
    { id: 'grayscale', label: 'Monocromático', icon: CircleSlash, active: grayscale, action: toggleGrayscale },
    { id: 'contrast', label: 'Alto Contraste', icon: Contrast, active: contrast, action: toggleContrast },
    { id: 'fontSize', label: 'Tamaño Texto', icon: ZoomIn, action: cycleFontSize, indicator: fontSizeIndicator },
    { id: 'highlightTitles', label: 'Resaltar Títulos', icon: Sparkles, active: highlightTitles, action: toggleHighlightTitles },
    { id: 'underlineLinks', label: 'Subrayar Enlaces', icon: Underline, active: underlineLinks, action: toggleUnderlineLinks },
    { id: 'hideImages', label: 'Ocultar Imágenes', icon: EyeOff, active: hideImages, action: toggleHideImages },
    { id: 'reset', label: 'Restablecer', icon: RefreshCw, action: resetAccessibility },
  ];

  const toolbarContent = (
    <div className="fixed bottom-4 left-4 z-[100] accessibility-panel-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-2 flex flex-col items-center gap-2 rounded-lg border bg-card p-2 shadow-lg"
          >
            {toolbarOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-md transition-colors w-24 h-24 text-center',
                  option.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
                aria-pressed={option.active}
              >
                <option.icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-semibold">{option.label}</span>
                {option.indicator}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label={isOpen ? 'Cerrar menú de accesibilidad' : 'Abrir menú de accesibilidad'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-8 w-8" /> : <AccessibilityIcon className="h-8 w-8" />}
      </button>
    </div>
  );

  const portalContainer = typeof window !== 'undefined' && document.getElementById('accessibility-portal');
  return portalContainer ? createPortal(toolbarContent, portalContainer) : null;
};

export default AccessibilityToolbar;
