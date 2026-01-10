
'use client';

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Página No Encontrada</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href="/">
          <Home className="mr-2 h-5 w-5" />
          Volver al Inicio
        </Link>
      </Button>
    </div>
  );
}
