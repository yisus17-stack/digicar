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
import { AccessibilityProvider, useAccessibility } from '@/hooks/use-accessibility.tsx';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { useEffect } from 'react';
import Script from 'next/script';

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
      {!isAdminPage && <AccessibilityToolbar />}
    </div>
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
          <AccessibilityProvider>
            <FirebaseClientProvider>
              <AppContent>{children}</AppContent>
              <Toaster />
            </FirebaseClientProvider>
          </AccessibilityProvider>
        </ThemeProvider>
        {/* Contenedor del portal para la barra de accesibilidad, ahora como hermano del body */}
        <div id="accessibility-portal"></div>
        <Script
          id="accessibe-script"
          src="https://acsbapp.com/apps/app/dist/js/app.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (window.acsbJS) {
              window.acsbJS.init();
            }
          }}
        />
      </body>
    </html>
  );
}

declare global {
  interface Window {
    acsbJS: {
      init: () => void;
    };
  }
}
