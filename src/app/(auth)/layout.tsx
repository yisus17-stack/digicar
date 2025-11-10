import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <FirebaseClientProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            {children}
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}