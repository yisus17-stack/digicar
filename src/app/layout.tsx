'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useUser } from '@/firebase/auth/use-user';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/app/theme-provider';
import AccessibilityToolbar from '@/components/AccessibilityToolbar';
import { AccessibilityContext } from '@/hooks/use-accessibility';
import { useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-sans' });

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useUser();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');
  const isLegalPage = pathname.startsWith('/legal');
  const showHeaderAndFooter = !isAuthPage && !isLegalPage && !isAdminPage;

  return (
    <div className="relative flex min-h-screen flex-col">
      {showHeaderAndFooter && <SiteHeader user={user} loading={loading} />}
      <main className="flex-1">{children}</main>
      {showHeaderAndFooter && <SiteFooter />}
    </div>
  );
}

function AccessibilityWrapper({ children }: { children: ReactNode }) {
  const [grayscale, setGrayscale] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState(0); // 0: normal, 1: medium, 2: large
  const [highlightTitles, setHighlightTitles] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [hideImages, setHideImages] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const body = document.body;
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
    if (theme !== 'light') {
      setTheme('light');
    }
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
      <AppContent>{children}</AppContent>
      <AccessibilityToolbar />
    </AccessibilityContext.Provider>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={cn('font-sans', poppins.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AccessibilityWrapper>
              {children}
            </AccessibilityWrapper>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
        <div id="accessibility-portal"></div>
      </body>
    </html>
  );
}
