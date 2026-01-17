'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilityState {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  grayscale: boolean;
  setGrayscale: (value: boolean) => void;
  underlineLinks: boolean;
  setUnderlineLinks: (value: boolean) => void;
  hideImages: boolean;
  setHideImages: (value: boolean) => void;
  highlightTitles: boolean;
  setHighlightTitles: (value: boolean) => void;
  textToSpeech: boolean;
  setTextToSpeech: (value: boolean) => void;
  textMagnifier: boolean;
  setTextMagnifier: (value: boolean) => void;
  readingMask: boolean;
  setReadingMask: (value: boolean) => void;
  highlightOnHover: boolean;
  setHighlightOnHover: (value: boolean) => void;
  fontSizeStep: 0 | 1 | 2;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  textSpacing: 0 | 1 | 2;
  setTextSpacing: (value: 0 | 1 | 2) => void;
  resetAccessibility: () => void;
}

export const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

export function useAccessibilityState(): AccessibilityState {
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [hideImages, setHideImages] = useState(false);
  const [highlightTitles, setHighlightTitles] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [textMagnifier, setTextMagnifier] = useState(false);
  const [readingMask, setReadingMask] = useState(false);
  const [highlightOnHover, setHighlightOnHover] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState<0 | 1 | 2>(0);
  const [textSpacing, setTextSpacing] = useState<0 | 1 | 2>(0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const increaseFontSize = () => {
    setFontSizeStep(prev => (prev < 2 ? prev + 1 : 2) as 0 | 1 | 2);
  };

  const decreaseFontSize = () => {
    setFontSizeStep(prev => (prev > 0 ? prev - 1 : 0) as 0 | 1 | 2);
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setGrayscale(false);
    setUnderlineLinks(false);
    setHideImages(false);
    setHighlightTitles(false);
    setTextToSpeech(false);
    setTextMagnifier(false);
    setReadingMask(false);
    setHighlightOnHover(false);
    setFontSizeStep(0);
    setTextSpacing(0);
  };
  
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.dataset.fontSizeStep = String(fontSizeStep);
    
    const body = document.body;
    body.dataset.highContrast = String(highContrast);
    body.dataset.highlightTitles = String(highlightTitles);
    body.dataset.underlineLinks = String(underlineLinks);
    body.dataset.hideImages = String(hideImages);
    body.dataset.textSpacing = String(textSpacing);
    
    const mainContentWrapper = document.getElementById('main-content-wrapper');
    if (mainContentWrapper) {
      mainContentWrapper.dataset.grayscale = String(grayscale);
    }
    
  }, [highContrast, fontSizeStep, highlightTitles, underlineLinks, hideImages, textSpacing, grayscale]);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const spanishVoice = 
          voices.find(v => v.lang === 'es-MX' && v.name.includes('Natural')) ||
          voices.find(v => v.lang === 'es-MX') ||
          voices.find(v => v.lang.startsWith('es') && v.name.includes('Microsoft') && v.name.includes('(Natural)')) ||
          voices.find(v => v.lang.startsWith('es') && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('es') && v.localService === false) ||
          voices.find(v => v.lang.startsWith('es'));
        setSelectedVoice(spanishVoice || voices[0]);
      }
    };
    
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    const speak = (text: string) => {
        if (!text) return;
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        speechSynthesis.cancel(); // Cancel any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        speechSynthesis.speak(utterance);
    };

    const handleEvent = (event: MouseEvent | FocusEvent) => {
        const target = event.target as HTMLElement;
        const isInteractive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
        if (isInteractive) return;

        const readableTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL', 'SPAN', 'LI', 'A', 'BUTTON'];

        if (readableTags.includes(target.tagName)) {
            const textToSpeak = target.textContent?.trim();
            if (textToSpeak) {
                speak(textToSpeak);
            }
        }
    };

    if (textToSpeech) {
        document.body.addEventListener('mouseover', handleEvent);
        document.body.addEventListener('focusin', handleEvent);
    } else {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            speechSynthesis.cancel();
        }
        document.body.removeEventListener('mouseover', handleEvent);
        document.body.removeEventListener('focusin', handleEvent);
    }

    return () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            speechSynthesis.cancel();
        }
        document.body.removeEventListener('mouseover', handleEvent);
        document.body.removeEventListener('focusin', handleEvent);
    };
}, [textToSpeech, selectedVoice]);


  return {
    highContrast, setHighContrast,
    grayscale, setGrayscale,
    underlineLinks, setUnderlineLinks,
    hideImages, setHideImages,
    highlightTitles, setHighlightTitles,
    textToSpeech, setTextToSpeech,
    textMagnifier, setTextMagnifier,
    readingMask, setReadingMask,
    highlightOnHover, setHighlightOnHover,
    fontSizeStep,
    increaseFontSize,
    decreaseFontSize,
    textSpacing, setTextSpacing,
    resetAccessibility,
  };
}
