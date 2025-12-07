
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
  cycleFontSize: () => void;
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

  const cycleFontSize = () => {
    setFontSizeStep(prev => (prev + 1) % 3 as 0 | 1 | 2);
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
    const mainContentWrapper = document.getElementById('main-content-wrapper');
    const body = document.body;

    if (mainContentWrapper) {
      mainContentWrapper.dataset.fontSizeStep = String(fontSizeStep);
    }
    
    body.dataset.highContrast = String(highContrast);
    body.dataset.highlightTitles = String(highlightTitles);
    body.dataset.underlineLinks = String(underlineLinks);
    body.dataset.hideImages = String(hideImages);
    body.dataset.textSpacing = String(textSpacing);
    body.dataset.textMagnifier = String(textMagnifier);
    body.dataset.readingMask = String(readingMask);
    body.dataset.highlightOnHover = String(highlightOnHover);
    
    if (mainContentWrapper) {
      mainContentWrapper.dataset.grayscale = String(grayscale);
    }
    
  }, [highContrast, fontSizeStep, highlightTitles, underlineLinks, hideImages, textSpacing, grayscale, textMagnifier, readingMask, highlightOnHover]);


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
    fontSizeStep, cycleFontSize,
    textSpacing, setTextSpacing,
    resetAccessibility,
  };
}
