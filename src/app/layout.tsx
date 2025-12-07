
'use client';

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
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { AccessibilityContext, useAccessibilityState } from '@/hooks/use-accessibility.tsx';
import { useState, useEffect, ReactNode } from 'react';
import Script from 'next/script';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-sans' });

function AppContent({ children, fontClassName }: { children: React.ReactNode, fontClassName: string }) {
  const pathname = usePathname();
  const { user, loading } = useUser();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');
  const isLegalPage = pathname.startsWith('/legal');
  const showHeaderAndFooter = !isAuthPage && !isLegalPage && !isAdminPage;

  return (
    <div id="main-content-wrapper" className={cn("relative flex min-h-screen flex-col font-sans", fontClassName)}>
      {showHeaderAndFooter && <SiteHeader user={user} loading={loading} />}
      <main className="flex-1">{children}</main>
      {showHeaderAndFooter && <SiteFooter />}
    </div>
  );
}

function AccessibilityProvider({ children }: { children: ReactNode }) {
  const accessibilityState = useAccessibilityState();

  return (
    <AccessibilityContext.Provider value={accessibilityState}>
      {children}
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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          value={{
            light: 'light',
            dark: 'dark',
          }}
          storageKey="digicar-theme"
          forcedTheme="light"
        >
          <FirebaseClientProvider>
            <AccessibilityProvider>
              <div id="main-content-wrapper">
                <AppContent fontClassName={poppins.className}>{children}</AppContent>
              </div>
              <AccessibilityToolbar fontClassName={poppins.className} />
            </AccessibilityProvider>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
        <div id="accessibility-portal"></div>
      </body>
    </html>
  );
}
