'use client';

import { createContext, useContext } from 'react';

export interface AccessibilityContextType {
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

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityContext.Provider');
  }
  return context;
};
