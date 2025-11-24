
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AccessibilityWidget from '@/components/layout/AccessibilityWidget';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { usePathname } from 'next/navigation';


const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'DigiCar - Tu Salón de Exposición de Autos Digital',
  description: 'Explora, compara y simula tu próximo auto con DigiCar.',
};

function ChatbotWrapper({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const showChatbot = !pathname.startsWith('/admin');

  return (
    <>
      {children}
      {showChatbot && <ChatbotWidget />}
    </>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', poppins.variable)}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <AccessibilityWidget />
            <ChatbotWidget />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
