
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type FontSizeStep = -2 | -1 | 0 | 1 | 2;

interface AccessibilityState {
  highContrast: boolean;
  fontSizeStep: FontSizeStep;
  grayscale: boolean;
  invert: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  textToSpeech: boolean;
  setHighContrast: (value: boolean) => void;
  setFontSizeStep: (step: FontSizeStep) => void;
  setGrayscale: (value: boolean) => void;
  setInvert: (value: boolean) => void;
  setUnderlineLinks: (value: boolean) => void;
  setReadableFont: (value: boolean) => void;
  setTextToSpeech: (value: boolean) => void;
  resetAccessibility: () => void;
  speak: (text: string, lang?: string) => void;
}

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

const getLocalStorageItem = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  const storedValue = localStorage.getItem(key);
  return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
};

const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState<boolean>(() => getLocalStorageItem('accessibility-highContrast', false));
  const [fontSizeStep, setFontSizeStep] = useState<FontSizeStep>(() => getLocalStorageItem('accessibility-fontSizeStep', 0));
  const [grayscale, setGrayscale] = useState<boolean>(() => getLocalStorageItem('accessibility-grayscale', false));
  const [invert, setInvert] = useState<boolean>(() => getLocalStorageItem('accessibility-invert', false));
  const [underlineLinks, setUnderlineLinks] = useState<boolean>(() => getLocalStorageItem('accessibility-underlineLinks', false));
  const [readableFont, setReadableFont] = useState<boolean>(() => getLocalStorageItem('accessibility-readableFont', false));
  const [textToSpeech, setTextToSpeech] = useState<boolean>(() => getLocalStorageItem('accessibility-textToSpeech', false));

  const speak = useCallback((text: string, lang = 'es-MX') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    synth.speak(utterance);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? 'true' : 'false';
    setLocalStorageItem('accessibility-highContrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.dataset.fontSizeStep = String(fontSizeStep);
    setLocalStorageItem('accessibility-fontSizeStep', fontSizeStep);
  }, [fontSizeStep]);
  
  useEffect(() => {
    document.documentElement.dataset.grayscale = grayscale ? 'true' : 'false';
    setLocalStorageItem('accessibility-grayscale', grayscale);
  }, [grayscale]);

  useEffect(() => {
    document.documentElement.dataset.invert = invert ? 'true' : 'false';
    setLocalStorageItem('accessibility-invert', invert);
  }, [invert]);

  useEffect(() => {
    document.documentElement.dataset.underlineLinks = underlineLinks ? 'true' : 'false';
    setLocalStorageItem('accessibility-underlineLinks', underlineLinks);
  }, [underlineLinks]);
  
  useEffect(() => {
    document.documentElement.dataset.readableFont = readableFont ? 'true' : 'false';
    setLocalStorageItem('accessibility-readableFont', readableFont);
  }, [readableFont]);

  useEffect(() => {
    setLocalStorageItem('accessibility-textToSpeech', textToSpeech);
    const synth = window.speechSynthesis;
    
    if (!textToSpeech || !synth) {
      synth?.cancel();
      return;
    }

    const cleanText = (text: string | null) => {
        return text?.replace(/\s\s+/g, ' ').trim() || '';
    }

    const readTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return;

      let textToRead = target.getAttribute('aria-label') || target.getAttribute('title');

      if (!textToRead) {
          if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'BUTTON', 'A', 'LABEL'].includes(target.tagName)) {
              textToRead = target.textContent;
          }
      }
      
      const cleanedText = cleanText(textToRead);
      if (cleanedText) {
          speak(cleanedText);
      }
    };
    
    const handleEvent = (event: Event) => readTarget(event.target);
    const handleMouseOut = () => synth.cancel();

    document.body.addEventListener('mouseover', handleEvent);
    document.body.addEventListener('focusin', handleEvent);
    document.body.addEventListener('mouseout', handleMouseOut);
    document.body.addEventListener('focusout', handleMouseOut);

    return () => {
        document.body.removeEventListener('mouseover', handleEvent);
        document.body.removeEventListener('focusin', handleEvent);
        document.body.removeEventListener('mouseout', handleMouseOut);
        document.body.removeEventListener('focusout', handleMouseOut);
        synth.cancel();
    };
  }, [textToSpeech, speak]);

  const resetAccessibility = () => {
    setHighContrast(false);
    setFontSizeStep(0);
    setGrayscale(false);
    setInvert(false);
    setUnderlineLinks(false);
    setReadableFont(false);
    setTextToSpeech(false);
  };

  const value = {
    highContrast,
    fontSizeStep,
    grayscale,
    invert,
    underlineLinks,
    readableFont,
    textToSpeech,
    setHighContrast,
    setFontSizeStep,
    setGrayscale,
    setInvert,
    setUnderlineLinks,
    setReadableFont,
    setTextToSpeech,
    resetAccessibility,
    speak,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
