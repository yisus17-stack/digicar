
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { cn } from '@/lib/utils';
import { PT_Sans } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AccessibilityWidget from '@/components/layout/AccessibilityWidget';


const ptSans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'DigiCar - Tu Salón de Exposición de Autos Digital',
  description: 'Explora, compara y simula tu próximo auto con DigiCar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', ptSans.variable)}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <AccessibilityWidget />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
