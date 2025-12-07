'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface AccessibilityContextType {
  grayscale: boolean;
  toggleGrayscale: () => void;
  contrast: boolean;
  toggleContrast: () => void;
  fontSizeStep: number;
  cycleFontSize: () => void;
  highlightTitles: boolean;
  toggleHighlightTitles: () => void;
  underlineLinks: boolean;
  toggleUnderlineLinks: () => void;
  hideImages: boolean;
  toggleHideImages: () => void;
  resetAccessibility: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [grayscale, setGrayscale] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState(0); // 0: normal, 1: medium, 2: large
  const [highlightTitles, setHighlightTitles] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [hideImages, setHideImages] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    // This effect runs on the client-side
    const body = document.body;

    // Apply or remove attributes based on state
    body.dataset.grayscale = String(grayscale);
    body.dataset.contrast = String(contrast);
    body.dataset.fontSizeStep = String(fontSizeStep);
    body.dataset.highlightTitles = String(highlightTitles);
    body.dataset.underlineLinks = String(underlineLinks);
    body.dataset.hideImages = String(hideImages);
    
  }, [grayscale, contrast, fontSizeStep, highlightTitles, underlineLinks, hideImages]);

  const toggleGrayscale = () => setGrayscale(prev => !prev);
  const toggleContrast = () => setContrast(prev => !prev);
  const cycleFontSize = () => setFontSizeStep(prev => (prev + 1) % 3);
  const toggleHighlightTitles = () => setHighlightTitles(prev => !prev);
  const toggleUnderlineLinks = () => setUnderlineLinks(prev => !prev);
  const toggleHideImages = () => setHideImages(prev => !prev);

  const resetAccessibility = () => {
    setGrayscale(false);
    setContrast(false);
    setFontSizeStep(0);
    setHighlightTitles(false);
    setUnderlineLinks(false);
    setHideImages(false);
    setTheme('light');
  };

  const value = {
    grayscale,
    toggleGrayscale,
    contrast,
    toggleContrast,
    fontSizeStep,
    cycleFontSize,
    highlightTitles,
    toggleHighlightTitles,
    underlineLinks,
    toggleUnderlineLinks,
    hideImages,
    toggleHideImages,
    resetAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
