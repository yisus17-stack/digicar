'use client';

import Link from 'next/link';
import { Search, User, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const popularSearches = [
    'Prestige X10',
    'Aurora GT',
    'Volta EV',
    'SUV',
    'Deportivo',
    'Híbrido',
    'Familiar',
];


const SiteHeader = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

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

  const handleClearSearch = () => {
    setSearchValue('');
  };

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchValue('');
    }
  }, [isSearchOpen]);

  return (
    <>
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-20 items-center justify-between px-12 gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="DigiCar Logo" width={150} height={50} />
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
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0" onClick={() => setIsSearchOpen(false)}>
          <div className='bg-background border-b animate-in slide-in-from-top-4 duration-300' onClick={(e) => e.stopPropagation()}>
            <div className="container mx-auto px-12 pt-8 md:pt-16">
              <div className="flex items-center h-20 gap-4">
                <Link href="/" className="flex items-center space-x-2">
                  <Image src="/logo.png" alt="DigiCar Logo" width={150} height={40} />
                </Link>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar"
                    className="w-full h-12 pl-10 pr-10 text-lg bg-muted border-none rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none"
                    autoFocus
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  {searchValue && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                      onClick={handleClearSearch}
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <Button variant="ghost" onClick={() => setIsSearchOpen(false)} className="text-muted-foreground">
                  <X className="h-5 w-5 md:hidden" />
                  <span className="hidden md:inline">Cancelar</span>
                </Button>
              </div>
              <div className="mt-8 pb-12">
                <p className="font-semibold mb-4 text-muted-foreground">Búsquedas Populares</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <Button key={term} variant="secondary" size="sm" className="rounded-full font-normal">
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteHeader;
