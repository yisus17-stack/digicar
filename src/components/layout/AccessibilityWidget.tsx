'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="mb-2 w-72 origin-bottom-left rounded-lg border bg-background shadow-lg"
            >
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Accessibility /> Herramientas
                </h2>
              </div>
              <div className="flex-1 flex flex-col gap-4 p-4">
              {options.map(({ Icon, label, action, isSwitch, checked, disabled }, index) => (
                <React.Fragment key={label}>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={label.replace(' ', '-')} className="flex items-center gap-3 cursor-pointer text-base">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {label}
                    </Label>
                    {isSwitch ? (
                      <Switch id={label.replace(' ', '-')} checked={checked} onCheckedChange={action} />
                    ) : (
                      <Button variant="ghost" size="sm" onClick={action} disabled={disabled} className="p-2 h-auto">
                        <Icon className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  {index < options.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
              <div className="p-4 border-t">
                <Button onClick={resetAll} variant="outline" className="w-full">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restablecer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          aria-label="Opciones de accesibilidad"
        >
          <Accessibility className="h-7 w-7" />
        </Button>
      </div>
    </>
  );
}
