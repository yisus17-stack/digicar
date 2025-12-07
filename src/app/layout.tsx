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
      <body className={cn('min-h-screen bg-background font-sans antialiased', poppins.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityProvider>
            <FirebaseClientProvider>
              <AppContent>{children}</AppContent>
              <Toaster />
            </FirebaseClientProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
