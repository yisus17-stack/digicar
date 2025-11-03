'use client';

import { Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VirtualAssistant() {
  return (
    <div className="absolute top-0 right-0">
        <Button variant="ghost" className="flex items-center gap-2 text-primary hover:text-primary">
            <Headphones className="h-6 w-6 p-1 border-2 border-primary rounded-full" />
            <span className="font-bold">Asesor Virtual</span>
        </Button>
    </div>
  );
}
