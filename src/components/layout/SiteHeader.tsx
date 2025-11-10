
'use client';

import Link from 'next/link';
import {
  Search,
  User,
  X,
  Menu,
  Home,
  LayoutGrid,
  GitCompareArrows,
  Wand2,
  Landmark,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';


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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Simulación temporal: cualquier usuario logueado es admin
  const isAdmin = !!user;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cerrar la sesión. Inténtalo de nuevo.',
      });
    }
  };

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/catalog', label: 'Catálogo', icon: LayoutGrid },
    { href: '/compare', label: 'Comparar', icon: GitCompareArrows },
    { href: '/simulator', label: 'Simulador', icon: Wand2 },
    { href: '/financing', label: 'Financiamiento', icon: Landmark },
  ];

  const openSearch = () => {
    setIsSearchVisible(true);
    document.body.style.overflow = 'hidden';
  };

  const closeSearch = () => {
    setIsSearchVisible(false);
    document.body.style.overflow = '';
    setSearchValue('');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchVisible) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchVisible]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleClearSearch = () => {
    setSearchValue('');
  };

  return (
    <>
      <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="DigiCar Logo"
              width={150}
              height={50}
              className="w-24 md:w-36"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary font-semibold' : ''
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={openSearch} className="h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                    <>
                        <DropdownMenuLabel>Hola, {user.displayName || user.email ||'Usuario'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center w-full cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Mi Perfil</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile/simulations" className="flex items-center w-full cursor-pointer">
                            <Wand2 className="mr-2 h-4 w-4" />
                            <span>Mis Simulaciones</span>
                          </Link>
                        </DropdownMenuItem>

                        {isAdmin && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Administración</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                <Link href="/admin/cars" className="flex items-center w-full cursor-pointer">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    <span>Administrar Autos</span>
                                </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/login" className="flex items-center w-full cursor-pointer">
                            <LogIn className="mr-2 h-4 w-4" />
                            <span>Iniciar Sesión</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/register" className="flex items-center w-full cursor-pointer">
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Registrarse</span>
                          </Link>
                        </DropdownMenuItem>
                    </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-3/4">
                  <div className="p-4">
                    <SheetHeader className="pb-4">
                      <SheetTitle>
                        <div className='p-3'>
                          <Link href="/" className="flex items-center">
                            <Image
                              src="/logo.png"
                              alt="DigiCar Logo"
                              width={120}
                              height={40}
                            />
                          </Link>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-2">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              'flex items-center gap-3 rounded-md p-3 text-lg transition-colors hover:text-primary',
                              pathname === link.href
                                ? 'font-bold text-primary'
                                : 'text-foreground'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={closeSearch}
          >
            <div className="flex w-full justify-center md:pt-4">
              <motion.div
                key="panel"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-background border-b w-full md:w-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-20 gap-4">
                    <Link href="/" className="hidden sm:flex items-center space-x-2">
                        <Image
                          src="/logo.png"
                          alt="DigiCar Logo"
                          width={150}
                          height={50}
                          className="w-24 md:w-36"
                        />
                    </Link>
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar"
                        className="w-full h-12 pl-12 pr-4 text-base bg-muted sm:rounded-full rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none"
                        autoFocus
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      {searchValue && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full sm:hidden"
                          onClick={handleClearSearch}
                        >
                          <X className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="link"
                      onClick={closeSearch}
                      className="text-muted-foreground"
                    >
                      Cancelar
                    </Button>
                  </div>
                  <div className="mt-4 pb-12">
                    <p className="font-semibold mb-4 text-muted-foreground text-sm">
                      Búsquedas Populares
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term) => (
                        <Button
                          key={term}
                          variant="secondary"
                          size="sm"
                          className="rounded-full font-normal"
                          onClick={() => {
                            setSearchValue(term);
                          }}
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteHeader;
