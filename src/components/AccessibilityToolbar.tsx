
'use client';

import {
    CircleSlash,
    Contrast,
    FileText,
    Type,
    Underline,
    Palette,
    Sun,
    Moon,
    ZoomIn,
    ZoomOut,
    Accessibility,
    X,
    Volume2,
    Paintbrush,
    Pilcrow,
} from 'lucide-react';
import { Button } from './ui/button';
import { useAccessibility } from '@/hooks/use-accessibility.tsx';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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
  <button
    onClick={onClick}
    aria-pressed={isActive}
    className={cn(
      'flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors text-center w-full aspect-square',
      isActive
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-card hover:bg-muted border-border'
    )}
  >
    {children}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h3 className={cn("text-lg font-semibold text-foreground mb-3", className)}>{children}</h3>
);

export function AccessibilityToolbar() {
  const {
    highContrast,
    fontSizeStep,
    grayscale,
    underlineLinks,
    readableFont,
    textToSpeech,
    setHighContrast,
    setFontSizeStep,
    setGrayscale,
    setUnderlineLinks,
    setReadableFont,
    setTextToSpeech,
    resetAccessibility,
  } = useAccessibility();

  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Cerrar el panel si se presiona la tecla Escape
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleIncreaseFont = () => setFontSizeStep(Math.min(2, fontSizeStep + 1) as any);
  const handleDecreaseFont = () => setFontSizeStep(Math.max(-2, fontSizeStep - 1) as any);

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
    <div className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-300">
      {/* Overlay para cerrar al hacer clic afuera */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
      
      {/* Contenido del Panel */}
      <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-card text-card-foreground shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
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
              <SectionTitle>Ajustes de Color</SectionTitle>
              <div className="grid grid-cols-3 gap-3">
                  <ToolButton
                      label="Contraste Oscuro"
                      onClick={() => setTheme('dark')}
                      isActive={theme === 'dark'}
                  >
                      <Moon className="h-7 w-7" />
                  </ToolButton>
                  <ToolButton
                      label="Contraste Claro"
                      onClick={() => setTheme('light')}
                      isActive={theme === 'light'}
                  >
                      <Sun className="h-7 w-7" />
                  </ToolButton>
                  <ToolButton
                      label="Alto Contraste"
                      onClick={() => setHighContrast(!highContrast)}
                      isActive={highContrast}
                  >
                      <Contrast className="h-7 w-7" />
                  </ToolButton>
                  <ToolButton
                      label="Monocromático"
                      onClick={() => setGrayscale(!grayscale)}
                      isActive={grayscale}
                  >
                      <Palette className="h-7 w-7" />
                  </ToolButton>
              </div>
            </div>

            <div>
              <SectionTitle>Ajustes de Contenido</SectionTitle>
               <div className="grid grid-cols-3 gap-3">
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
                      label="Leer Texto"
                      onClick={() => setTextToSpeech(!textToSpeech)}
                      isActive={textToSpeech}
                    >
                      <Volume2 className="h-7 w-7" />
                    </ToolButton>
               </div>
            </div>
        </div>

        <footer className="p-4 border-t">
             <Button
                variant="outline"
                className="w-full"
                onClick={resetAccessibility}
              >
                <CircleSlash className="mr-2 h-4 w-4" />
                Restablecer todo
              </Button>
        </footer>
      </div>
    </div>
  );
}
