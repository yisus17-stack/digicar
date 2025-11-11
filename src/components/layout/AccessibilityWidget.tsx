'use client';

import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Contrast,
  Link as LinkIcon,
  Type,
  RefreshCcw,
  Pipette,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { usePathname } from 'next/navigation';

const FONT_STEP_LIMIT = 2;

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [invert, setInvert] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [readableFont, setReadableFont] = useState(false);
  const pathname = usePathname();

  const applySetting = (key: string, value: string) => {
    document.documentElement.setAttribute(key, value);
    localStorage.setItem(key, value);
  };

  const removeSetting = (key: string) => {
    document.documentElement.removeAttribute(key);
    localStorage.removeItem(key);
  };

  useEffect(() => {
    const settings = {
      'data-font-size-step': (val: string) => setFontSizeStep(parseInt(val, 10)),
      'data-contrast': (val: string) => setHighContrast(val === 'true'),
      'data-grayscale': (val: string) => setGrayscale(val === 'true'),
      'data-invert': (val: string) => setInvert(val === 'true'),
      'data-underline-links': (val: string) => setUnderlineLinks(val === 'true'),
      'data-readable-font': (val: string) => setReadableFont(val === 'true'),
    };

    Object.entries(settings).forEach(([key, setter]) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        setter(storedValue);
        document.documentElement.setAttribute(key, storedValue);
      }
    });
  }, []);

  const handleFontSizeChange = (step: number) => {
    const newStep = Math.max(-FONT_STEP_LIMIT, Math.min(FONT_STEP_LIMIT, fontSizeStep + step));
    setFontSizeStep(newStep);
    applySetting('data-font-size-step', newStep.toString());
  };

  const handleToggle = (setter: (value: boolean | ((prev: boolean) => boolean)) => void, state: boolean, key: string) => {
    const newState = !state;
    setter(newState);
    if (newState) {
      applySetting(key, 'true');
    } else {
      removeSetting(key);
    }
  };

  const resetAll = () => {
    setFontSizeStep(0);
    removeSetting('data-font-size-step');
    setHighContrast(false);
    removeSetting('data-contrast');
    setGrayscale(false);
    removeSetting('data-grayscale');
    setInvert(false);
    removeSetting('data-invert');
    setUnderlineLinks(false);
    removeSetting('data-underline-links');
    setReadableFont(false);
    removeSetting('data-readable-font');
  };

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const options = [
    {
      Icon: ZoomIn,
      label: 'Aumentar texto',
      action: () => handleFontSizeChange(1),
      disabled: fontSizeStep >= FONT_STEP_LIMIT,
    },
    {
      Icon: ZoomOut,
      label: 'Reducir texto',
      action: () => handleFontSizeChange(-1),
      disabled: fontSizeStep <= -FONT_STEP_LIMIT,
    },
    {
      Icon: Pipette,
      label: 'Escala de grises',
      isSwitch: true,
      checked: grayscale,
      action: () => handleToggle(setGrayscale, grayscale, 'data-grayscale'),
    },
    {
      Icon: Contrast,
      label: 'Alto contraste',
      isSwitch: true,
      checked: highContrast,
      action: () => handleToggle(setHighContrast, highContrast, 'data-contrast'),
    },
    {
      Icon: Eye,
      label: 'Negativo',
      isSwitch: true,
      checked: invert,
      action: () => handleToggle(setInvert, invert, 'data-invert'),
    },
    {
      Icon: LinkIcon,
      label: 'Subrayar enlaces',
      isSwitch: true,
      checked: underlineLinks,
      action: () => handleToggle(setUnderlineLinks, underlineLinks, 'data-underline-links'),
    },
    {
      Icon: Type,
      label: 'Fuente legible',
      isSwitch: true,
      checked: readableFont,
      action: () => handleToggle(setReadableFont, readableFont, 'data-readable-font'),
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50"
          aria-label="Opciones de accesibilidad"
        >
          <Accessibility className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] p-0 flex flex-col">
        <SheetHeader className='p-4 border-b'>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Accessibility /> Herramientas de Accesibilidad
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            {options.map(({ Icon, label, action, isSwitch, checked, disabled }, index) => (
              <React.Fragment key={label}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={label.replace(/\s+/g, '-')} className="flex items-center gap-3 cursor-pointer text-base">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {label}
                  </Label>
                  {isSwitch ? (
                    <Switch id={label.replace(/\s+/g, '-')} checked={checked} onCheckedChange={action} />
                  ) : (
                    <Button variant="outline" size="sm" onClick={action} disabled={disabled} className="p-2 h-auto">
                      <Icon className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                {index < options.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t">
          <Button onClick={resetAll} variant="outline" className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Restablecer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
