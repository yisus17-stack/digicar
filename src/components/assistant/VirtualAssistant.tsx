'use client';

import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VirtualAssistant() {
  return (
    <Button variant="ghost" className="flex items-center gap-2 text-primary hover:text-primary">
        <Bot className="h-8 w-8 p-1.5 border-2 border-primary rounded-full" />
        <span className="font-bold">Chatbot</span>
    </Button>
  );
}
