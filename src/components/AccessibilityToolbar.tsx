
'use client';

import {
    CircleSlash,
    Contrast,
    FileText,
    Type,
    Underline,
    Palette,
    SunMoon,
    ZoomIn,
    ZoomOut,
    Accessibility,
    X,
  } from 'lucide-react';
  import { Button } from './ui/button';
  import { useAccessibility } from '@/hooks/use-accessibility';
  import { useState } from 'react';
  import { cn } from '@/lib/utils';
  
  const ToolButton = ({
    label,
    onClick,
    isActive,
    children,
  }: {
    label: string;
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="icon"
        onClick={onClick}
        aria-label={label}
        aria-pressed={isActive}
        className="h-14 w-14 rounded-lg"
      >
        {children}
      </Button>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
  
  export function AccessibilityToolbar() {
    const {
      highContrast,
      fontSizeStep,
      grayscale,
      invert,
      underlineLinks,
      readableFont,
      setHighContrast,
      setFontSizeStep,
      setGrayscale,
      setInvert,
      setUnderlineLinks,
      setReadableFont,
      resetAccessibility,
    } = useAccessibility();
  
    const [isOpen, setIsOpen] = useState(false);
  
    const handleIncreaseFont = () => {
      setFontSizeStep(Math.min(2, fontSizeStep + 1) as any);
    };
  
    const handleDecreaseFont = () => {
      setFontSizeStep(Math.max(-2, fontSizeStep - 1) as any);
    };
  
    if (!isOpen) {
      return (
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
      );
    }
  
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-300">
        <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar panel de accesibilidad"
            className="absolute top-3 right-3 h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
  
          <h2 className="text-2xl font-bold mb-6 text-center">Panel de Accesibilidad</h2>
  
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
            <ToolButton
              label="Contraste"
              onClick={() => setHighContrast(!highContrast)}
              isActive={highContrast}
            >
              <Contrast className="h-7 w-7" />
            </ToolButton>
  
            <ToolButton
              label="Aumentar Texto"
              onClick={handleIncreaseFont}
              isActive={fontSizeStep > 0}
            >
              <ZoomIn className="h-7 w-7" />
            </ToolButton>
  
            <ToolButton
              label="Reducir Texto"
              onClick={handleDecreaseFont}
              isActive={fontSizeStep < 0}
            >
              <ZoomOut className="h-7 w-7" />
            </ToolButton>
  
            <ToolButton
              label="Fuente Legible"
              onClick={() => setReadableFont(!readableFont)}
              isActive={readableFont}
            >
              <FileText className="h-7 w-7" />
            </ToolButton>
  
            <ToolButton
              label="Subrayar Enlaces"
              onClick={() => setUnderlineLinks(!underlineLinks)}
              isActive={underlineLinks}
            >
              <Underline className="h-7 w-7" />
            </ToolButton>
  
            <ToolButton
              label="Escala de Grises"
              onClick={() => setGrayscale(!grayscale)}
              isActive={grayscale}
            >
              <Palette className="h-7 w-7" />
            </ToolButton>
  
            <ToolButton
              label="Invertir Colores"
              onClick={() => setInvert(!invert)}
              isActive={invert}
            >
              <SunMoon className="h-7 w-7" />
            </ToolButton>
  
            <ToolButton
              label="Restablecer"
              onClick={resetAccessibility}
              isActive={false}
            >
              <CircleSlash className="h-7 w-7" />
            </ToolButton>
          </div>
        </div>
      </div>
    );
  }
