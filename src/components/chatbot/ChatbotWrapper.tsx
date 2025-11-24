'use client';

import { usePathname } from 'next/navigation';

export default function ChatbotWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChatbot = !pathname.startsWith('/admin');

  if (!showChatbot) {
    return null;
  }

  return <>{children}</>;
}
