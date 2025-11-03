'use client';

import Link from 'next/link';
import { Search, User, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

const SiteHeader = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="DigiCar Logo" width={40} height={40} />
          <span className="font-bold text-xl">DigiCar</span>
        </Link>
        <nav
          className={cn(
            'hidden md:flex items-center space-x-8 text-lg font-medium'
          )}
        >
          <Link href="/" className="text-primary font-bold">Inicio</Link>
          <Link href="/" className="transition-colors hover:text-primary">Catálogo</Link>
          <Link href="/compare" className="transition-colors hover:text-primary">Comparar</Link>
          <Link href="/simulator" className="transition-colors hover:text-primary">Simulador</Link>
        </nav>
        <div className="flex items-center gap-4">
          {isSearchOpen ? (
            <div className="relative flex-1 md:max-w-xs">
              <Input
                type="search"
                placeholder="Buscar autos..."
                className="w-full pr-10"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
