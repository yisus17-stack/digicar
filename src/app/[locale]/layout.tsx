import type {Metadata} from 'next';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AccessibilityWidget from '@/components/layout/AccessibilityWidget';
import { i18n, type Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'DigiCar - Tu Salón de Exposición de Autos Digital',
  description: 'Explora, compara y simula tu próximo auto con DigiCar.',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const dictionary = await getDictionary(params.locale);

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader locale={params.locale} dictionary={dictionary} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <AccessibilityWidget />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
