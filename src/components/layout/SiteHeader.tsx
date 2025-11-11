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
  UserPlus,
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

const SiteHeader = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = !!user;

  // Do not show header on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/catalog', label: 'Catálogo', icon: LayoutGrid },
    { href: '/compare', label: 'Comparar', icon: GitCompareArrows },
    { href: '/simulator', label: 'Simulador IA', icon: Wand2 },
    { href: '/financing', label: 'Financiamiento', icon: Landmark },
  ];

  const openSearch = () => setIsSearchVisible(true);
  const closeSearch = () => setIsSearchVisible(false);

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


  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="DigiCar Logo"
                width={150}
                height={50}
              />
            </Link>
          </div>

          <nav className="hidden items-center space-x-6 text-sm font-medium lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
                          <Link href="/profile">
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
            
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full">
                  <SheetHeader>
                    <SheetTitle>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="DigiCar Logo" width={150} height={50}/>
                        </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <nav className="flex flex-col space-y-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
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
              <div className="container mx-auto flex h-20 items-center px-4">
                <Search className="mr-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Busca en todo el catálogo..."
                  className="h-12 flex-1 border-0 bg-transparent text-lg shadow-none focus-visible:ring-0"
                  autoFocus
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteHeader;
