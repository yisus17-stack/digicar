
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
  Landmark,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useState, useEffect, type MouseEvent } from 'react';
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
import { useAuth, useUser } from '@/firebase';
import { signOut, type User as FirebaseUser } from 'firebase/auth';
import Swal from 'sweetalert2';
import { ThemeToggle } from '../ThemeToggle';
import { useMounted } from '@/hooks/use-mounted';
import { Skeleton } from '../ui/skeleton';

interface SiteHeaderProps {
    user: FirebaseUser | null;
    loading: boolean;
}

const SiteHeaderSkeleton = () => {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Skeleton className="h-10 w-36" />
                <div className="hidden items-center space-x-6 lg:flex">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-28" />
                </div>
                <div className="flex items-center justify-end gap-2 sm:gap-4">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="lg:hidden">
                        <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                </div>
            </div>
        </header>
    );
};

const SiteHeader = ({ user, loading }: SiteHeaderProps) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const isAdmin = user?.uid === "oDqiYNo5iIWWWu8uJWOZMdheB8n2";
  const isMounted = useMounted();

  const openSearch = () => setIsSearchVisible(true);
  const closeSearch = () => setIsSearchVisible(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchVisible) closeSearch();
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchVisible]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(searchTerm.trim())}`);
      closeSearch();
      setSearchTerm('');
    }
  };

  const handleProtectedLinkClick = (e: React.MouseEvent<HTMLElement>, href: string) => {
    e.preventDefault();
    if (loading) {
      return; 
    }
    if (user) {
      router.push(href);
    } else {
      router.push('/login');
    }
  }
  
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  if (!isMounted) {
    return <SiteHeaderSkeleton />;
  }


  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home, protected: false },
    { href: '/catalogo', label: 'Catálogo', icon: LayoutGrid, protected: false },
    { href: '/comparacion', label: 'Comparar', icon: GitCompareArrows, protected: true },
    { href: '/financiamiento', label: 'Financiamiento', icon: Landmark, protected: true },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('comparisonIds');
      await Swal.fire({
        title: 'Sesión Cerrada',
        text: 'Has cerrado sesión correctamente.',
        icon: 'success',
        confirmButtonColor: '#595c97',
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cerrar sesión. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#595c97',
      });
    }
  };


  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/digicar-logo.png"
                alt="DigiCar Logo"
                width={150}
                height={50}
                draggable="false"
                className="block dark:hidden high-contrast-hidden"
              />
              <Image
                src="/digicar-logo-blanco.png"
                alt="DigiCar Logo"
                width={150}
                height={50}
                draggable="false"
                className="hidden dark:block high-contrast-hidden"
              />
              <Image
                src="/digicar-logo-contraste.png"
                alt="DigiCar Logo de Alto Contraste"
                width={150}
                height={50}
                draggable="false"
                className="hidden high-contrast-block"
              />
            </Link>
          </div>

          <nav className="hidden items-center space-x-6 text-sm font-medium lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => link.protected ? handleProtectedLinkClick(e, link.href) : undefined}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={openSearch}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>
            
            {isMounted ? (
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
                                <Link href="/perfil">
                                    <User className="mr-2 h-4 w-4" /> Mi Perfil
                                </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Administración</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                        <Link href="/admin">
                                            <ShieldCheck className="mr-2 h-4 w-4" /> Panel de Admin
                                        </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                <Link href="/login">
                                    <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                                </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                <Link href="/register">
                                    <UserPlus className="mr-2 h-4 w-4" /> Registrarse
                                </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Skeleton className="h-9 w-9 rounded-full" />
            )}
            
            <div className="lg:hidden">
              {isMounted ? (
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                      <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <Menu className="h-5 w-5" />
                          <span className="sr-only">Abrir menú</span>
                      </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-4/5">
                      <SheetHeader>
                        <SheetTitle>
                          <Link href="/" className="flex items-center space-x-2">
                            <Image
                              src="/digicar-logo.png"
                              alt="DigiCar Logo"
                              width={150}
                              height={50}
                              draggable="false"
                              className="block dark:hidden high-contrast-hidden"
                            />
                            <Image
                              src="/digicar-logo-blanco.png"
                              alt="DigiCar Logo"
                              width={150}
                              height={50}
                              draggable="false"
                              className="hidden dark:block high-contrast-hidden"
                            />
                            <Image
                              src="/digicar-logo-contraste.png"
                              alt="DigiCar Logo de Alto Contraste"
                              width={150}
                              height={50}
                              draggable="false"
                              className="hidden high-contrast-block"
                            />
                          </Link>
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                          <nav className="flex flex-col space-y-4">
                          {navLinks.map((link) => (
                              <Link
                              key={link.href}
                              href={link.href}
                              onClick={(e) => link.protected ? handleProtectedLinkClick(e, link.href) : undefined}
                              className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted"
                              >
                              <link.icon className="h-5 w-5" />
                              <span>{link.label}</span>
                              </Link>
                          ))}
                          </nav>
                      </div>
                      </SheetContent>
                  </Sheet>
              ) : (
                <Skeleton className="h-9 w-9 rounded-md" />
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80"
            onClick={closeSearch}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-0 bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearchSubmit} className="container mx-auto flex h-20 items-center px-4">
                <Search className="mr-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Busca en todo el catálogo..."
                  className="h-12 flex-1 border-0 bg-transparent text-lg shadow-none focus-visible:ring-0"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={closeSearch}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Cerrar búsqueda</span>
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteHeader;
