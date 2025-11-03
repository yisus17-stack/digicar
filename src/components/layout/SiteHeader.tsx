'use client';

import Link from 'next/link';
import { Search, User, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

const SiteHeader = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  return (
    <>
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="DigiCar Logo" width={40} height={40} />
            <span className="font-bold text-xl">DigiCar</span>
          </Link>
          
          <div className="flex-1 flex justify-center">
              <nav className='hidden md:flex items-center space-x-8 text-lg font-medium'>
                <Link href="/" className="text-primary font-bold">Inicio</Link>
                <Link href="/" className="transition-colors hover:text-primary">Catálogo</Link>
                <Link href="/compare" className="transition-colors hover:text-primary">Comparar</Link>
                <Link href="/simulator" className="transition-colors hover:text-primary">Simulador</Link>
              </nav>
          </div>

          <div className="flex items-center justify-end gap-4" style={{minWidth: '150px'}}>
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <Search className="h-5 w-5" />
              </Button>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0" onClick={() => setIsSearchOpen(false)}>
          <div className="container mx-auto px-4 pt-20" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar autos, marcas..."
                  className="w-full h-14 pl-12 pr-14 text-lg"
                  autoFocus
                />
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
              </div>
              {/* Aquí se podrían añadir las recomendaciones */}
              <div className="mt-4 p-4 bg-background rounded-lg">
                <p className="text-center text-muted-foreground">Escribe algo para empezar a buscar...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteHeader;
