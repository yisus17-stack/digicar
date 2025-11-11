'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Contrast,
  Link,
  Type,
  RefreshCcw,
  Pipette,
  Eye,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const FONT_STEP_LIMIT = 2;

export default function AccessibilityWidget() {
  const [fontSizeStep, setFontSizeStep] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [invert, setInvert] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [readableFont, setReadableFont] = useState(false);

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
      'data-font-size-step': setFontSizeStep,
      'data-contrast': setHighContrast,
      'data-grayscale': setGrayscale,
      'data-invert': setInvert,
      'data-underline-links': setUnderlineLinks,
      'data-readable-font': setReadableFont,
    };

    Object.entries(settings).forEach(([key, setter]) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        if (typeof setter === 'function') {
          if (key === 'data-font-size-step') {
            setter(parseInt(storedValue, 10));
          } else {
            setter(storedValue === 'true');
          }
        }
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
      Icon: Link,
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
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl shadow-lg z-50"
          aria-label="Opciones de accesibilidad"
        >
          <Accessibility className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[340px] flex flex-col" side="left">
        <SheetHeader>
          <SheetTitle className="text-xl flex items-center gap-2">
            <Accessibility /> Herramientas de Accesibilidad
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4">
          {options.map(({ Icon, label, action, isSwitch, checked, disabled }, index) => (
            <React.Fragment key={label}>
              <div className="flex items-center justify-between">
                <Label htmlFor={label.replace(' ', '-')} className="flex items-center gap-3 cursor-pointer text-base">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {label}
                </Label>
                {isSwitch ? (
                  <Switch
                    id={label.replace(' ', '-')}
                    checked={checked}
                    onCheckedChange={action}
                  />
                ) : (
                  <Button variant="ghost" size="sm" onClick={action} disabled={disabled} className="p-2 h-auto">
                    <Icon className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <Separator />
            </React.Fragment>
          ))}
        </div>
        <Button onClick={resetAll} variant="outline" className="w-full">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Restablecer
        </Button>
      </SheetContent>
    </Sheet>
  );
}
