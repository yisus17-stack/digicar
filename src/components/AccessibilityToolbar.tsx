
'use client';

import {
    CircleSlash,
    Contrast,
    FileText,
    Underline,
    Palette,
    Sun,
    Moon,
    ZoomIn,
    Accessibility,
    X,
    Volume2,
    ImageOff,
    Heading1,
    Baseline,
    ZoomOut,
    RectangleHorizontal,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { useAccessibility } from '@/hooks/use-accessibility.tsx';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';
import { motion, AnimatePresence } from 'framer-motion';

const ToolButton = ({
  label,
  onClick,
  isActive,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    aria-pressed={isActive}
    className={cn(
      'flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors text-center w-full aspect-square',
      isActive
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-card hover:bg-muted border-border',
      className
    )}
  >
    {children}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h3 className={cn("text-lg font-semibold text-foreground mb-3", className)}>{children}</h3>
);

export function AccessibilityToolbar({ fontClassName }: { fontClassName: string }) {
  const {
    highContrast,
    fontSizeStep,
    grayscale,
    underlineLinks,
    textToSpeech,
    hideImages,
    highlightTitles,
    textSpacing,
    textMagnifier,
    readingMask,
    cycleFontSize,
    setHighContrast,
    setGrayscale,
    setUnderlineLinks,
    setTextToSpeech,
    setHideImages,
    setHighlightTitles,
    setTextSpacing,
    setTextMagnifier,
    setReadingMask,
    resetAccessibility,
  } = useAccessibility();

  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useMounted();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCycleTextSpacing = () => {
    const nextStep = (textSpacing + 1) % 3;
    setTextSpacing(nextStep as any);
  };

  const getTextSpacingLabel = () => {
    if (textSpacing === 0) return 'Espaciado de Texto';
    if (textSpacing === 1) return 'Espaciado x1.6';
    if (textSpacing === 2) return 'Espaciado x1.8';
  }

  const getFontSizeLabel = () => {
    if (fontSizeStep === 0) return 'Tamaño de Texto';
    if (fontSizeStep === 1) return 'Texto Mediano';
    if (fontSizeStep === 2) return 'Texto Grande';
    return 'Tamaño de Texto';
  }

  const handleReset = () => {
    resetAccessibility();
    if (theme !== 'light') {
      setTheme('light');
    }
  }

  if (!isMounted) {
    return null;
  }

  const toolbarContent = (
    <div className={cn("accessibility-panel-wrapper", fontClassName)}>
      {!isOpen && (
        <div className="fixed bottom-4 left-4 z-50">
          <Button
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir panel de accesibilidad"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <Accessibility className="h-7 w-7" />
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
            
            <motion.div 
              className="absolute top-0 left-0 h-full w-full max-w-sm bg-card text-card-foreground shadow-2xl flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <header className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">Panel de Accesibilidad</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar panel de accesibilidad"
                >
                    <X className="h-5 w-5" />
                </Button>
                </header>

                <div className="flex-grow overflow-y-auto p-4 space-y-6">
                    <div>
                        <SectionTitle>Ajustes de Contenido</SectionTitle>
                        <div className="grid grid-cols-3 gap-3">
                             <button
                                onClick={cycleFontSize}
                                aria-pressed={fontSizeStep > 0}
                                className={cn(
                                'flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors text-center w-full aspect-square',
                                fontSizeStep > 0
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-card hover:bg-muted border-border'
                                )}
                            >
                                <ZoomIn className="h-7 w-7" />
                                <span className="text-xs font-medium">{getFontSizeLabel()}</span>
                                <div className="flex items-end gap-1 pt-1">
                                    <div className={cn("w-2 h-2 rounded-full transition-colors", fontSizeStep >= 1 ? "bg-primary-foreground" : "bg-gray-400")} />
                                    <div className={cn("w-2 h-3 rounded-full transition-colors", fontSizeStep >= 2 ? "bg-primary-foreground" : "bg-gray-400")} />
                                </div>
                            </button>
                             <ToolButton label="Lupa de Texto" onClick={() => setTextMagnifier(!textMagnifier)} isActive={textMagnifier}>
                                <ZoomIn className="h-7 w-7" />
                            </ToolButton>
                            <ToolButton label="Máscara de Lectura" onClick={() => setReadingMask(!readingMask)} isActive={readingMask}>
                                <RectangleHorizontal className="h-7 w-7" />
                            </ToolButton>
                            <ToolButton label="Resaltar Títulos" onClick={() => setHighlightTitles(!highlightTitles)} isActive={highlightTitles}>
                                <Heading1 className="h-7 w-7" />
                            </ToolButton>
                            <ToolButton label="Subrayar Enlaces" onClick={() => setUnderlineLinks(!underlineLinks)} isActive={underlineLinks}>
                                <Underline className="h-7 w-7" />
                            </ToolButton>
                            <ToolButton label={getTextSpacingLabel()} onClick={handleCycleTextSpacing} isActive={textSpacing > 0}>
                                <Baseline className="h-7 w-7" />
                            </ToolButton>
                            <ToolButton label="Ocultar Imágenes" onClick={() => setHideImages(!hideImages)} isActive={hideImages}>
                                <ImageOff className="h-7 w-7" />
                            </ToolButton>
                             <ToolButton label="Leer Texto" onClick={() => setTextToSpeech(!textToSpeech)} isActive={textToSpeech}>
                                <Volume2 className="h-7 w-7" />
                            </ToolButton>
                        </div>
                    </div>
                    <div>
                      <SectionTitle>Ajustes de Color</SectionTitle>
                      <div className="grid grid-cols-3 gap-3">
                          <ToolButton label="Contraste Oscuro" onClick={() => setTheme('dark')} isActive={theme === 'dark'}>
                              <Moon className="h-7 w-7" />
                          </ToolButton>
                          <ToolButton label="Contraste Claro" onClick={() => setTheme('light')} isActive={theme === 'light'}>
                              <Sun className="h-7 w-7" />
                          </ToolButton>
                          <ToolButton label="Alto Contraste" onClick={() => setHighContrast(!highContrast)} isActive={highContrast}>
                              <Contrast className="h-7 w-7" />
                          </ToolButton>
                          <ToolButton label="Monocromático" onClick={() => setGrayscale(!grayscale)} isActive={grayscale}>
                              <Palette className="h-7 w-7" />
                          </ToolButton>
                      </div>
                    </div>
                </div>

                <footer className="p-4 border-t">
                     <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleReset}
                      >
                        <CircleSlash className="mr-2 h-4 w-4" />
                        Restablecer todo
                      </Button>
                </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const portalContainer = typeof window !== 'undefined' ? document.getElementById('accessibility-portal') : null;
  return portalContainer ? createPortal(toolbarContent, portalContainer) : null;
}
