
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AccessibilityWidget from '@/components/layout/AccessibilityWidget';
import { usePathname } from 'next/navigation';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-sans' });

// Metadata no puede ser exportada desde un client component, pero la dejamos para referencia.
// export const metadata: Metadata = {
//   title: 'DigiCar',
//   description: 'Explora, compara y simula tu próximo auto con DigiCar.',
// };

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLegalPage = pathname.startsWith('/legal');

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', poppins.variable)}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            {!isLegalPage && <SiteHeader />}
            <div className="flex-1">{children}</div>
            {!isLegalPage && <SiteFooter />}
            <AccessibilityWidget />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutContent>{children}</LayoutContent>;
}
