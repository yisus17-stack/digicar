'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useTheme } from 'next-themes';

type FontSizeStep = 0 | 1 | 2; // 0: normal, 1: medium, 2: large
type TextSpacingStep = 0 | 1 | 2;

interface AccessibilityState {
  highContrast: boolean;
  fontSizeStep: FontSizeStep;
  grayscale: boolean;
  invert: boolean;
  underlineLinks: boolean;
  textToSpeech: boolean;
  hideImages: boolean;
  highlightTitles: boolean;
  textSpacing: TextSpacingStep;
  setHighContrast: (value: boolean) => void;
  setFontSizeStep: (step: FontSizeStep) => void;
  cycleFontSize: () => void;
  setGrayscale: (value: boolean) => void;
  setInvert: (value: boolean) => void;
  setUnderlineLinks: (value: boolean) => void;
  setTextToSpeech: (value: boolean) => void;
  setHideImages: (value: boolean) => void;
  setHighlightTitles: (value: boolean) => void;
  setTextSpacing: (step: TextSpacingStep) => void;
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
  const { setTheme } = useTheme();
  const [highContrast, setHighContrast] = useState<boolean>(() => getLocalStorageItem('accessibility-highContrast', false));
  const [fontSizeStep, setFontSizeStep] = useState<FontSizeStep>(() => getLocalStorageItem('accessibility-fontSizeStep', 0));
  const [grayscale, setGrayscale] = useState<boolean>(() => getLocalStorageItem('accessibility-grayscale', false));
  const [invert, setInvert] = useState<boolean>(() => getLocalStorageItem('accessibility-invert', false));
  const [underlineLinks, setUnderlineLinks] = useState<boolean>(() => getLocalStorageItem('accessibility-underlineLinks', false));
  const [textToSpeech, setTextToSpeech] = useState<boolean>(() => getLocalStorageItem('accessibility-textToSpeech', false));
  const [hideImages, setHideImages] = useState<boolean>(() => getLocalStorageItem('accessibility-hideImages', false));
  const [highlightTitles, setHighlightTitles] = useState<boolean>(() => getLocalStorageItem('accessibility-highlightTitles', false));
  const [textSpacing, setTextSpacing] = useState<TextSpacingStep>(() => getLocalStorageItem('accessibility-textSpacing', 0));

  const cycleFontSize = () => {
    setFontSizeStep(prev => ((prev + 1) % 3) as FontSizeStep);
  }

  const speak = useCallback((text: string, lang = 'es-MX') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    synth.speak(utterance);
  }, []);

  useEffect(() => {
    document.body.dataset.contrast = highContrast ? 'true' : 'false';
    setLocalStorageItem('accessibility-highContrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    const stepMap = { 0: 0, 1: 1, 2: 2 };
    document.body.dataset.fontSizeStep = String(stepMap[fontSizeStep] || 0);
    setLocalStorageItem('accessibility-fontSizeStep', fontSizeStep);
  }, [fontSizeStep]);
  
  useEffect(() => {
    document.body.dataset.grayscale = grayscale ? 'true' : 'false';
    setLocalStorageItem('accessibility-grayscale', grayscale);
  }, [grayscale]);

  useEffect(() => {
    document.body.dataset.invert = invert ? 'true' : 'false';
    setLocalStorageItem('accessibility-invert', invert);
  }, [invert]);

  useEffect(() => {
    document.body.dataset.underlineLinks = underlineLinks ? 'true' : 'false';
    setLocalStorageItem('accessibility-underlineLinks', underlineLinks);
  }, [underlineLinks]);
  
  useEffect(() => {
    document.body.dataset.hideImages = hideImages ? 'true' : 'false';
    setLocalStorageItem('accessibility-hideImages', hideImages);
  }, [hideImages]);

  useEffect(() => {
    document.body.dataset.highlightTitles = highlightTitles ? 'true' : 'false';
    setLocalStorageItem('accessibility-highlightTitles', highlightTitles);
  }, [highlightTitles]);
  
  useEffect(() => {
    document.body.dataset.textSpacing = String(textSpacing);
    setLocalStorageItem('accessibility-textSpacing', textSpacing);
  }, [textSpacing]);


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

    const findReadableText = (element: HTMLElement): string | null => {
        if (!element) return null;
        
        // Prioritize explicit labels
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        const title = element.getAttribute('title');
        if (title) return title;
        
        // Exclude interactive elements that contain other text
        if (element.matches('button, a, [role="button"]')) {
            const childText = Array.from(element.childNodes)
                .map(node => node.nodeType === Node.TEXT_NODE ? node.textContent : '')
                .join(' ')
                .trim();
            if(childText) return childText;
        }

        // General text content for static elements
        const readableElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'SPAN'];
        if (readableElements.includes(element.tagName)) {
            return element.textContent;
        }

        return null;
    }

    const readTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return;
      
      const textToRead = findReadableText(target);
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
    setTextToSpeech(false);
    setHideImages(false);
    setHighlightTitles(false);
    setTextSpacing(0);
    setTheme('light');
  };

  const value = {
    highContrast,
    fontSizeStep,
    grayscale,
    invert,
    underlineLinks,
    textToSpeech,
    hideImages,
    highlightTitles,
    textSpacing,
    setHighContrast,
    setFontSizeStep,
    cycleFontSize,
    setGrayscale,
    setInvert,
    setUnderlineLinks,
    setTextToSpeech,
    setHideImages,
    setHighlightTitles,
    setTextSpacing,
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
